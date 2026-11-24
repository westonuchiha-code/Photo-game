// Bodies (97): one male and one female base body, sculpted as a single skinned mesh each, laid out on one texture
// atlas so a "skin" (skin photo + face map + painted clothes) wraps the whole character, PS1 style.
//   makeBody(sex, material)  -> Group { SkinnedMesh + bones }, feet at y = 0, facing +z.  userData.pose(phase, k), .bones
//   ATLAS  the layout of the 1:1 atlas (u0, v0, u1, v1; v up):  face, headBack, torso, arm, leg, foot
//   paintSkin(sex, opts) -> CanvasTexture: a stand-in skin drawn in the atlas layout until photo skins replace it
//   drawTemplate(sex) -> canvas: the UV wireframe of the body over the atlas regions (the guide for making skins)
import * as THREE from 'three';

export const ATLAS = { face: [0.0, 0.72, 0.28, 1.0], headBack: [0.28, 0.72, 0.56, 1.0], foot: [0.56, 0.72, 0.78, 1.0], sole: [0.78, 0.72, 1.0, 1.0], torso: [0.0, 0.36, 0.6, 0.72], arm: [0.6, 0.0, 1.0, 0.72], leg: [0.0, 0.0, 0.6, 0.36] };
// the body's measurements (metres). Rings are [y, rx, rzFront, rzBack, cz]
const SPEC = {
  m: { H: 1.78, hipY: 0.93, hipX: 0.088, shY: 1.435, shX: 0.198, armA: 0.16, neckY: 1.50, headY: 1.555, hs: 1.03,
    torso: [[0.80, 0.05, 0.05, 0.06, 0], [0.835, 0.135, 0.085, 0.10, 0], [0.89, 0.172, 0.10, 0.118, 0], [0.95, 0.170, 0.10, 0.112, 0], [1.02, 0.152, 0.098, 0.094, 0.004], [1.10, 0.152, 0.102, 0.09, 0.006], [1.19, 0.170, 0.112, 0.096, 0.006], [1.28, 0.190, 0.126, 0.108, 0.004], [1.36, 0.202, 0.124, 0.114, 0], [1.42, 0.204, 0.104, 0.110, -0.004], [1.462, 0.175, 0.08, 0.096, -0.008], [1.495, 0.092, 0.062, 0.078, -0.008], [1.52, 0.058, 0.056, 0.062, -0.004], [1.57, 0.054, 0.054, 0.06, 0.002]],
    arm: [[-0.045, 0.02, 0.03], [-0.02, 0.04, 0.05], [0.02, 0.05, 0.058], [0.06, 0.053, 0.06], [0.12, 0.052, 0.056], [0.20, 0.046, 0.05], [0.265, 0.04, 0.042], [0.295, 0.039, 0.04], [0.34, 0.045, 0.043], [0.40, 0.041, 0.038], [0.48, 0.032, 0.029], [0.545, 0.027, 0.022]],
    leg: [[-0.07, 0.05, 0.05, 0.06], [0.0, 0.08, 0.074, 0.10], [0.07, 0.086, 0.088, 0.098], [0.18, 0.082, 0.084, 0.084], [0.30, 0.068, 0.07, 0.07], [0.39, 0.058, 0.06, 0.058], [0.435, 0.056, 0.062, 0.054], [0.48, 0.052, 0.054, 0.056], [0.56, 0.056, 0.05, 0.07], [0.64, 0.05, 0.046, 0.062], [0.74, 0.038, 0.038, 0.042], [0.82, 0.033, 0.034, 0.036], [0.855, 0.034, 0.036, 0.038]],
    elbow: 0.295, wrist: 0.545, knee: 0.435, ankle: 0.855, hand: 1.0, foot: 1.0 },
  f: { H: 1.66, hipY: 0.87, hipX: 0.086, shY: 1.338, shX: 0.168, armA: 0.17, neckY: 1.40, headY: 1.45, hs: 0.955,
    torso: [[0.75, 0.05, 0.05, 0.06, 0], [0.785, 0.14, 0.085, 0.105, 0], [0.84, 0.182, 0.10, 0.125, 0], [0.90, 0.176, 0.098, 0.115, 0], [0.97, 0.142, 0.088, 0.088, 0.004], [1.04, 0.124, 0.084, 0.078, 0.006], [1.11, 0.132, 0.092, 0.082, 0.006], [1.19, 0.146, 0.104, 0.092, 0.004], [1.27, 0.166, 0.106, 0.098, 0], [1.325, 0.170, 0.09, 0.096, -0.004], [1.364, 0.146, 0.068, 0.084, -0.008], [1.395, 0.074, 0.054, 0.066, -0.008], [1.42, 0.048, 0.046, 0.052, -0.004], [1.465, 0.045, 0.045, 0.05, 0.002]],
    arm: [[-0.04, 0.018, 0.026], [-0.018, 0.033, 0.042], [0.02, 0.041, 0.048], [0.06, 0.044, 0.049], [0.12, 0.043, 0.046], [0.20, 0.038, 0.041], [0.25, 0.034, 0.036], [0.275, 0.033, 0.034], [0.32, 0.037, 0.036], [0.38, 0.034, 0.032], [0.45, 0.027, 0.025], [0.51, 0.023, 0.019]],
    leg: [[-0.07, 0.05, 0.05, 0.06], [0.0, 0.084, 0.074, 0.104], [0.07, 0.092, 0.088, 0.102], [0.17, 0.084, 0.084, 0.086], [0.28, 0.068, 0.07, 0.07], [0.365, 0.056, 0.058, 0.056], [0.405, 0.053, 0.058, 0.052], [0.45, 0.049, 0.05, 0.052], [0.52, 0.052, 0.046, 0.064], [0.60, 0.046, 0.042, 0.056], [0.69, 0.035, 0.035, 0.038], [0.765, 0.03, 0.031, 0.033], [0.80, 0.031, 0.033, 0.035]],
    elbow: 0.275, wrist: 0.51, knee: 0.405, ankle: 0.80, hand: 0.9, foot: 0.9 },
};
// the head, as rings up from the chin: [dy, rx, rzFront, rzBack]; the face is then sculpted on the front
const HEAD = [[-0.012, 0.04, 0.03, 0.05], [0.0, 0.046, 0.066, 0.052], [0.014, 0.055, 0.084, 0.056], [0.032, 0.063, 0.092, 0.064], [0.05, 0.069, 0.095, 0.074], [0.068, 0.073, 0.094, 0.084], [0.086, 0.076, 0.093, 0.092], [0.104, 0.078, 0.093, 0.098], [0.122, 0.079, 0.094, 0.102], [0.14, 0.079, 0.097, 0.104], [0.158, 0.078, 0.098, 0.104], [0.176, 0.075, 0.096, 0.102], [0.194, 0.068, 0.088, 0.096], [0.21, 0.056, 0.072, 0.082], [0.222, 0.036, 0.046, 0.054], [0.229, 0.0, 0.0, 0.0]];
const HEAD_H = 0.241, G2 = (v, c, s) => Math.exp(-(((v - c) / s) ** 2));
function sculptFace(x, dy, z, a, fem) { const front = Math.max(0, Math.cos(a)); if (front <= 0) return [x, z];
  z += 0.03 * G2(x, 0, 0.0135) * (dy > 0.082 ? G2(dy, 0.082, 0.05) : G2(dy, 0.082, 0.012)) * (dy < 0.14 ? 1 : 0.5);   // nose: long bridge, tip at 0.082
  z += 0.006 * G2(Math.abs(x), 0.014, 0.008) * G2(dy, 0.08, 0.009);                                                    // nostril wings
  z -= 0.012 * G2(Math.abs(x), 0.031, 0.015) * G2(dy, 0.127, 0.011); z += 0.0035 * G2(Math.abs(x), 0.031, 0.008) * G2(dy, 0.127, 0.005);                                                  // eye sockets
  z += (fem ? 0.002 : 0.0045) * G2(dy, 0.146, 0.009) * G2(Math.abs(x), 0.03, 0.03);                                    // brow ridge
  z += 0.0045 * G2(x, 0, 0.026) * G2(dy, 0.052, 0.007) + 0.004 * G2(x, 0, 0.022) * G2(dy, 0.04, 0.006);                // lips
  z -= 0.003 * G2(x, 0, 0.03) * G2(dy, 0.046, 0.0035);                                                                 // the line between them
  z += (fem ? 0.003 : 0.006) * G2(x, 0, 0.022) * G2(dy, 0.012, 0.014);                                                 // chin
  z += 0.004 * G2(Math.abs(x), 0.045, 0.016) * G2(dy, 0.092, 0.02);                                                    // cheekbones
  const jaw = fem ? 0.9 : 1.0; if (dy < 0.05) x *= 1 - (1 - jaw) * (1 - dy / 0.05);
  return [x, z]; }

