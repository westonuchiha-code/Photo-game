// The owner's PSX vehicle pack, dressed by hand (replaces the generated pass, which painted single-mesh bodies one
// colour). Library textures only, as the owner asked. Bodies that come as one mesh get their windows from their own
// faces (the cabin band), and real detail parts (headlights, tail lights, grille, bumpers, plates, decals) are placed by
// casting a ray at the body, so they sit on its surface. Military paint is drawn camouflage; tracks are drawn links.
import { THREE, objDress, objSrc } from './psx_kit.js';
import { whenImages } from './texmix.js';
import { T, M, P, glass, sheet, text } from './fill_kit.js';

const tiled = (w, h, draw, o = {}) => { const m = sheet(w, h, draw, { roughness: 0.75, ...o }); m.map.wrapS = m.map.wrapT = THREE.RepeatWrapping; return m; };
const blobs = (cols, seed) => (x, w, h) => { let s = seed; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647); x.fillStyle = cols[0]; x.fillRect(0, 0, w, h);
  for (let c = 1; c < cols.length; c++) for (let i = 0; i < 9; i++) { x.fillStyle = cols[c]; const cx = r() * w, cy = r() * h; x.beginPath(); for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2, rr = (0.08 + r() * 0.12) * w; const px = cx + Math.cos(a) * rr * (1.4 + r()), py = cy + Math.sin(a) * rr; k ? x.lineTo(px, py) : x.moveTo(px, py); } x.fill();
    for (const [dx, dy] of [[-w, 0], [w, 0], [0, -h], [0, h]]) { x.save(); x.translate(dx, dy); x.fill(); x.restore(); } }
  x.globalAlpha = 0.18; for (let i = 0; i < 1400; i++) { x.fillStyle = r() < 0.5 ? '#000' : '#fff'; x.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); } x.globalAlpha = 1; };
const NATO = () => tiled(256, 256, blobs(['#4a5432', '#3a2e22', '#1e1e1a'], 7)), DESERT = () => tiled(256, 256, blobs(['#a8946a', '#9a8660', '#b4a27a'], 11)), FELD = () => T('g132_rustpaint', 1, 1, { match: '#6a6a58', matchAmt: 0.9, rough: 0.85, metal: 0.15 });
const TRACKS = () => tiled(64, 64, (x, w, h) => { x.fillStyle = '#2a2a2a'; x.fillRect(0, 0, w, h); x.fillStyle = '#4a4844'; for (let i = 0; i < 4; i++) x.fillRect(0, i * 16 + 2, w, 9); x.fillStyle = '#1a1a1a'; x.fillRect(w / 2 - 4, 0, 8, h); }, { metalness: 0.4, roughness: 0.6 });
const RUBBER = () => P('#1c1c1e', { roughness: 0.92 }), GUN = () => T('g132_metal_scratched', 1, 1, { tint: '#4a4c50', rough: 0.4, metal: 0.6 }), HUB = () => P('#9a9ea2', { roughness: 0.35, metalness: 0.7 });
const GLASS = (c = '#2a3a44') => glass({ opacity: 0.78, color: c, roughness: 0.05, metalness: 0.4 }), CHROME = () => P('#c8ccd0', { roughness: 0.2, metalness: 0.8 });
const carPaint = (c) => T('g132_rustpaint', 1, 1, { match: c, matchAmt: 0.97, rough: 0.32, metal: 0.35 });
const glowM = (c, k = 2) => new THREE.MeshStandardMaterial({ color: c, emissive: new THREE.Color(c), emissiveIntensity: k });
const rel = (q) => (q.c.y - q.b.min.y) / Math.max(1e-6, q.b.max.y - q.b.min.y), relz = (q) => (q.c.z - q.b.min.z) / Math.max(1e-6, q.b.max.z - q.b.min.z);
const inPart = (q, ax) => (q.c[ax] - q.ob.min[ax]) / Math.max(1e-6, q.ob.max[ax] - q.ob.min[ax]);
// a wheel: rubber, with the hub face (the flat sides near the axle) in metal
const wheel = (q) => (Math.abs(q.n.x) > 0.7 && Math.hypot(q.c.y - (q.ob.min.y + q.ob.max.y) / 2, q.c.z - (q.ob.min.z + q.ob.max.z) / 2) < 0.28 * (q.ob.max.y - q.ob.min.y) ? 'hub' : 'rubber');
// stick a detail on the body: cast from outside along -dir at (x, y) (or (y, z) / (x, z) for other dirs)
function stick(g, body, mesh, dir, a, b, gap = 0.006) {
  const box = new THREE.Box3().setFromObject(g), far = 20, o = new THREE.Vector3(), d = new THREE.Vector3(...dir).normalize();
  if (Math.abs(d.z) > 0.5) o.set(a, b, d.z > 0 ? box.max.z + far : box.min.z - far); else if (Math.abs(d.x) > 0.5) o.set(d.x > 0 ? box.max.x + far : box.min.x - far, a, b); else o.set(a, box.max.y + far, b);
  const rc = new THREE.Raycaster(o, d.clone().negate()), hit = rc.intersectObjects(body, true)[0]; if (!hit) return null;
  mesh.position.copy(hit.point).addScaledVector(d, gap); mesh.lookAt(mesh.position.clone().add(d)); g.add(mesh); return mesh; }
