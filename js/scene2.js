/* ============================================================
   js/scene2.js — Scene 2 · names reveal
   Greeting → families line → groom name writes itself → glowing
   "&" → bride name writes itself → gold rule draws outward →
   date → one foil shimmer sweep → drifting gold sparkles.
   Telugu: names fade + glow in Noto Serif Telugu (no handwriting).
   All copy comes from js/config.js.
   ============================================================ */
(function () {
  "use strict";

  var App = window.Invitation;
  var C = window.CONFIG;

  var tl = null;

  var SPARKS = [
    { left: "6%", top: "18%", dx: -12, dy: -46, at: 5.2 },
    { left: "84%", top: "12%", dx: 14, dy: -40, at: 5.5 },
    { left: "22%", top: "64%", dx: -10, dy: -52, at: 5.8 },
    { left: "72%", top: "58%", dx: 12, dy: -44, at: 6.1 },
    { left: "46%", top: "8%", dx: 4, dy: -38, at: 6.35 },
    { left: "60%", top: "82%", dx: 10, dy: -50, at: 6.6 }
  ];

  function sparkSvg() {
    return '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M7 0 L8.6 5.4 L14 7 L8.6 8.6 L7 14 L5.4 8.6 L0 7 L5.4 5.4 Z" fill="#b08d57"></path></svg>';
  }

  function render(root) {
    var names = C.names[App.lang] || C.names.en;
    var amp = App.ui("amp") || "&";

    var sparkHtml = SPARKS.map(function (s, i) {
      return '<span class="s2-spark" data-i="' + i + '" style="left:' + s.left + ";top:" + s.top + '">' + sparkSvg() + "</span>";
    }).join("");

    root.innerHTML =
      '<div class="s2-canvas">' +

        '<div class="s2-ornament">' +
          '<div class="rs-line"></div>' +
          '<svg class="rs-star" width="12" height="12" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 0 L8.6 5.4 L14 7 L8.6 8.6 L7 14 L5.4 8.6 L0 7 L5.4 5.4 Z" fill="#b08d57"></path></svg>' +
          '<div class="rs-line"></div>' +
        "</div>" +

        '<p class="s2-greeting"></p>' +
        '<p class="s2-families">' + App.ui("togetherWith") + "</p>" +

        '<div class="s2-names">' +
          '<h1 class="s2-name s2-groom"><span class="s2-name-inner"></span><span class="s2-pen"></span></h1>' +
          '<div class="s2-amp">' + amp + "</div>" +
          '<h1 class="s2-name s2-bride"><span class="s2-name-inner"></span><span class="s2-pen"></span></h1>' +
          '<div class="s2-shimmer"></div>' +
          sparkHtml +
        "</div>" +

        '<div class="s2-rule-wrap"><div class="s2-rule"></div></div>' +
        '<p class="s2-date"></p>' +

        '<div class="s2-foot">' +
          '<div class="rs-line" style="width:40px"></div>' +
          '<svg class="rs-star" width="10" height="10" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 0 L8.6 5.4 L14 7 L8.6 8.6 L7 14 L5.4 8.6 L0 7 L5.4 5.4 Z" fill="#b08d57"></path></svg>' +
          '<div class="rs-line" style="width:40px"></div>' +
        "</div>" +

      "</div>";
  }

  /* refresh all language-dependent copy (called on enter) */
  function fillText(root) {
    var names = C.names[App.lang] || C.names.en;
    root.querySelector(".s2-greeting").textContent = App.greetingText();
    root.querySelector(".s2-families").textContent = App.ui("togetherWith");
    root.querySelector(".s2-groom .s2-name-inner").textContent = names.groomFull;
    root.querySelector(".s2-bride .s2-name-inner").textContent = names.brideFull;
    root.querySelector(".s2-amp").textContent = App.ui("amp") || "&";
    root.querySelector(".s2-date").textContent = App.txt(C.date.line);
  }

  function buildTimeline(root) {
    var isTe = App.lang === "te";
    var g = window.gsap;

    tl = g.timeline({ defaults: { ease: "power2.inOut" } });

    tl.fromTo(root.querySelector(".s2-greeting"),
      { opacity: 0, y: 14 },
      { opacity: 1, y: 0, duration: 1.2 }, 0);

    tl.fromTo(root.querySelector(".s2-families"),
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 1.1 }, 0.7);

    var groom = root.querySelector(".s2-groom");
    var bride = root.querySelector(".s2-bride");

    if (isTe) {
      /* Telugu: fade + glow, no handwriting */
      tl.fromTo(groom,
        { opacity: 0, textShadow: "0 0 18px rgba(212,175,110,0.95)" },
        { opacity: 1, textShadow: "0 0 0px rgba(212,175,110,0)", duration: 1.7 }, 1.5);
    } else {
      /* English script: clip reveal + travelling glow (writes itself) */
      tl.fromTo(groom.querySelector(".s2-name-inner"),
        { clipPath: "inset(0 100% 0 0)", webkitClipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 -5% 0 0)", webkitClipPath: "inset(0 -5% 0 0)", duration: 1.8, ease: "power1.inOut" }, 1.5);
      tl.fromTo(groom.querySelector(".s2-pen"),
        { x: 0, opacity: 0.85 },
        { x: groom.offsetWidth, opacity: 0, duration: 1.8, ease: "power1.inOut" }, 1.5);
    }

    tl.fromTo(root.querySelector(".s2-amp"),
      { opacity: 0, scale: 0.7 },
      { opacity: 1, scale: 1, duration: 1.3 }, 3.3);

    if (isTe) {
      tl.fromTo(bride,
        { opacity: 0, textShadow: "0 0 18px rgba(212,175,110,0.95)" },
        { opacity: 1, textShadow: "0 0 0px rgba(212,175,110,0)", duration: 1.7 }, 4.1);
    } else {
      tl.fromTo(bride.querySelector(".s2-name-inner"),
        { clipPath: "inset(0 100% 0 0)", webkitClipPath: "inset(0 100% 0 0)" },
        { clipPath: "inset(0 -5% 0 0)", webkitClipPath: "inset(0 -5% 0 0)", duration: 1.8, ease: "power1.inOut" }, 4.1);
      tl.fromTo(bride.querySelector(".s2-pen"),
        { x: 0, opacity: 0.85 },
        { x: bride.offsetWidth, opacity: 0, duration: 1.8, ease: "power1.inOut" }, 4.1);
    }

    /* gold rule draws outward */
    tl.fromTo(root.querySelector(".s2-rule"),
      { scaleX: 0 },
      { scaleX: 1, duration: 1.2 }, 5.6);

    /* date */
    tl.fromTo(root.querySelector(".s2-date"),
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 1.1 }, 6.2);

    /* one foil shimmer sweep across the names */
    tl.fromTo(root.querySelector(".s2-shimmer"),
      { xPercent: -130 },
      { xPercent: 130, duration: 1.7, ease: "power1.inOut" }, 5.3);

    /* a few gold sparkles drift */
    Array.prototype.forEach.call(root.querySelectorAll(".s2-spark"), function (el, i) {
      var s = SPARKS[i];
      tl.fromTo(el,
        { opacity: 0, x: 0, y: 0, scale: 0.5 },
        { opacity: 0.9, x: s.dx * 0.4, y: s.dy * 0.45, scale: 1, duration: 1.2, ease: "power1.out" }, s.at);
      tl.to(el,
        { opacity: 0, x: s.dx, y: s.dy, duration: 1.3, ease: "power1.in" }, s.at + 1.2);
    });
  }

  App.registerScene(2, {
    init: render,
    enter: function () {
      var root = this.root;
      fillText(root);
      var canvas = root.querySelector(".s2-canvas");

      if (tl) { tl.kill(); tl = null; }

      if (!window.gsap || App.reduced) {
        /* no motion: everything sits at its final state */
        canvas.classList.remove("is-animating");
        return;
      }

      canvas.classList.add("is-animating");
      buildTimeline(root);
    },
    exit: function () {
      if (tl) { tl.kill(); tl = null; }
    }
  });
})();
