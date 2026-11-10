/* Web Audio helpers shared by the sound demos (Morse, BitBounce). */

/** iPhones mute Web Audio while the ring switch is on silent, so a demo would
 *  run its lights with no sound. A "playback" audio session ignores the switch
 *  the way video does (Safari 16.4+; other browsers lack it and are unaffected).
 *  Call it from the tap that starts the sound, before creating the context. */
export function unmuteOnIOS() {
  try {
    const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
    if (session && session.type !== 'playback') session.type = 'playback';
  } catch {
    /* the page still plays, just under the ring switch */
  }
}

export function createAudioContext(): AudioContext | null {
  const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  try {
    return new Ctx({ latencyHint: 'interactive' });
  } catch {
    return null;
  }
}