class Builder { constructor() { this.p = []; this.uv = []; this.si = []; this.sw = []; this.idx = []; }
  v(x, y, z, u, v, bones) { this.p.push(x, y, z); this.uv.push(u, v); const b = bones.slice(0, 2); while (b.length < 2) b.push([0, 0]); const t = b[0][1] + b[1][1] || 1; this.si.push(b[0][0], b[1][0], 0, 0); this.sw.push(b[0][1] / t, b[1][1] / t, 0, 0); return this.p.length / 3 - 1; }
  // a grid of rows x cols vertices already pushed starting at `base`
  grid(base, rows, cols, flip) { for (let r = 0; r < rows - 1; r++) for (let c = 0; c < cols - 1; c++) { const a = base + r * cols + c, b = a + 1, d = a + cols, e = d + 1; flip ? this.idx.push(a, d, b, b, d, e) : this.idx.push(a, b, d, b, e, d); } } }
const blend = (t, edge, w, lo, hi) => { const k = Math.min(1, Math.max(0, (t - edge + w) / (2 * w))), s = k * k * (3 - 2 * k); return [[lo, 1 - s], [hi, s]].sort((a, b) => b[1] - a[1]); };
const B = { hips: 0, spine: 1, chest: 2, neck: 3, head: 4, armL: 5, foreL: 6, handL: 7, armR: 8, foreR: 9, handR: 10, thighL: 11, shinL: 12, footL: 13, thighR: 14, shinR: 15, footR: 16 };
const lerp = (a, b, t) => a + (b - a) * t, rect = (R, s, t) => [lerp(R[0], R[2], s), lerp(R[1], R[3], t)];
// rings resampled with a Catmull-Rom spline so the silhouette is smooth, not faceted ring to ring
function smooth(rings, sub) { const out = [], n = rings.length, cr = (p0, p1, p2, p3, t) => 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
  for (let i = 0; i < n - 1; i++) { const a = rings[Math.max(0, i - 1)], b = rings[i], c = rings[i + 1], d = rings[Math.min(n - 1, i + 2)]; for (let s = 0; s < sub; s++) { const t = s / sub; out.push(b.map((_, k) => k === 0 ? lerp(b[0], c[0], t) : Math.max(0, cr(a[k], b[k], c[k], d[k], t)))); } } out.push(rings[n - 1].slice()); return out; }

