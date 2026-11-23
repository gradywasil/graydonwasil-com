/* A Game Boy Color in the browser: binjgb (Ben Smith's emulator, MIT, built to
 * WebAssembly and shipped with GB Studio's web export) driven by our own small
 * frame loop. The wasm and glue are static files in public/gb (copied there by
 * scripts/sync-chromatic.py) and are only fetched when someone turns a
 * cartridge on.
 *
 * What this file does: load the module, unpack a gzipped ROM, run the machine
 * against the display clock, draw each frame to a canvas, play the sound,
 * take button presses, and hand the cartridge's battery RAM back so a save can
 * outlive the tab. It knows nothing about React or this page's design.
 *
 * A machine is an instance of the compiled emulator with its own memory, a
 * fixed 16 MB that cannot grow (two of the ROMs are 4 MB each). Once a machine
 * has failed (out of memory, or a trap such as "memory access out of bounds"),
 * it stays broken, and when one machine served every cartridge, nothing loaded
 * again until the page was reloaded. So a machine is only reused when its last
 * cartridge was switched off cleanly and emptied. One that failed is dropped,
 * and the next cartridge gets a fresh one. Normally a visit makes one machine. */

export const SCREEN_W = 160;
export const SCREEN_H = 144;

const AUDIO_FRAMES = 4096;
const AUDIO_LATENCY_SEC = 0.1;
/** Never run more than five frames in one go, so a stalled tab does not fast-forward on return. */
const MAX_UPDATE_SEC = 5 / 60;
const CPU_TICKS_PER_SEC = 4194304;
const EVENT_NEW_FRAME = 1;
const EVENT_AUDIO_BUFFER_FULL = 2;
const EVENT_UNTIL_TICKS = 4;
/** binjgb's colour correction: 2 is the Gambatte / Game Boy Online look GB Studio's own player uses. */
const COLOR_CORRECTION = 2;
/** How long a changed save waits before it is written out. */
const SAVE_EVERY_MS = 2000;

export type PadButton = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'start' | 'select';

/** The parts of the emscripten module this file calls. */
interface Binjgb {
  HEAP8: Int8Array;
  _malloc(size: number): number;
  _free(ptr: number): void;
  _emulator_new_simple(rom: number, size: number, sampleRate: number, audioFrames: number, correction: number): number;
  _emulator_delete(e: number): void;
  _joypad_new(): number;
  _joypad_delete(joypad: number): void;
  _emulator_set_default_joypad_callback(e: number, joypad: number): void;
  _emulator_get_ticks_f64(e: number): number;
  _emulator_run_until_f64(e: number, ticks: number): number;
  _emulator_was_ext_ram_updated(e: number): number;
  _emulator_read_ext_ram(e: number, file: number): void;
  _emulator_write_ext_ram(e: number, file: number): void;
  _ext_ram_file_data_new(e: number): number;
  _file_data_delete(file: number): void;
  _get_file_data_ptr(file: number): number;
  _get_file_data_size(file: number): number;
  _get_frame_buffer_ptr(e: number): number;
  _get_frame_buffer_size(e: number): number;
  _get_audio_buffer_ptr(e: number): number;
  _get_audio_buffer_capacity(e: number): number;
  _set_joyp_up(e: number, down: boolean): void;
  _set_joyp_down(e: number, down: boolean): void;
  _set_joyp_left(e: number, down: boolean): void;
  _set_joyp_right(e: number, down: boolean): void;
  _set_joyp_A(e: number, down: boolean): void;
  _set_joyp_B(e: number, down: boolean): void;
  _set_joyp_start(e: number, down: boolean): void;
  _set_joyp_select(e: number, down: boolean): void;
}

interface BinjgbOptions {
  /** Emscripten's hook for supplying the instance ourselves: here, from the module compiled once. */
  instantiateWasm?: (imports: WebAssembly.Imports, done: (instance: WebAssembly.Instance, module: WebAssembly.Module) => void) => object;
}

type BinjgbFactory = (options?: BinjgbOptions) => Promise<Binjgb>;

declare global {
  interface Window {
    Binjgb?: BinjgbFactory;
    webkitAudioContext?: typeof AudioContext;
    /** The emulator calls this global when a game writes to the link-cable port. We have no cable. */
    emulator?: { serialCallback(byte: number): void };
  }
}

const BASE = `${import.meta.env.BASE_URL}gb/`;

