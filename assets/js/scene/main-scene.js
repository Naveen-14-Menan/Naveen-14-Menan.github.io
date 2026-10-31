// Phase 1: the 3D hero. Sources flow as 0s and 1s through Snowflake into a Cortex agent.
// Entry point: start(stageElement). Called from assets/js/main.js after the page has loaded.
import * as THREE from '../../vendor/three/three.module.js';
import { buildLanes } from './lanes.js';
import { createBits } from './bits.js';
import { createNodes } from './pipeline-nodes.js';
import { createLabels } from './labels.js';
import { computeFit, applyCamera } from './layout.js';
import { readTheme, onThemeChange } from './theme.js';
import { enable3D, disable3D, prefersReducedMotion } from './fallback.js';

const STATIC_TIME = 2.2;       // time (s) shown when motion is reduced
const SLOW_FRAME = 0.024;      // 24 ms: quality steps down above this average

export function start(stage) {
  if (stage.dataset.scene) return; // already started
  const canvas = stage.querySelector('.scene-canvas');

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: window.devicePixelRatio <= 2, alpha: true });
  } catch (err) {
    stage.dataset.scene = 'off';
    disable3D();
    throw err;
  }
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200);
  scene.add(new THREE.AmbientLight(0xffffff, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 2.2);
  sun.position.set(4, 6, 8);
  scene.add(sun);

  // ----- content -----
  const phone = stage.clientWidth < 560;
  const lanes = buildLanes(THREE);
  const nodes = createNodes(THREE, lanes);
  const bits = createBits(THREE, lanes, {
    speed: 1.6,
    perInputLane: phone ? 8 : 14,
    perOutputRow: phone ? 4 : 6,
    ambient: phone ? 24 : 48,
  });
  const pipeline = new THREE.Group();
  pipeline.add(nodes.group, bits.object);
  scene.add(pipeline);

  const labels = createLabels(stage, [
    { text: 'Oracle PL/SQL', anchor: nodes.anchors.sources[0] },
    { text: 'Pentaho ETL', anchor: nodes.anchors.sources[1] },
    { text: 'AWS pipelines', anchor: nodes.anchors.sources[2] },
    { text: 'Snowflake', anchor: nodes.anchors.hub },
    { text: 'Cortex agent', anchor: nodes.anchors.agent },
  ]);

  // ----- state -----
  let fit = null;
  let inView = true;
  let running = false;
  let time = 0;
  let last = 0;
  let frames = 0;
  let acc = 0;
  let qualityStep = 0; // 0 = full, 1 = pixel ratio 1, 2 = give up
  let shownOnce = false;

  function applyTheme() {
    const theme = readTheme();
    nodes.setTheme(theme);
    bits.setTheme(theme);
    scene.fog = scene.fog || new THREE.Fog(theme.bg, 22, 48);
    scene.fog.color.set(theme.bg);
    if (!running) draw(prefersReducedMotion() ? STATIC_TIME : time);
  }

  function draw(t) {
    if (!fit) return;
    pipeline.rotation.y = Math.sin(t * 0.35) * 0.14;
    pipeline.rotation.x = Math.sin(t * 0.27) * 0.05;
    nodes.update(t);
    bits.update(t);
    pipeline.updateMatrixWorld(true);
    labels.update(THREE, camera, pipeline, fit.W, fit.H);
    renderer.render(scene, camera);
    if (!shownOnce) {
      shownOnce = true;
      enable3D();
    }
  }

  function tick(now) {
    const dt = Math.max(0, Math.min(0.05, (now - last) / 1000 || 0.016));
    last = now;
    time += dt;
    draw(time);

    // adaptive quality: skip 30 warm-up frames, then average
    frames++;
    if (frames > 30) {
      acc += dt;
      const n = frames - 30;
      const span = qualityStep === 0 ? 60 : 120;
      if (n >= span) {
        const avg = acc / n;
        acc = 0; frames = 30;
        if (avg > SLOW_FRAME) {
          if (qualityStep === 0) {
            qualityStep = 1;
            renderer.setPixelRatio(1);
            resize();
          } else {
            qualityStep = 2;
            giveUp();
          }
        }
      }
    }
  }

  function setRunning(want) {
    if (want === running) return;
    running = want;
    if (want) {
      last = performance.now();
      renderer.setAnimationLoop(tick);
      stage.dataset.scene = 'running';
    } else {
      renderer.setAnimationLoop(null);
      stage.dataset.scene = fit ? 'static' : 'off';
    }
  }

  function giveUp() {
    setRunning(false);
    stage.dataset.scene = 'off';
    disable3D();
  }

  function refreshRunState() {
    const want = !!fit && inView && !document.hidden && !prefersReducedMotion() && qualityStep < 2;
    setRunning(want);
    if (!want && fit && qualityStep < 2) {
      stage.dataset.scene = 'static';
      draw(prefersReducedMotion() ? STATIC_TIME : time);
    }
  }

  function resize() {
    fit = computeFit(stage);
    if (!fit) {
      setRunning(false);
      stage.dataset.scene = 'off';
      disable3D();
      shownOnce = false;
      return;
    }
    const maxRatio = fit.W >= 900 ? 2 : 1.5;
    const ratio = qualityStep >= 1 ? 1 : Math.min(window.devicePixelRatio || 1, maxRatio);
    renderer.setPixelRatio(ratio);
    renderer.setSize(fit.W, fit.H, false);
    applyCamera(camera, fit);
    bits.setSizes(fit.s, fit.H);
    labels.update(THREE, camera, pipeline, fit.W, fit.H);
    refreshRunState();
    if (!running) draw(prefersReducedMotion() ? STATIC_TIME : time);
  }

  // ----- events -----
  new ResizeObserver(resize).observe(stage);
  new IntersectionObserver((entries) => {
    inView = entries[entries.length - 1].isIntersecting;
    refreshRunState();
  }).observe(stage);
  document.addEventListener('visibilitychange', refreshRunState);
  window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', refreshRunState);
  onThemeChange(applyTheme);
  canvas.addEventListener('webglcontextlost', (e) => {
    e.preventDefault();
    giveUp();
  });
  canvas.addEventListener('webglcontextrestored', () => {
    qualityStep = 0;
    shownOnce = false;
    resize();
  });

  applyTheme();
  resize();
}