const plane = (w, h, m) => new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
const plateM = (t) => sheet(256, 128, (x, w, h) => { x.fillStyle = '#e8e4d4'; x.fillRect(0, 0, w, h); x.strokeStyle = '#2a2a2a'; x.lineWidth = 6; x.strokeRect(4, 4, w - 8, h - 8); text(x, 'ELM COUNTY', w / 2, 26, 'bold 18px Arial', '#2a4a8a'); text(x, t, w / 2, 80, 'bold 56px monospace', '#1a1a1a'); });
// lights, grille, bumpers and plates for a car whose front is +z
function carDetails(g, { plate = 'ELM 417', lightY = 0.36, grille = true, bumperY = 0.2, tailY = 0.42, police = false } = {}) {
  g.updateMatrixWorld(true); const body = []; g.traverse((c) => { if (c.isMesh) body.push(c); }); const box = new THREE.Box3().setFromObject(g), W = box.max.x - box.min.x, H = box.max.y - box.min.y;
  const head = glowM('#fff4dc', 1.6), tail = glowM('#c81e1e', 1.2), dark = P('#141416', { roughness: 0.6 });
  for (const s of [-1, 1]) { stick(g, body, plane(W * 0.2, H * 0.08, head), [0, 0, 1], s * W * 0.32, H * lightY); stick(g, body, plane(W * 0.16, H * 0.07, tail), [0, 0, -1], s * W * 0.34, H * tailY);
    stick(g, body, plane(W * 0.06, H * 0.035, glowM('#e8941e', 0.8)), [0, 0, 1], s * W * 0.44, H * (lightY - 0.05)); }
  if (grille) stick(g, body, plane(W * 0.32, H * 0.09, dark), [0, 0, 1], 0, H * (lightY - 0.01));
  for (const [z, dz] of [[1, 0.02], [-1, 0.02]]) { const bm = new THREE.Mesh(new THREE.BoxGeometry(W * 0.98, H * 0.07, 0.12), RUBBER()); stick(g, body, bm, [0, 0, z], 0, H * bumperY, dz); }
  for (const z of [1, -1]) stick(g, body, plane(0.42, 0.21, plateM(plate)), [0, 0, z], 0, H * (bumperY + 0.08), 0.075);
  if (police) for (const s of [-1, 1]) stick(g, body, plane(1.5, 0.32, sheet(512, 110, (x, w, h) => { x.clearRect(0, 0, w, h); text(x, 'POLICE', w / 2, h / 2, '900 86px Arial', '#f4f2ea'); }, { transparent: true })), [s, 0, 0], H * 0.5, 0.1);
  return g; }
