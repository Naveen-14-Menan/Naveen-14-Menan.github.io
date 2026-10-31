// The SVG diagram is the fallback. It is hidden only after the first 3D frame is drawn.
const root = document.documentElement;

export function enable3D() {
  root.classList.add('has-3d');
}

export function disable3D() {
  root.classList.remove('has-3d');
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
