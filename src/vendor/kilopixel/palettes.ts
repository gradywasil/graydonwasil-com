/**
 * Built-in palettes. Every palette is one of two kinds, and choosing it also chooses how the
 * picture is mapped onto it:
 *
 * - **Gradient** (`ramp`): colors run darkest to lightest and brightness picks the color
 *   (Tone ramp mapping). Extra colors make the gradient smoother or let it pass through more hues.
 * - **Color set** (`set`): a fixed collection of distinct hues and each pixel snaps to the nearest
 *   one (Match colors mapping). Extra colors mean more of the scene keeps its real color — a
 *   16-color set can render skin, sky and foliage, which is what makes higher bit depths richer.
 *
 * Sets are stored darkest-first and lightest-last because Two-tone and the ASCII background use
 * the endpoints. Names may hint at classic hardware but never use trademarks.
 * Ids are persisted in settings — retire an id through RETIRED_PALETTES rather than renaming it.
 */
export type PaletteKind = 'ramp' | 'set';
export type PaletteTheme = 'retro' | 'print' | 'film' | 'nature' | 'art' | 'neon';
export interface Palette { id: string; label: string; kind: PaletteKind; theme: PaletteTheme; colors: string[] }

const light = (color: string) => {
  const value = parseInt(color.slice(1), 16);
  return (value >> 16) * 0.299 + (value >> 8 & 255) * 0.587 + (value & 255) * 0.114;
};
const ramp = (id: string, label: string, theme: PaletteTheme, colors: string[]): Palette => ({ id, label, kind: 'ramp', theme, colors });
/** Sets are authored in any order and stored dark → light so the endpoints are the darkest and lightest inks. */
const set = (id: string, label: string, theme: PaletteTheme, colors: string[]): Palette => ({ id, label, kind: 'set', theme, colors: [...colors].sort((a, b) => light(a) - light(b)) });

