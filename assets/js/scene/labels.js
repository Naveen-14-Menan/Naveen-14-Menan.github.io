// HTML text labels that follow 3D anchor points. Text stays in the DOM (readable, selectable).
export function createLabels(stage, defs) {
  const holder = stage.querySelector('.scene-labels');
  holder.textContent = '';
  const items = defs.map((d) => {
    const el = document.createElement('span');
    el.className = 'scene-label';
    el.textContent = d.text;
    holder.appendChild(el);
    return { el, anchor: d.anchor, x: Infinity, y: Infinity };
  });
  const v = { x: 0, y: 0, z: 0 };

  function update(THREE, camera, group, width, height) {
    const vec = new THREE.Vector3();
    items.forEach((it) => {
      vec.copy(it.anchor);
      group.localToWorld(vec);
      vec.project(camera);
      const x = (vec.x * 0.5 + 0.5) * width;
      const y = (-vec.y * 0.5 + 0.5) * height;
      if (Math.abs(x - it.x) > 0.25 || Math.abs(y - it.y) > 0.25) {
        it.x = x; it.y = y;
        it.el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
      }
    });
  }
  return { update };
}
