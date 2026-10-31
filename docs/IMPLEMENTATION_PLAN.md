# Implementation plan: 3D data-pipeline portfolio

Owner: Naveen Menan N S
Site: https://naveen-14-menan.github.io
Status (31 Oct 2026): **Phase 0 (restructure) and Phase 1 (3D hero) are built and tested.** Phases 2 to 5 are plan only. Hobbies were removed from the scope.

## 0. How to read this plan

- **Every number is a proposed starting value.** I could not test the 3D scene in a real browser while writing this plan. Tune each value on screen, then update this file.
- **Reference viewport: 1280 x 800 px** (desktop, aspect 1.6). Phone reference: **390 x 844 px**.
- **Three.js names** (for example `InstancedMesh`, `CatmullRomCurve3`, `Points`) are from memory. Check each one against the documentation of the exact version you pin.
- **Unknowns are marked "MEASURE".** Do not guess them. Measure them in Phase 0.
- **Safe-to-publish rule:** this repository is public. No confidential Dassault data, no phone number.

## 1. Goals and non-goals

### Goals
1. Show a data-engineering story: sources flow through Snowflake to an AI agent, as 1s and 0s, in 3D.
2. One continuous 3D scene behind the page. The camera moves with the scroll.
3. 3D clock-tower "work in progress" scene in Featured work.
4. A short name-forming intro: 0s and 1s fly in and form "Naveen Menan N S" (section 6.11).
5. The page stays fully usable with no WebGL, with reduced motion, and on phones.

### Non-goals
- No cursor-following character (rejected).
- No React, no build step, in this plan. Revisit only if the budget rule in section 8 fails.
- No video files (blocked by `.gitignore`; too heavy).
- No 3D model downloads. All objects are built from basic shapes in code.
- No hobbies section. This is a professional portfolio (decision, 31 Oct 2026).

## 2. Blockers

| # | Blocker | Owner | Status |
|---|---|---|---|
| B1 | Decide which numbers stay public. See the list in the chat reply of 31 Oct 2026 (items N1 to N14) | You | Open |
| B2 | Replace `assets/files/resume.pdf` with a scrubbed copy. The current file contains the cost, latency, row-count and clinical-trial lines | You | Open |
| B3 | Image from Google Drive: Drive returned only a text read of it. Upload the image in chat and say where it should be used (see "Image decision" below) | You | Open |
| B4 | Hobbies one-liners | n/a | Closed: no hobbies section |
| B5 | Education years | You | Closed: the page shows 2016 - 2020; the resume PDF says March 2020 and still shows the CGPA |
| B6 | Pin three.js and keep its license | Done | Closed: 0.186.1, license in `assets/vendor/three/` |
| B7 | The project cards on the live page have no expandable details now (Problem / Action / Result were removed) and the chevron still shows. Decide: restore short details, or remove the chevron and the "Work in progress" stickers | You | Open |

### Image decision (open)
The Drive image appears to be a personal "goals" poster (text found in it includes Build / Learn / Run, Half Marathon, Financial Freedom, AI Research, tool names such as AWS, Snowflake, Java, Pentaho, Airflow and Spark, and book titles). I could not see the picture itself. Before it goes on a public page, check three things:
1. **Professional fit.** Half Marathon and Financial Freedom are personal goals; you chose not to show hobbies.
2. **Accuracy.** Airflow and Spark appear in the image text but not on your resume or site. Show only skills you actually have.
3. **Rights.** Tool logos belong to their owners. If an AI tool made the image, check its terms for your use.

Possible uses, pick one: (a) a small "about me" portrait or poster next to the About text, (b) the builder in the clock-tower scene replaced by a stylized version of you, (c) the Open Graph link-preview image (1200 x 630 px).

## 3. Repository structure

### 3.1 Target tree