/** The emulator's glue and its compiled code, fetched once. Each machine is a new instance of them. */
interface Emulator { factory: BinjgbFactory; wasm: WebAssembly.Module }

let emulatorPromise: Promise<Emulator> | null = null;

function loadGlue(): Promise<BinjgbFactory> {
  return new Promise<BinjgbFactory>((resolve, reject) => {
    if (window.Binjgb) { resolve(window.Binjgb); return; }
    const script = document.createElement('script');
    script.src = `${BASE}binjgb.js`;
    script.onload = () => {
      if (window.Binjgb) resolve(window.Binjgb); else reject(new Error('The emulator did not start.'));
    };
    script.onerror = () => { script.remove(); reject(new Error('The emulator could not be loaded.')); };
    document.head.append(script);
  });
}

async function compileWasm(): Promise<WebAssembly.Module> {
  const res = await fetch(`${BASE}binjgb.wasm`);
  if (!res.ok) throw new Error(`The emulator could not be loaded (${res.status}).`);
  return WebAssembly.compile(await res.arrayBuffer());
}

/** Load the emulator once, on first use. */
export function loadEmulator(): Promise<Emulator> {
  emulatorPromise ??= Promise.all([loadGlue(), compileWasm()])
    .then(([factory, wasm]) => {
      window.emulator ??= { serialCallback() { /* nothing is plugged in */ } };
      return { factory, wasm };
    })
    .catch((error) => { emulatorPromise = null; throw error; });
  return emulatorPromise;
}

/** A machine of its own: a fresh instance of the emulator, with its own memory. */
function newMachine({ factory, wasm }: Emulator): Promise<Binjgb> {
  // Emscripten never hears about a failed instantiateWasm, so a failure is raced in beside it.
  let fail: (error: unknown) => void = () => {};
  const failed = new Promise<never>((_, reject) => { fail = reject; });
  const made = factory({
    instantiateWasm(imports, done) {
      WebAssembly.instantiate(wasm, imports).then((instance) => done(instance, wasm), fail);
      return {};
    },
  });
  return Promise.race([made, failed]);
}

/** A machine whose last cartridge was switched off cleanly and emptied out, ready for the next. */
let spare: Binjgb | null = null;

/** Unpacked ROMs, kept for the visit: switching back to a cartridge does not fetch or unpack it again. */
const roms = new Map<string, Promise<Uint8Array>>();

/** Fetch a ROM. They are stored gzipped; a server that unpacks them on the way is fine too. */
export function fetchRom(name: string): Promise<Uint8Array> {
  let rom = roms.get(name);
  if (!rom) {
    rom = (async () => {
      const res = await fetch(`${BASE}roms/${name}.gbc.gz`);
      if (!res.ok) throw new Error(`The cartridge could not be loaded (${res.status}).`);
      const bytes = new Uint8Array(await res.arrayBuffer());
      const gzipped = bytes[0] === 0x1f && bytes[1] === 0x8b;
      if (!gzipped) return bytes;
      if (typeof DecompressionStream === 'undefined') throw new Error('This browser is too old to unpack the cartridge.');
      const unpacked = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
      return new Uint8Array(await new Response(unpacked).arrayBuffer());
    })();
    rom.catch(() => roms.delete(name));
    roms.set(name, rom);
  }
  return rom;
}

let audio: AudioContext | null = null;

/** The page's one audio context. Make it from a press: browsers keep it silent until then. */
export function wakeAudio(): AudioContext | null {
  try {
    const Ctor = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctor) return null;
    audio ??= new Ctor();
    if (audio.state === 'suspended') void audio.resume();
    return audio;
  } catch {
    return null;
  }
}

export interface CoreOptions {
  canvas: HTMLCanvasElement;
  /** The cartridge's battery RAM from last time, if any. */
  save?: Uint8Array | null;
  /** Called with the battery RAM a moment after the game changes it, and when the core stops. */
  onSave?: (ram: Uint8Array) => void;
  /** Called once if the machine fails while running. It has stopped itself by then. */
  onCrash?: (error: unknown) => void;
  muted?: boolean;
}

/** One running console with one cartridge in it. */
export class GbCore {
  private readonly m: Binjgb;
  private readonly e: number;
  private readonly romPtr: number;
  /** Where the emulator reads the buttons from: without one it never sees a press. */
  private readonly joypad: number;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly image = new ImageData(SCREEN_W, SCREEN_H);
  private readonly sampleRate: number;
  private readonly onSave?: (ram: Uint8Array) => void;
  private readonly onCrash?: (error: unknown) => void;
  private readonly down = new Set<PadButton>();