export const PALETTES: Palette[] = [
  /* ── 1-bit · two inks ── */
  ramp('binary-true', 'Black & white', 'print', ['#000000', '#ffffff']),
  ramp('indigo-paper', 'Indigo paper', 'print', ['#232159', '#fff0d3']),
  ramp('cyanotype', 'Cyanotype', 'film', ['#0d3a6b', '#e8f0f2']),
  ramp('thermal-paper', 'Receipt', 'print', ['#2a2826', '#f4f0e6']),
  ramp('fluoro-pink', 'Fluoro pink', 'print', ['#e83e8c', '#fff6ec']),
  ramp('rust-cream', 'Rust & cream', 'print', ['#7d3428', '#ffefb5']),
  ramp('amber-mono', 'Amber terminal', 'retro', ['#1a0f00', '#ffb33a']),
  ramp('green-mono', 'Green terminal', 'retro', ['#021a06', '#3cff7a']),
  ramp('cyan-ink', 'Cyan ink', 'neon', ['#052d45', '#40f4ee']),
  ramp('red-yellow', 'Red & yellow', 'art', ['#c21d36', '#fff25a']),
  ramp('blue-lime', 'Blue & lime', 'neon', ['#122e9b', '#d5ff35']),
  ramp('violet-mint', 'Violet & mint', 'neon', ['#4a176c', '#aaffd4']),
  ramp('pink-lemon', 'Pink & lemon', 'art', ['#9c185a', '#fff29b']),
  ramp('teal-peach', 'Teal & peach', 'art', ['#075a60', '#ffd0a3']),
  ramp('navy-gold', 'Navy & gold', 'art', ['#14213d', '#fcbf49']),
  ramp('plum-pistachio', 'Plum & pistachio', 'art', ['#4b244b', '#d8ed9c']),
  ramp('matcha', 'Matcha', 'nature', ['#2d3a1e', '#e9efc9']),

  /* ── 2-bit · four colors ── */
  ramp('pocket', 'Pocket green', 'retro', ['#182b21', '#496b3c', '#91a75b', '#d9e5a0']),
  set('blue-desktop', 'Blue desktop', 'retro', ['#0055aa', '#ffffff', '#000022', '#ff8800']),
  set('cga', 'CGA cyan & pink', 'retro', ['#140e24', '#a52a99', '#46cbd6', '#fff4ff']),
  set('cga-bright', 'CGA bright', 'retro', ['#000000', '#ff00c8', '#00e5ef', '#ffffff']),
  set('cga-warm', 'CGA lime & red', 'retro', ['#000000', '#ff5555', '#55ff55', '#ffff55']),
  ramp('phosphor', 'Green phosphor', 'retro', ['#04130a', '#145c2e', '#35b65a', '#b9ffc4']),
  ramp('amber', 'Amber screen', 'retro', ['#241a10', '#765020', '#c48d36', '#ffe2a0']),
  ramp('red-visor', 'Red visor', 'retro', ['#0a0000', '#4d0000', '#a30000', '#ff2a1a']),
  ramp('mono', 'Paper & ink', 'print', ['#151719', '#555958', '#a5aaa4', '#f0f0e6']),
  ramp('binary', 'Pure black & white', 'print', ['#000000', '#000000', '#ffffff', '#ffffff']),
  ramp('sepia', 'Old photograph', 'film', ['#261c17', '#70503c', '#b79c70', '#efe0bc']),
  set('snapshot', 'Snapshot', 'film', ['#2b2420', '#b5523b', '#6f9bb5', '#efd9b4']),
  set('primary', 'Primary colors', 'art', ['#080810', '#2342d4', '#f33137', '#fff03c']),
  set('riso-trio', 'Riso trio', 'print', ['#3255a4', '#ff48b0', '#ffe14d', '#f7f2e8']),
  set('terracotta', 'Terracotta', 'art', ['#2e2a24', '#c8553d', '#8a9a5b', '#f2e3c9']),
  set('tidepool', 'Tidepool', 'nature', ['#16324f', '#2f8f83', '#e07a5f', '#f4f1de']),
  set('night-drive', 'Night drive', 'neon', ['#0d0221', '#ff2a6d', '#05d9e8', '#d1f7ff']),
  ramp('plum', 'Plum dusk', 'art', ['#281f35', '#6a426b', '#bd8193', '#f6d7c0']),
  ramp('ice', 'Arctic blue', 'nature', ['#10223b', '#2b597e', '#74b5c8', '#dbf7ed']),
  ramp('sunset', 'Desert sunset', 'nature', ['#2b1c42', '#a44653', '#eb996b', '#ffe5b6']),
  ramp('ocean', 'Deep ocean', 'nature', ['#071e31', '#17586a', '#4fa99c', '#c9f1ce']),
  ramp('sakura', 'Cherry blossom', 'nature', ['#2f213b', '#80516d', '#d69cae', '#ffe3e2']),
  ramp('copper', 'Copper plate', 'print', ['#211c1b', '#694639', '#bc8053', '#efd1a3']),
  ramp('red', 'Red alert', 'neon', ['#170d13', '#6a1829', '#d64a50', '#ffcac3']),
  ramp('gold', 'Black & gold', 'art', ['#171510', '#5e4d1e', '#b99435', '#f8e7a2']),
  ramp('mint', 'Mint cream', 'nature', ['#15312f', '#3a7764', '#8ec4a2', '#e5f4d2']),
  ramp('marine', 'Marine orange', 'art', ['#122a3b', '#48617a', '#e89957', '#ffe3be']),
  ramp('blueprint', 'Blueprint', 'print', ['#091c50', '#294d9a', '#829fd1', '#eef5ff']),
  ramp('thermal', 'Thermal glow', 'neon', ['#20103c', '#8d2767', '#e87b40', '#fff3a5']),
  ramp('moss', 'Forest moss', 'nature', ['#20281a', '#5b653a', '#a1a16a', '#e1dcb2']),
  ramp('peach', 'Peach soda', 'art', ['#392331', '#8e5c64', '#dba08a', '#ffe7bf']),
  ramp('lilac-lime', 'Lilac & lime', 'art', ['#281d3c', '#775983', '#a5bd64', '#eaf5b0']),
  ramp('coral-current', 'Coral current', 'nature', ['#09223d', '#25859a', '#ff8069', '#fff3c4']),
  ramp('acid-rush', 'Acid rush', 'neon', ['#20113d', '#c039d2', '#b6ec27', '#f4ffcf']),
  ramp('riso-pop', 'Riso pop', 'print', ['#17224d', '#d04a80', '#fca353', '#c8f6db']),
  ramp('cobalt-lemon', 'Cobalt & lemon', 'art', ['#101638', '#2455d6', '#eaa51d', '#ffffbc']),
  ramp('pastel-parade', 'Pastel parade', 'art', ['#3b304e', '#a18cd1', '#f1b2a5', '#e1f9da']),
  ramp('tropic-jam', 'Tropic jam', 'neon', ['#112b49', '#d13c87', '#1edbb8', '#fff269']),
  ramp('teal-flame', 'Teal & flame', 'art', ['#0a302e', '#b23220', '#ff9d3d', '#fff1cc']),
  ramp('comic-pop', 'Comic pop', 'print', ['#141736', '#ee354b', '#13d6db', '#fff02d']),
  ramp('candy-shop', 'Candy shop', 'neon', ['#241e49', '#9e50d4', '#fa91bd', '#d7ffe0']),
  ramp('harvest-ink', 'Harvest ink', 'print', ['#2d2132', '#386b48', '#e7a84a', '#fff0b0']),
  ramp('solar-flare', 'Solar flare', 'neon', ['#150f29', '#e44825', '#f7c42d', '#fff9df']),
  ramp('confetti', 'Confetti', 'art', ['#3a1c65', '#ec447a', '#56d7b2', '#ffe76b']),

  /* ── 3-bit · six colors ── */
  set('block-party', 'Block party', 'print', ['#121212', '#243cbd', '#cf302b', '#2b9c48', '#f4ce30', '#f4eed2']),
  set('memphis', 'Memphis', 'art', ['#1d1d1b', '#ff6f91', '#00b2a9', '#ffd23f', '#7b5ea7', '#fbf5ec']),
  set('woodblock', 'Woodblock', 'print', ['#1f2a44', '#b8372b', '#d9a441', '#7f9a7a', '#e8c9a1', '#f3ead8']),
  set('tarot', 'Tarot', 'art', ['#2b193d', '#a3333d', '#2e6e65', '#d4a017', '#7c9ccf', '#f3e7c9']),
  set('aquarium', 'Aquarium', 'nature', ['#0b2a3a', '#ff7b29', '#1f8ea3', '#f2d03b', '#7ad3c5', '#eaf6f3']),
  set('desert-modern', 'Desert modern', 'nature', ['#3a2e39', '#d4776b', '#e8b04a', '#4f8a8b', '#a7c4d4', '#f4e9dc']),
  set('prism-six', 'Prism', 'neon', ['#18265c', '#9e2851', '#286e55', '#db7434', '#3cb9bd', '#f2d549']),
  set('tomato-tide', 'Tomato tide', 'nature', ['#16414a', '#24777d', '#b84236', '#52a9a1', '#e08365', '#f5c1a0']),
  set('orchard-print', 'Orchard print', 'print', ['#263d23', '#42672f', '#9e493b', '#7b963e', '#d29c55', '#d6cf88']),
  set('wildflower', 'Wildflower', 'nature', ['#314630', '#6b5c85', '#7d9967', '#b19ac1', '#d4c28b', '#e9dfb7']),
  set('retro-poster', 'Retro poster', 'print', ['#253a4c', '#9e4d3b', '#527d7e', '#c09549', '#d4b294', '#ebd9b0']),
  ramp('sorbet-six', 'Sorbet stand', 'art', ['#9a7cab', '#c196bc', '#e8abb8', '#aad2d3', '#f5d3ad', '#f7e9ce']),
  ramp('electric-papaya', 'Papaya heat', 'neon', ['#4d191c', '#9d2a25', '#d9532c', '#ef843d', '#f6b55b', '#f8d991']),
  ramp('driftwood', 'Driftwood', 'film', ['#30302f', '#595957', '#83837d', '#a7a79f', '#c9c9bf', '#e6e6d9']),
  ramp('lilac-lantern', 'Lilac lantern', 'art', ['#332645', '#604b78', '#927eab', '#b6a5c8', '#dbba6b', '#f0dca2']),
  ramp('after-hours', 'After hours', 'neon', ['#0b0c24', '#232047', '#3f2e67', '#623b87', '#8d519b', '#b777ad']),
  ramp('desert-radio', 'Desert radio', 'film', ['#432b23', '#78503a', '#ad7650', '#cca071', '#dfbf8d', '#eed9b2']),
  ramp('poolside', 'Poolside', 'nature', ['#073c61', '#086d92', '#139abd', '#43bed2', '#85d9df', '#c4edf0']),
  ramp('midnight-fuchsia', 'Midnight fuchsia', 'neon', ['#2d1035', '#612358', '#9a3777', '#c95a91', '#e68bac', '#f0b7cc']),
  ramp('coastal-film', 'Coastal film', 'film', ['#2c4a58', '#557888', '#829ca4', '#b0b3a6', '#cfc8aa', '#e5ddc1']),
  ramp('circuit-board', 'Circuit green', 'retro', ['#102c17', '#24562a', '#448139', '#70a84a', '#a3cd68', '#d4e99a']),

  /* ── 3-bit · eight colors ── */
  set('teletext', 'Teletext', 'retro', ['#000000', '#0000ff', '#ff0000', '#ff00ff', '#00ff00', '#00ffff', '#ffff00', '#ffffff']),
  set('cga-eight', 'CGA eight', 'retro', ['#000000', '#20208c', '#8c206f', '#555555', '#197e94', '#f050c8', '#55dce5', '#ffffff']),
  set('arcade-spectrum', 'Arcade spectrum', 'retro', ['#101024', '#3530a4', '#a12c83', '#16959e', '#d24b31', '#e59b2e', '#a9cb37', '#ead978']),
  set('ben-day', 'Ben-Day comic', 'print', ['#1a1a1a', '#e4002b', '#00a3e0', '#ec008c', '#2e3192', '#00a651', '#fff200', '#fdfaf2']),
  set('riso-overprint', 'Riso overprint', 'print', ['#2b2d5c', '#0078bf', '#ff48b0', '#ff7a59', '#ffe800', '#00a495', '#a678c2', '#f7f2e8']),
  set('stained-glass', 'Stained glass', 'art', ['#14141c', '#8e1b2b', '#1d4e89', '#1f7a4d', '#d98e04', '#6b3fa0', '#5fb3c9', '#f1d98a']),
  set('mid-century', 'Mid-century', 'art', ['#2f2a26', '#d0532b', '#e3a72f', '#2f7f7a', '#8aa64b', '#4b6a8f', '#d8b9a0', '#f4ead6']),
  set('jungle', 'Jungle', 'nature', ['#0f2416', '#2f5d34', '#7aa43b', '#c0392b', '#f39c12', '#3d8bb5', '#e8c28e', '#f6f0dc']),
  set('gelato', 'Gelato', 'art', ['#5b4a6b', '#e88aa6', '#f2b880', '#f5e18f', '#9fd6a5', '#8fc1e3', '#c7a8e0', '#fdf6ec']),
  set('vapor-eight', 'Vaporwave', 'neon', ['#1b0f2e', '#5b2a86', '#ff3ea5', '#ff9e5e', '#00d4ff', '#7af7c4', '#f8e16c', '#fff3fb']),
  set('pop-art', 'Pop art', 'print', ['#151515', '#2532a4', '#931e27', '#d12e2f', '#4463d4', '#ef7130', '#e9cb32', '#f8f0cb']),
  set('carnival', 'Carnival', 'art', ['#3b1818', '#9c2525', '#307d36', '#d34024', '#5ba638', '#ec7127', '#eba72c', '#f5d24b']),
  ramp('city-signs', 'City signs', 'neon', ['#091421', '#172c48', '#23405f', '#285679', '#397a9c', '#a66c32', '#dc9142', '#e9ac58']),
  set('tropical-print', 'Tropical print', 'nature', ['#203f2b', '#37603b', '#9b4540', '#5a8c48', '#ce6955', '#9bb94e', '#e5ad63', '#e2dc8c']),
  ramp('lagoon-peach', 'Lagoon & peach', 'nature', ['#123e41', '#206568', '#368e89', '#b77a6b', '#60b4a7', '#e5a187', '#9cd7c1', '#f7d9bd']),
  ramp('coast-party', 'Coast party', 'nature', ['#123e54', '#246580', '#3f8aa5', '#61a8bd', '#d39c62', '#e6bd84', '#a6dce0', '#f5e3bb']),
  set('laser-garden', 'Laser garden', 'neon', ['#211130', '#4c2369', '#723893', '#9051b3', '#6c9327', '#9bbb25', '#c7dc48', '#e5f48b']),
  ramp('sherbet', 'Sherbet', 'art', ['#a280b3', '#c493bb', '#d7a4c4', '#e9b7b5', '#b8cfc5', '#f2cfae', '#cfe3c2', '#f9e7cd']),
  ramp('sunset-drive', 'Sunset drive', 'neon', ['#32172a', '#64213b', '#982b49', '#c44453', '#e06465', '#ee9288', '#f4b9aa', '#f9d9c2']),
  ramp('velvet-citrus', 'Velvet citrus', 'art', ['#37153e', '#622369', '#8d367e', '#b95492', '#ca8240', '#c8a64e', '#e0c475', '#f0dfac']),
  ramp('market-spice', 'Market spice', 'film', ['#3c241b', '#69351f', '#974724', '#b3622a', '#c98137', '#d7a756', '#e1c17d', '#edd7ab']),
  ramp('polar-lights', 'Polar lights', 'nature', ['#0b2139', '#163e5c', '#205f7a', '#267b8a', '#3f9c9d', '#6db7ae', '#a1d3c4', '#c8e6d8']),
  ramp('film-roadtrip', 'Film roadtrip', 'film', ['#3a3b31', '#595448', '#75674f', '#81876b', '#a49370', '#b2b492', '#c8c4a4', '#dcd4b5']),
  ramp('soft-focus', 'Soft focus', 'film', ['#807887', '#9b8f9f', '#b39eae', '#b1b4bc', '#d0bac9', '#ddcac4', '#d4dedb', '#f0e7df']),

  /* ── 4-bit · sixteen colors ── */
  set('fantasy-16', 'Fantasy console', 'retro', ['#000000', '#1d2b53', '#7e2553', '#008751', '#ab5236', '#5f574f', '#c2c3c7', '#fff1e8', '#ff004d', '#ffa300', '#ffec27', '#00e436', '#29adff', '#83769c', '#ff77a8', '#ffccaa']),
  set('breadbin-16', 'Breadbin 16', 'retro', ['#000000', '#ffffff', '#880000', '#aaffee', '#cc44cc', '#00cc55', '#0000aa', '#eeee77', '#dd8855', '#664400', '#ff7777', '#333333', '#777777', '#aaff66', '#0088ff', '#bbbbbb']),
  set('living-room-16', 'Living room', 'retro', ['#000000', '#7c7c7c', '#bcbcbc', '#f8f8f8', '#0000fc', '#0078f8', '#3cbcfc', '#a4e4fc', '#d82800', '#f83800', '#fca044', '#f8b800', '#00a800', '#58d854', '#ac7c00', '#f8b8f8']),
  set('dos-16', 'DOS 16', 'retro', ['#000000', '#0000aa', '#00aa00', '#00aaaa', '#aa0000', '#aa00aa', '#aa5500', '#aaaaaa', '#555555', '#5555ff', '#55ff55', '#55ffff', '#ff5555', '#ff55ff', '#ffff55', '#ffffff']),
  set('desktop-16', 'Classic desktop', 'retro', ['#ffffff', '#fcf305', '#ff6402', '#dd0806', '#f20884', '#4600a5', '#0000d4', '#02abea', '#1fb714', '#006411', '#562c05', '#90713a', '#c0c0c0', '#808080', '#404040', '#000000']),
  set('cartridge-16', 'Cartridge', 'retro', ['#000000', '#21c842', '#5edc78', '#5455ed', '#7d76fc', '#d4524d', '#42ebf5', '#fc5554', '#ff7978', '#d4c154', '#e6ce80', '#21b03b', '#c95bba', '#6e6e6e', '#cccccc', '#ffffff']),
  set('portrait-16', 'Portrait', 'film', ['#120f0e', '#2b201c', '#4a3329', '#6e4a3a', '#93624b', '#b9806a', '#d6a084', '#ebc2a6', '#f8e3d3', '#fbf6f0', '#6d1f2a', '#b5434d', '#33415c', '#6d84a6', '#4f6b4a', '#9aa29c']),
  set('slide-film-16', 'Slide film', 'film', ['#120c0a', '#3a2219', '#7a2e1d', '#c4372a', '#e0822d', '#f2c14e', '#e9b48f', '#f7ead2', '#1d3557', '#2e6f9e', '#7fb3d5', '#2f5233', '#6a994e', '#a7c957', '#8d7966', '#c9bfae']),
  set('instant-16', 'Instant film', 'film', ['#25464f', '#3f6670', '#6f9a9c', '#a9c4bd', '#ece4d2', '#f6efe0', '#e2867f', '#e8b796', '#c97f55', '#e7cf8a', '#7fa8a6', '#a8c8cf', '#5f7f6a', '#9cae7c', '#8a6a5c', '#d7a0b0']),
  set('crayon-16', 'Crayon box', 'art', ['#1d1b1b', '#f7f3e8', '#8a8a8a', '#ed1c24', '#ff7f27', '#ffd33d', '#b5e61d', '#22b14c', '#0f6b3e', '#00a2e8', '#3f48cc', '#7e3fa0', '#ff8fc4', '#b97a57', '#ffc8a0', '#6b3e26']),
  set('gouache-16', 'Gouache', 'art', ['#22201f', '#47403b', '#7a6e65', '#b3a597', '#e9e0d1', '#f5efe4', '#a8473b', '#d0784b', '#e2b356', '#c9c27a', '#6f8b5e', '#3f6b6a', '#4a6a96', '#8fa9c4', '#8a5a83', '#d9a4a0']),
  set('sticker-16', 'Sticker sheet', 'neon', ['#111111', '#ffffff', '#f5372c', '#ff9a0a', '#ffd000', '#52d66a', '#00a86b', '#5ac8fa', '#1f7aff', '#5b55d8', '#b04fe0', '#ff2d92', '#ffb3c7', '#a2845e', '#ffd8b1', '#8e8e93']),
  set('neon-city-16', 'Neon city', 'neon', ['#07060f', '#141331', '#24224f', '#3d2c6e', '#5a5a7a', '#ff2e88', '#ff6b3d', '#ffd23f', '#39ff88', '#00e5ff', '#3a86ff', '#b14aed', '#ff9ec7', '#e8d5b7', '#9ad9ff', '#f4f1ff']),
  set('vapor-16', 'Vapor mall', 'neon', ['#1a1033', '#2d1b5a', '#4b2c87', '#7a4fb5', '#ff71ce', '#ffb3e6', '#01cdfe', '#05ffa1', '#b967ff', '#fffb96', '#ff9a8b', '#94e8ff', '#e0d0ff', '#3a8dde', '#8a6fdf', '#fff6fd']),
  set('garden-16', 'Garden', 'nature', ['#142114', '#26402a', '#3f6b3a', '#6d9b45', '#a8c66c', '#e5edc8', '#f7f4ea', '#d8345f', '#f28fad', '#f4a259', '#ffd166', '#8e6fbf', '#5b8bd9', '#8b5a3c', '#c69c72', '#a2b5c9']),
  set('autumn-16', 'Autumn walk', 'nature', ['#1b120e', '#3e2417', '#6b3a1f', '#9c4a1a', '#c9622a', '#e89a3c', '#f2c35b', '#f7e7c6', '#8c1c13', '#b8432f', '#5a5f2a', '#8a8f3d', '#3d4a5a', '#7d8fa3', '#c8b6a6', '#a87b5d']),
  set('reef-16', 'Coral reef', 'nature', ['#061826', '#0b3954', '#087e8b', '#2ec4b6', '#7ae7dd', '#cbf3f0', '#fffaf0', '#ff5a5f', '#ff9f80', '#ffbf47', '#f5e6a8', '#c2a878', '#6a4c93', '#3e8e41', '#1f4e79', '#e94f9a']),
  set('poster-16', 'Poster press', 'print', ['#171b24', '#2b3680', '#772c3d', '#315a9b', '#b44134', '#42794a', '#d46139', '#6b9655', '#4db2b0', '#dd8b45', '#b4ad67', '#99cead', '#efba59', '#e5d291', '#eadfba', '#f6eddb']),
  set('earth-16', 'Earth pigments', 'nature', ['#342e28', '#493b30', '#614934', '#785839', '#8c6841', '#9e794d', '#7f885e', '#ab8c5f', '#989f75', '#b7a077', '#afb48d', '#c4b38f', '#c3c5a4', '#d2c6a9', '#d9d7be', '#e4dfd0']),
  ramp('porcelain-16', 'Porcelain', 'art', ['#8c879e', '#a18eaa', '#b098b6', '#bc9faa', '#9bafb9', '#cbaab5', '#a9babf', '#d7b8bc', '#b9c8c8', '#e0c4bd', '#c9d3cc', '#e8d1c2', '#d6dfd1', '#eee0d0', '#e5e8db', '#f5efdf']),
  ramp('thermal-16', 'Heat camera', 'neon', ['#05020f', '#15052b', '#280a4a', '#45115c', '#65146c', '#841d6c', '#a52362', '#c13355', '#da4840', '#ec642c', '#f4892c', '#faaa34', '#fdc953', '#fde575', '#fef0b2', '#fffbe8']),
  ramp('dusk-16', 'Dusk map', 'nature', ['#120b22', '#1f1236', '#2c194c', '#40215b', '#56286a', '#6e2f72', '#883478', '#a33e7b', '#c04b7b', '#d75e78', '#e67872', '#f29270', '#f6ad7f', '#fac691', '#fddcb4', '#fff1d6']),
  ramp('aurora-16', 'Aurora map', 'nature', ['#060d1f', '#091830', '#0d2441', '#0f3250', '#0f445b', '#0f5566', '#116a6c', '#157f72', '#249474', '#3baa72', '#4fbf6f', '#76cc74', '#98d978', '#b5e58b', '#cfefaa', '#e9f9c9']),
  ramp('split-16', 'Split tone', 'film', ['#0c1a2b', '#15293d', '#1f3850', '#2c4861', '#3d596e', '#4e6a7c', '#667983', '#7e8889', '#94938b', '#a79c89', '#bba486', '#caaf88', '#daba89', '#e7c896', '#f1d8ad', '#fbe8c4']),
  ramp('night-16', 'Night signal', 'neon', ['#080f1b', '#0c1727', '#122135', '#1a2d45', '#243b56', '#304b68', '#66523e', '#3f5d79', '#826044', '#516f8b', '#a17049', '#c38350', '#d18e56', '#d9995e', '#e1a367', '#e9ad73']),
  ramp('ember-16', 'Ember', 'nature', ['#30191b', '#472025', '#61272a', '#7a302b', '#923d2c', '#aa4e2e', '#be6033', '#cf753c', '#dd8b49', '#e7a05b', '#edb36d', '#f1c381', '#f3d095', '#f5dba9', '#f7e4bd', '#f9ebd0']),
  ramp('glacier-16', 'Glacier', 'nature', ['#0c263f', '#10344f', '#15445f', '#1b5470', '#236581', '#2c7692', '#3888a3', '#4899b3', '#5cabc2', '#73bbcf', '#8bc9da', '#a3d6e3', '#bae1e9', '#cee9ed', '#dfefef', '#ecf5f1']),
  ramp('graphite-16', 'Graphite', 'film', ['#17191b', '#252729', '#333537', '#424446', '#515355', '#606264', '#707274', '#808284', '#909294', '#a0a2a4', '#b0b2b4', '#c0c2c4', '#cfd1d3', '#dddfe1', '#e9ebed', '#f5f6f7']),
];