```
.
├── index.html
├── 404.html
├── robots.txt
├── sitemap.xml
├── .nojekyll
├── .gitignore
├── README.md
├── assets/
│   ├── css/    tokens, base, header, hero, hero-3d, sections, about, scene-wip, scene-clocktower
│   ├── js/
│   │   ├── main.js              theme button, footer year (classic script)
│   │   └── scene/               3D modules (ES modules): main-scene, layout, lanes, bits,
│   │                            pipeline-nodes, labels, theme, fallback
│   ├── img/    favicon.svg, og-image.png (to add)
│   ├── files/  resume.pdf
│   └── vendor/three/ three.module.js, three.core.js (minified, pinned 0.186.1), LICENSE, VERSION.md
└── docs/
    └── IMPLEMENTATION_PLAN.md
```

### 3.2 Rules
1. CSS files load in the order that `index.html` lists them. Never reorder.
2. One purpose for each file. A new section gets a new CSS file named `section-<name>.css` and one new `<link>` line.
3. All paths in `index.html` are relative (`assets/...`). `404.html` uses absolute paths (`/assets/...`) because it can load from any URL.
4. No file over 100 MB (Git limit). Target: whole repo under 20 MB. MEASURE with `du -sh .git`.
5. File names: lowercase, hyphens, no spaces.

### 3.3 Migration commands (run in your cloned repo)

```bash
git switch main
git pull
git switch -c restructure
git rm -r -q .
# Copy the contents of the restructured folder into this folder (include hidden files .gitignore and .nojekyll)
git add -A
git status          # expect R (rename) for favicon.svg, resume.pdf, script.js
git commit -m "Restructure into assets/ and add docs"
git push -u origin restructure
```

Preview locally with `python -m http.server 8000`. When it looks the same as the live site:

```bash
git switch main
git merge restructure
git push origin main
```

## 4. Design system (pixel values)

Existing tokens stay. These are the values in `tokens.css` today.

### 4.1 Color

| Token | Light | Dark |
|---|---|---|
| `--bg` | #f3f6f7 | #0f1a20 |
| `--surface` | #ffffff | #16242c |
| `--ink` | #12232e | #e3ebee |
| `--muted` | #566a75 | #93a6af |
| `--line` | #d3dde2 | #2a3d45 |
| `--accent` | #0e7c7b | #4fc1bc |
| `--accent-soft` | #dcefee | #173a3b |

New tokens to add in Phase 1:

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bit-dim` | rgba(14,124,123,0.35) | rgba(79,193,188,0.35) | Bits before the hub |
| `--bit-lit` | #0e7c7b | #4fc1bc | Bits after the hub |
| `--panel` | rgba(243,246,247,0.82) | rgba(15,26,32,0.82) | Content panels over the canvas |
| `--sticker` | #ffd23f | #ffd23f | Sticker yellow (same in both themes) |

### 4.2 Type

| Token | Size | Line height | Use |
|---|---|---|---|
| `--step--1` | 14 px | 22.4 px | Captions, nav |
| `--step-0` | 16 px | 25.6 px | Body |
| `--step-1` | 19.2 px | 28.8 px | Lead, card titles |
| `--step-2` | 24 px | 28 px | Section titles |
| Hero name (>= 900 px) | clamp(38.4 px, 3.9vw, 57.6 px) | 1.15 | One line, `white-space: nowrap` |
| Hero name (< 900 px) | clamp(28 px, 7.2vw, 54.4 px) | 1.15 | One line |

Fonts: system stacks only (no downloads). Headings use the serif stack in `tokens.css`; body uses the sans stack.

### 4.3 Spacing (8 px grid)

4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px. Use only these values for new rules.

### 4.4 Layout

| Item | Value |
|---|---|
| Container | width: min(100% - 40px, 1040px), centered. Side gutters: 20 px minimum |
| Header height | 60 px, sticky, z-index 10 |
| Anchor offset | `scroll-padding-top: 72px` |
| Section padding | 56 px top and bottom (desktop) |
| Hero padding | 96 px top, 72 px bottom at >= 900 px; 64 px and 48 px below |
| Hero grid | 1.05fr / 1fr, gap 40 px. Text column = 512 px wide at 1280 px |
| Radius | 6 px (small), 12 px (large) |
| Border | 1 px `--line`; 4 px left accent on cards |
| Button | padding 10.4 px 17.6 px, font 14 px, radius 6 px |

### 4.5 Breakpoints

| Name | Width | Changes |
|---|---|---|
| xs | < 560 px | 1 column everywhere; 2 of 4 stickers hidden; bit count 480 |
| sm | 560 to 719 px | Nav hidden (menu not planned) |
| md | 720 to 899 px | Nav visible; hero stacks to 1 column |
| lg | 900 to 1199 px | Hero 2 columns |
| xl | >= 1200 px | Split layout: text left, scene right (section 6.2) |

### 4.6 z-index map

| Layer | z-index |
|---|---|
| 3D canvas (`position: fixed`) | 0 |
| Page content | 1 |
| Stickers and pinned card | 2 and 3 |
| Sticky header | 10 |
| Skip link | 20 |

### 4.7 Motion

| Item | Value |
|---|---|
| Default easing | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Micro (hover, toggle) | 150 to 200 ms |
| Reveal on scroll | 400 ms, translateY 16 px to 0, fade 0 to 1 |
| Camera smoothing | `1 - exp(-dt * 6)` (frame-rate independent) |
| Reduced motion | No camera travel, no loops, static frame |

## 5. 3D architecture

### 5.1 Approach
- **One fixed canvas, one WebGL context.** Multiple contexts waste memory and hit browser limits.
- **Library:** three.js, vendored in `assets/vendor/`, exact version pinned. No CDN.
- **No build step.** ES modules in `assets/js/scene/`, loaded by `import()` after the page is ready.
- **All text stays in HTML.** The canvas is `aria-hidden="true"` and `pointer-events: none`.
- **Local testing needs a server.** Modules do not load from `file://`.

