// Texture blending tools, so library textures sit together instead of clashing or visibly repeating.
//   noTile(m, { grade, tone })   shader patch on a tiled material: each repeat of the texture is shifted and flipped at
//       random (a narrow soft band hides the seams between repeats), a slow light/dark wash breaks up the surface, and
//       a gentle grade (saturation, contrast) pulls every texture toward one shared look.
//   matchColour(m, '#hex', amt)  once the texture has loaded, tints the material so the texture's AVERAGE colour lands
//       on the target (amt 0..1 how far): parts made of different photos can be brought into one palette.
//   patchwork({...})  builds a new texture by cutting pieces out of library textures and pasting them together: a clean
//       base, then a few pieces (whole, upside down, halved and turned) keyed out by colour or feathered, then one grade
//       over the lot so the pieces blend. rustPaint(tint, seed) is the painted-metal-with-some-rust preset.
import * as THREE from 'three';
import { tex, rng } from './kit.js';

export const HOUSE = { sat: 0.9, con: 0.94, tone: 0.16 };
// ---- shader: no visible repeats + grade
const NT_FUNCS = `
flat varying vec3 vNtSeed;
float ntH(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec2 ntS = vec2(0.0);
vec4 ntCell(vec2 c){ c += ntS; return vec4(ntH(c), ntH(c + 17.3), ntH(c + 41.9) < 0.5 ? -1.0 : 1.0, ntH(c + 73.1) < 0.5 ? -1.0 : 1.0); }
vec4 ntAt(sampler2D s, vec2 uv, vec2 c, vec2 dx, vec2 dy){ vec4 o = ntCell(c); return textureGrad(s, uv * o.zw + o.xy, dx * o.zw, dy * o.zw); }
float ntN(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(ntH(i), ntH(i + vec2(1, 0)), f.x), mix(ntH(i + vec2(0, 1)), ntH(i + vec2(1, 1)), f.x), f.y); }
vec4 ntSample(sampler2D s, vec2 uv){ vec2 c = floor(uv), f = fract(uv), dx = dFdx(uv), dy = dFdy(uv);
  vec4 a = ntAt(s, uv, c, dx, dy);
  float wx = f.x > 0.5 ? 0.5 * smoothstep(0.76, 1.0, f.x) : 0.5 * (1.0 - smoothstep(0.0, 0.24, f.x));
  float wy = f.y > 0.5 ? 0.5 * smoothstep(0.76, 1.0, f.y) : 0.5 * (1.0 - smoothstep(0.0, 0.24, f.y));
  if (wx > 0.001) a = mix(a, ntAt(s, uv, c + vec2(f.x > 0.5 ? 1.0 : -1.0, 0.0), dx, dy), wx);
  if (wy > 0.001) a = mix(a, ntAt(s, uv, c + vec2(0.0, f.y > 0.5 ? 1.0 : -1.0), dx, dy), wy);
  return a; }
vec3 ntNAt(sampler2D s, vec2 uv, vec2 c, vec2 dx, vec2 dy){ vec4 o = ntCell(c); vec3 n = textureGrad(s, uv * o.zw + o.xy, dx * o.zw, dy * o.zw).xyz * 2.0 - 1.0; n.xy *= o.zw; return n; }
vec3 ntNormal(sampler2D s, vec2 uv){ vec2 c = floor(uv), f = fract(uv), dx = dFdx(uv), dy = dFdy(uv);
  vec3 a = ntNAt(s, uv, c, dx, dy);
  float wx = f.x > 0.5 ? 0.5 * smoothstep(0.76, 1.0, f.x) : 0.5 * (1.0 - smoothstep(0.0, 0.24, f.x));
  float wy = f.y > 0.5 ? 0.5 * smoothstep(0.76, 1.0, f.y) : 0.5 * (1.0 - smoothstep(0.0, 0.24, f.y));
  if (wx > 0.001) a = mix(a, ntNAt(s, uv, c + vec2(f.x > 0.5 ? 1.0 : -1.0, 0.0), dx, dy), wx);
  if (wy > 0.001) a = mix(a, ntNAt(s, uv, c + vec2(0.0, f.y > 0.5 ? 1.0 : -1.0), dx, dy), wy);
  return a; }
vec3 ntNFlip(sampler2D s, vec2 uv){ vec2 c = floor(uv), dx = dFdx(uv), dy = dFdy(uv); vec4 o = ntCell(c); vec2 f = fract(uv); vec2 q = c + vec2(o.z < 0.0 ? 1.0 - f.x : f.x, o.w < 0.0 ? 1.0 - f.y : f.y); vec3 n = textureGrad(s, q, dx * o.zw, dy * o.zw).xyz * 2.0 - 1.0; n.xy *= o.zw; return n; }
vec4 ntFlip(sampler2D s, vec2 uv){ vec2 c = floor(uv), dx = dFdx(uv), dy = dFdy(uv); vec4 o = ntCell(c); vec2 f = fract(uv); vec2 q = c + vec2(o.z < 0.0 ? 1.0 - f.x : f.x, o.w < 0.0 ? 1.0 - f.y : f.y); return textureGrad(s, q, dx * o.zw, dy * o.zw); }
`;
// the shader chunk: mode 'full' shuffles + flips each repeat (soft seams), 'flip' only flips each repeat (square tiles),
// 'tone' leaves the layout alone (grids: brick, planks), every mode gets the slow light/dark wash and the grade
export function ntChunk(mode = 'full', grade = HOUSE) { const g = { ...HOUSE, ...grade }, f = (v) => v.toFixed(3);
  const smp = mode === 'full' ? 'ntSample(map, vMapUv)' : mode === 'flip' ? 'ntFlip(map, vMapUv)' : 'texture2D(map, vMapUv)';
  return `#ifdef USE_MAP
  vec3 ntq = floor(vNtSeed * 8.0 + 0.5); ntS = floor(vec2(ntH(ntq.xz * 0.0731 + ntq.y * 0.037), ntH(ntq.zx * 0.1913 - ntq.y * 0.011)) * 997.0);
  vec4 sampledDiffuseColor = ${smp};
  vec3 ntc = sampledDiffuseColor.rgb; float ntl = dot(ntc, vec3(0.2126, 0.7152, 0.0722));
  ntc = mix(vec3(ntl), ntc, ${f(g.sat)}); ntc = max((ntc - 0.18) * ${f(g.con)} + 0.18, 0.0);
  ntc *= 1.0 + ${f(g.tone * (mode === 'tone' ? 1.6 : 1))} * (ntN(vMapUv * 0.37 + 3.1 + ntS * 0.013) * 0.7 + ntN(vMapUv * 1.3 + ntS * 0.007) * 0.3 - 0.5);
  sampledDiffuseColor.rgb = ntc; diffuseColor *= sampledDiffuseColor;
#endif`; }
export function ntPatch(sh, mode, grade) { sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nflat varying vec3 vNtSeed;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvNtSeed = modelMatrix[3].xyz;\n#ifdef USE_INSTANCING\nvNtSeed += instanceMatrix[3].xyz;\n#endif'); sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + NT_FUNCS).replace('#include <map_fragment>', ntChunk(mode, grade)); if (mode === 'full' || mode === 'flip') sh.fragmentShader = sh.fragmentShader.replace('#include <normal_fragment_maps>', THREE.ShaderChunk.normal_fragment_maps.replace('texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0', mode === 'full' ? 'ntNormal( normalMap, vNormalMapUv )' : 'ntNFlip( normalMap, vNormalMapUv )')); }
export function noTile(m, { grade = HOUSE, tile = true, mode = tile ? 'full' : 'tone' } = {}) {
  const g = { ...HOUSE, ...grade }, key = `nt_${mode}_${g.sat}_${g.con}_${g.tone}`;
  m.onBeforeCompile = (sh) => ntPatch(sh, mode, g); m.customProgramCacheKey = () => key; m.needsUpdate = true; return m;
}
// ---- wait for library images
const imgOK = (i) => i && (i.width || i.naturalWidth) > 0 && (i.complete === undefined || i.complete);
export function whenImages(names, cb) { const ts = names.map((n) => tex(n)); let tries = 0; const go = () => { if (ts.every((t) => imgOK(t.image))) cb(ts.map((t) => t.image)); else if (tries++ < 600) setTimeout(go, 50); }; go(); }
const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
export function meanColour(img) { const c = document.createElement('canvas'); c.width = c.height = 24; const x = c.getContext('2d'); x.drawImage(img, 0, 0, 24, 24); let r = 0, g = 0, b = 0; try { const d = x.getImageData(0, 0, 24, 24).data; for (let i = 0; i < d.length; i += 4) { r += lin(d[i] / 255); g += lin(d[i + 1] / 255); b += lin(d[i + 2] / 255); } } catch (e) { return [0.3, 0.3, 0.3]; } const n = 24 * 24; return [r / n, g / n, b / n]; }
export function matchColour(m, name, target, amt = 1) { const t = new THREE.Color(target); whenImages([name], ([img]) => { const a = meanColour(img), k = (i, v) => Math.min(8, 1 + ((v / Math.max(a[i], 0.005)) - 1) * amt); m.color.setRGB(k(0, t.r), k(1, t.g), k(2, t.b)); m.needsUpdate = true; }); return m; }
// ---- patchwork textures
function blurAlpha(d, w, h, r) { const a = new Float32Array(w * h); for (let i = 0; i < w * h; i++) a[i] = d[i * 4 + 3]; const t = new Float32Array(w * h); for (let pass = 0; pass < 2; pass++) { for (let y = 0; y < h; y++) { let s = 0; for (let x = -r; x <= r; x++) s += a[y * w + Math.min(w - 1, Math.max(0, x))]; for (let x = 0; x < w; x++) { t[y * w + x] = s / (2 * r + 1); s += a[y * w + Math.min(w - 1, x + r + 1)] - a[y * w + Math.max(0, x - r)]; } } for (let x = 0; x < w; x++) { let s = 0; for (let y = -r; y <= r; y++) s += t[Math.min(h - 1, Math.max(0, y)) * w + x]; for (let y = 0; y < h; y++) { a[y * w + x] = s / (2 * r + 1); s += t[Math.min(h - 1, y + r + 1) * w + x] - t[Math.max(0, y - r) * w + x]; } } } for (let i = 0; i < w * h; i++) d[i * 4 + 3] = Math.min(d[i * 4 + 3], a[i]) * 0.5 + a[i] * 0.5; }
// a piece: crop [u,v,cw,ch] (fractions of the source), turned k quarter-turns, flipped, keyed (a function r,g,b -> keep 0..1) or feathered
function piece(img, crop, size, { turn = 0, flip = false, key = null, feather = 0.3, soft = 3 }) {
  const W = img.width || img.naturalWidth, H = img.height || img.naturalHeight, c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d');
  x.translate(size / 2, size / 2); x.rotate(turn * Math.PI / 2); if (flip) x.scale(-1, 1); x.drawImage(img, crop[0] * W, crop[1] * H, crop[2] * W, crop[3] * H, -size / 2, -size / 2, size, size); x.setTransform(1, 0, 0, 1, 0, 0);
  try { const id = x.getImageData(0, 0, size, size), d = id.data;
    for (let i = 0; i < d.length; i += 4) { const px = (i / 4) % size, py = Math.floor(i / 4 / size), e = Math.min(px, py, size - 1 - px, size - 1 - py) / (size * 0.5); let k = key ? key(d[i], d[i + 1], d[i + 2]) : 1; if (!key || feather) k *= Math.min(1, e / Math.max(feather, 0.001)); d[i + 3] = 255 * Math.max(0, Math.min(1, k)); }
    if (soft) blurAlpha(d, size, size, soft); x.putImageData(id, 0, 0); } catch (e) { /* no pixel access: use it as is */ }
  return c;
}
const wrapDraw = (x, c, px, py, W, H, alpha = 1, op = 'source-over') => { x.globalAlpha = alpha; x.globalCompositeOperation = op; for (const ox of [-W, 0, W]) for (const oy of [-H, 0, H]) { const X = px + ox, Y = py + oy; if (X + c.width > 0 && X < W && Y + c.height > 0 && Y < H) x.drawImage(c, X, Y); } x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; };
function gradeCanvas(x, W, H, { sat = 1, con = 1, bright = 1, tint = null, tintAmt = 0 }) { try { const id = x.getImageData(0, 0, W, H), d = id.data, t = tint ? new THREE.Color(tint).convertLinearToSRGB() : null; for (let i = 0; i < d.length; i += 4) { let r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255; const l = 0.2126 * r + 0.7152 * g + 0.0722 * b; r = l + (r - l) * sat; g = l + (g - l) * sat; b = l + (b - l) * sat; r = (r - 0.5) * con + 0.5; g = (g - 0.5) * con + 0.5; b = (b - 0.5) * con + 0.5; if (t) { r += (t.r * l * 2 - r) * tintAmt; g += (t.g * l * 2 - g) * tintAmt; b += (t.b * l * 2 - b) * tintAmt; } d[i] = r * bright * 255; d[i + 1] = g * bright * 255; d[i + 2] = b * bright * 255; } x.putImageData(id, 0, 0); } catch (e) { /* leave it */ } }
// patchwork({ size, base: { name, tint, rep }, pieces: [{ name, crop, at:[x,y] (0..1), scale (of size), turn, flip, key, feather, alpha, op }], wash, grade, rough, metal, seed })
export function patchwork({ size = 1024, base, pieces = [], wash = 0.18, grade = {}, seed = 1, rough = 0.6, metal = 0.1, repeat = [1, 1] }) {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d'); x.fillStyle = base.fill || '#888'; x.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; t.repeat.set(...repeat);
  const names = [...new Set([base.name, ...pieces.map((p) => p.name)].filter(Boolean))];
  whenImages(names, (imgs) => { const I = Object.fromEntries(names.map((n, i) => [n, imgs[i]])), R = rng(seed);
    if (base.name) { const rep = base.rep || 1, s = size / rep; for (let i = 0; i < rep; i++) for (let j = 0; j < rep; j++) x.drawImage(I[base.name], i * s, j * s, s, s); if (base.tint) { x.globalCompositeOperation = 'multiply'; x.fillStyle = base.tint; x.fillRect(0, 0, size, size); x.globalCompositeOperation = 'source-over'; } }
    for (const p of pieces) { const sz = Math.round(size * (p.scale || 0.5)), pc = piece(I[p.name], p.crop || [0, 0, 1, 1], sz, p), at = p.at || [R(), R()]; if (p.tint) { const q = pc.getContext('2d'); q.globalCompositeOperation = 'source-atop'; q.globalAlpha = p.tintAmt ?? 0.5; q.fillStyle = p.tint; q.fillRect(0, 0, sz, sz); } wrapDraw(x, pc, at[0] * size - sz / 2, at[1] * size - sz / 2, size, size, p.alpha ?? 1, p.op || 'source-over'); }
    if (wash) for (let i = 0; i < 7; i++) { const cx = R() * size, cy = R() * size, r = size * (0.25 + R() * 0.4), gr = x.createRadialGradient(cx, cy, 0, cx, cy, r), dark = R() < 0.55; gr.addColorStop(0, dark ? `rgba(0,0,0,${wash * 0.6})` : `rgba(255,255,255,${wash * 0.35})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = gr; x.fillRect(0, 0, size, size); }
    gradeCanvas(x, size, size, grade); t.needsUpdate = true; });
  return new THREE.MeshStandardMaterial({ map: t, roughness: rough, metalness: metal });
}
// painted metal with a little rust: clean grey paint (tinted), the rust blotches cut out of 'rusty_paint' and pasted three
// times (as is, upside down, a half turned sideways), a couple of faint run-stains, then one grade over it all.
const rustKey = (r, g, b) => (r - b - 40) / 50;
const _RP = new Map();
export function rustPaint(tint = '#7a8a7a', seed = 1, { amount = 1, rough = 0.6, metal = 0.15 } = {}) { const k = tint + seed + amount; if (_RP.has(k)) return _RP.get(k); const R = rng(seed * 7 + 3), cr = () => [R() * 0.5, R() * 0.6, 0.5, 0.4];
  const pieces = [{ name: 'rusty_paint', crop: cr(), scale: 0.42 * amount, turn: 0, key: rustKey, feather: 0.12 }, { name: 'rusty_paint', crop: cr(), scale: 0.36 * amount, turn: 2, key: rustKey, feather: 0.12 }, { name: 'rusty_paint', crop: [R() * 0.5, R() * 0.6, 0.25, 0.4], scale: 0.3 * amount, turn: 1, flip: true, key: rustKey, feather: 0.12 },
    { name: 'b84_rust', crop: [R() * 0.4, R() * 0.4, 0.3, 0.3], scale: 0.22, at: [R(), 0.9], feather: 0.6, alpha: 0.45, op: 'multiply' }, { name: 'g132_rustpaint', crop: [0, 0, 0.5, 1], scale: 0.5, at: [R(), 0.5], turn: 0, feather: 0.5, alpha: 0.5 }];
  const m = patchwork({ size: 512, base: { name: 'g132_rustpaint', tint, fill: tint }, pieces, seed, rough, metal, grade: { sat: 0.92, con: 0.96 }, wash: 0.14 }); _RP.set(k, m); return m; }
