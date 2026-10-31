// The 0 and 1 streams. Two kinds of bits:
//  - stream bits: travel along the lanes (sources -> hub -> agent)
//  - ambient bits: dim digits that drift slowly in the background for depth
// Each digit kind ("0" or "1") is one THREE.Points object, so the whole stream is 4 draw calls.
import { sampleLane } from './lanes.js';

const DIST = 20; // camera distance in world units (must match layout.js)

function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function glyphTexture(THREE, char) {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  g.font = '700 58px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#ffffff';
  g.fillText(char, 32, 35);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function createBits(THREE, lanes, config) {
  const rand = mulberry32(20261031);
  const tex = [glyphTexture(THREE, '0'), glyphTexture(THREE, '1')];

  // ----- build the bit list -----
  const bits = [];
  const addStream = (kind, lane, count, spreadR) => {
    for (let i = 0; i < count; i++) {
      bits.push({
        kind, lane,
        u0: (i + rand() * 0.6) / count,
        speed: (config.speed / lanes[kind === 'in' ? 'inputs' : 'outputs'][lane].length) * (0.9 + rand() * 0.2),
        oy: (rand() - 0.5) * 2 * spreadR,
        oz: (rand() - 0.5) * 2 * spreadR,
        digit: bits.length % 2,
      });
    }
  };
  for (let l = 0; l < 3; l++) addStream('in', l, config.perInputLane, 0.2);
  for (let l = 0; l < 3; l++) addStream('out', l, config.perOutputRow, 0.04);

  const ambient = [];
  for (let i = 0; i < config.ambient; i++) {
    ambient.push({
      x: -6.8 + rand() * 14.8, y: -5.5 + rand() * 11, z: -6 + rand() * 9,
      drift: 0.08 + rand() * 0.12,
      digit: i % 2,
    });
  }

  // ----- buffers: one Points per digit, for stream and for ambient -----
  const make = (list, opacityScale) => {
    const out = [0, 1].map((d) => {
      const members = list.filter((b) => b.digit === d);
      const pos = new Float32Array(members.length * 3);
      const col = new Float32Array(members.length * 3);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
      const mat = new THREE.PointsMaterial({
        map: tex[d], size: 0.5, sizeAttenuation: true,
        transparent: true, depthWrite: false, vertexColors: true, alphaTest: 0.02,
      });
      const pts = new THREE.Points(geo, mat);
      pts.frustumCulled = false;
      return { members, pos, col, geo, mat, pts };
    });
    return out;
  };
  const stream = make(bits);
  const dust = make(ambient);

  const object = new THREE.Group();
  [...stream, ...dust].forEach((s) => object.add(s.pts));

  // ----- colors -----
  const c = { bg: new THREE.Color(), dim: new THREE.Color(), lit: new THREE.Color(), dust: new THREE.Color() };
  function setTheme(theme) {
    c.bg.set(theme.bg);
    c.dim.set(theme.bg).lerp(new THREE.Color(theme.accent), 0.55);
    c.lit.set(theme.accent);
    c.dust.set(theme.bg).lerp(new THREE.Color(theme.accent), 0.22);
  }

  // Convert a size in screen pixels (at the reference distance) to PointsMaterial.size.
  // PointsMaterial draws a point of  size * (canvasHeight / 2) / distance  device pixels.
  function setSizes(pxPerUnit, cssHeight) {
    const px = (u, minPx) => Math.max(u * pxPerUnit, minPx);
    const toSize = (p) => (2 * p * DIST) / cssHeight;
    const streamSize = toSize(px(0.42, 15));
    const dustSize = toSize(px(0.3, 11));
    stream.forEach((s) => (s.mat.size = streamSize));
    dust.forEach((s) => (s.mat.size = dustSize));
  }

  const tmp = [0, 0, 0];
  const tmpColor = new THREE.Color();

  function update(t) {
    // stream bits
    const idx = [0, 0];
    for (let d = 0; d < 2; d++) {
      const s = stream[d];
      s.members.forEach((b, i) => {
        const lane = b.kind === 'in' ? lanes.inputs[b.lane] : lanes.outputs[b.lane];
        const u = (((b.u0 + t * b.speed) % 1) + 1) % 1;
        sampleLane(lane, u, tmp);
        const j = i * 3;
        s.pos[j] = tmp[0];
        s.pos[j + 1] = tmp[1] + b.oy;
        s.pos[j + 2] = tmp[2] + b.oz;
        const a = smooth(0, 0.14, u) * smooth(1, 0.86, u);
        tmpColor.copy(c.bg).lerp(b.kind === 'in' ? c.dim : c.lit, a);
        s.col[j] = tmpColor.r; s.col[j + 1] = tmpColor.g; s.col[j + 2] = tmpColor.b;
      });
      s.geo.attributes.position.needsUpdate = true;
      s.geo.attributes.color.needsUpdate = true;
    }
    // ambient bits
    for (let d = 0; d < 2; d++) {
      const s = dust[d];
      s.members.forEach((b, i) => {
        let x = b.x + t * b.drift;
        x = ((x + 6.8) % 14.8 + 14.8) % 14.8 - 6.8;
        const j = i * 3;
        s.pos[j] = x; s.pos[j + 1] = b.y; s.pos[j + 2] = b.z;
        s.col[j] = c.dust.r; s.col[j + 1] = c.dust.g; s.col[j + 2] = c.dust.b;
      });
      s.geo.attributes.position.needsUpdate = true;
      s.geo.attributes.color.needsUpdate = true;
    }
  }

  return { object, update, setTheme, setSizes, count: bits.length + ambient.length };
}
