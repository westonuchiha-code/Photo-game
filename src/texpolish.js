// The no-repeat pass for the whole game (owner's note, POLISH_NOTES 149/150): every textured material is patched when
// it compiles, by how its texture is classed in src/tiling.js (tools/classify_tiling.py):
//   full  organic, seamless (concrete, dirt, bark, rust, fabric): each repeat shifted + flipped at random, soft seams
//   flip  square tiles: each repeat flipped at random, grid kept
//   tone  grids (brick, planks, siding, paving): layout kept
//   off   signs, photos, cut-outs: untouched
// all but `off` also get a slow light/dark wash and a gentle shared grade, so neighbouring textures sit together.
// Import once, right after texcache.js. Materials with their own onBeforeCompile are left to it.
import * as THREE from 'three';
import { TILING } from './tiling.js';
import { ntPatch, HOUSE } from './models/texmix.js';

const load = THREE.TextureLoader.prototype.load;
THREE.TextureLoader.prototype.load = function (url, ...rest) { const t = load.call(this, url, ...rest); try { const n = String(url).split('/').pop().replace(/\.(png|jpe?g|webp)(\?.*)?$/i, ''); if (t && n) t.userData.tex = n; } catch (e) { /* untagged */ } return t; };
export const modeOf = (m) => { if (!m || m.isShaderMaterial || !m.map || !m.map.userData) return null; const k = TILING[m.map.userData.tex]; return k && k !== 'off' ? k : null; };
const P = THREE.Material.prototype, baseOBC = P.onBeforeCompile, baseKey = P.customProgramCacheKey;
function polishOBC(sh, r) { const mode = modeOf(this); if (mode) ntPatch(sh, mode, HOUSE); }
const ON = !(typeof location !== 'undefined' && /[?&]notp\b/.test(location.search));   // ?notp turns the pass off (for comparing)
if (ON) P.onBeforeCompile = polishOBC;
if (ON) P.customProgramCacheKey = function () { if (this.onBeforeCompile !== polishOBC) return baseKey.call(this); return 'tp:' + (modeOf(this) || '-'); };
export function texPolishOff() { P.onBeforeCompile = baseOBC; P.customProgramCacheKey = baseKey; }
