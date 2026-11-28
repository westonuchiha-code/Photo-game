// The owner's PSX OBJ models (lights, office, signs, buildings, fairground), dressed only from library textures as the
// owner asked: each face's material is picked by part name, facing and height (objDress), all through fill_kit's T()
// so the no-repeat shader, the shared grade and colour matching apply. Signs carry made-up names.
import { THREE, objDress } from './psx_kit.js';
import { T, M, P, sheet, text } from './fill_kit.js';

const rel = (q) => (q.c.y - q.b.min.y) / Math.max(1e-6, q.b.max.y - q.b.min.y);   // 0 at the model's foot, 1 at its top
const side = (q) => Math.abs(q.n.y) < 0.5, up = (q) => q.n.y > 0.6;
const glow = (col = '#ffd79a', k = 1.6) => new THREE.MeshStandardMaterial({ color: col, emissive: new THREE.Color(col), emissiveIntensity: k, roughness: 0.4 });
const iron = () => T('b80_blackplastic', 1, 1, { tint: '#3a3a3c', rough: 0.55, metal: 0.4 });
const weathered = (r = 1) => T('wd_plank_b', r, r, { rough: 0.95, match: '#6a6258' });
const deck = (r = 1) => T('wd_plank_b', r, r, { rough: 0.9, match: '#7a6248' });
const tin = () => T('g141_rust_roof', 1, 1, { rough: 0.8, metal: 0.25 });
// a flat front face (a sign, a poster): the model plus a drawn face just in front of its widest side
async function withFace(o, w, h, draw, inset = 0.94) {
  const b = new THREE.Box3().setFromObject(o), s = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3()), alongX = s.x >= s.z;
  const pl = new THREE.Mesh(new THREE.PlaneGeometry((alongX ? s.x : s.z) * inset, s.y * inset), sheet(w, h, draw, { roughness: 0.8 }));
  if (alongX) pl.position.set(c.x, c.y, b.max.z + 0.004); else { pl.rotation.y = Math.PI / 2; pl.position.set(b.max.x + 0.004, c.y, c.z); }
  o.add(pl); return o; }

// ---- lights
export const makePxWallLantern = () => objDress('px_ob_lamp01', { iron: iron(), glass: glow('#ffcf86') }, (q) => (rel(q) > 0.42 && side(q) && rel(q) < 0.9 && Math.abs(q.c.z - (q.b.min.z + q.b.max.z) / 2) < 0.2 ? 'glass' : 'iron'), { tile: 0.3 });
const streetLamp = (paint) => objDress('px_ob_oldlantern01a', { post: T('g132_rustpaint', 1, 1, { tint: paint, rough: 0.6, metal: 0.3 }), glass: glow('#ffd79a', 1.8), cap: iron() }, (q) => { const h = rel(q); return h > 0.915 && h < 0.965 && side(q) ? 'glass' : h > 0.9 ? 'cap' : 'post'; }, { tile: 0.5 });
export const makePxOldStreetLamp = () => streetLamp('#3a4a3c');
export const makePxOldStreetLampBlack = () => streetLamp('#2a2a2c');
export const makePxWallSconce = () => objDress('px_ob_shadelamp01', { brass: T('b85_bronze', 1, 1, { rough: 0.35, metal: 0.7 }), shade: glow('#f0d0a0', 0.9) }, (q) => (rel(q) > 0.72 && side(q) ? 'shade' : 'brass'), { height: 0.95, tile: 0.2 });
export async function makePxTorch() { const g = await objDress('px_ob_torch01', { wood: T('bark_oak', 1, 1, { rough: 1 }), rag: T('b82_canvasgrey', 1, 1, { tint: '#3a3028', rough: 1 }) }, (q) => (rel(q) > 0.78 ? 'rag' : 'wood'), { tile: 0.15 });
  const b = new THREE.Box3().setFromObject(g), f = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.22, 7), new THREE.MeshBasicMaterial({ color: new THREE.Color(2.4, 1.1, 0.3), toneMapped: false })); f.position.set((b.min.x + b.max.x) / 2, b.max.y + 0.08, (b.min.z + b.max.z) / 2); g.add(f); return g; }