### 5.2 Modules

| File | Job | Status |
|---|---|---|
| `main-scene.js` | Renderer, camera, lights, loop, resize, quality control, pause rules | Built |
| `layout.js` | Fits the camera to the free area of the hero | Built |
| `lanes.js` | Bit paths and lookup tables | Built |
| `bits.js` | The 0/1 particle streams and ambient bits | Built |
| `pipeline-nodes.js` | Source blocks, hub, agent orb, guide lines | Built |
| `labels.js` | HTML labels that follow 3D points | Built |
| `theme.js` | Reads CSS colors; reacts to theme changes | Built |
| `fallback.js` | Shows or hides the SVG fallback (`has-3d` class) | Built |
| `stations.js` | Station table, scroll-to-camera mapping | Phase 2 |
| `clock-tower.js` | 3D clock tower, gears, builder, sparks | Phase 3 |
| `sticker-anchors.js` | Projects 3D anchor points to the HTML stickers | Phase 3 |
| `intro.js` | Name-forming intro | Phase 5 |

### 5.3 Renderer settings

| Setting | Value |
|---|---|
| `antialias` | true when devicePixelRatio <= 2, else false |
| `alpha` | true; clear color alpha 0 so the page background shows |
| Pixel ratio cap | min(devicePixelRatio, 2) at >= 900 px; min(devicePixelRatio, 1.5) below |
| Canvas size | 100vw x 100dvh (fallback 100vh) |
| Shadows | Off |
| Post-processing | None |
| Tone mapping | None |
| Fog | Linear, color = `--bg`, near 18 u, far 60 u |

### 5.4 Camera

| Setting | Desktop | Portrait phone |
|---|---|---|
| Field of view (vertical) | 45 degrees | 55 degrees |
| Near / far | 0.1 / 200 | 0.1 / 200 |
| Visible height at distance d | 0.8284 x d | 1.0412 x d |

Formula to convert world units (u) to pixels: `px per u = viewport height / visible height`.

### 5.5 Lights and materials

| Item | Value |
|---|---|
| Ambient light | intensity 0.7 |
| Directional light | intensity 1.1, position (4, 6, 8) |
| Standard material | roughness 0.55, metalness 0.1 |
| Hub crystal | flat shading, accent color |
| Bits | `PointsMaterial` with a canvas texture, no lighting |