/** Ids removed from the catalog, mapped to their closest replacement so remembered choices survive. */
export const RETIRED_PALETTES: Readonly<Record<string, string>> = {
  'lavender': 'plum', 'steel': 'ice', 'orchid-lime': 'acid-rush', 'fjord-fire': 'marine',
  'woodland-16': 'garden-16', 'orchid-16': 'dusk-16', 'acid-16': 'vapor-16',
};
/** The palette a depth starts on when the user switches to it. */
export const DEFAULT_PALETTE_BY_DEPTH: Readonly<Record<number, string>> = { 2: 'binary-true', 4: 'pocket', 6: 'block-party', 8: 'teletext', 16: 'fantasy-16' };

export const findPalette = (id: string | undefined): Palette | undefined =>
  id === undefined ? undefined : PALETTES.find(item => item.id === (RETIRED_PALETTES[id] ?? id));
export const defaultPalette = (depth: number): Palette =>
  findPalette(DEFAULT_PALETTE_BY_DEPTH[depth]) ?? PALETTES.find(item => item.colors.length === depth)!;
/** Gradients map by brightness; color sets match each pixel to the nearest color. */
export const paletteMapping = (palette: Pick<Palette, 'kind'>): 'tone' | 'color' => palette.kind === 'set' ? 'color' : 'tone';
/** Any matching mapping treats a palette as a color set; only tone mapping treats it as a gradient. */
export const mappingKind = (mapping: string | undefined): PaletteKind => mapping === undefined || mapping === 'tone' ? 'ramp' : 'set';
export const PALETTE_KIND_LABEL: Readonly<Record<PaletteKind, string>> = { ramp: 'Gradient', set: 'Color set' };