// ---- cars (front +z): a drawn livery per side, its windows traced from the body's own roofline
async function profile(file, re) {   // the body's top height along its length, as fractions of the whole model's box
  const src = await objSrc(file); src.updateMatrixWorld(true); const all = new THREE.Box3(); let body = null; src.traverse((o) => { if (o.isMesh) { all.expandByObject(o); if (re.test(o.name)) body = o; } });
  const N = 48, top = new Array(N).fill(-1), S = all.getSize(new THREE.Vector3()), p = body.geometry.attributes.position, v = new THREE.Vector3();
  for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i).applyMatrix4(body.matrixWorld); const k = Math.min(N - 1, Math.max(0, Math.floor((v.z - all.min.z) / S.z * N))); top[k] = Math.max(top[k], (v.y - all.min.y) / S.y); }
  for (let k = 0; k < N; k++) if (top[k] < 0) top[k] = top[k - 1] ?? top.find((t) => t >= 0);
  return top; }
const paintSkin = (col) => (x, w, h) => { x.fillStyle = col; x.fillRect(0, 0, w, h); let s = 9; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647); x.globalAlpha = 0.06; for (let i = 0; i < 900; i++) { x.fillStyle = r() < 0.5 ? '#000' : '#fff'; x.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 2); } x.globalAlpha = 1; };
// over a painted canvas, once the library's scratched metal has loaded: a faint pass of it, so the paint has wear
function liveryMat(w, h, draw, gloss = 0.32) { const m = sheet(w, h, draw, { roughness: gloss, metalness: 0.3 }); whenImages(['g132_metal_scratched'], ([img]) => { const c = m.map.image, x = c.getContext('2d'); x.globalAlpha = 0.1; x.globalCompositeOperation = 'multiply'; for (let i = 0; i < c.width; i += 256) for (let j = 0; j < c.height; j += 256) x.drawImage(img, i, j, 256, 256); x.globalAlpha = 1; x.globalCompositeOperation = 'source-over'; m.map.needsUpdate = true; }); return m; }
function sideSkin(col, top, belt, sign, o) { return liveryMat(1024, 512, (x, W, H) => { paintSkin(col)(x, W, H); const N = top.length, X = (zf) => (sign < 0 ? zf : 1 - zf) * W, Y = (hy) => (1 - hy) * H;
    if (o.lower) { x.fillStyle = o.lower; x.fillRect(0, Y(0.47), W, H); text(x, 'POLICE', X(0.48), Y(0.33), '900 74px Arial', '#f0eee6'); }
    // the cabin: the longest run of the body standing well above the beltline (from cab onward for a van)
    let best = null, run = null; for (let k = 0; k < N; k++) { const ok = top[k] > belt + 0.12 && (!o.cab || k / N > o.cab); if (ok) { run = run || [k, k]; run[1] = k; if (!best || run[1] - run[0] > best[1] - best[0]) best = [...run]; } else run = null; }
    if (best) { const [k0, k1] = best, zf = (k) => (k + 0.5) / N, lo = belt + 0.03, pts = []; pts.push([zf(k0) + 0.012, lo]); for (let k = k0; k <= k1; k++) pts.push([zf(k), Math.max(lo + 0.05, top[k] - 0.055)]); pts.push([zf(k1) - 0.012, lo]);
      x.fillStyle = '#1e2830'; x.beginPath(); pts.forEach(([z, y], i) => (i ? x.lineTo(X(z), Y(y)) : x.moveTo(X(z), Y(y)))); x.closePath(); x.fill();
      x.fillStyle = 'rgba(160,190,210,0.18)'; x.beginPath(); pts.forEach(([z, y], i) => (i ? x.lineTo(X(z), Y(y)) : x.moveTo(X(z), Y(y)))); x.closePath(); x.save(); x.clip(); x.fillRect(0, 0, W, Y(lo + 0.12)); x.restore();   // a sky reflection along the top of the glass
      const bz = zf(k0) + (zf(k1) - zf(k0)) * (o.cab ? 0.5 : 0.48); x.fillStyle = col; x.fillRect(Math.min(X(bz - 0.012), X(bz + 0.012)), Y(1), Math.abs(X(bz + 0.012) - X(bz - 0.012)), Y(lo - 0.01) - Y(1));   // B pillar
      // door seams and handles below the glass
      x.strokeStyle = 'rgba(0,0,0,0.55)'; x.lineWidth = 3; for (const z of o.cab ? [zf(k0) + 0.01, bz, zf(k1)] : [zf(k0) - 0.03, bz, zf(k1) - 0.02]) { x.beginPath(); x.moveTo(X(z), Y(lo)); x.lineTo(X(z), Y(0.2)); x.stroke(); }
      x.fillStyle = '#9a9ea2'; for (const z of [bz - 0.06, (o.cab ? zf(k1) : zf(k1) - 0.02) - 0.06]) x.fillRect(Math.min(X(z), X(z + 0.04)), Y(lo - 0.05), Math.abs(X(z + 0.04) - X(z)), 9); }
    x.fillStyle = 'rgba(0,0,0,0.5)'; x.fillRect(0, Y(0.2), W, Y(0.12) - Y(0.2));   // the sill
  }); }
