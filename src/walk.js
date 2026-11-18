// First-person walking: WASD/arrows + mouse drag (or click for mouse-lock)
// on desktop; left-thumb joystick + right-side drag on touch screens.
import * as THREE from 'three';

const EYE = 1.62;
const SPEED = 2.2;

export class WalkControls {
  constructor(camera, dom, { bounds, colliders = [] }) {
    this.camera = camera;
    this.dom = dom;
    this.bounds = bounds;
    this.colliders = colliders;
    this.position = new THREE.Vector3();
    this.yaw = 0;
    this.pitch = 0;
    this.enabled = true;
    this.keys = new Set();
    this.move = new THREE.Vector2(); // joystick input
    this._bind();
  }

  _bind() {
    addEventListener('keydown', (e) => this.keys.add(e.code));
    addEventListener('keyup', (e) => this.keys.delete(e.code));
    addEventListener('blur', () => this.keys.clear());

    // Mouse: drag to look, or click to lock the pointer.
    let dragging = false;
    this.dom.addEventListener('mousedown', () => { if (this.enabled) dragging = true; });
    addEventListener('mouseup', () => { dragging = false; });
    this.dom.addEventListener('dblclick', () => { if (this.enabled) this.dom.requestPointerLock?.(); });
    addEventListener('mousemove', (e) => {
      if (!this.enabled) return;
      if (dragging || document.pointerLockElement === this.dom) this.look(e.movementX, e.movementY, 0.0025);
    });

    // Touch: left 40% of the screen = joystick, rest = look.
    const stick = document.getElementById('stick');
    const knob = stick?.querySelector('.knob');
    const touches = new Map();
    this.dom.addEventListener('touchstart', (e) => {
      if (!this.enabled) return;
      for (const t of e.changedTouches) {
        const isMove = t.clientX < innerWidth * 0.4 && ![...touches.values()].some((v) => v.kind === 'move');
        touches.set(t.identifier, { kind: isMove ? 'move' : 'look', x0: t.clientX, y0: t.clientY, x: t.clientX, y: t.clientY });
        if (isMove && stick) {
          stick.style.left = `${t.clientX}px`;
          stick.style.top = `${t.clientY}px`;
          stick.classList.add('on');
        }
      }
      e.preventDefault();
    }, { passive: false });
    this.dom.addEventListener('touchmove', (e) => {
      for (const t of e.changedTouches) {
        const s = touches.get(t.identifier);
        if (!s) continue;
        if (s.kind === 'look') this.look(t.clientX - s.x, t.clientY - s.y, 0.005);
        else {
          const dx = t.clientX - s.x0, dy = t.clientY - s.y0;
          const len = Math.min(1, Math.hypot(dx, dy) / 50);
          const a = Math.atan2(dy, dx);
          this.move.set(Math.cos(a) * len, -Math.sin(a) * len);
          if (knob) knob.style.transform = `translate(${Math.cos(a) * len * 40}px, ${Math.sin(a) * len * 40}px)`;
        }
        s.x = t.clientX; s.y = t.clientY;
      }
      e.preventDefault();
    }, { passive: false });
    const end = (e) => {
      for (const t of e.changedTouches) {
        const s = touches.get(t.identifier);
        if (s?.kind === 'move') {
          this.move.set(0, 0);
          stick?.classList.remove('on');
          if (knob) knob.style.transform = '';
        }
        touches.delete(t.identifier);
      }
    };
    this.dom.addEventListener('touchend', end);
    this.dom.addEventListener('touchcancel', end);
  }

  look(dx, dy, k) {
    this.yaw -= dx * k;
    this.pitch = Math.max(-1.4, Math.min(1.4, this.pitch - dy * k));
  }

  update(dt) {
    if (!this.enabled) return;
    const k = this.keys;
    let f = this.move.y, s = this.move.x;
    if (k.has('KeyW') || k.has('ArrowUp')) f += 1;
    if (k.has('KeyS') || k.has('ArrowDown')) f -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) s += 1;
    if (k.has('KeyA') || k.has('ArrowLeft')) s -= 1;
    const len = Math.hypot(f, s);
    if (len > 1) { f /= len; s /= len; }
    const sp = SPEED * (k.has('ShiftLeft') || k.has('ShiftRight') ? 1.8 : 1) * dt;
    const sin = Math.sin(this.yaw), cos = Math.cos(this.yaw);
    this.position.x += (-sin * f + cos * s) * sp;
    this.position.z += (-cos * f - sin * s) * sp;
    this._collide();
    this.apply();
  }

  _collide() {
    const p = this.position, R = 0.25, b = this.bounds;
    for (const c of this.colliders) {
      if (c.type === 'circle') {
        const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), m = c.r + R;
        if (d < m && d > 1e-6) { p.x = c.x + (dx / d) * m; p.z = c.z + (dz / d) * m; }
      } else {
        const cx = Math.max(c.minX, Math.min(p.x, c.maxX));
        const cz = Math.max(c.minZ, Math.min(p.z, c.maxZ));
        const dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz);
        if (d < R) {
          if (d > 1e-6) { p.x = cx + (dx / d) * R; p.z = cz + (dz / d) * R; }
          else p.z = c.maxZ + R;
        }
      }
    }
    p.x = Math.max(b.minX, Math.min(b.maxX, p.x));
    p.z = Math.max(b.minZ, Math.min(b.maxZ, p.z));
  }

  apply() {
    this.camera.position.set(this.position.x, EYE, this.position.z);
    this.camera.rotation.set(this.pitch, this.yaw, 0, 'YXZ');
  }
}
