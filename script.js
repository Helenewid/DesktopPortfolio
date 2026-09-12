(function () {
  "use strict";

  /* ---------- Scale the home "desktop" stage to fit the viewport ---------- */
  /* Below the mobile breakpoint, CSS reflows .stage into a stacked layout
     instead -- skip the scale transform so that layout isn't fighting it. */
  var stage = document.getElementById("stage");
  var STAGE_W = 1440, STAGE_H = 1024;
  var mobileQuery = window.matchMedia("(max-width: 700px)");

  function scaleStage() {
    if (mobileQuery.matches) {
      stage.style.transform = "none";
      return;
    }
    var scale = Math.min(window.innerWidth / STAGE_W, window.innerHeight / STAGE_H);
    stage.style.transform = "scale(" + scale + ")";
  }
  scaleStage();
  window.addEventListener("resize", scaleStage);

  /* ---------- Dock magnification (macOS-style) ---------- */
  var dock = document.querySelector(".dock");
  var dockIcons = document.querySelectorAll(".dock-icon");
  var dockMagnifyQuery = window.matchMedia("(min-width: 701px)");

  function resetDockIcons() {
    dockIcons.forEach(function (icon) { icon.style.transform = ""; });
  }

  if (dock) {
    dock.addEventListener("mousemove", function (e) {
      if (!dockMagnifyQuery.matches) return;
      var mouseX = e.clientX;
      var maxDist = 90;
      var maxScale = 1.55;
      dockIcons.forEach(function (icon) {
        var rect = icon.getBoundingClientRect();
        var center = rect.left + rect.width / 2;
        var dist = Math.abs(mouseX - center);
        var scale = dist < maxDist ? 1 + (maxScale - 1) * (1 - dist / maxDist) : 1;
        var lift = (scale - 1) * 18;
        icon.style.transform = "scale(" + scale.toFixed(3) + ") translateY(-" + lift.toFixed(2) + "px)";
      });
    });
    dock.addEventListener("mouseleave", resetDockIcons);
  }

  /* ---------- Window (overlay) open / close ---------- */
  var backdrop = document.getElementById("backdrop");
  var windows = {
    projects: document.getElementById("window-projects"),
    about: document.getElementById("window-about"),
    wittario: document.getElementById("window-wittario"),
    suppassion: document.getElementById("window-suppassion")
  };

  function openWindow(name) {
    var win = windows[name];
    if (!win) return;
    backdrop.classList.add("open");
    win.classList.add("open");
  }

  function closeWindow(name) {
    var win = windows[name];
    if (!win) return;
    win.classList.remove("open");
    if (!anyWindowOpen()) backdrop.classList.remove("open");
  }

  function anyWindowOpen() {
    return Object.keys(windows).some(function (key) {
      return windows[key].classList.contains("open");
    });
  }

  function closeAll() {
    Object.keys(windows).forEach(function (key) { windows[key].classList.remove("open"); });
    backdrop.classList.remove("open");
  }

  document.querySelectorAll("[data-open]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      openWindow(el.getAttribute("data-open"));
    });
  });

  document.querySelectorAll("[data-close]").forEach(function (el) {
    el.addEventListener("click", function () {
      closeWindow(el.getAttribute("data-close"));
    });
  });

  backdrop.addEventListener("click", closeAll);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAll();
  });

  /* ---------- Projects -> Wittario case study drill-down ---------- */
  document.querySelectorAll("[data-open-project]").forEach(function (el) {
    el.addEventListener("click", function () {
      var target = el.getAttribute("data-open-project");
      closeWindow("projects");
      openWindow(target);
    });
  });

  document.querySelectorAll("[data-back-to-projects]").forEach(function (el) {
    el.addEventListener("click", function () {
      var win = el.closest(".window");
      if (win) {
        var key = win.id.replace(/^window-/, "");
        closeWindow(key);
      }
      openWindow("projects");
    });
  });

  /* ---------- About me sidebar tabs (+ avatar returns to overview) ---------- */
  var aboutNavItems = document.querySelectorAll(".about-nav-item");
  var aboutTabButtons = document.querySelectorAll("[data-about-tab]");
  var aboutPanels = document.querySelectorAll(".about-panel");

  aboutTabButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var tab = btn.getAttribute("data-about-tab");

      aboutNavItems.forEach(function (b) { b.classList.remove("active"); });
      if (btn.classList.contains("about-nav-item")) btn.classList.add("active");

      aboutPanels.forEach(function (panel) {
        panel.hidden = panel.getAttribute("data-panel") !== tab;
      });
    });
  });

  /* ---------- Photo zoom toggle on the home screen ---------- */
  var photoFrame = document.querySelector(".photo-frame");
  var zoomIn = document.getElementById("zoom-in");
  var zoomOut = document.getElementById("zoom-out");
  if (zoomIn) zoomIn.addEventListener("click", function () { photoFrame.classList.add("zoomed"); });
  if (zoomOut) zoomOut.addEventListener("click", function () { photoFrame.classList.remove("zoomed"); });

  /* ---------- Case study contents nav: smooth scroll within the window ---------- */
  document.querySelectorAll(".case-contents a").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var id = link.getAttribute("href").slice(1);
      var target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* ---------- Scroll-triggered reveal for case study sections ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && "IntersectionObserver" in window) {
    document.querySelectorAll(".wittario-body").forEach(function (root) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      }, { root: root, threshold: 0.15 });

      root.querySelectorAll(".case-section").forEach(function (section) {
        section.classList.add("reveal");
        observer.observe(section);
      });
    });
  }
})();
