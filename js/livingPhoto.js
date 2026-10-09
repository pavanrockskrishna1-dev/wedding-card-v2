/* ============================================================
   js/livingPhoto.js — "Living photos" (reusable)
   Wraps a framed photo so it breathes:
     • behind the frame: the same image at 115 %, blurred 22 px,
       45 % opacity, slowly drifting (a soft glow around the print)
     • on the photo: a soft-white diagonal light sweep every 6 s
       (mix-blend-mode: soft-light); the existing Ken Burns zoom
       stays on the <img> and is untouched
     • depth: 6 petals / sparkles — three drift in front of the
       photo, three sit behind it (visible at the frame edges)
     • gentle tilt up to 4° from deviceorientation when the device
       reports it; otherwise a very slow automatic sway.
       Never asks for permission (iOS' requestPermission is never
       called — the sway is used there instead).
     • reduced motion = static: no drift, sweep, petals or tilt.

   Usage (Scene 3 now, Scene 6 later):
     var lp = LivingPhoto.mount(frameEl, {
       src: "images/photo-1.jpg",   // same file the photo shows
       photo: photoWindowEl         // element that holds the <img>
     });
     lp.destroy();                  // optional teardown

   The source image is only referenced, never re-encoded.
   ============================================================ */
(function () {
  "use strict";

  var CSS = [
    ".lp-wrap { position: relative; isolation: isolate; will-change: transform; }",
    ".lp-frame { position: relative; z-index: 1; }",
    ".lp-photo { position: relative; overflow: hidden; }",
    ".lp-back { position: absolute; inset: 0; z-index: 0; pointer-events: none; animation: lp-back-drift 16s ease-in-out infinite alternate; }",
    ".lp-back img { position: absolute; left: 50%; top: 50%; width: 115%; height: 115%; max-width: none; object-fit: cover; transform: translate(-50%, -50%); filter: blur(22px); opacity: .45; pointer-events: none; -webkit-user-drag: none; }",
    ".lp-back.is-missing img { opacity: 0; }",
    "@keyframes lp-back-drift { from { transform: translate3d(-7px, -5px, 0); } to { transform: translate3d(7px, 5px, 0); } }",
    ".lp-sweep { position: absolute; inset: 0; z-index: 2; pointer-events: none; mix-blend-mode: soft-light; background: linear-gradient(105deg, transparent 36%, rgba(255, 255, 255, .95) 50%, transparent 64%); transform: translate3d(-100%, 0, 0); animation: lp-sweep 6s ease-in-out infinite; }",
    "@keyframes lp-sweep { 0% { transform: translate3d(-100%, 0, 0); } 25% { transform: translate3d(100%, 0, 0); } 100% { transform: translate3d(100%, 0, 0); } }",
    ".lp-layer { position: absolute; inset: 0; pointer-events: none; overflow: visible; }",
    ".lp-layer-behind { z-index: 0; }",
    ".lp-layer-front { z-index: 3; }",
    ".lp-p { position: absolute; left: var(--x); top: var(--y); width: var(--s); height: var(--s); opacity: 0; pointer-events: none; animation: lp-drift var(--d) linear var(--dl) infinite; }",
    ".lp-p svg { display: block; width: 100%; height: 100%; overflow: visible; }",
    ".lp-spark svg { filter: drop-shadow(0 0 3px rgba(255, 255, 255, .95)); }",
    "@keyframes lp-drift { 0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0; } 18% { opacity: var(--o); } 82% { opacity: var(--o); } 100% { transform: translate3d(var(--dx), var(--dy), 0) rotate(var(--rot)); opacity: 0; } }",
    ".scene:not(.is-active) .lp-anim, .stage.is-paused .lp-anim { animation-play-state: paused; }",
    ".lp-static .lp-anim { animation: none !important; }",
    ".lp-static .lp-sweep, .lp-static .lp-p { display: none; }",
    "@media (prefers-reduced-motion: reduce) { .lp-anim { animation: none !important; } .lp-sweep, .lp-p { display: none; } }"
  ].join("\n");

  /* Petals (rose-light) and sparkles (white). x/y are % of the frame. */
  var FRONT = [
    { k: "petal", x: "12%", y: "16%", s: 9, d: 13, dl: -3, dx: 16, dy: 46, rot: 80, o: .75 },
    { k: "spark", x: "80%", y: "38%", s: 7, d: 10, dl: -6, dx: -12, dy: 36, rot: -60, o: .85 },
    { k: "petal", x: "58%", y: "76%", s: 8, d: 15, dl: -9, dx: 10, dy: 30, rot: 50, o: .7 }
  ];
  var BEHIND = [
    { k: "petal", x: "-3%", y: "30%", s: 8, d: 17, dl: -2, dx: 18, dy: 40, rot: 90, o: .7 },
    { k: "spark", x: "101%", y: "55%", s: 6, d: 11, dl: -5, dx: -14, dy: 28, rot: -40, o: .8 },
    { k: "petal", x: "-2%", y: "80%", s: 7, d: 14, dl: -11, dx: 12, dy: -18, rot: 30, o: .6 }
  ];
  var PETAL_SVG = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M5 0C9 3 9.2 8 5 10C.8 8 1 3 5 0Z" fill="#E8BFC5"/></svg>';
  var SPARK_SVG = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M5 0L6 4L10 5L6 6L5 10L4 6L0 5L4 4Z" fill="#FFFFFF"/></svg>';

  var MAX_TILT = 4;          /* degrees, both axes */
  var instances = [];
  var raf = 0, orientationOn = false, reduced = false;
  var orient = { beta: 0, gamma: 0, base: null, last: -1e9 };
  var tilt = { x: 0, y: 0 };

  function injectCss() {
    if (document.getElementById("lp-style")) { return; }
    var s = document.createElement("style");
    s.id = "lp-style";
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }

  function prefersReduced() {
    var A = window.Invitation;
    if (A && typeof A.reduced === "boolean") { return A.reduced; }
    return !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function clampTilt(v) { return Math.max(-MAX_TILT, Math.min(MAX_TILT, v)); }

  /* Only listen where no permission is needed. iOS (requestPermission
     present) is never asked: it simply keeps the automatic sway. */
  function canListenOrientation() {
    return "DeviceOrientationEvent" in window &&
      typeof window.DeviceOrientationEvent.requestPermission !== "function";
  }

  function onOrientation(e) {
    if (e.beta == null || e.gamma == null) { return; }   /* sensor absent (desktop) */
    orient.beta = e.beta;
    orient.gamma = e.gamma;
    orient.last = performance.now();
    if (!orient.base) { orient.base = { beta: e.beta, gamma: e.gamma }; }
  }

  function targetTilt(now) {
    if (orient.base && now - orient.last < 1500) {
      return {
        x: clampTilt(-(orient.beta - orient.base.beta) * .2),
        y: clampTilt((orient.gamma - orient.base.gamma) * .2)
      };
    }
    var secs = now / 1000;
    return {
      x: 1.4 * Math.sin(2 * Math.PI * secs / 23 + 1),
      y: 2.4 * Math.sin(2 * Math.PI * secs / 18)
    };
  }

  function tick(now) {
    raf = window.requestAnimationFrame(tick);
    if (document.hidden) { return; }
    var tgt = targetTilt(now);
    tilt.x += (tgt.x - tilt.x) * .05;
    tilt.y += (tgt.y - tilt.y) * .05;
    var t = "perspective(900px) rotateX(" + tilt.x.toFixed(2) + "deg) rotateY(" + tilt.y.toFixed(2) + "deg)";
    for (var i = 0; i < instances.length; i++) { instances[i].wrap.style.transform = t; }
  }

  function startLoop() {
    if (reduced || !instances.length) { return; }
    if (canListenOrientation() && !orientationOn) {
      window.addEventListener("deviceorientation", onOrientation, { passive: true });
      orientationOn = true;
    }
    if (!raf) { raf = window.requestAnimationFrame(tick); }
  }

  function stopLoop() {
    if (raf) { window.cancelAnimationFrame(raf); raf = 0; }
    for (var i = 0; i < instances.length; i++) { instances[i].wrap.style.transform = ""; }
    tilt.x = 0; tilt.y = 0;
  }

  function applyMotion(ctrl) {
    ctrl.wrap.classList.toggle("lp-static", reduced);
    if (reduced) { ctrl.wrap.style.transform = ""; }
  }

  function speckHtml(list) {
    return list.map(function (p) {
      return '<span class="lp-p lp-anim lp-' + p.k + '" style="--x:' + p.x + ";--y:" + p.y +
        ";--s:" + p.s + "px;--d:" + p.d + "s;--dl:" + p.dl + "s;--dx:" + p.dx + "px;--dy:" + p.dy +
        "px;--rot:" + p.rot + "deg;--o:" + p.o + '">' + (p.k === "spark" ? SPARK_SVG : PETAL_SVG) + "</span>";
    }).join("");
  }

  function mount(frame, opts) {
    if (!frame || !frame.parentNode) { return null; }
    if (frame.__livingPhoto) { return frame.__livingPhoto; }
    opts = opts || {};
    injectCss();
    reduced = prefersReduced();

    var fgImg = frame.querySelector("img");
    var photo = opts.photo || (fgImg && fgImg.parentNode) || frame;
    var src = opts.src || (fgImg && fgImg.getAttribute("src")) || "";

    var wrap = document.createElement("div");
    wrap.className = "lp-wrap";
    frame.parentNode.insertBefore(wrap, frame);
    wrap.appendChild(frame);
    frame.classList.add("lp-frame");
    photo.classList.add("lp-photo");

    var back = document.createElement("div");
    back.className = "lp-back lp-anim";
    var bimg = document.createElement("img");
    bimg.alt = "";
    bimg.decoding = "async";
    bimg.draggable = false;
    bimg.setAttribute("aria-hidden", "true");
    bimg.addEventListener("error", function () { back.classList.add("is-missing"); });
    back.appendChild(bimg);
    wrap.insertBefore(back, frame);

    var behind = document.createElement("div");
    behind.className = "lp-layer lp-layer-behind";
    behind.innerHTML = speckHtml(BEHIND);
    wrap.insertBefore(behind, frame);

    var front = document.createElement("div");
    front.className = "lp-layer lp-layer-front";
    front.innerHTML = speckHtml(FRONT);
    wrap.appendChild(front);

    var sweep = document.createElement("span");
    sweep.className = "lp-sweep lp-anim";
    sweep.setAttribute("aria-hidden", "true");
    photo.appendChild(sweep);

    if (src) { bimg.src = src; }

    var ctrl = {
      wrap: wrap,
      frame: frame,
      setSource: function (s) { bimg.src = s; back.classList.remove("is-missing"); },
      destroy: function () {
        var i = instances.indexOf(ctrl);
        if (i >= 0) { instances.splice(i, 1); }
        wrap.style.transform = "";
        if (wrap.parentNode) { wrap.parentNode.insertBefore(frame, wrap); wrap.parentNode.removeChild(wrap); }
        frame.classList.remove("lp-frame");
        photo.classList.remove("lp-photo");
        if (sweep.parentNode) { sweep.parentNode.removeChild(sweep); }
        delete frame.__livingPhoto;
        if (!instances.length) { stopLoop(); }
      }
    };
    frame.__livingPhoto = ctrl;
    instances.push(ctrl);
    applyMotion(ctrl);
    if (reduced) { stopLoop(); } else { startLoop(); }
    return ctrl;
  }

  /* Live changes of the reduced-motion setting (main.js dispatches this). */
  window.addEventListener("invitation:motionchange", function () {
    reduced = prefersReduced();
    instances.forEach(applyMotion);
    if (reduced) { stopLoop(); } else { startLoop(); }
  });

  window.LivingPhoto = { mount: mount };
})();