### 5.6 Scroll to camera mapping
1. On load and on resize, read each section's `offsetTop` and `offsetHeight`. Store the center Y of each.
2. On scroll, take the viewport center Y = `scrollY + innerHeight / 2`.
3. Find the two neighboring sections whose centers surround it. Let `t` = progress between them (0 to 1).
4. Camera position and look-at = lerp between the two stations with `smoothstep(t)`.
5. Smooth the result with the frame-rate-independent factor in section 4.7.
6. Read layout values only on load and resize, never on every scroll event.

## 6. Section specifications

World coordinates are in units (u). Pixel values are at 1280 x 800.

### 6.1 Hero (station S0): BUILT in Phase 1

The camera is fitted to the free area of the hero, so it works at any width. Code: `layout.js`.

| Item | As built |
|---|---|
| Stage | `.hero-stage`: full width, min-height max(560 px, 100svh - 60 px); 680 px minimum below 900 px |
| Canvas | `position: absolute; inset: 0` inside the stage; `aria-hidden`; `pointer-events: none` |
| Free area, >= 900 px | x from (text column right edge + 24 px) to (width - 20 px); y from 24 px to (height - 24 px) |
| Free area, < 900 px | x from 20 px to (width - 20 px); y from (text bottom + 16 px) to (height - 16 px) |
| Too small | Less than 240 x 170 px: the 3D scene turns off and the SVG diagram stays |
| Camera distance | 20 u, fixed. Field of view is computed: 2 x atan((height / s) / 40) |
| Scale `s` (px per u) | min(free width / 13.8, free height / 7.2); on phones the width divisor is 15.6 |
| Camera x, y | x = 0.15 - (cx - W/2) / s;  y = -0.25 + (cy - H/2) / s |

Measured at 1280 x 800 (stage 1280 x 740): text column ends at x = 632 px, free area x = 656 to 1260 px, `s` = 43.8 px per u. Result in the screenshot: source blocks start at about x = 683 px, the agent ring ends at about x = 1235 px (45 px from the edge).

| Object | Size (u) | Position (u) |
|---|---|---|
| Source blocks (3) | 2.2 x 1.2 x 1.2, with 3 row stripes on the front face | x = -5; y = +2.4, 0, -2.4 |
| Hub (Snowflake) | Icosahedron, radius 1.4 | (0, 0, 0) |
| Agent (Cortex) | Sphere radius 1.0 + ring radius 1.4 | (5, 0, 0) |
| Labels | HTML, 13 px bold (11 px below 560 px), muted color | Below each object (anchors in `pipeline-nodes.js`) |
| Sway | Whole pipeline rotates +/- 8 degrees (y) and +/- 3 degrees (x) slowly | n/a |

The original SVG diagram stays in the HTML as the fallback. It is hidden only after the first 3D frame is drawn (class `has-3d` on `<html>`).

### 6.2 Split layout at >= 1200 px
- Sections after the hero get `max-width: 720px` and sit at the left edge of the 1040 px container (x = 120 to 840 px).
- The scene occupies x = 860 px to the right edge.
- Each section has a panel: background `--panel`, radius 12 px, padding 32 px, border 1 px `--line`.
- Below 1200 px: panels are full container width, padding 20 px, and the scene is dimmed to opacity 0.35.
- **Exception:** the Contact section uses the full 1040 px container.

### 6.3 About (station S1)

| Item | Value |
|---|---|
| Camera | (-3.35, 0.4, 9) |
| Look-at | (-3.35, 0, 0) |
| Scale | 800 / (0.8284 x 9) = 107 px per u |
| Hub on screen | x = 998 px, radius 150 px. Hub is partly cut by the right edge, by design |
| Bit behavior | Bits enter the hub, then leave in neat rows spaced 0.4 u (43 px) |

### 6.4 Featured work (station S2)
Two scenes in one station: the agent orb (about 2 s of scroll), then the clock tower.

