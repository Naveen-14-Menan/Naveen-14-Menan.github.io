# three.js (vendored)

- Version: **0.186.1** (npm `three@0.186.1`, published 24 Sep 2026)
- License: MIT (see `LICENSE` in this folder)
- Files: `three.module.js` and `three.core.js`, both minified with esbuild (`--minify --format=esm`) from the package's `build/three.module.js` and `build/three.core.js`.
- `three.module.js` imports `./three.core.js`. Keep both files in the same folder with these names.

## How to update
1. `npm pack three@<version>` and unpack it.
2. Minify the two files: `npx esbuild build/three.module.js --minify --format=esm --outfile=three.module.js` and the same for `three.core.js`.
3. Replace both files here and update the version above.
4. Test the hero on desktop, a phone, dark mode, reduced motion, and with WebGL disabled.