// ---- office
export const makePxDesk = () => objDress('px_ob_desk01', { body: T('walnut_floor', 1, 1, { rough: 0.5, match: '#5a3a26' }), drawer: T('walnut_floor', 1, 1, { rough: 0.45, match: '#6e4a30' }), top: T('walnut_floor', 1, 1, { rough: 0.35, match: '#4e3220' }) }, (q) => (/Drawer/.test(q.obj) ? 'drawer' : up(q) && rel(q) > 0.9 ? 'top' : 'body'), { tile: 0.8 });
export const makePxDeskTray = () => objDress('px_ob_organizer01', { m: T('op_leather', 1, 1, { match: '#4a3a2e', rough: 0.6 }) }, () => 'm', { scale: 0.6, tile: 0.4 });
const pencil = (paint) => objDress('px_ob_pencil01a', { body: P(paint, { roughness: 0.4 }), wood: T('laminate_oak', 1, 1, { rough: 0.8 }), end: P('#d88a8a', { roughness: 0.9 }) }, (q) => { const z = (q.c.z - q.b.min.z) / (q.b.max.z - q.b.min.z); return z > 0.93 ? 'wood' : z < 0.05 ? 'end' : 'body'; }, { scale: 0.38, tile: 0.05 });
export const makePxPencilYellow = () => pencil('#e8b81e');
export const makePxPencilRed = () => pencil('#b8281e');
export const makePxPencilBlue = () => pencil('#2a4a9a');
// ---- signs
export const makePxPoster = async () => withFace(await objDress('px_ob_poster01', { m: T('sg_plaster', 1, 1, { tint: '#e8e2d0' }) }, () => 'm'), 300, 450, (x, w, h) => { x.fillStyle = '#e8e0cc'; x.fillRect(0, 0, w, h); x.fillStyle = '#1a1a1c'; x.fillRect(20, 20, w - 40, 250); x.fillStyle = '#c8281e'; x.beginPath(); x.arc(w / 2, 140, 70, 0, 7); x.fill(); text(x, 'HAVE YOU', w / 2, 320, '900 40px Arial', '#1a1a1c'); text(x, 'SEEN HER?', w / 2, 365, '900 40px Arial', '#1a1a1c'); text(x, 'call 555-0141', w / 2, 415, 'italic 20px Georgia', '#3a3a3a'); });
export const makePxBakerySign = async () => withFace(await objDress('px_ob_signbakery01', { m: deck(1) }, () => 'm'), 640, 240, (x, w, h) => { x.fillStyle = '#5a3a24'; x.fillRect(0, 0, w, h); x.strokeStyle = '#c8a050'; x.lineWidth = 8; x.strokeRect(14, 14, w - 28, h - 28); text(x, 'ELM ST. BAKERY', w / 2, 110, 'bold 70px Georgia', '#f0e0b8'); text(x, 'bread · rolls · open at six', w / 2, 180, 'italic 30px Georgia', '#c8a050'); });
export const makePxTarp = () => objDress('px_ob_tarpet01', { m: T('b82_canvasblue', 1, 1, { rough: 0.95, side: THREE.DoubleSide }) }, () => 'm', { tile: 1.5, keepLines: true });
// ---- buildings
export const makePxBumperArena = () => objDress('px_ob_bumpercararena01', { frame: T('g132_rustpaint', 1, 1, { tint: '#c84a2a', rough: 0.6, metal: 0.2 }), floor: T('g132_metal_scratched', 1, 1, { tint: '#8a8c90', rough: 0.5, metal: 0.4 }), roof: tin(), net: T('px_sw_wirefence', 1, 1, { side: THREE.DoubleSide }) }, (q) => ({ Floor: 'floor', Roof: 'roof', Net: 'net' }[q.mtl] || 'frame'), { tile: 2 });
export const makePxFisherHut = () => objDress('px_ob_fisherhut01', { wall: weathered(1), roof: tin(), door: T('g144_wood_grey', 1, 1, { rough: 0.95, match: '#5a5046' }), latch: M.rust(), ladder: deck(1) }, (q) => (/Door/.test(q.obj) ? 'door' : /Latch/.test(q.obj) ? 'latch' : /Ladder/.test(q.obj) ? 'ladder' : up(q) && rel(q) > 0.75 ? 'roof' : 'wall'), { tile: 1.2 });
const gasPaint = (tint) => T('g132_rustpaint', 1, 1, { tint, rough: 0.65, metal: 0.25 });
export const makePxGasHolderSphere = () => objDress('px_ob_gasstorage01', { tank: gasPaint('#9aa89a'), steel: M.rust(), deck: M.galv(), cap: gasPaint('#5a6a5a') }, (q) => (/Sphere/.test(q.obj) ? 'tank' : /Plattform/.test(q.obj) ? 'deck' : /Cap/.test(q.obj) ? 'cap' : 'steel'), { tile: 3 });
export const makePxGasHolder = () => objDress('px_ob_gasstorage02a', { frame: gasPaint('#3a4a3c'), silo: gasPaint('#8a9488'), pad: M.concrete(1) }, (q) => (/Silo/.test(q.obj) ? 'silo' : rel(q) < 0.03 ? 'pad' : 'frame'), { tile: 3 });
export const makePxGasHolderEmpty = () => objDress('px_ob_gasstorage02b', { frame: gasPaint('#3a4a3c'), pad: M.concrete(1) }, (q) => (rel(q) < 0.03 ? 'pad' : 'frame'), { tile: 3 });
const pier = (file) => objDress(file, { post: weathered(1), deck: deck(1), wet: T('g144_wood_grey', 1, 1, { rough: 0.6, match: '#3e3a34' }) }, (q) => (up(q) && rel(q) > 0.8 ? 'deck' : rel(q) < 0.35 ? 'wet' : 'post'), { tile: 1 });
export const makePxPier = () => pier('px_ob_pier01');
export const makePxPierEnd = () => pier('px_ob_pier01_end');
export const makePxPierBraced = () => pier('px_ob_pier02');
const shack = (file) => objDress(file, { wall: T('g141_rust_roof', 1, 1, { rough: 0.8, metal: 0.2, match: '#7a5a44' }), roof: tin(), door: weathered(1) }, (q) => (/Door/.test(q.obj) ? 'door' : up(q) && rel(q) > 0.8 ? 'roof' : 'wall'), { tile: 1.5 });
export const makePxShack = () => shack('px_ob_shack01a');
export const makePxShackDoors = () => shack('px_ob_shack01b');
export function makePxSwingCarousel() {
  const seat = ['#c8281e', '#e8b81e', '#2a5aa8', '#2a7a3a', '#e8742a', '#7a2a8a'], mats = { deck: T('wd_plank_b', 1, 1, { rough: 0.85, match: '#6a5a4a' }), base: T('g132_rustpaint', 1, 1, { tint: '#2a6a7a', rough: 0.6 }), canopy: T('g132_rustpaint', 1, 1, { tint: '#c84a3a', rough: 0.55 }), pole: T('g132_rustpaint', 1, 1, { tint: '#e8d8a8', rough: 0.5, metal: 0.2 }), chain: M.galv() };
  seat.forEach((c, i) => (mats['s' + i] = T('g132_rustpaint', 1, 1, { tint: c, rough: 0.55 })));
  return objDress('px_ob_swingcarousel01', mats, (q) => { if (/Swing/.test(q.obj)) { const sy = (q.c.y - q.ob.min.y) / Math.max(1e-6, q.ob.max.y - q.ob.min.y); const i = (parseInt((q.obj.match(/\.(\d+)$/) || [0, 0])[1], 10) || 0) % 6; return sy < 0.12 ? 's' + i : 'chain'; }
    if (/Upper/.test(q.obj)) return 'canopy'; if (/Platform/.test(q.obj)) return up(q) ? 'deck' : 'base'; return 'pole'; }, { tile: 1.5 });
}