| Item | Value |
|---|---|
| Camera at tower | (6.9, 1, 11) |
| Look-at | (6.9, 0.5, 0) |
| Scale | 800 / (0.8284 x 11) = 87.8 px per u |
| Tower placement | Center at world (11, 0, 0). Screen x = 640 + (11 - 6.9) x 87.8 = 1000 px |
| Tower size on screen | 4.0 u wide = 351 px; 5.2 u tall = 457 px (plus roof 1.6 u = 140 px) |

### 6.5 3D clock tower

| Part | Geometry (u) | Color |
|---|---|---|
| Walls (back, left, right) | Box 4.0 x 5.2 x 0.2 each; front open for a cutaway | #e6d6b2 |
| Floor | Box 4.0 x 0.2 x 3.0 | #9a7954 |
| Roof | Cone radius 3.0, height 1.6, 4 sides, rotated 45 degrees | #b76c39 |
| Clock bezel | Torus radius 1.05, tube 0.10 | #b77b41 |
| Clock face | Cylinder radius 1.0, height 0.12 | #fff8e8 |
| Hour hand | Box 0.10 x 0.55 x 0.05, 1 turn per 72 s | #273944 |
| Minute hand | Box 0.07 x 0.85 x 0.05, 1 turn per 6 s | #273944 |
| Gear A | Radius 0.9, 14 teeth (small boxes 0.14 x 0.18 x 0.14) | #f3d59c, teeth #b66b3d |
| Gear B | Radius 0.64, 10 teeth | same |
| Gear C | Radius 0.45, 8 teeth | same |
| Pendulum | Rod 0.06 x 1.6 + sphere radius 0.25, swing +/- 18 degrees, period 2 s | #bd7542 |

Gear speeds (meshing, alternating direction): A = +0.60 rad/s, B = -0.84 rad/s, C = +1.05 rad/s.
Check: speed ratio = tooth-count ratio (14 : 10 : 8).

The clock-tower colors reuse the palette in `scene-clocktower.css`.

### 6.6 3D builder (original design)

| Part | Geometry (u) | Color |
|---|---|---|
| Head | Sphere radius 0.28 | #e9a77f |
| Hard hat | Half sphere radius 0.31 + brim cylinder radius 0.38, height 0.04 | #f5aa25 |
| Body (shirt) | Cylinder radius 0.30, height 0.45 | #f0a52d |
| Overalls | Cylinder radius 0.32, height 0.45 | #285f99 |
| Legs | 2 cylinders radius 0.10, height 0.4 | #285f99 |
| Boots | 2 boxes 0.22 x 0.12 x 0.30 | #78432e |
| Working arm | Cylinder radius 0.08, length 0.55. Pivot at shoulder. Oscillates +/- 25 degrees, period 1.2 s | #f0a52d |
| Wrench | Box 0.5 x 0.07 x 0.07 | #d6e2e4 |
| Sparks | 6 `Points`, size 0.08 u, flash every 1.2 s | #ffd34e |

Do not use `CapsuleGeometry` unless your pinned version has it (verify in the docs).

### 6.7 Stickers on the 3D tower
- 4 HTML stickers stay in the DOM. `sticker-anchors.js` projects 4 anchor points to screen pixels each frame and sets `transform: translate(x px, y px) rotate(a deg)`.
- Rotations: -8, +7, +5, -6 degrees (as in the CSS today).
- Style unchanged: background #ffd23f, 2 px border #3c2d18, font clamp(9.9 px, 1.25vw, 13.1 px), weight 700, shadow 3 px 4 px 0 rgba(0,0,0,0.28).
- Hide stickers 3 and 4 below 560 px.
- The pinned card "Scroll down for more info" stays HTML, centered, rotated -2 degrees, with the 14 px red pin at its top.

### 6.8 Skills (station S3: processing gates)