// (phones: a lighter mesh, about a third of the triangles; set once before any body is made)
let LOW = false; export function useLowDetailBodies(v = true) { LOW = v; }
const _geo = {};
function bodyGeometry(sex) { if (_geo[sex]) return _geo[sex]; const S = SPEC[sex], fem = sex === 'f', b = new Builder(), N = LOW ? 10 : 16, SUB = LOW ? 1 : 2;
  // ---- torso + neck: unwrapped round the body, the seam down the spine
  { const R = smooth(S.torso, SUB), y0 = R[0][0], y1 = R[R.length - 1][0], base = b.p.length / 3;
    for (const [y, rx, rf, rb, cz] of R) for (let c = 0; c <= N; c++) { const a = -Math.PI + (c / N) * Math.PI * 2, sn = Math.sin(a), cs = Math.cos(a); let x = rx * Math.sign(sn) * Math.abs(sn) ** 0.85, z = cz + (cs > 0 ? rf : rb) * cs;
        if (cs > 0) { const ch = fem ? 0.034 * G2(Math.abs(x), 0.072, 0.05) * (y > S.shY - 0.2 ? G2(y, S.shY - 0.2, 0.075) : G2(y, S.shY - 0.2, 0.04)) : 0.012 * G2(Math.abs(x), 0.085, 0.07) * G2(y, S.shY - 0.14, 0.07); z += ch; z -= 0.004 * G2(x, 0, 0.012) * G2(y, S.shY - 0.2, 0.2); }
        else { z += 0.006 * G2(x, 0, 0.014) * G2(y, (S.hipY + S.shY) / 2 + 0.05, 0.22); z -= (fem ? 0.014 : 0.01) * G2(Math.abs(x), 0.08, 0.06) * G2(y, S.hipY - 0.03, 0.06); }
        const w = y < S.hipY + 0.13 ? blend(y, S.hipY + 0.1, 0.06, B.hips, B.spine) : y < S.neckY ? blend(y, (S.hipY + S.shY) / 2 + 0.06, 0.07, B.spine, B.chest) : blend(y, S.neckY + 0.02, 0.025, B.chest, B.neck);
        b.v(x, y, z, ...rect(ATLAS.torso, 0.01 + 0.98 * c / N, (y - y0) / (y1 - y0)), w); }
    b.grid(base, R.length, N + 1, false); }
  // ---- head: the front half takes the face map straight on (a flat projection), the back half the hair
  { const R = smooth(HEAD, LOW ? 2 : 3), hs = S.hs, base0 = S.headY, M = LOW ? 12 : 20, half = (front) => { const base = b.p.length / 3, AR = front ? ATLAS.face : ATLAS.headBack;
      for (const [dy, rx, rf, rb] of R) for (let c = 0; c <= M; c++) { const a = (front ? -Math.PI / 2 : Math.PI / 2) + (c / M) * Math.PI, sn = Math.sin(a), cs = Math.cos(a); let x = rx * sn, z = (cs > 0 ? rf : rb) * cs + 0.006;
          [x, z] = sculptFace(x, dy, z, front ? a : Math.sign(sn) * (Math.PI / 2 - 1e-6), fem); if (!front) z = (cs > 0 ? rf : rb) * cs + 0.006 + (z - ((cs > 0 ? rf : rb) * cs + 0.006)) * Math.max(0, 1 + cs * 6); const u = front ? 0.5 + x / 0.168 : 0.5 - x / 0.168, w = blend(dy, 0.005, 0.02, B.neck, B.head);
          b.v(x * hs, base0 + dy * hs, z * hs, ...rect(AR, Math.min(1, Math.max(0, u)), (dy + 0.012) / HEAD_H), w); }
      b.grid(base, R.length, M + 1, false); }; half(true); half(false);
    // ears: a small flattened shell each side, painted from the edge of the face map
    for (const s of [-1, 1]) { const base = b.p.length / 3, E = 6; for (let r = 0; r <= 4; r++) for (let c = 0; c <= E; c++) { const th = (r / 4) * Math.PI, ph = (c / E) * Math.PI * 2, ex = Math.sin(th) * Math.cos(ph), ey = Math.cos(th), ez = Math.sin(th) * Math.sin(ph);
        b.v(s * (0.079 + 0.002 + ex * 0.006 * s - ez * 0.005) * hs, S.headY + (0.108 + ey * 0.027) * hs, (-0.004 + ez * 0.013 - Math.abs(ey) * 0.004) * hs, ...rect(ATLAS.face, s > 0 ? 0.97 : 0.03, (0.112 + ey * 0.02 + 0.012) / HEAD_H), [[B.head, 1]]); } b.grid(base, 5, E + 1, false); } }
  // ---- arms (hanging in a slight A-pose; both share the arm strip of the atlas, mirrored) with hands
  for (const s of [-1, 1]) { const R = smooth(S.arm, SUB), A = S.armA * s, ca = Math.cos(A), sa = Math.sin(A), sx = s * S.shX, bU = s < 0 ? B.armL : B.armR, base = b.p.length / 3, L = S.wrist + 0.2 * S.hand, AN = LOW ? 7 : 10;
    const put = (lx, t, lz, u, v, w) => b.v(sx + lx * ca + t * sa, S.shY - t * ca + lx * sa, lz, ...rect(ATLAS.arm, u, 1 - v), w);
    for (const [t, rx, rz] of R) for (let c = 0; c <= AN; c++) { const a = -Math.PI + (c / AN) * Math.PI * 2; const w = t < 0.035 ? blend(t, 0.0, 0.035, B.chest, bU) : t < S.elbow + 0.08 ? blend(t, S.elbow, 0.045, bU, bU + 1) : blend(t, S.wrist, 0.02, bU + 1, bU + 2), lean = t < 0.03 ? (0.03 - t) * 0.95 : 0;
        put(rx * Math.sin(a) * s - s * lean, t + lean * S.armA, rz * Math.cos(a) + (t > S.elbow ? 0.004 : -0.004), c / AN * 0.62, (t + 0.05) / (L + 0.05), w); }
    b.grid(base, R.length, AN + 1, s > 0);
    // hand: a palm, four separate fingers (index at the front, each with two knuckle rings, lightly curled), a thumb
    { const h = S.hand, V0 = (tt) => (S.wrist + tt * h + 0.05) / (L + 0.05), PR = smooth([[0, 0.022, 0.027], [0.025, 0.0145, 0.036], [0.06, 0.0135, 0.043], [0.092, 0.012, 0.042], [0.104, 0.0085, 0.039]], SUB), hb = b.p.length / 3, hw = [[bU + 2, 1]];
      for (const [t, rx, rz] of PR) for (let c = 0; c <= AN; c++) { const a = -Math.PI + (c / AN) * Math.PI * 2, cs = Math.cos(a), sn = Math.sin(a); put(rx * sn * s * h, S.wrist + t * h, (rz * Math.sign(cs) * Math.abs(cs) ** 0.6 + 0.008) * h, c / AN * 0.62, V0(t), hw); }
      b.grid(hb, PR.length, AN + 1, s > 0);
      const FN = LOW ? 4 : 6; [[0.031, 0.07, 0.0102, 0.094], [0.0105, 0.078, 0.0106, 0.096], [-0.0098, 0.072, 0.0102, 0.094], [-0.0295, 0.056, 0.0092, 0.088]].forEach(([zc, len, fr, t0], fi) => { const fb = b.p.length / 3, FRg = [[0, 1.0], [0.3, 1.02], [0.38, 0.94], [0.66, 0.9], [0.72, 0.84], [0.9, 0.78], [0.97, 0.52], [1.0, 0.0]];
        for (const [k, rr] of FRg) for (let c = 0; c <= FN; c++) { const a = (c / FN) * Math.PI * 2, sn = Math.sin(a), cs = Math.cos(a), curl = (k * len) ** 2 * (2.2 + fi * 0.5), spread = (zc - 0.001) * k * 0.12, lx = fr * rr * 1.05 * sn, lz = fr * rr * 0.98 * cs;
            put((lx * s - curl * s) * h, S.wrist + (t0 + k * len) * h, (zc + 0.008 + spread + lz) * h, sn > 0 ? 0.465 - (zc + lz) * 3.4 : 0.155 + (zc + lz) * 3.4, V0(t0 + k * len), hw); }
        b.grid(fb, FRg.length, FN + 1, s < 0); });
      const TR = [[0, 0.008, 0.009], [0.02, 0.0102, 0.0115], [0.045, 0.0096, 0.0105], [0.066, 0.0086, 0.0092], [0.08, 0.006, 0.0062], [0.085, 0, 0.001]], tb = b.p.length / 3; for (const [t, rx, rz] of TR) for (let c = 0; c <= 6; c++) { const a = (c / 6) * Math.PI * 2; put((rx * Math.sin(a) * s - 0.004 * s) * h, S.wrist + (0.03 + t * 0.8) * h, (0.038 + t * 0.42 + rz * Math.cos(a)) * h, 0.66 + c / 6 * 0.3, V0(0.03 + t), hw); }
      b.grid(tb, TR.length, 7, s > 0); } }
  // ---- legs (share the leg strip, mirrored) and feet
  for (const s of [-1, 1]) { const R = smooth(S.leg, SUB), sx = s * S.hipX, bU = s < 0 ? B.thighL : B.thighR, base = b.p.length / 3, LN = LOW ? 8 : 12, L = S.ankle;
    for (const [t, rx, rf, rb] of R) for (let c = 0; c <= LN; c++) { const a = -Math.PI + (c / LN) * Math.PI * 2, cs = Math.cos(a), sn = Math.sin(a), y = S.hipY - t; let w = t < S.knee + 0.1 ? blend(t, S.knee, 0.05, bU, bU + 1) : blend(t, S.ankle - 0.01, 0.02, bU + 1, bU + 2); if (t < 0.03) w = blend(t, 0.0, 0.03, B.hips, bU);
        const inx = t < 0.2 ? (0.2 - t) * 0.12 : 0, kn = 0.006 * G2(t, S.knee, 0.03) * Math.max(0, cs);
        b.v(sx + (rx * sn + inx * 0) * 1 + s * t * 0.012 * 0, y, (cs > 0 ? rf : rb) * cs + kn - 0.004, ...rect(ATLAS.leg, 0.01 + 0.98 * c / LN, 1 - (t + 0.07) / (L + 0.07)), w); }
    b.grid(base, R.length, LN + 1, true);
    { const f = S.foot, ay = S.hipY - S.ankle, FR = smooth([[-0.062, 0.0, 0.012, 0.02], [-0.052, 0.026, 0.03, 0.032], [-0.02, 0.036, 0.052, 0.052], [0.02, 0.04, 0.05, 0.05], [0.06, 0.045, 0.036, 0.036], [0.11, 0.05, 0.027, 0.027], [0.155, 0.047, 0.021, 0.021], [0.185, 0.034, 0.016, 0.016], [0.196, 0.0, 0.008, 0.009]], SUB), fb = b.p.length / 3, FN = LOW ? 7 : 10;
      for (const [z, rx, ry, cy] of FR) for (let c = 0; c <= FN; c++) { const a = -Math.PI + (c / FN) * Math.PI * 2, cs = Math.cos(a), sn = Math.sin(a), top = cs > -0.3; const yy = Math.max(0.004, (cy + ry * cs) * f * (ay / 0.075) * 0.72);
          b.v(sx + rx * sn * f * (1 + (sn * s > 0 ? 0.0 : 0.08)), yy, z * f + 0.012, ...rect(top ? ATLAS.foot : ATLAS.sole, 0.5 + sn * rx / 0.13, (z + 0.07) / 0.28), [[bU + 2, 1]]); }
      b.grid(fb, FR.length, FN + 1, false); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(b.p, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2)); g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(b.si, 4)); g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(b.sw, 4)); g.setIndex(b.idx); g.computeVertexNormals();
  // weld the normals of vertices that share a position (UV seams), so no seam shows in the shading
  { const p = g.attributes.position, n = g.attributes.normal, map = new Map(); for (let i = 0; i < p.count; i++) { const k = Math.round(p.getX(i) * 1500) + '|' + Math.round(p.getY(i) * 1500) + '|' + Math.round(p.getZ(i) * 1500); (map.get(k) || map.set(k, []).get(k)).push(i); }
    for (const l of map.values()) if (l.length > 1) { let x = 0, y = 0, z = 0; for (const i of l) { x += n.getX(i); y += n.getY(i); z += n.getZ(i); } const d = Math.hypot(x, y, z) || 1; for (const i of l) n.setXYZ(i, x / d, y / d, z / d); } }
  g.computeBoundingSphere(); g.boundingSphere.radius *= 1.3; g.userData.spec = S; return (_geo[sex] = g); }

