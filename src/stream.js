// Distance streaming, step 1: size-based culling. After the world is built, every node is measured once (a world-space
// bounding box, computed bottom-up). Small things are hidden when the camera is far from them, big things stay longer:
//   show distance = min(MAX, BASE + radius * K)   (a 0.5 m prop ~ 75 m, a 5 m stall ~ 110 m, a 40 m hall ~ 390 m)
// Anything that animates or moves itself (userData.update / tick / brain) is never hidden, and nothing the game itself
// hid is touched: only nodes visible at registration are managed, and only the streamer's own hides are undone.
import * as THREE from 'three';

export function makeStreamer(scene, { base = 70, k = 8, max = 450, always = 120, phone = false } = {}) {
  if (phone) { base *= 0.75; max *= 0.7; }
  const entries = [];
  const box = new THREE.Box3(), tmp = new THREE.Box3();
  scene.updateMatrixWorld(true);
  // bottom-up: returns this node's world box (or null), registering nodes small enough to cull on their own
  function measure(o, depth) {
    if (!o.visible) return null;
    const ud = o.userData || {};
    const self = new THREE.Box3();
    if (o.isInstancedMesh) { o.computeBoundingBox(); if (o.boundingBox) self.copy(o.boundingBox).applyMatrix4(o.matrixWorld); }
    else if ((o.isMesh || o.isPoints || o.isLine || o.isSprite) && o.geometry) { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); if (o.geometry.boundingBox) self.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); }
    const kids = [];
    for (const c of o.children) { if (c.isLight || c.isCamera) continue; const b = measure(c, depth + 1); if (b) { self.union(b); kids.push([c, b]); } }
    if (self.isEmpty()) return null;
    const animated = typeof ud.update === 'function' || typeof ud.tick === 'function' || typeof ud.brain === 'function' || ud.noStream;
    if (animated) {   // whole animated set culls as one, and its centre follows it if it moves
      o.traverse((d) => { if (d !== o) unregister(d); });
      if (depth > 0) { const r = self.getSize(new THREE.Vector3()).length() / 2; register(o, self, Math.min(r, 60)); const e = byObj.get(o); e.live = true; e.off = e.c.clone().sub(o.getWorldPosition(new THREE.Vector3())); }
      return self;
    }
    const size = self.getSize(new THREE.Vector3()), r = size.length() / 2;
    // a node is worth culling on its own if it's not huge; its children registered earlier are dropped in favour of it
    // only when the node is a tight cluster (r < 6); bigger nodes keep their children's finer culling
    if (r <= always && depth > 0) {
      if (r < 6) for (const e of kids) unregister(e[0]);
      if (r < 6 || o.isMesh || o.isInstancedMesh) register(o, self, r);
    }
    return self;
  }
  const byObj = new Map();
  function register(o, b, r) { const e = { o, c: b.getCenter(new THREE.Vector3()), r, d: Math.min(max, base + r * k), hidden: false }; byObj.set(o, e); }
  function unregister(o) { byObj.delete(o); }
  const t0 = performance.now();
  for (const c of scene.children) measure(c, 1);
  for (const e of byObj.values()) entries.push(e);
  const ms = Math.round(performance.now() - t0);
  let shown = entries.length;
  const wp = new THREE.Vector3();
  function update(cam) {
    shown = 0;
    for (const e of entries) {
      if (e.live) { e.o.getWorldPosition(wp); e.c.copy(wp).add(e.off); }
      const dx = cam.x - e.c.x, dz = cam.z - e.c.z, dy = cam.y - e.c.y, dist = Math.sqrt(dx * dx + dz * dz + dy * dy * 0.25) - e.r;
      const show = dist < e.d * (e.hidden ? 0.94 : 1.0);   // a little hysteresis so things don't flicker at the edge
      if (show) { shown++; if (e.hidden) { e.o.visible = true; e.hidden = false; } }
      else if (!e.hidden) { if (e.o.visible) { e.o.visible = false; e.hidden = true; } }
    }
  }
  return { update, entries, stats: () => ({ managed: entries.length, shown, setupMs: ms }) };
}

// Streaming step 1b: merge a hand-built building's static meshes by material, so a room full of small props costs a
// handful of draw calls instead of thousands. Meshes are grouped by an equivalent-material key (two std({ color }) calls
// with the same values share one), baked into the root's space, and replaced by one mesh per key. Skipped: instanced,
// skinned and multi-material meshes, anything under a node that animates (userData.update / tick / brain / noMerge),
// and lights. Colliders are plain data and unaffected.
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
function matKey(m) {
  const id = (t) => (t ? t.uuid : '-'); const c = (x) => (x ? x.getHexString() : '-');
  return [m.type, c(m.color), id(m.map), id(m.normalMap), c(m.emissive), id(m.emissiveMap), m.emissiveIntensity, m.roughness, m.metalness, id(m.roughnessMap), id(m.alphaMap),
    m.transparent, m.opacity, m.side, m.alphaTest, m.depthWrite, m.clearcoat ?? '-', m.transmission ?? '-', m.flatShading, m.polygonOffset, m.polygonOffsetFactor, id(m.envMap), m.vertexColors].join('|');
}
export function mergeStatic(root, { minCount = 2 } = {}) {
  root.updateMatrixWorld(true);
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const groups = new Map(); let before = 0;
  const visit = (o) => {
    const ud = o.userData || {};
    if (o !== root && ((typeof ud.tick === 'function' && !ud.mergeSafe) || typeof ud.update === 'function' || typeof ud.brain === 'function' || ud.noMerge)) return;
    if (!o.visible) return;
    if (o.isMesh && !o.isInstancedMesh && !o.isSkinnedMesh && !Array.isArray(o.material) && o.geometry && o.geometry.attributes.position && !o.morphTargetInfluences) {
      const k = matKey(o.material); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(o); before++;
    }
    for (const c of o.children) visit(c);
  };
  visit(root);
  let after = 0; const m4 = new THREE.Matrix4();
  for (const [, list] of groups) {
    if (list.length < minCount) { after += list.length; continue; }
    const geos = [];
    for (const o of list) {
      let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
      for (const n of Object.keys(g.attributes)) if (n !== 'position' && n !== 'normal' && n !== 'uv') g.deleteAttribute(n);
      if (!g.attributes.normal) g.computeVertexNormals();
      if (!g.attributes.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count * 2), 2));
      g.clearGroups(); m4.multiplyMatrices(inv, o.matrixWorld); g.applyMatrix4(m4); geos.push(g);
    }
    const merged = mergeGeometries(geos, false); if (!merged) { after += list.length; continue; }
    merged.computeBoundingBox(); merged.computeBoundingSphere();
    const mesh = new THREE.Mesh(merged, list[0].material); mesh.castShadow = list.some((o) => o.castShadow); mesh.receiveShadow = list.some((o) => o.receiveShadow);
    mesh.name = 'merged'; root.add(mesh); after++;
    for (const o of list) { o.parent.remove(o); }
    for (const g of geos) g.dispose();
  }
  // drop groups left empty by the merge
  const prune = (o) => { for (const c of [...o.children]) prune(c); if (o !== root && o.isGroup && o.children.length === 0 && !o.userData.keep) o.parent && o.parent.remove(o); };
  prune(root);
  return { before, after };
}