| Item | Value |
|---|---|
| Gates | 6 torus rings, radius 1.1 u, tube 0.06 u, at x = 18 + i x 2.2 (i = 0..5) |
| Labels | HTML, matching the 6 skill groups |
| Camera | (22, 0.6, 12), look-at (22, 0, 0) |
| Bits | Pass through each gate; color brightens from `--bit-dim` to `--bit-lit` across the 6 gates |

### 6.9 Experience and Education (station S4)

| Item | Value |
|---|---|
| Timeline node | Sphere radius 0.35 at (33, 0, 0), pulses scale 1.0 to 1.15 every 2 s |
| Education node | Sphere radius 0.25 at (36, -1.2, 0), static |
| Camera | (34, 0.3, 10), look-at (34, 0, 0) |

### 6.10 Contact (station S5)

| Item | Value |
|---|---|
| Delivered node | Octahedron radius 0.9 at (52, 0, 0) |
| Camera | (52, 0.4, 9), look-at (52, 0, 0) |
| Hover effect | Hovering the email button sends 40 bits from the camera toward the node, 600 ms |
| Footer | Unchanged |

### 6.11 Name-forming intro (Phase 5)

Goal: 0s and 1s fly in and form "Naveen Menan N S", then fade into the real heading.

| Item | Value |
|---|---|
| Duration | 1.4 s total: 0.9 s fly-in (left to right sweep), 0.2 s hold, 0.3 s cross-fade to the HTML heading |
| Particles | About 600 on desktop, 300 on phones. Targets come from the heading text drawn to an offscreen canvas (bold serif, 64 px) and sampled every 3 px where alpha > 128 |
| Placement | Targets are scaled and moved to match the real `h1` rectangle on screen (same x, y, width) |
| Easing | `cubic-bezier(0.22, 1, 0.36, 1)` |
| Start state | Bits begin at x = -10% of the viewport width, with random y in the hero and random z of +/- 4 u |
| Rendering | One `Points` pair on the existing hero renderer (no second WebGL context) |
| Heading | The real `h1` stays in the HTML. It is hidden with `opacity: 0` only after the intro starts, so a failure never leaves an empty hero |
| Once per visit | A `sessionStorage` flag in try/catch. Repeat visits and reloads in the same session skip it |
| Skip | Any key, click, or scroll skips it at once. The Pause animation button (8.4) also skips it |
| Reduced motion | No intro. The heading is shown at once |
| No WebGL or error | No intro. The heading is shown at once |
| Cost | No new library. Estimated under 3 KB gzip of code (not yet built) |

## 7. The bits system (as built in Phase 1)

| Item | Value |
|---|---|
| Object | 4 `Points` objects: digit "0" and "1" for the stream, and digit "0" and "1" for ambient bits (4 draw calls) |
| Texture | 64 x 64 px canvas, bold monospace "0" or "1", 58 px, white on transparent (shared) |
| Sprite size | 0.42 u for stream bits, 0.30 u for ambient bits; never below 15 px and 11 px |
| Stream bits, desktop | 3 input lanes x 14 + 3 output rows x 6 = **60** |
| Ambient bits, desktop | **48**, x from -6.8 to +8 u so they stay away from the text |
| Phone (< 560 px) | 3 x 8 + 3 x 4 = 36 stream bits, 24 ambient |
| Speed | 1.6 u/s along the path, with +/- 10% random variation per bit |
| Input lanes | 3 curves from the source blocks to the hub, 0.2 u spread |
| Output rows | 3 close rows (y = -0.35, 0, +0.35) from the hub to the agent, 0.04 u spread |
| Fade | Color blends toward the background over the first 14% and the last 14% of each path |
| Colors | Before the hub: 55% accent over the background. After the hub: full accent. Ambient: 22% accent |
| Update cost | CPU writes position and color buffers once per frame. About 108 bits. Paths use a 96-point lookup table |
| Pause | When the tab is hidden, the hero is off screen, or motion is reduced (static frame at t = 2.2 s) |

**Correction to the first draft of this plan:** the first draft said 900 stream bits. A test render showed that 84 bits already look crowded, because each sprite is about 20 px wide. The numbers above are the tested values.

