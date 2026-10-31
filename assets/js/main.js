// Theme toggle and footer year. Plain JavaScript, no dependencies.
(function () {
  var root = document.documentElement;
  var media = window.matchMedia("(prefers-color-scheme: dark)");

  function currentTheme() {
    var set = root.getAttribute("data-theme");
    if (set === "light" || set === "dark") return set;
    return media.matches ? "dark" : "light";
  }

  function updateButton(button) {
    var next = currentTheme() === "dark" ? "light" : "dark";
    button.setAttribute("aria-label", "Switch to " + next + " mode");
    button.setAttribute("title", "Switch to " + next + " mode");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var button = document.querySelector(".theme-toggle");
    if (button) {
      updateButton(button);

      button.addEventListener("click", function () {
        var next = currentTheme() === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        try {
          localStorage.setItem("theme", next);
        } catch (e) { /* Storage blocked: the choice lasts for this visit only. */ }
        updateButton(button);
      });

      // Keep the button label correct if the system setting changes.
      media.addEventListener("change", function () { updateButton(button); });
    }

    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  });
})();

// Phase 1: load the 3D hero after the page has finished loading.
// If anything fails (no WebGL, old browser, file:// without a server), the SVG diagram stays.
(function () {
  var stage = document.querySelector(".hero-stage");
  if (!stage) return;

  function begin() {
    import("./scene/main-scene.js")
      .then(function (m) { m.start(stage); })
      .catch(function (err) {
        if (window.console) console.warn("3D hero not started; showing the SVG diagram.", err);
      });
  }

  function whenIdle() {
    if ("requestIdleCallback" in window) window.requestIdleCallback(begin, { timeout: 2000 });
    else window.setTimeout(begin, 200);
  }

  if (document.readyState === "complete") whenIdle();
  else window.addEventListener("load", whenIdle);
})();