function endSkin(col, belt, o, front) { return liveryMat(512, 512, (x, W, H) => { paintSkin(col)(x, W, H); const Y = (hy) => (1 - hy) * H;
    if (o.lower) { x.fillStyle = o.lower; x.fillRect(0, Y(0.47), W, H); }
    if (!(o.cab && !front)) { x.fillStyle = '#1e2830'; x.fillRect(W * 0.1, Y(0.96), W * 0.8, Y(belt + 0.03) - Y(0.96)); x.fillStyle = 'rgba(160,190,210,0.18)'; x.fillRect(W * 0.1, Y(0.96), W * 0.8, (Y(belt + 0.03) - Y(0.96)) * 0.3); }
    else { x.strokeStyle = 'rgba(0,0,0,0.5)'; x.lineWidth = 3; x.beginPath(); x.moveTo(W / 2, Y(0.95)); x.lineTo(W / 2, Y(0.15)); x.stroke(); x.fillStyle = '#9a9ea2'; x.fillRect(W / 2 - 40, Y(0.55), 30, 8); x.fillRect(W / 2 + 10, Y(0.55), 30, 8); }   // a van's back doors
  }); }
const CAR = (file, col, belt, opts = {}) => async () => { const re = /chass|police/i, top = await profile(file, re);
  const mats = { paint: liveryMat(256, 256, paintSkin(col)), sideL: sideSkin(col, top, belt, -1, opts), sideR: sideSkin(col, top, belt, 1, opts), front: endSkin(col, belt, opts, true), back: endSkin(col, belt, opts, false), glass: GLASS(), rubber: RUBBER(), hub: HUB(), under: P('#1a1a1c', { roughness: 0.9 }), lower: liveryMat(256, 256, paintSkin(opts.lower || col)), bar_r: glowM('#e8282a', 2.2), bar_b: glowM('#2a4ae8', 2.2) };
  const g = await objDress(file, mats, (q) => { if (!re.test(q.obj)) return wheel(q); const h = rel(q), ax = Math.abs(q.n.x), az = Math.abs(q.n.z);
    if (opts.bar && h > 0.975 && q.n.y > 0.5) return q.c.x < (q.b.min.x + q.b.max.x) / 2 ? 'bar_r' : 'bar_b';
    if (q.n.y < -0.6) return 'under';
    if (ax >= az && Math.abs(q.n.y) < 0.75) return q.n.x < 0 ? 'sideL' : 'sideR';
    if (az > ax && Math.abs(q.n.y) < 0.68) return q.n.z > 0 ? 'front' : 'back';
    if (opts.lower && h < 0.45 && Math.abs(q.n.y) < 0.6) return 'lower'; return 'paint'; }, { tile: 1.5, uv: { sideL: 'fit', sideR: 'fit', front: 'fit', back: 'fit' } });
  return carDetails(g, { ...opts, police: false }); };