### Honest limit
`Points` sprites always face the camera. They are real 3D positions with perspective scaling, but they are flat images of digits, not solid 3D letters. Solid extruded text needs a font file and far more geometry. Not planned.

## 8. Performance, fallbacks, accessibility

### 8.1 Budgets

| Metric | Target | Note |
|---|---|---|
| Hero text visible before 3D loads | Always | 3D starts after `load` + idle callback (max 2,000 ms wait) |
| LCP | <= 2.5 s | Standard "good" threshold; verify in current Lighthouse docs |
| CLS | <= 0.1 | Reserve the canvas space; stickers use transform only |
| Frame time, desktop | <= 16.7 ms | |
| Frame time, phone | <= 33 ms | |
| Draw calls | <= 40 | |
| Triangles | <= 30,000 | |
| three.js transfer size | **Measured: about 196 KB gzip** (92 KB + 104 KB, estimated with `gzip -9`) | Under the 500 KB limit, so no build step is needed. Check the real size in DevTools after deploy |
| Repo size | < 20 MB | |

### 8.2 Adaptive quality
1. Measure frame time over 60 frames.
2. If the average exceeds 24 ms: drop the pixel ratio to 1, then halve the bit count.
3. If still above 24 ms after 120 more frames: stop rendering and show the static fallback.

### 8.3 Fallbacks

| Case | Behavior |
|---|---|
| No WebGL | `fallback.js` adds `.no-3d` to `<html>`: SVG hero diagram shows, canvas removed, stations ignored |
| Reduced motion | One static frame (S0), no scroll travel, no loops, SVG animations off (already in CSS) |
| Script error | Same as no WebGL (wrap `import()` in try/catch) |
| Tab hidden | Loop stops |
| Print | Canvas hidden |

### 8.4 Accessibility
1. Canvas: `aria-hidden="true"`. All meaning stays in HTML.
2. Add a visible **Pause animation** button in the header: 44 x 44 px target, `aria-pressed`, saved in `localStorage` inside try/catch.
3. Body text contrast >= 4.5:1; large text >= 3:1 (WCAG AA). Check text on `--panel` over the brightest bits.
4. Keep the 3 px focus outline with 3 px offset.
5. Keyboard: Tab order follows the DOM. Skip link stays first.
6. Labels projected from 3D are `aria-hidden`; the same text exists in normal HTML.
7. No flashing faster than 3 times per second.

### 8.5 SEO and sharing
- `<title>` and `<meta name="description">` already exist.
- Add `og:title`, `og:description`, `og:image` (1200 x 630 px PNG, under 300 KB), `og:url`, and `twitter:card`.
- Add `<link rel="canonical" href="https://naveen-14-menan.github.io/">`.
- Add JSON-LD `Person` markup with name, job title, and sameAs links (LinkedIn, GitHub). Use only facts from your resume.

## 9. Phases

Estimates are my rough guesses for one person. They are not measured.

| Phase | Branch | Tasks | Output | Acceptance test | Status / estimate |
|---|---|---|---|---|---|
| 0 | `restructure` | Migration (section 3.3) | New structure | Page identical (pixel compare); no failed file loads | **Built.** Tested: identical in light, dark, mobile |
| 1 | `feat/3d-hero` | `main-scene.js`, `bits.js`, `pipeline-nodes.js`, `layout.js`, `lanes.js`, `labels.js`, `fallback.js`, `theme.js`. Hero scene (6.1) | 3D hero with SVG fallback | See "Phase 1 test results" below | **Built.** Needs a check on real devices |
| 2 | `feat/3d-journey` | `stations.js`; panels and split layout (6.2); About, Skills, Experience stations (6.3, 6.8, 6.9) | Scroll camera travel | No jump or lag at any scroll speed; text readable at all stations | 2 to 3 days |
| 3 | `feat/3d-clock-tower` | `clock-tower.js`, `sticker-anchors.js` (6.4 to 6.7) | 3D tower with stickers | Gear speeds match section 6.5; stickers track the tower within 2 px | 2 to 3 days |
| 4 | `feat/3d-polish` | Contact station (6.10), pause button, adaptive quality for all stations, SEO tags (8.5) | Complete site | Section 10 passes | 1 to 2 days |
| 5 | `feat/intro` | Name-forming intro (6.11) | Intro | Skippable; never blocks content; skipped on repeat visits | 0.5 to 1 day |