export function makeBody(sex = 'm', material) { const S = SPEC[sex], geo = bodyGeometry(sex), g = new THREE.Group(), bones = [], mk = (name, parent, x, y, z) => { const bn = new THREE.Bone(); bn.name = name; bn.userData.w = [x, y, z]; const pw = parent ? parent.userData.w : [0, 0, 0]; bn.position.set(x - pw[0], y - pw[1], z - pw[2]); parent ? parent.add(bn) : g.add(bn); bones.push(bn); return bn; };
  const hips = mk('hips', null, 0, S.hipY, 0), spine = mk('spine', hips, 0, S.hipY + 0.1, 0), chest = mk('chest', spine, 0, (S.hipY + S.shY) / 2 + 0.06, 0), neck = mk('neck', chest, 0, S.neckY + 0.02, 0), head = mk('head', neck, 0, S.headY + 0.005, 0), limbs = {};
  for (const s of [-1, 1]) { const A = S.armA * s, at = (t) => [s * S.shX + t * Math.sin(A), S.shY - t * Math.cos(A), 0], a = mk('arm', chest, ...at(0)), f = mk('fore', a, ...at(S.elbow)), h = mk('hand', f, ...at(S.wrist)); limbs[s] = { a, f, h }; }
  for (const s of [-1, 1]) { const t = mk('thigh', hips, s * S.hipX, S.hipY, 0), sh = mk('shin', t, s * S.hipX, S.hipY - S.knee, 0), ft = mk('foot', sh, s * S.hipX, S.hipY - S.ankle, 0); limbs[s].t = t; limbs[s].s = sh; limbs[s].ft = ft; }
  const mesh = new THREE.SkinnedMesh(geo, material); g.updateMatrixWorld(true); mesh.bind(new THREE.Skeleton(bones)); mesh.frustumCulled = true; g.add(mesh);
  const L = limbs[-1], R = limbs[1];
  g.userData.pose = (ph, k = 1) => { const sn = Math.sin(ph), cs = Math.cos(ph);   // k: 0 standing .. 1 a full stride
    L.t.rotation.x = -sn * 0.5 * k; R.t.rotation.x = sn * 0.5 * k; L.s.rotation.x = (Math.max(0, cs) * 0.9 + 0.05) * k; R.s.rotation.x = (Math.max(0, -cs) * 0.9 + 0.05) * k; L.ft.rotation.x = -Math.max(0, cs) * 0.25 * k; R.ft.rotation.x = -Math.max(0, -cs) * 0.25 * k;
    L.a.rotation.x = sn * 0.42 * k; R.a.rotation.x = -sn * 0.42 * k; L.f.rotation.x = -0.12 - Math.max(0, sn) * 0.4 * k; R.f.rotation.x = -0.12 - Math.max(0, -sn) * 0.4 * k;
    hips.position.y = S.hipY + (Math.abs(cs) * 0.03 - 0.03) * k; hips.rotation.y = sn * 0.08 * k; spine.rotation.y = -sn * 0.14 * k; hips.rotation.z = cs * 0.02 * k; neck.rotation.y = sn * 0.05 * k; };
  g.userData.sex = sex; g.userData.bones = { hips, spine, chest, neck, head, L, R }; g.userData.mesh = mesh; g.userData.spec = S; g.userData.noFinish = true; g.userData.pose(0, 0); return g; }