  private raf = 0;
  private lastSec = 0;
  private leftoverTicks = 0;
  private audioAt = 0;
  private muted: boolean;
  // One-pole high-pass so the sampler's resting level never reaches the speakers as a click.
  private hpL = 0; private hpR = 0; private prevL = 0; private prevR = 0;
  private saveDirty = false;
  private savedAt = 0;
  private gone = false;
  /** It failed: it is never emptied out or reused. */
  private broken = false;

  constructor(m: Binjgb, rom: Uint8Array, opts: CoreOptions) {
    this.m = m;
    this.onSave = opts.onSave;
    this.onCrash = opts.onCrash;
    this.muted = opts.muted ?? false;
    const ctx = opts.canvas.getContext('2d');
    if (!ctx) throw new Error('This browser cannot draw the screen.');
    this.ctx = ctx;
    this.sampleRate = audio?.sampleRate ?? 44100;

    this.romPtr = m._malloc(rom.byteLength);
    new Uint8Array(m.HEAP8.buffer, this.romPtr, rom.byteLength).set(rom);
    this.e = m._emulator_new_simple(this.romPtr, rom.byteLength, this.sampleRate, AUDIO_FRAMES, COLOR_CORRECTION);
    if (this.e === 0) throw new Error('That does not look like a Game Boy ROM.');
    this.joypad = m._joypad_new();
    m._emulator_set_default_joypad_callback(this.e, this.joypad);
    if (opts.save) this.loadRam(opts.save);
  }

  /** Start (or restart after `pause`) running against the display clock. */
  start() {
    if (this.gone || this.raf) return;
    this.lastSec = 0;
    this.leftoverTicks = 0;
    this.audioAt = 0;
    void audio?.resume();
    this.raf = requestAnimationFrame(this.frame);
  }

  pause() {
    if (!this.raf) return;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.releaseAll();
    void audio?.suspend();
    this.flushSave();
  }

  get running() { return this.raf !== 0; }

  setMuted(muted: boolean) {
    this.muted = muted;
    this.audioAt = 0;
  }

  press(button: PadButton, down: boolean) {
    if (this.gone) return;
    if (down) this.down.add(button); else this.down.delete(button);
    const { m, e } = this;
    switch (button) {
      case 'up': m._set_joyp_up(e, down); break;
      case 'down': m._set_joyp_down(e, down); break;
      case 'left': m._set_joyp_left(e, down); break;
      case 'right': m._set_joyp_right(e, down); break;
      case 'a': m._set_joyp_A(e, down); break;
      case 'b': m._set_joyp_B(e, down); break;
      case 'start': m._set_joyp_start(e, down); break;
      case 'select': m._set_joyp_select(e, down); break;
    }
  }

  releaseAll() {
    for (const b of [...this.down]) this.press(b, false);
  }

  /** Switch off: save (unless told not to), stop, and empty the machine out for the next
   *  cartridge. A machine that failed on the way is dropped instead. */
  destroy(keepSave = true) {
    if (this.gone) return;
    if (!keepSave) this.saveDirty = false;
    try {
      this.pause();
      this.flushSave();
    } catch {
      this.broken = true;
    }
    this.stopLoop();
    this.gone = true;
    if (this.broken) return;
    const { m } = this;
    try {
      m._emulator_delete(this.e);
      m._joypad_delete(this.joypad);
      m._free(this.romPtr);
      spare ??= m;
    } catch { /* not fit to reuse; dropping it gives its memory back */ }
  }

