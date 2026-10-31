// The solid objects: 3 source blocks, the Snowflake hub, and the Cortex agent orb.
import { sampleLane } from './lanes.js';

export function createNodes(THREE, lanes) {
  const group = new THREE.Group();

  const mats = {
    src: new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.1 }),
    edge: new THREE.LineBasicMaterial(),
    stripe: new THREE.MeshBasicMaterial(),
    hub: new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.1, flatShading: true }),
    orb: new THREE.MeshStandardMaterial({ roughness: 0.5, metalness: 0.05, emissiveIntensity: 0.45 }),
    ring: new THREE.MeshBasicMaterial(),
    guide: new THREE.LineBasicMaterial({ transparent: true, opacity: 0.7 }),
  };

  // Sources
  const srcGeo = new THREE.BoxGeometry(2.2, 1.2, 1.2);
  const edgeGeo = new THREE.EdgesGeometry(srcGeo);
  const stripeGeo = new THREE.BoxGeometry(1.7, 0.07, 0.02);
  [2.4, 0, -2.4].forEach((y) => {
    const m = new THREE.Mesh(srcGeo, mats.src);
    m.position.set(-5, y, 0);
    m.add(new THREE.LineSegments(edgeGeo, mats.edge));
    [0.3, 0, -0.3].forEach((sy) => {
      const row = new THREE.Mesh(stripeGeo, mats.stripe);
      row.position.set(0, sy, 0.61);
      m.add(row);
    });
    group.add(m);
  });

  // Hub (Snowflake)
  const hub = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 0), mats.hub);
  group.add(hub);

  // Agent (Cortex)
  const orb = new THREE.Mesh(new THREE.SphereGeometry(1.0, 32, 24), mats.orb);
  orb.position.set(5, 0, 0);
  group.add(orb);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.03, 8, 64), mats.ring);
  ring.position.copy(orb.position);
  ring.rotation.x = Math.PI / 2.6;
  group.add(ring);

  // Thin guide lines under the bit streams
  [...lanes.inputs, lanes.outputs[1]].forEach((lane) => {
    const geo = new THREE.BufferGeometry().setFromPoints(lane.points);
    group.add(new THREE.Line(geo, mats.guide));
  });

  const anchors = {
    sources: [2.4, 0, -2.4].map((y) => new THREE.Vector3(-5, y - 0.95, 0)),
    hub: new THREE.Vector3(0, -2.0, 0),
    agent: new THREE.Vector3(5, -1.75, 0),
  };

  function setTheme(theme) {
    mats.src.color.set(theme.surface);
    mats.edge.color.set(theme.muted);
    mats.stripe.color.set(theme.line);
    mats.hub.color.set(theme.accent);
    mats.orb.color.set(theme.accentSoft);
    mats.orb.emissive.set(theme.accent);
    mats.ring.color.set(theme.accent);
    mats.guide.color.set(theme.line);
  }

  function update(t) {
    hub.rotation.y = t * 0.35;
    hub.rotation.x = 0.4 + Math.sin(t * 0.4) * 0.1;
    ring.rotation.z = t * 0.6;
    orb.rotation.y = t * 0.2;
  }

  return { group, anchors, setTheme, update };
}