export const makePxCar01 = CAR('px_o_vehicles_car01', '#a8b4a4', 0.66, { cab: 0.5, plate: 'ELM 220', lightY: 0.4, tailY: 0.45 });
export const makePxCar02 = CAR('px_o_vehicles_car02', '#7a2a2a', 0.64, { plate: 'ELM 913' });
export const makePxCar02Blue = CAR('px_o_vehicles_car02', '#2a3a5a', 0.64, { plate: 'ELM 088' });
export const makePxCar02Cream = CAR('px_o_vehicles_car02', '#c8bea0', 0.64, { plate: 'ELM 551' });
export const makePxPoliceCar01 = CAR('px_o_vehicles_policecar01', '#eceae4', 0.6, { lower: '#16171a', bar: true, plate: 'ELM P 12', lightY: 0.38 });
// ---- bumper cars: glossy shell, rubber skirt, dark seat, steel pole with a spark at the top, a number on the nose
const BUMP = (col, n) => async () => { const mats = { shell: P(col, { roughness: 0.25, metalness: 0.1 }), skirt: RUBBER(), seat: P('#1e1e22', { roughness: 0.7 }), pole: CHROME() };
  const g = await objDress('px_o_vehicles_bumpercar01a', mats, (q) => { const y = q.c.y - q.b.min.y; return y > 1.62 ? 'pole' : y < 0.28 ? 'skirt' : 'shell'; }, { tile: 0.8 });
  g.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(g), body = []; g.traverse((c) => { if (c.isMesh) body.push(c); });
  const sp = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.5, 2.5, 1.2), toneMapped: false })); sp.position.set(0, box.max.y, box.min.z + 0.3); g.add(sp);
  stick(g, body, plane(0.36, 0.36, sheet(128, 128, (x, w, h) => { x.fillStyle = '#f4f0e0'; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); text(x, String(n), 64, 66, '900 74px Arial', '#1a1a1a'); }, { transparent: true })), [0, 0, 1], 0, 0.55);
  return g; };
export const makePxBumperCar01a = BUMP('#c81e1e', 3), makePxBumperCar01b = BUMP('#1e4ab8', 7), makePxBumperCar01c = BUMP('#e8b81e', 1), makePxBumperCar01d = BUMP('#2a8a3a', 9);
export const makePxEScooter01 = () => objDress('px_o_vehicles_escooter01', { alu: P('#a8acb0', { roughness: 0.35, metalness: 0.7 }), grip: RUBBER(), deck: P('#2a2a2c', { roughness: 0.9 }) },
  (q) => { const h = rel(q), z = relz(q); return (h < 0.18 && (z < 0.12 || z > 0.88)) ? 'grip' : h > 0.94 ? 'grip' : (q.n.y > 0.7 && h < 0.2) ? 'deck' : 'alu'; }, { tile: 0.3 });
// ---- the excavator: yellow body, glass cab, drawn tracks, chrome rams, worn steel teeth
export const makePxExcavator01 = () => objDress('px_o_vehicles_excavator01', { yel: T('g132_rustpaint', 1, 1, { match: '#d8a81e', matchAmt: 0.9, rough: 0.6, metal: 0.2 }), tracks: TRACKS(), deck: P('#2a2a2c', { roughness: 0.8 }), glass: GLASS(), ram: CHROME(), steel: M.rust() },
  (q) => { if (/Hydrau/i.test(q.obj)) return 'ram'; if (/Chassis/i.test(q.obj)) return inPart(q, 'y') < 0.6 ? 'tracks' : 'deck'; if (/Cabin/i.test(q.obj)) return inPart(q, 'y') > 0.45 && Math.abs(q.n.y) < 0.6 && inPart(q, 'x') > 0.4 ? 'glass' : 'yel'; if (/Shovel/i.test(q.obj) && inPart(q, 'y') < 0.15) return 'steel'; return 'yel'; }, { tile: 1.2 });
