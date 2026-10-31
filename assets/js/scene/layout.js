// Fits the camera so the pipeline fills the free area of the hero.
// Desktop (>= 900 px): the free area is the space to the right of the text column.
// Narrow screens: the free area is the space below the text.
// World -> screen:  screenX = W/2 + (worldX - camX) * s    screenY = H/2 - (worldY - camY) * s
// where s is the scale in pixels per world unit at the reference distance.
export const DIST = 20;

const PIPE_W = 13.8;   // world width of the pipeline (blocks to agent ring), with side margin
const PIPE_H = 7.2;    // world height (blocks, plus labels below)
const CENTER_X = 0.15; // world x of the pipeline's visual center
const CENTER_Y = -0.25;

export function computeFit(stage) {
  const W = stage.clientWidth;
  const H = stage.clientHeight;
  const sr = stage.getBoundingClientRect();
  const text = stage.querySelector('.hero-text').getBoundingClientRect();

  let left, right, top, bottom;
  if (W >= 900) {
    left = text.right - sr.left + 24;
    right = W - 20;
    top = 24;
    bottom = H - 24;
  } else {
    left = 20;
    right = W - 20;
    top = text.bottom - sr.top + 16;
    bottom = H - 16;
  }
  const w = right - left;
  const h = bottom - top;
  if (w < 240 || h < 170) return null; // not enough room: keep the SVG fallback

  const pipeW = W < 560 ? PIPE_W + 1.8 : PIPE_W; // extra side room for labels on phones
  const s = Math.min(w / pipeW, h / PIPE_H);
  return { W, H, s, cx: left + w / 2, cy: top + h / 2, phone: W < 560 };
}

export function applyCamera(camera, fit) {
  const visibleH = fit.H / fit.s;
  camera.fov = (2 * Math.atan(visibleH / (2 * DIST)) * 180) / Math.PI;
  camera.aspect = fit.W / fit.H;
  const camX = CENTER_X - (fit.cx - fit.W / 2) / fit.s;
  const camY = CENTER_Y + (fit.cy - fit.H / 2) / fit.s;
  camera.position.set(camX, camY, DIST);
  camera.lookAt(camX, camY, 0);
  camera.updateProjectionMatrix();
}
