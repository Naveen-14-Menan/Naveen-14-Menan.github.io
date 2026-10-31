# Naveen Menan N S: Portfolio website

This repository contains my personal portfolio website.
The website is static. GitHub Pages hosts it from the `main` branch.

Website URL: https://naveen-14-menan.github.io

## Project structure

```
.
├── index.html                  Page content and structure
├── 404.html                    Page that GitHub Pages shows for unknown URLs
├── robots.txt                  Rules for search engines
├── sitemap.xml                 List of public pages
├── .nojekyll                   Tells GitHub Pages not to run Jekyll
├── .gitignore                  Files that Git must not track
├── assets/
│   ├── css/
│   │   ├── tokens.css          Colors, fonts, sizes (light and dark)
│   │   ├── base.css            Reset and global element styles
│   │   ├── header.css          Site header, navigation, theme button
│   │   ├── hero.css            Hero section, buttons, stack diagram (SVG fallback)
│   │   ├── hero-3d.css         Stage, canvas and labels for the 3D hero
│   │   ├── sections.css        Shared sections, work cards, skills, timeline, footer
│   │   ├── about.css           About highlights
│   │   ├── scene-wip.css       Work-in-progress stickers and pinned card
│   │   └── scene-clocktower.css  Clock-tower scene
│   ├── js/
│   │   ├── main.js             Theme button, footer year, loads the 3D hero
│   │   └── scene/              3D hero modules (ES modules)
│   ├── img/                    Icons and images
│   ├── files/                  Downloads (resume.pdf)
│   └── vendor/three/           three.js 0.186.1 (minified), license, VERSION.md
└── docs/
    └── IMPLEMENTATION_PLAN.md  Plan for the 3D upgrade
```

The CSS files load in the order that `index.html` lists them. Do not change the order.

## Run on your computer

The 3D hero uses JavaScript modules. Browsers block modules on `file://` pages.
If you open `index.html` by double-click, the page still works, but it shows the SVG diagram instead of the 3D hero.
To see the 3D hero, use a local server:

```
python -m http.server 8000
```

Open http://localhost:8000.

## 3D hero

- The hero shows 3 source systems, Snowflake and a Cortex agent in 3D, with 0s and 1s flowing between them.
- It loads after the page has loaded. The text never waits for it.
- It pauses when the hero is off screen, when the tab is hidden, or when the visitor prefers reduced motion (then it shows one still frame).
- If WebGL is not available, the SVG diagram stays.
- Plan for the next phases: `docs/IMPLEMENTATION_PLAN.md`.

## Edit the content

1. Open `index.html`.
2. Find the section by its comment, for example `<!-- WORK -->`.
3. Change the text and save.
4. Examine the page in a browser.

> **WARNING:** This repository is public. Do not add confidential employer data or a phone number.

## Replace the resume

1. Export the new resume as a PDF.
2. Name the file `resume.pdf`.
3. Put it in `assets/files/`. Replace the old file.

## Publish

1. Commit your changes.
2. Push to the `main` branch.
3. Wait 1 to 2 minutes. GitHub Pages updates the website.
