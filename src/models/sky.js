// Night sky from the sky / moon photos:
//   a big dome with the photographed cloud layer (mirror-tiled so there are no
//   seams), lit from behind by the moon: clouds near the moon glow warm-white
//   like the halo in the photo, clouds far away stay dark grey-blue.
//   The half moon is the cut-out from the moon photo, on a camera-facing quad.
import * as THREE from 'three';

const loader = new THREE.TextureLoader();

export function makeSky({ moonDir = new THREE.Vector3(-0.35, 0.62, -0.7), radius = 400 } = {}) {
  const g = new THREE.Group();
  g.name = 'night_sky';
  const dir = moonDir.clone().normalize();

  const clouds = loader.load('assets/textures/sky_clouds_pano.png');
  clouds.wrapS = clouds.wrapT = THREE.MirroredRepeatWrapping;
  clouds.colorSpace = THREE.NoColorSpace;

  const mat = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    uniforms: {
      clouds: { value: clouds },
      moonDir: { value: dir },
      time: { value: 0 },
      moonTex: { value: null },
      moonRight: { value: new THREE.Vector3() },
      moonUp: { value: new THREE.Vector3() },
      moonSize: { value: new THREE.Vector2(0.046, 0.071) },   // half-width, half-height (radians)
    },
    vertexShader: `
      varying vec3 vDir;
      void main() {
        vDir = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform sampler2D clouds;
      uniform vec3 moonDir;
      uniform float time;
      uniform sampler2D moonTex;
      uniform vec3 moonRight, moonUp;
      uniform vec2 moonSize;
      varying vec3 vDir;
      void main() {
        vec3 d = normalize(vDir);
        float h = clamp(d.y, -0.2, 1.0);
        // project the dome onto a cloud plane overhead, so clouds shrink toward the horizon
        vec2 uv = d.xz / max(d.y + 0.18, 0.06) * 0.22 + vec2(time * 0.0025, 0.0);
        float c = texture2D(clouds, uv).r;               // 0.5 = average cloud
        float cover = smoothstep(0.3, 0.75, c);
        // moonlight through the clouds: tight bright halo + wide soft glow
        float m = max(dot(d, moonDir), 0.0);
        float halo = pow(m, 60.0) * 0.32 + pow(m, 12.0) * 0.22 + pow(m, 4.0) * 0.08;  // soft, so the moon disc stays brighter than its glow
        vec3 night = mix(vec3(0.012, 0.018, 0.035), vec3(0.03, 0.04, 0.06), h);   // sky behind clouds
        vec3 cloudCol = vec3(0.055, 0.06, 0.075) * (0.6 + cover * 0.8);
        cloudCol += vec3(0.95, 0.9, 0.85) * halo * (0.35 + cover * 0.9);         // lit edges near the moon
        // the moon sits BEHIND the clouds: draw it into the sky, then lay clouds over it
        vec3 behind = night;
        if (m > 0.995) {
          vec2 mp = vec2(dot(d, moonRight), dot(d, moonUp)) / moonSize * 0.5 + 0.5;
          if (mp.x > 0.0 && mp.x < 1.0 && mp.y > 0.0 && mp.y < 1.0) {
            vec4 mt = texture2D(moonTex, mp);
            behind = mix(behind, pow(mt.rgb, vec3(2.2)) * 1.6, mt.a);
          }
        }
        // thick cloud hides the moon, thin cloud lets it glow through
        float alpha = 0.22 + 0.78 * smoothstep(0.38, 0.72, c);   // a thin haze everywhere, thick where the clouds are
        vec3 col = mix(behind, cloudCol, alpha);
        // city glow low on the horizon (the warm cast in the photos)
        col += vec3(0.16, 0.1, 0.06) * pow(1.0 - clamp(h, 0.0, 1.0), 6.0) * 0.6;
        // below the horizon: no clouds, just the dark city haze
        vec3 below = vec3(0.05, 0.045, 0.045);
        col = mix(below, col, smoothstep(-0.02, 0.06, d.y));
        gl_FragColor = vec4(col, 1.0);
      }`,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(radius, 48, 24), mat);
  dome.renderOrder = -10;
  dome.frustumCulled = false;
  g.add(dome);

  // the half moon cut-out (moon photo), drawn inside the sky shader behind the clouds
  const moonTex = loader.load('assets/textures/moon.png');
  moonTex.colorSpace = THREE.NoColorSpace;   // linearised in the shader
  mat.uniforms.moonTex.value = moonTex;
  const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), dir).normalize();
  mat.uniforms.moonRight.value.copy(right).negate();
  mat.uniforms.moonUp.value.crossVectors(dir, right).negate();

  // a hazy halo around the moon (the user's hazy-moon photo, added as a soft additive glow)
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: loader.load('assets/textures/moon_halo.png'), blending: THREE.AdditiveBlending, transparent: true, opacity: 0.55, depthWrite: false, fog: false }));
  halo.material.map.colorSpace = THREE.SRGBColorSpace; halo.position.copy(dir).multiplyScalar(radius * 0.92); halo.scale.setScalar(radius * 0.22); halo.renderOrder = -9; g.add(halo);
  g.userData.update = (camera, t) => {
    g.position.copy(camera.position);   // sky follows the viewer
    mat.uniforms.time.value = t;
  };
  g.userData.moonDir = dir;
  return g;
}