// ---- military: camouflage, drawn tracks, dark road wheels, gunmetal guns
const MIL = (file, paint, extra = () => null) => () => objDress(file, { paint: paint(), tracks: TRACKS(), wheel: P('#2a2a28', { roughness: 0.8 }), rubber: RUBBER(), hub: HUB(), gun: GUN(), glass: GLASS('#3a4a3a'), wood: T('laminate_oak', 1, 1, { rough: 0.7 }), canvas: T('b82_canvasgrey', 1, 1, { match: '#5a5a3a', rough: 0.95 }), steel: M.galv() },
  (q) => { const e = extra(q); if (e) return e; const nm = q.obj + ' ' + q.mtl;
    if (/track/i.test(nm)) return 'tracks'; if (/sprocket|wheel/i.test(nm)) return /tire|wheels\.|wheel(bck|mid|fro)/i.test(q.obj) ? wheel(q) : 'wheel'; if (/tire/i.test(nm)) return wheel(q);
    if (/gun|barrel|cannon|mg0815/i.test(nm)) return 'gun'; if (/window/i.test(nm)) return 'glass'; if (/luggage/i.test(nm)) return 'canvas'; if (/pickaxe|^axe/i.test(q.obj)) return inPart(q, 'z') > 0.75 ? 'steel' : 'wood';
    return 'paint'; }, { tile: 2.5 });
export const makePxAV7 = MIL('px_o_vehicles_av_7', FELD);
export const makePxKWagen = MIL('px_o_vehicles_kwagen', FELD);
export const makePxL1A5 = MIL('px_o_vehicles_l1a5', NATO);
export const makePxM1A2 = MIL('px_o_vehicles_m1a2', DESERT);
export const makePxTPzFuchs = MIL('px_o_vehicles_tpzfuchs', NATO);
export const makePxGDWolf = MIL('px_o_vehicles_gdwolf', NATO, (q) => (/Details\.Back/.test(q.obj) ? wheel(q) : /Chassis/.test(q.obj) && rel(q) > 0.62 && Math.abs(q.n.y) < 0.75 ? 'glass' : null));
export const makePxTurret77 = MIL('px_o_vehicles_turret7_7', FELD);
export const makePxTurretMG0815 = MIL('px_o_vehicles_turretmg0815', GUN);
// ---- aircraft
export const makePxEFT = () => objDress('px_o_vehicles_eft', { top: T('g132_rustpaint', 1, 1, { match: '#7a8088', matchAmt: 0.95, rough: 0.5, metal: 0.3 }), belly: P('#a8aeb4', { roughness: 0.5, metalness: 0.3 }), canopy: GLASS('#8a6a2a'), store: P('#e4e2dc', { roughness: 0.5 }), dark: P('#2a2c30', { roughness: 0.6 }), rubber: RUBBER(), hub: HUB() },
  (q) => { if (/cockpit/i.test(q.obj)) return inPart(q, 'y') > 0.35 ? 'canopy' : 'top'; if (/sraam|irm|bmb|amraam|tank|missile/i.test(q.obj)) return 'store'; if (/wheel|gear/i.test(q.obj)) return wheel(q); if (/intake|nozzle|engine/i.test(q.obj)) return 'dark'; return q.n.y < -0.3 ? 'belly' : 'top'; }, { tile: 3 });
export const makePxV1Rocket = () => objDress('px_o_vehicles_v1_rocket', { body: T('g132_rustpaint', 1, 1, { match: '#5a6458', matchAmt: 0.9, rough: 0.7, metal: 0.2 }), jet: GUN(), belly: P('#8a9488', { roughness: 0.7 }) },
  (q) => (rel(q) > 0.62 ? 'jet' : q.n.y < -0.4 ? 'belly' : 'body'), { tile: 2 });
