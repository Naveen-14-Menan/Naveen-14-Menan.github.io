# Project guide for Claude Code

This is the personal portfolio website of Naveen Menan N S (data engineer).
It is a static site. GitHub Pages hosts it from the `main` branch at https://naveen-14-menan.github.io.
The repository is **public**.

## Rules
1. Do not invent facts, numbers, names, links or project details. If data is missing, write `[PLACEHOLDER]` and ask.
2. Say clearly when you are not certain. Check library functions in the current documentation. Do not guess.
3. Do not add confidential employer data or a phone number to any file.
4. Write documentation and comments in short, simple sentences (ASD-STE100 style).
5. No build step and no framework. Plain HTML, CSS and JavaScript only. Exception: pinned, vendored three.js.
6. Keep the page usable without WebGL, with reduced motion, and on phones.
7. Never push to `main` directly. Work on a branch per phase and merge when its test passes.

## Structure
- `index.html`: the page. CSS files load in the order listed in `<head>`. Do not reorder them.
- `assets/css/`: tokens, base, header, hero, hero-3d, sections, about, scene-wip, scene-clocktower.
- `assets/js/main.js`: theme button, footer year, loader for the 3D hero.
- `assets/js/scene/`: 3D hero modules (ES modules).
- `assets/vendor/three/`: three.js 0.186.1, minified. See `VERSION.md`.
- `docs/IMPLEMENTATION_PLAN.md`: the full plan with pixel values, phases and test matrix.

## Run and test
- Serve locally (ES modules do not load from `file://`): `python -m http.server 8000`, then open http://localhost:8000.
- Test with Playwright and Chromium. For WebGL in headless mode use the launch args:
  `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --ignore-gpu-blocklist`.
- Always check: no console errors, the name on one line, no horizontal scroll, light and dark mode, reduced motion, and WebGL disabled (`--disable-3d-apis`).

## Style
- Colors come from CSS variables in `tokens.css`. The 3D scene reads them in `theme.js`.
- Spacing uses an 8 px grid. Breakpoints: 560, 720, 900, 1200 px.