### Phase 1 test results (31 Oct 2026, headless Chromium with software WebGL)

| Check | Result |
|---|---|
| Starts and draws the first frame | Pass at 1920, 1280, 1024, 768, 390 px wide |
| Console errors | 0 in 12 repeated loads (one timing bug was found and fixed: a negative time step caused NaN positions) |
| Name on one line | Pass |
| Dark mode and live theme switch | Pass |
| Reduced motion | Pass: one static frame, no loop |
| Scroll away | Pass: loop pauses when the hero is off screen |
| WebGL disabled | Pass: SVG diagram stays, no errors on the page |
| Opened from `file://` | Pass: SVG diagram stays; the console explains why |
| **Not tested** | Real GPUs, real phones, Safari, Firefox, Lighthouse scores, real frame times. The software renderer cannot show them |

## 10. Test matrix

### Devices and browsers
- Desktop: Chrome, Edge, Firefox, Safari.
- Phone: one Android Chrome, one iPhone Safari (real devices if possible).
- Viewport widths: 320, 360, 390, 414, 768, 1024, 1280, 1440, 1920 px.

### Conditions
1. Light mode and dark mode.
2. Reduced motion on.
3. WebGL disabled (browser flag or dev tools).
4. CPU 4x slowdown and "Fast 3G" in dev tools.
5. Keyboard only, no mouse.
6. Screen reader quick pass on the hero, About, and Contact sections.
7. Lighthouse run for performance, accessibility, best practices, SEO. Record the scores in this file. I do not know your current scores.

### Pixel checks
- Name stays on one line at every width in the list above (`scrollWidth <= clientWidth` on the `h1`).
- No horizontal scroll at any width (`documentElement.scrollWidth == innerWidth`).
- Stickers stay inside the tower scene on the screen.

## 11. Git workflow

1. `main` is live. Never commit unfinished work to `main`.
2. One branch per phase (section 9). Merge when its acceptance test passes.
3. Commit messages: imperative, under 72 characters ("Add bit streams to hero scene").
4. One logical change per commit.
5. Tag each release: `git tag v1.0-restructure`, `v1.1-3d-hero`, and so on. This gives a one-step way back.
6. Rollback: `git revert <commit>` or redeploy a tag.
7. GitHub Pages deploys only one branch. Preview other branches with the local server.

## 12. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Confidential data published | Medium | High | B1 and B2 before any push; review every diff |
| 3D hurts load time on phones | Medium | High | Lazy load, adaptive quality, fallback |
| three.js size too large for no-build | Unknown | Medium | MEASURE in Phase 0; budget rule in 8.1 |
| Text unreadable over the scene | Medium | High | Panels at 82% opacity, contrast check |
| Scroll mapping breaks when fonts or images change layout | Medium | Medium | Recompute on resize and after `load` |
| Browser differences (Safari WebGL) | Medium | Medium | Test on a real iPhone |
| Over-decorated site distracts a hiring manager | Medium | High | Keep the content first; keep the Pause button; review with one trusted reader |
| Three.js API differs from this plan | Medium | Low | Check docs for the pinned version |
| Placeholders or unfinished stickers reach the live site | Medium | High | Search for `[PLACEHOLDER]` and review the "Work in progress" stickers before every merge |

## 13. Definition of done

1. All open blockers in section 2 are cleared.
2. No `[PLACEHOLDER]` text in `index.html`.
3. Every phase's acceptance test passes.
4. Section 10 conditions all pass.
5. Section 8.1 budgets are met, or the exception is written in this file with a reason.
6. The no-WebGL and reduced-motion versions show all content.
7. `README.md` and this file match the code.
