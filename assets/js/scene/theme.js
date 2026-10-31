// Reads the site colors from the CSS variables so the 3D scene follows light/dark mode.
export function readTheme() {
  const cs = getComputedStyle(document.documentElement);
  const get = (name) => cs.getPropertyValue(name).trim();
  return {
    bg: get('--bg'),
    surface: get('--surface'),
    ink: get('--ink'),
    muted: get('--muted'),
    line: get('--line'),
    accent: get('--accent'),
    accentSoft: get('--accent-soft'),
  };
}

// Calls cb when the visitor (or the system) changes the theme.
export function onThemeChange(cb) {
  new MutationObserver(cb).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', cb);
}