  private stopLoop() {
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  /** The battery RAM as it is now (empty for a cartridge without any). */
  readRam(): Uint8Array {
    const { m, e } = this;
    const file = m._ext_ram_file_data_new(e);
    try {
      m._emulator_write_ext_ram(e, file);
      return new Uint8Array(m.HEAP8.buffer, m._get_file_data_ptr(file), m._get_file_data_size(file)).slice();
    } finally {
      m._file_data_delete(file);
    }
  }

  private loadRam(ram: Uint8Array) {
    const { m, e } = this;
    const file = m._ext_ram_file_data_new(e);
    try {
      // A save from a different build of the game has a different size; it is left alone.
      if (m._get_file_data_size(file) !== ram.byteLength) return;
      new Uint8Array(m.HEAP8.buffer, m._get_file_data_ptr(file), ram.byteLength).set(ram);
      m._emulator_read_ext_ram(e, file);
    } finally {
      m._file_data_delete(file);
    }
  }

  private flushSave() {
    if (!this.saveDirty || this.gone) return;
    this.saveDirty = false;
    this.savedAt = performance.now();
    this.onSave?.(this.readRam());
  }

  private frame = (nowMs: number) => {
    this.raf = requestAnimationFrame(this.frame);
    try {
      this.step(nowMs);
    } catch (error) {
      // Stop here rather than throw again on every frame; the page offers a fresh machine.
      this.stopLoop();
      this.gone = true;
      this.broken = true;
      void audio?.suspend();
      this.onCrash?.(error);
    }
  };

  private step(nowMs: number) {
    const { m, e } = this;
    const nowSec = nowMs / 1000;
    const deltaSec = Math.max(nowSec - (this.lastSec || nowSec), 0);
    this.lastSec = nowSec;

    const startTicks = m._emulator_get_ticks_f64(e);
    const until = startTicks + Math.min(deltaSec, MAX_UPDATE_SEC) * CPU_TICKS_PER_SEC - this.leftoverTicks;
    let drew = false;
    for (;;) {
      const event = m._emulator_run_until_f64(e, until);
      if (event & EVENT_NEW_FRAME) {
        const size = m._get_frame_buffer_size(e);
        this.image.data.set(new Uint8Array(m.HEAP8.buffer, m._get_frame_buffer_ptr(e), size));
        drew = true;
      }
      if (event & EVENT_AUDIO_BUFFER_FULL) this.pushAudio();
      if (event & EVENT_UNTIL_TICKS) break;
    }
    this.leftoverTicks = (m._emulator_get_ticks_f64(e) - until) | 0;
    if (drew) this.ctx.putImageData(this.image, 0, 0);

    if (m._emulator_was_ext_ram_updated(e)) this.saveDirty = true;
    if (this.saveDirty && performance.now() - this.savedAt > SAVE_EVERY_MS) this.flushSave();
  }

  private pushAudio() {
    const { m, e } = this;
    if (!audio || audio.state !== 'running' || this.muted) { this.audioAt = 0; return; }
    const now = audio.currentTime;
    this.audioAt ||= now + AUDIO_LATENCY_SEC;
    if (this.audioAt < now) { this.audioAt = now + AUDIO_LATENCY_SEC; return; }

    const samples = new Uint8Array(m.HEAP8.buffer, m._get_audio_buffer_ptr(e), m._get_audio_buffer_capacity(e));
    const buffer = audio.createBuffer(2, AUDIO_FRAMES, this.sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    const volume = 0.5 / 255;
    let hpL = this.hpL, hpR = this.hpR, prevL = this.prevL, prevR = this.prevR;
    for (let i = 0; i < AUDIO_FRAMES; i++) {
      const l = samples[2 * i] * volume;
      const r = samples[2 * i + 1] * volume;
      hpL = l - prevL + 0.995 * hpL; prevL = l;
      hpR = r - prevR + 0.995 * hpR; prevR = r;
      left[i] = hpL;
      right[i] = hpR;
    }
    this.hpL = hpL; this.hpR = hpR; this.prevL = prevL; this.prevR = prevR;

    const source = audio.createBufferSource();
    source.buffer = buffer;
    source.connect(audio.destination);
    source.start(this.audioAt);
    this.audioAt += AUDIO_FRAMES / this.sampleRate;
  }
}

/** Boot a cartridge: the emulator, the ROM and the last save, together. `stale` is asked
 *  between steps; once it says yes, nothing more is started and this gives null. */
export async function boot(romName: string, opts: CoreOptions, stale: () => boolean = () => false): Promise<GbCore | null> {
  const [emulator, rom] = await Promise.all([loadEmulator(), fetchRom(romName)]);
  if (stale()) return null;
  const reused = spare;
  spare = null;
  if (reused) {
    try {
      return new GbCore(reused, rom, opts);
    } catch { /* that machine was not fit to reuse after all: a fresh one below */ }
  }
  const m = await newMachine(emulator);
  if (stale()) { spare ??= m; return null; }
  return new GbCore(m, rom, opts);
}
