// Texture memory guard. Imported first by main.js.
// 1. Every image URL is loaded once; each TextureLoader.load() call gets a clone (own repeat/offset, shared
//    image and GPU upload). Models load the same file once per face, so this saves a lot of decoding.
// 2. Phones and tablets (coarse pointer, or ?lite) scale every loaded image to max 512 px before it's
//    uploaded. The full-size set is ~530 MB of GPU memory, which mobile browsers can't hold.
// 3. Canvas-drawn textures (signs, labels) bigger than the device budget (1024 px desktop, 256 px mobile)
//    are swapped for a scaled copy by shrinkCanvases(scene), called once the world is built.
import * as THREE from 'three';

export const LITE = matchMedia('(pointer: coarse)').matches || new URLSearchParams(location.search).has('lite');
const CANVAS_MAX = LITE ? 256 : 1024;

const base = new Map();
const imgLoad = THREE.TextureLoader.prototype.load;
// 4. Images are decoded off the main thread: fetched and turned into ImageBitmaps (createImageBitmap decodes in the
//    background), instead of <img> elements, which the browser decodes on the main thread the moment WebGL uploads
//    them (seconds of stall at the start for ~1000 textures). WebGL ignores flipY for bitmaps, so they're created
//    already flipped (same result on screen). Phones get the 512 px downscale done in the same off-thread step.
//    Falls back to the plain image loader if anything about it fails.
const canBitmap = typeof createImageBitmap === 'function' && typeof fetch === 'function' && !new URLSearchParams(location.search).has('imgdecode');
// (checked once: a browser that ignores imageOrientation would give upside-down textures -> use images there)
const flipWorks = !canBitmap ? Promise.resolve(false) : (async () => {
  const c = document.createElement('canvas'); c.width = 1; c.height = 2; const x = c.getContext('2d'); x.fillStyle = '#f00'; x.fillRect(0, 0, 1, 1); x.fillStyle = '#00f'; x.fillRect(0, 1, 1, 1);
  const b = await createImageBitmap(c, { imageOrientation: 'flipY' }); const d = document.createElement('canvas'); d.width = 1; d.height = 2; const y = d.getContext('2d', { willReadFrequently: true }); y.drawImage(b, 0, 0);
  return y.getImageData(0, 0, 1, 1).data[2] > 200;
})().catch(() => false);
function origLoad(url, onLoad, onProgress, onError) {
  if (!canBitmap || !/\.(png|jpe?g|webp)(\?|$)/i.test(url)) return imgLoad.call(this, url, onLoad, onProgress, onError);
  const mgr = this.manager || THREE.DefaultLoadingManager, full = mgr.resolveURL((this.path || '') + url), tex = new THREE.Texture(), self = this;
  mgr.itemStart(full);
  (async () => {
    if (!(await flipWorks)) throw new Error('no flipped bitmaps');
    const blob = await (await fetch(full)).blob();
    let bmp = await createImageBitmap(blob, { imageOrientation: 'flipY', premultiplyAlpha: 'none' });
    if (LITE && Math.max(bmp.width, bmp.height) > 512) { const k = 512 / Math.max(bmp.width, bmp.height); const w = Math.round(bmp.width * k), h = Math.round(bmp.height * k); bmp.close(); bmp = await createImageBitmap(blob, { imageOrientation: 'flipY', premultiplyAlpha: 'none', resizeWidth: w, resizeHeight: h, resizeQuality: 'high' }); }
    tex.image = bmp; tex.needsUpdate = true; if (onLoad) onLoad(tex); mgr.itemEnd(full);
  })().catch(() => {   // not decodable as a bitmap here: the ordinary image path
    imgLoad.call(self, url, (t) => { tex.image = t.image; tex.needsUpdate = true; if (onLoad) onLoad(tex); mgr.itemEnd(full); }, onProgress, () => { mgr.itemError(full); mgr.itemEnd(full); if (onError) onError(); });
  });
  return tex;
}
THREE.TextureLoader.prototype.load = function (url, onLoad, onProgress, onError) {
  const key = (this.path || '') + url;
  let e = base.get(key);
  if (!e) {
    e = { tex: null, clones: [], loaded: false, waiting: [] };
    base.set(key, e);
    e.tex = origLoad.call(this, url, (t) => {
      if (LITE && !(t.image instanceof ImageBitmap)) { const im = t.image, m = Math.max(im.width, im.height); if (m > 512) { const k = 512 / m, cv = document.createElement('canvas'); cv.width = Math.round(im.width * k); cv.height = Math.round(im.height * k); cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height); t.image = cv; } }
      e.loaded = true;
      for (const c of e.clones) { c.image = t.image; c.needsUpdate = true; }
      for (const [c, cb] of e.waiting) cb(c);
      e.waiting.length = 0;
    }, onProgress, onError);
  }
  const c = e.tex.clone();
  e.clones.push(c);
  if (onLoad) { if (e.loaded) setTimeout(() => onLoad(c), 0); else e.waiting.push([c, onLoad]); }
  return c;
};

// Shrink oversized canvases at upload time (the first time three.js asks for the texture's data).
const shrunk = new WeakMap();
function shrink(cv) {
  if (!(cv instanceof HTMLCanvasElement)) return cv;
  const m = Math.max(cv.width, cv.height);
  if (m <= CANVAS_MAX) return cv;
  let s = shrunk.get(cv);
  if (!s) {
    const k = CANVAS_MAX / m;
    s = document.createElement('canvas');
    s.width = Math.max(1, Math.round(cv.width * k)); s.height = Math.max(1, Math.round(cv.height * k));
    shrunk.set(cv, s);
  }
  const x = s.getContext('2d'); x.clearRect(0, 0, s.width, s.height); x.drawImage(cv, 0, 0, s.width, s.height);
  return s;
}
const desc = Object.getOwnPropertyDescriptor(THREE.Source.prototype, 'needsUpdate');
// Source only has a needsUpdate setter; when a shrunk canvas changes, redraw the small copy first.
Object.defineProperty(THREE.Source.prototype, 'needsUpdate', {
  set(v) { if (v === true && this._orig) this.data = shrink(this._orig); desc.set.call(this, v); },
  configurable: true,
});
// Call once after the world is built: every oversized canvas texture gets the small copy.
export function shrinkCanvases(scene) {
  let n = 0;
  scene.traverse((o) => {
    if (!o.material) return;
    for (const m of [].concat(o.material)) for (const k in m) {
      const t = m[k];
      if (!t || !t.isTexture || !t.source || t.source._orig) continue;
      const cv = t.source.data;
      if (cv instanceof HTMLCanvasElement && Math.max(cv.width, cv.height) > CANVAS_MAX) { t.source._orig = cv; t.source.data = shrink(cv); t.source.version++; n++; }
    }
  });
  return n;
}

export function textureStats() {
  let clones = 0; for (const e of base.values()) clones += e.clones.length;
  return { files: base.size, textures: clones, lite: LITE };
}