// ---- hair: a shell over the scalp, hung from the head bone. Styles: 'short', 'crop', 'bob', 'long', 'bald' (none)
const _hair = {};
function hairGeometry(sex, style) { const key = sex + style; if (_hair[key]) return _hair[key]; const S = SPEC[sex], hs = S.hs, N = 28, R = smooth(HEAD, 3), shortS = style === 'short' || style === 'crop', low = style === 'long' ? -0.17 : style === 'bob' ? -0.03 : 0.058, th = style === 'crop' ? 0.004 : style === 'short' ? 0.008 : 0.014;
  const ringAt = (dy) => { if (dy <= 0.06) return R.find((r) => r[0] >= 0.06); for (let i = 0; i < R.length - 1; i++) if (dy <= R[i + 1][0]) { const t = (dy - R[i][0]) / (R[i + 1][0] - R[i][0]); return R[i].map((v, k) => lerp(v, R[i + 1][k], t)); } return R[R.length - 1]; };
  const ss = (x) => { x = Math.min(1, Math.max(0, x)); return x * x * (3 - 2 * x); };
  // the hairline, by angle from straight ahead: forehead, temple, over the ear, down to the nape (or the hair's length)
  const line = (a) => { const d = Math.abs(a) * 180 / Math.PI; if (shortS) return d < 40 ? 0.17 : d < 72 ? lerp(0.17, 0.128, ss((d - 40) / 32)) : d < 100 ? 0.128 : lerp(0.128, low, ss((d - 100) / 35)); return d < 45 ? 0.17 - 0.01 * (d / 45) : lerp(0.16, low, ss((d - 45) / 40)); };
  const rows = []; for (let dy = low; dy < 0.058; dy += 0.02) rows.push(dy); for (let dy = 0.058; dy < 0.2295; dy += 0.0086) rows.push(dy);
  const p = [], uv = [], idx = []; for (const dy of rows) for (let c = 0; c <= N; c++) { const a = -Math.PI + (c / N) * Math.PI * 2, sn = Math.sin(a), cs = Math.cos(a), ln = line(a), de = Math.max(dy, ln), q = ringAt(de), drop = de < 0.06 ? (0.06 - de) * 0.12 : 0, edge = Math.min(1, 0.12 + (de - ln) / 0.03), t2 = th * edge;
      let x = q[1] * sn, z = (cs > 0 ? q[2] : q[3]) * cs + 0.006; const len = Math.hypot(x, z) || 1; x = (x + x / len * t2) * (1 - drop); z = (z + z / len * t2) * (1 - drop * 0.4);
      p.push(x * hs, (de + (de > 0.2 ? th * 0.6 * (de - 0.2) / 0.03 : 0)) * hs - 0.005, z * hs); uv.push(...rect(ATLAS.headBack, 0.08 + 0.84 * c / N, lerp(0.45, 0.98, (de - low) / (0.23 - low)))); }
  for (let r = 0; r < rows.length - 1; r++) for (let c = 0; c < N; c++) { const a = r * (N + 1) + c, b = a + 1, d = a + N + 1, e = d + 1; idx.push(a, b, d, b, e, d); }
  { const top = p.length / 3, tr = (rows.length - 1) * (N + 1), cy = (0.229 + th * 0.6) * hs - 0.004; p.push(0, cy, 0.004 * hs); uv.push(...rect(ATLAS.headBack, 0.5, 0.99)); for (let c = 0; c < N; c++) idx.push(tr + c, tr + c + 1, top); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return (_hair[key] = g); }
export function addHair(body, style, material) { if (!style || style === 'bald') return null; const m = new THREE.Mesh(hairGeometry(body.userData.sex, style), material); body.userData.bones.head.add(m); return m; }

// ---- the UV template: every triangle of the body drawn over the atlas regions (give this to whoever paints a skin)
export function drawTemplate(sex = 'm', size = 1024) { const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d'), geo = bodyGeometry(sex), uv = geo.attributes.uv, ix = geo.index;
  x.fillStyle = '#f4f2ee'; x.fillRect(0, 0, size, size); const tint = { face: '#f6ddd0', headBack: '#d8d0c8', torso: '#d6e4f2', arm: '#dcefd8', leg: '#d8dcf0', foot: '#eee6c8', sole: '#e0d8c0' };
  for (const [k, [u0, v0, u1, v1]] of Object.entries(ATLAS)) { x.fillStyle = tint[k]; x.fillRect(u0 * size, (1 - v1) * size, (u1 - u0) * size, (v1 - v0) * size); x.strokeStyle = '#444'; x.lineWidth = 2; x.strokeRect(u0 * size, (1 - v1) * size, (u1 - u0) * size, (v1 - v0) * size); x.fillStyle = '#333'; x.font = `${size / 48}px sans-serif`; x.fillText(k, u0 * size + 6, (1 - v1) * size + size / 40); }
  x.strokeStyle = 'rgba(0,0,0,0.45)'; x.lineWidth = 0.6; x.beginPath(); for (let i = 0; i < ix.count; i += 3) { const a = ix.getX(i), b = ix.getX(i + 1), d = ix.getX(i + 2); x.moveTo(uv.getX(a) * size, (1 - uv.getY(a)) * size); x.lineTo(uv.getX(b) * size, (1 - uv.getY(b)) * size); x.lineTo(uv.getX(d) * size, (1 - uv.getY(d)) * size); x.closePath(); } x.stroke(); return c; }

// ---- a stand-in skin, painted in the atlas layout: skin tone with soft shading, a drawn face, hair, simple clothes.
// (Photo skins replace this: a skin photo for the tone, a face photo fitted to the face region, clothes from fabric.)
export function paintSkin(sex = 'm', { skin = '#d8a880', hair = '#2a1c12', top = '#7a8a9a', bottom = '#34425e', shoe = '#2a2420', sleeves = 'short', legs = 'long', seed = 1, size = 512 } = {}) {
  const c = document.createElement('canvas'); c.width = c.height = size; const x = c.getContext('2d'), fem = sex === 'f', S = SPEC[sex], px = (R, s, t) => [lerp(R[0], R[2], s) * size, (1 - lerp(R[1], R[3], t)) * size], box = (R, s0, t0, s1, t1) => { const [ax, ay] = px(R, s0, t1), [bx, by] = px(R, s1, t0); x.fillRect(ax, ay, bx - ax, by - ay); };
  let sd = seed * 9301 + 49297; const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647), shade = (col, k) => { const c3 = new THREE.Color(col); c3.multiplyScalar(k); return '#' + c3.getHexString(); };
  const grain = (R, s0, t0, s1, t1, col, amt = 0.07, n = 900) => { x.fillStyle = col; box(R, s0, t0, s1, t1); const [ax, ay] = px(R, s0, t1), [bx, by] = px(R, s1, t0); for (let i = 0; i < n; i++) { x.fillStyle = rnd() < 0.5 ? `rgba(0,0,0,${amt * rnd()})` : `rgba(255,255,255,${amt * rnd()})`; x.fillRect(ax + rnd() * (bx - ax), ay + rnd() * (by - ay), 1 + rnd() * 2, 1 + rnd() * 3); } };
  const vgrad = (R, s0, t0, s1, t1, a0, a1) => { const [ax, ay] = px(R, s0, t1), [bx, by] = px(R, s1, t0), g = x.createLinearGradient(0, ay, 0, by); g.addColorStop(0, a0); g.addColorStop(1, a1); x.fillStyle = g; x.fillRect(ax, ay, bx - ax, by - ay); };
  const hgrad = (R, stops) => { const [ax, ay] = px(R, 0, 1), [bx, by] = px(R, 1, 0), g = x.createLinearGradient(ax, 0, bx, 0); for (const [o, col] of stops) g.addColorStop(o, col); x.fillStyle = g; x.fillRect(ax, ay, bx - ax, by - ay); };
  x.fillStyle = skin; x.fillRect(0, 0, size, size); for (const R of Object.values(ATLAS)) grain(R, 0, 0, 1, 1, skin, 0.035, 500);
  // torso: top (neckline leaves the neck + collarbone bare), bottom's waistband below
  { const R = ATLAS.torso, y0 = S.torso[0][0], y1 = S.torso[S.torso.length - 1][0], T = (y) => (y - y0) / (y1 - y0), waist = T(S.hipY + 0.1), neck = T(S.neckY - 0.012);
    grain(R, 0, waist, 1, neck, top, 0.09, 2600); grain(R, 0, 0, 1, waist, bottom, 0.08, 1400); x.fillStyle = shade(bottom, 0.6); box(R, 0, waist - 0.012, 1, waist + 0.004);
    const [nx, ny] = px(R, 0.5, neck); x.fillStyle = skin; x.beginPath(); x.ellipse(nx, ny, size * 0.6 * (fem ? 0.085 : 0.06), size * 0.36 * (fem ? 0.07 : 0.04), 0, 0, Math.PI); x.fill(); x.strokeStyle = shade(top, 0.7); x.lineWidth = size / 220; x.beginPath(); x.ellipse(nx, ny, size * 0.6 * (fem ? 0.085 : 0.06), size * 0.36 * (fem ? 0.07 : 0.04), 0, 0, Math.PI); x.stroke();
    hgrad(R, [[0, 'rgba(0,0,0,0.22)'], [0.12, 'rgba(0,0,0,0.0)'], [0.25, 'rgba(0,0,0,0.16)'], [0.5, 'rgba(255,255,255,0.06)'], [0.75, 'rgba(0,0,0,0.16)'], [0.88, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.22)']]);
    for (let i = 0; i < 9; i++) { const [fx, fy] = px(R, 0.3 + rnd() * 0.4, waist + 0.05 + rnd() * 0.25); x.strokeStyle = 'rgba(0,0,0,0.10)'; x.lineWidth = size / 300; x.beginPath(); x.moveTo(fx - size * 0.03, fy); x.quadraticCurveTo(fx, fy + size * 0.012 * (rnd() - 0.5) * 2, fx + size * 0.03, fy + size * 0.006); x.stroke(); } }
  // arms: sleeve to mid upper arm or to the wrist; legs: trousers or shorts; socks + shoes
  { const R = ATLAS.arm, L = S.wrist + 0.2 * S.hand + 0.05, t = sleeves === 'long' ? (S.wrist + 0.045) / L : (0.15 + 0.05) / L; grain(R, 0, 1 - t, 0.64, 1, top, 0.09, 1200); x.fillStyle = shade(top, 0.7); box(R, 0, 1 - t - 0.004, 0.64, 1 - t + 0.006);
    hgrad([R[0], R[1], lerp(R[0], R[2], 0.64), R[3]], [[0, 'rgba(0,0,0,0.2)'], [0.25, 'rgba(0,0,0,0)'], [0.5, 'rgba(255,255,255,0.05)'], [0.75, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.2)']]);
    const hy = 1 - (S.wrist + 0.07 * S.hand + 0.05) / L, hy1 = 1 - (S.wrist + 0.195 * S.hand + 0.05) / L; x.strokeStyle = shade(skin, 0.72); x.lineWidth = size / 400; for (const sC of [0.14, 0.2, 0.26, 0.42, 0.48, 0.54]) { const [ax, ay] = px(R, sC * 0.62 / 0.62 * 0.62 + 0.0, hy), [bx, by] = px(R, sC * 0.62, hy1); x.beginPath(); x.moveTo(px(R, sC * 0.62, hy)[0], ay); x.lineTo(bx, by); x.stroke(); void ax; } }
  { const R = ATLAS.leg, L = S.ankle + 0.07, t = legs === 'long' ? 1 : (S.knee - 0.08 + 0.07) / L; grain(R, 0, 1 - t, 1, 1, bottom, 0.08, 2400); if (legs !== 'long') { x.fillStyle = shade(bottom, 0.65); box(R, 0, 1 - t - 0.006, 1, 1 - t + 0.006); }
    hgrad(R, [[0, 'rgba(0,0,0,0.22)'], [0.25, 'rgba(0,0,0,0)'], [0.5, 'rgba(255,255,255,0.05)'], [0.75, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0.22)']]); vgrad(R, 0, 0.86, 1, 1, 'rgba(0,0,0,0.25)', 'rgba(0,0,0,0)');
    grain(ATLAS.foot, 0, 0, 1, 1, shoe, 0.08, 500); x.fillStyle = shade(shoe, 0.5); box(ATLAS.foot, 0.42, 0.3, 0.58, 0.62); x.fillStyle = shade(shoe, 1.6); for (let i = 0; i < 4; i++) box(ATLAS.foot, 0.4, 0.34 + i * 0.07, 0.6, 0.355 + i * 0.07); grain(ATLAS.sole, 0, 0, 1, 1, shade(shoe, 0.45), 0.06, 300); }
  // face: placed to the sculpted features (eyes 0.128 up from the chin, nose tip 0.082, mouth 0.046), then hair
  { const R = ATLAS.face, FY = (dy) => (dy + 0.012) / HEAD_H, FX = (m) => 0.5 + m / 0.168, P = (m, dy) => px(R, FX(m), FY(dy)), u = size * 0.28 / 0.168;   // u: pixels per metre across the face
    hgrad(R, [[0, 'rgba(0,0,0,0.05)'], [0.5, 'rgba(255,255,255,0.05)'], [1, 'rgba(0,0,0,0.05)']]); hgrad(ATLAS.headBack, [[0, 'rgba(0,0,0,0.05)'], [0.5, 'rgba(0,0,0,0.1)'], [1, 'rgba(0,0,0,0.05)']]); vgrad(ATLAS.headBack, 0, 0, 1, 0.16, 'rgba(0,0,0,0)', 'rgba(0,0,0,0.3)'); vgrad(R, 0, 0, 1, 0.16, 'rgba(0,0,0,0)', 'rgba(0,0,0,0.3)');
    if (!fem) { const [bx, by] = P(0, 0.035); const g = x.createRadialGradient(bx, by, u * 0.01, bx, by, u * 0.06); g.addColorStop(0, 'rgba(40,30,25,0.16)'); g.addColorStop(1, 'rgba(40,30,25,0)'); x.fillStyle = g; x.fillRect(bx - u * 0.07, by - u * 0.05, u * 0.14, u * 0.1); }
    for (const s of [-1, 1]) { const [ex, ey] = P(s * 0.031, 0.128); x.fillStyle = 'rgba(60,30,20,0.22)'; x.beginPath(); x.ellipse(ex, ey, u * 0.02, u * 0.012, 0, 0, 7); x.fill();
      x.fillStyle = '#ece6de'; x.beginPath(); x.ellipse(ex, ey, u * 0.0135, u * 0.0062, 0, 0, 7); x.fill(); x.fillStyle = ['#3a2616', '#2a4a6a', '#3a5a3a', '#1c1410'][seed % 4]; x.beginPath(); x.arc(ex, ey, u * 0.006, 0, 7); x.fill(); x.fillStyle = '#0a0806'; x.beginPath(); x.arc(ex, ey, u * 0.0028, 0, 7); x.fill();
      x.strokeStyle = 'rgba(25,15,10,0.9)'; x.lineWidth = u * (fem ? 0.0028 : 0.002); x.beginPath(); x.ellipse(ex, ey, u * 0.0138, u * 0.0066, 0, Math.PI, Math.PI * 2); x.stroke();
      x.strokeStyle = shade(hair, 0.9); x.lineWidth = u * (fem ? 0.0035 : 0.006); x.lineCap = 'round'; x.beginPath(); const [b0x, b0y] = P(s * 0.014, 0.143), [b1x, b1y] = P(s * 0.032, 0.148), [b2x, b2y] = P(s * 0.05, 0.142); x.moveTo(b0x, b0y); x.quadraticCurveTo(b1x, b1y, b2x, b2y); x.stroke();
      const [nx, ny] = P(s * 0.012, 0.081); x.fillStyle = 'rgba(50,25,18,0.5)'; x.beginPath(); x.ellipse(nx, ny, u * 0.004, u * 0.0022, 0, 0, 7); x.fill();
      const [cx, cy] = P(s * 0.045, 0.08); const g = x.createRadialGradient(cx, cy, 0, cx, cy, u * 0.025); g.addColorStop(0, fem ? 'rgba(210,90,90,0.22)' : 'rgba(190,90,80,0.1)'); g.addColorStop(1, 'rgba(200,90,90,0)'); x.fillStyle = g; x.fillRect(cx - u * 0.03, cy - u * 0.03, u * 0.06, u * 0.06); }
    { const [m0x, m0y] = P(-0.024, 0.047), [m1x, m1y] = P(0.024, 0.047), [mcx, mcy] = P(0, 0.046), lip = fem ? 'rgba(170,60,70,0.85)' : 'rgba(150,85,75,0.6)'; x.fillStyle = lip; x.beginPath(); x.moveTo(m0x, m0y); x.quadraticCurveTo(mcx, mcy - u * 0.011, m1x, m1y); x.quadraticCurveTo(mcx, mcy + u * 0.013, m0x, m0y); x.fill(); x.strokeStyle = 'rgba(60,20,20,0.8)'; x.lineWidth = u * 0.0016; x.beginPath(); x.moveTo(m0x, m0y); x.quadraticCurveTo(mcx, mcy + u * 0.002, m1x, m1y); x.stroke(); }
    // hair: over the top of the face map (a hairline), the whole back of the head, sideburns
    const hl = fem ? 0.172 : 0.178; x.fillStyle = hair; { const [ax, ay] = px(R, 0, 1), [bx] = px(R, 1, 1), [, hy] = P(0, hl); x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, ay); x.lineTo(bx, P(0, fem ? 0.06 : 0.13)[1]); x.lineTo(P(0.068, 0)[0], P(0, fem ? 0.1 : 0.14)[1]); x.quadraticCurveTo(P(0.06, 0)[0], hy, P(0, 0)[0], hy + u * 0.004); x.quadraticCurveTo(P(-0.06, 0)[0], hy, P(-0.068, 0)[0], P(0, fem ? 0.1 : 0.14)[1]); x.lineTo(ax, P(0, fem ? 0.06 : 0.13)[1]); x.closePath(); x.fill(); }
    const RB = ATLAS.headBack; grain(RB, 0, fem ? 0.0 : 0.3, 1, 1, hair, 0.12, 900); if (!fem) vgrad(RB, 0, 0.22, 1, 0.34, 'rgba(0,0,0,0)', 'rgba(0,0,0,0)');
    x.strokeStyle = 'rgba(255,255,255,0.06)'; x.lineWidth = 1; for (let i = 0; i < 60; i++) { const [sx2, sy2] = px(RB, rnd(), 0.4 + rnd() * 0.6); x.beginPath(); x.moveTo(sx2, sy2); x.lineTo(sx2 + (rnd() - 0.5) * 6, sy2 + 14); x.stroke(); } }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
