// Places that should not be there: what is behind the one door in an area that is always a little open.
//   makeWrongPlace(kind) -> { group, areas: [{ minX, maxX, minZ, maxZ }] (local), exit: [x0, x1, z0, z1] (local),
//                             start: [x, z, yaw], light: how bright the general light is in there (0..1), lamp: PointLight or null }
// 'corridor': far longer than the building it is in; the same door again and again; the door at the far end lets you
//             out where you came in.
// 'hall':     one enormous dark room with a table, a chair and a lamp in the middle of it; the way out is on the far side.
// Built from the same wall, floor and furniture pieces as the ordinary interiors.
import * as THREE from 'three';
import { mat, plain, box, flat } from '../models/kit.js';
import { makeChair } from '../models/furniture88.js';
import { makeKitchenTable } from '../models/kitchen89.js';

const lit = () => new THREE.MeshBasicMaterial({ color: new THREE.Color(1.9, 1.8, 1.55), toneMapped: false });
function door(g, x, z, ry, wood, trim) { const d = new THREE.Group(); d.position.set(x, 0, z); d.rotation.y = ry; g.add(d); box(0.86, 2.02, 0.04, wood, 0, 1.01, 0.03, d, 0.9); for (const [y0, y1] of [[0.2, 0.9], [1.05, 1.85]]) box(0.6, y1 - y0, 0.01, wood, 0, (y0 + y1) / 2, 0.055, d, 0.9); for (const s of [-1, 1]) box(0.06, 2.08, 0.07, trim, s * 0.46, 1.04, 0.02, d); box(0.98, 0.06, 0.07, trim, 0, 2.08, 0.02, d); const k = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 6), plain('#b8a04a', { roughness: 0.3, metalness: 0.7 })); k.position.set(0.34, 1.0, 0.07); d.add(k); return d; }

export function makeWrongPlace(kind) {
  const g = new THREE.Group(); g.name = 'wrong_' + kind; const T = 0.12;
  const wood = mat('wood_floor', { to: '#5a4030', rough: 0.5 }), trim = mat('sg_plaster', { to: '#d9d5c8', rough: 0.6 });
  if (kind === 'corridor') { const W = 1.0, L = 66, H = 2.45, wall = mat('sg_plaster', { to: '#b9b39a', rough: 0.9 }), carpet = mat('dn_carpet', { to: '#5a2f2a', rough: 1 });
    flat(-W, W, 0, L, 0.004, carpet, g, 1.5); const ceil = flat(-W, W, 0, L, H, mat('b82_speckle', { to: '#cfcabb', side: THREE.DoubleSide }), g, 1.2); ceil.castShadow = false;
    for (const s of [-1, 1]) { box(T, H, L, wall, s * (W + T / 2), H / 2, L / 2, g, 2.4); box(0.02, 0.09, L, trim, s * (W - 0.01), 0.045, L / 2, g); }
    box(W * 2 + T * 2, H, T, wall, 0, H / 2, -T / 2, g, 2.4); box(W * 2 + T * 2, H, T, wall, 0, H / 2, L + T / 2, g, 2.4);
    // the same door, every four metres, both sides, all the way down; a strip light between each pair
    for (let z = 3; z < L - 2; z += 4) { door(g, -W + 0.001, z, Math.PI / 2, wood, trim); door(g, W - 0.001, z + 2, -Math.PI / 2, wood, trim); const p = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.03, 1.1), lit()); p.position.set(0, H - 0.016, z + 1); g.add(p); }
    door(g, 0, 0.001, 0, wood, trim); door(g, 0, L - 0.001, Math.PI, wood, trim);   // the one you came in by, and the one at the end
    return { group: g, areas: [{ minX: -W + 0.28, maxX: W - 0.28, minZ: 0.35, maxZ: L - 0.2 }], exit: [-W, W, L - 1.1, L], start: [0, 1.2, Math.PI], light: 0.34, lamp: null }; }
  // the hall
  const S = 22, H = 9, wall = plain('#1d1e22', { roughness: 0.95 }), floorM = mat('walnut_floor', { to: '#3a2a20', rough: 0.5 });
  flat(-S, S, 0, S * 2, 0.004, floorM, g, 1.5); const ceil = flat(-S, S, 0, S * 2, H, plain('#101114', { roughness: 1, side: THREE.DoubleSide }), g, 1); ceil.castShadow = false;
  box(S * 2, H, T, wall, 0, H / 2, -T / 2, g); box(S * 2, H, T, wall, 0, H / 2, S * 2 + T / 2, g); for (const s of [-1, 1]) box(T, H, S * 2, wall, s * (S + T / 2), H / 2, S, g);
  door(g, 0, 0.001, 0, wood, trim); door(g, 0, S * 2 - 0.001, Math.PI, wood, trim);
  // in the middle: a table, one chair pulled out, a lamp on a long flex
  const tb = makeKitchenTable(); tb.position.set(0, 0, S); g.add(tb); const ch = makeChair(); ch.position.set(0.15, 0, S - 1.05); ch.rotation.y = 0.35; g.add(ch);
  box(0.012, H - 2.3, 0.012, plain('#0c0c0e'), 0, 2.3 + (H - 2.3) / 2, S, g); const shade = new THREE.Mesh(new THREE.ConeGeometry(0.26, 0.2, 16, 1, true), plain('#2a2c2e', { roughness: 0.6, side: THREE.DoubleSide })); shade.position.set(0, 2.32, S); g.add(shade); const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), lit()); bulb.position.set(0, 2.22, S); g.add(bulb);
  // (the lamp's light is painted, not real: a real light here would cost every surface in the area something)
  { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), gr = x.createRadialGradient(64, 64, 2, 64, 64, 64); gr.addColorStop(0, 'rgba(255,226,170,0.85)'); gr.addColorStop(0.35, 'rgba(255,220,160,0.35)'); gr.addColorStop(1, 'rgba(255,220,160,0)'); x.fillStyle = gr; x.fillRect(0, 0, 128, 128);
    const pm = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }), pool = new THREE.Mesh(new THREE.PlaneGeometry(13, 13), pm); pool.rotation.x = -Math.PI / 2; pool.position.set(0, 0.012, S); g.add(pool);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.1), pm); top.rotation.x = -Math.PI / 2; top.position.set(0, 0.79, S); g.add(top); }
  const lamp = null;
  return { group: g, areas: [{ minX: -S + 0.3, maxX: S - 0.3, minZ: 0.35, maxZ: S * 2 - 0.2 }], exit: [-0.9, 0.9, S * 2 - 1.1, S * 2], start: [0, 1.2, Math.PI], light: 0.07, lamp, colliders: [[-0.75, 0.75, S - 0.5, S + 0.5]] };
}
