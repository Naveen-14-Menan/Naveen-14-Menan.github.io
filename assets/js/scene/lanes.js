// Paths that the bits follow. Units are world units (u).
// Input lanes: source block -> hub. Output rows: hub -> agent.
// Each path is sampled once into a lookup table, so each frame only needs a cheap lerp.

const SAMPLES = 96;

function makeLane(THREE, points) {
  const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
  const spaced = curve.getSpacedPoints(SAMPLES - 1);
  const lut = new Float32Array(SAMPLES * 3);
  spaced.forEach((p, i) => {
    lut[i * 3] = p.x;
    lut[i * 3 + 1] = p.y;
    lut[i * 3 + 2] = p.z;
  });
  return { length: curve.getLength(), lut, n: SAMPLES, points: spaced };
}

export function buildLanes(THREE) {
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  const ys = [2.4, 0, -2.4];
  const zs = [-0.5, 0, 0.5];
  const inputs = ys.map((y, i) => {
    const z = zs[i];
    return makeLane(THREE, [V(-3.9, y, z), V(-3.1, y, z), V(-2.4, y * 0.35, z * 0.5), V(-1.45, 0, 0)]);
  });

  const rowY = [-0.35, 0, 0.35];
  const rowZ = [0.25, 0, -0.25];
  const outputs = rowY.map((y, i) => {
    const z = rowZ[i];
    return makeLane(THREE, [V(1.45, y * 0.5, z * 0.5), V(2.4, y, z), V(3.4, y, z), V(3.95, y * 0.4, z * 0.4)]);
  });

  return { inputs, outputs };
}

// Writes the position at progress u (0 to 1) into out[0..2].
export function sampleLane(lane, u, out) {
  const f = Math.min(Math.max(u, 0), 1) * (lane.n - 1);
  const i = Math.min(Math.floor(f), lane.n - 2);
  const k = f - i;
  const a = lane.lut;
  const i3 = i * 3;
  out[0] = a[i3] + (a[i3 + 3] - a[i3]) * k;
  out[1] = a[i3 + 1] + (a[i3 + 4] - a[i3 + 1]) * k;
  out[2] = a[i3 + 2] + (a[i3 + 5] - a[i3 + 2]) * k;
}
