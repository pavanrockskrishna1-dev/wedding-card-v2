/* ============================================================
   js/scene4.js — Scene 4 · The Blessing
   A finished transparent illustration is revealed top-to-bottom;
   three glowing threads join at the couple's hands before the
   verse fades in. Copy & data: js/config.js (verse,
   showJesusFigure).
   ============================================================ */
(function () {
  "use strict";
  var App = window.Invitation, C = window.CONFIG;
  var tl = null, pausedByVisibility = false;

  /* Light dust drifting in the rays (left/top %, size px, duration s,
     negative delay s so the drift is mid-flight, peak opacity). */
  var SPECKS = [
    { left: "36%", top: "10%", s: 3, dur: 12, del: 0,  op: .5  },
    { left: "52%", top: "6%",  s: 2, dur: 15, del: 3,  op: .4  },
    { left: "62%", top: "16%", s: 3, dur: 13, del: 6,  op: .45 },
    { left: "44%", top: "22%", s: 2, dur: 17, del: 2,  op: .4  },
    { left: "57%", top: "30%", s: 2, dur: 14, del: 8,  op: .35 },
    { left: "33%", top: "26%", s: 2, dur: 16, del: 5,  op: .4  },
    { left: "48%", top: "38%", s: 3, dur: 12, del: 9,  op: .45 },
    { left: "64%", top: "42%", s: 2, dur: 18, del: 4,  op: .35 },
    { left: "38%", top: "46%", s: 2, dur: 15, del: 7,  op: .3  },
    { left: "55%", top: "50%", s: 2, dur: 13, del: 11, op: .3  },
    { left: "30%", top: "15%", s: 2, dur: 19, del: 10, op: .35 },
    { left: "68%", top: "24%", s: 2, dur: 16, del: 1,  op: .35 }
  ];

  /* SVG uses the PNG's native 442 × 924 coordinate space.  The two
     outer paths start at the supplied palm points; all three stay out
     near the outer contours and converge only at the joined hands. */
  function threadGroup(withJesus) {
    var paths = withJesus ? [
      "M146 83 C125 158 62 205 46 304 C27 421 44 515 111 556 C153 582 225 601 292 591",
      "M151 86 C137 176 91 232 79 337 C66 450 88 521 139 559 C180 590 240 601 292 591",
      "M411 83 C431 170 432 247 421 346 C410 454 384 520 347 555 C325 576 308 587 292 591"
    ] : [
      "M218 462 C160 467 48 480 24 526 C0 571 37 601 88 617 C137 633 228 610 292 591",
      "M221 462 C285 470 402 478 426 523 C450 569 404 600 354 619 C328 627 308 606 292 591",
      "M224 462 C183 480 100 506 71 548 C42 590 83 613 127 624 C174 637 248 608 292 591"
    ];
    var strokes = paths.map(function (d, i) {
      return '<path class="s4-thread s4-th-' + (i + 1) + '" d="' + d + '"/>';
    }).join("");
    return '<g class="s4-threads">' + strokes +
      '<path class="s4-knot" d="M286 591 C286 586 291 584 292 591 C293 598 298 596 298 591 C298 586 293 584 292 591 C291 597 286 596 286 591Z"/>' +
      '</g>';
  }

  function render(root) {
    var withJesus = !!C.showJesusFigure;
    var specks = SPECKS.map(function (s) {
      return '<span class="s4-speck" style="left:' + s.left + ";top:" + s.top +
        ";width:" + s.s + "px;height:" + s.s + "px;--dur:" + s.dur +
        "s;--del:-" + s.del + "s;--op:" + s.op + '"></span>';
    }).join("");

    root.innerHTML =
      '<div class="s4-sky" aria-hidden="true">' +
        '<div class="s4-glow"></div>' +
        '<div class="s4-rays">' +
          '<span class="s4-ray" style="--rot:-26deg;animation-duration:23s"></span>' +
          '<span class="s4-ray" style="--rot:-11deg;animation-duration:29s;opacity:.85"></span>' +
          '<span class="s4-ray" style="--rot:3deg;animation-duration:26s"></span>' +
          '<span class="s4-ray" style="--rot:17deg;animation-duration:31s;opacity:.85"></span>' +
          '<span class="s4-ray" style="--rot:30deg;animation-duration:24s;opacity:.7"></span>' +
        '</div>' +
        '<div class="s4-dust">' + specks + '</div>' +
      '</div>' +
      '<div class="s4-wrap">' +
        '<div class="s4-art' + (withJesus ? '' : ' s4-art--couple-only') + '" aria-hidden="true">' +
          '<div class="s4-art-viewport">' +
            '<span class="s4-halo-glow"></span>' +
            '<div class="s4-image-reveal">' +
              '<img class="s4-illustration" src="images/blessing.png" alt="" draggable="false" decoding="async"/>' +
            '</div>' +
            '<svg class="s4-thread-overlay" viewBox="0 0 442 924" preserveAspectRatio="none" focusable="false">' +
              threadGroup(withJesus) +
            '</svg>' +
          '</div>' +
        '</div>' +
        '<div class="s4-verse"></div>' +
      '</div>';
  }

  /* Split the verse at its own sentence pauses (":" / ";") so each
     language reads line by line. Nothing but config text is used. */
  function splitVerse(text) {
    var words = String(text || "").split(/\s+/);
    var lines = [], cur = [];
    words.forEach(function (w) {
      if (!w) { return; }
      cur.push(w);
      if (/[:;]$/.test(w) && cur.length >= 3) {
        lines.push(cur.join(" "));
        cur = [];
      }
    });
    if (cur.length) { lines.push(cur.join(" ")); }
    if (lines.length === 1 && lines[0].length > 90) {
      var ws = lines[0].split(" ");
      var half = Math.ceil(ws.length / 2);
      lines = [ws.slice(0, half).join(" "), ws.slice(half).join(" ")];
    }
    while (lines.length > 4) { lines[3] += " " + lines.splice(4, 1)[0]; }
    return lines;
  }

  function fillText(root) {
    var verse = root.querySelector(".s4-verse");
    var lines = splitVerse(App.txt(C.verse.text));
    verse.innerHTML = lines.map(function () { return '<p class="s4-verse-line"></p>'; }).join("") +
      '<p class="s4-ref"></p>';
    var els = verse.querySelectorAll(".s4-verse-line");
    lines.forEach(function (line, i) { els[i].textContent = line; });
    verse.querySelector(".s4-ref").textContent = App.txt(C.verse.ref);
  }

  function prepStrokes(root) {
    var els = root.querySelectorAll(".s4-thread, .s4-knot");
    Array.prototype.forEach.call(els, function (el) {
      var length = 320;
      try { length = el.getTotalLength(); } catch (e) {}
      el.style.strokeDasharray = length + " " + length;
      el.style.strokeDashoffset = String(length);
    });
  }
  function clearStrokes(root) {
    var els = root.querySelectorAll(".s4-thread, .s4-knot");
    Array.prototype.forEach.call(els, function (el) {
      el.style.strokeDasharray = "none";
      el.style.strokeDashoffset = "0";
    });
  }

  function resetVisual(root) {
    root.classList.remove("is-animating");
    if (window.gsap) {
      window.gsap.set(root.querySelectorAll(
        ".s4-glow, .s4-rays, .s4-dust, .s4-verse-line, .s4-ref"),
        { clearProps: "all" });
    }
    var reveal = root.querySelector(".s4-image-reveal");
    if (reveal) { reveal.style.setProperty("--s4-reveal", "100%"); }
    clearStrokes(root);
  }

  function staticFinal(root) {
    resetVisual(root);
    App.markSceneReady(4);
  }

  /* Slow, calm, reverent — ≈ 9 s through the reference and release. */
  function buildTimeline(root) {
    var g = window.gsap;
    var reveal = root.querySelector(".s4-image-reveal");
    var withJesus = !!C.showJesusFigure;
    tl = g.timeline({ defaults: { ease: "sine.inOut" } });

    /* Warm light, rays, and drifting dust keep their original timing. */
    tl.fromTo(root.querySelector(".s4-glow"), { opacity: 0 }, { opacity: 1, duration: 2.6 }, 0);
    tl.fromTo(root.querySelector(".s4-rays"), { opacity: 0 }, { opacity: 1, duration: 2.2 }, .2);
    tl.fromTo(root.querySelector(".s4-dust"), { opacity: 0 }, { opacity: 1, duration: 2.4 }, .4);

    /* Reveal Jesus first, then the couple.  The CSS mask's soft edge
       follows this stop in the same 0–100% image coordinate space. */
    g.set(reveal, { "--s4-reveal": "0%" });
    if (withJesus) {
      tl.to(reveal, { "--s4-reveal": "50%", duration: 2.5, ease: "sine.inOut" }, 0);
      tl.to(reveal, { "--s4-reveal": "100%", duration: 2, ease: "sine.inOut" }, 2.5);
    } else {
      /* In couple-only mode, the cropped lower half reveals top-to-bottom. */
      tl.to(reveal, { "--s4-reveal": "100%", duration: 2.5, ease: "sine.inOut" }, 0);
    }

    /* Three fine threads travel from the palms (or top-centre light)
       toward the joined hands; the knot finishes at about 6.5 s. */
    prepStrokes(root);
    var threads = root.querySelectorAll(".s4-thread");
    tl.to(threads, {
      strokeDashoffset: 0,
      duration: 1.55,
      ease: "power1.inOut",
      stagger: .16
    }, 4.5);
    tl.to(root.querySelector(".s4-knot"), {
      strokeDashoffset: 0,
      duration: .4,
      ease: "power1.inOut"
    }, 6.1);
    tl.call(function () { clearStrokes(root); }, null, 7);

    /* The verse, reference, and Next release retain their original times. */
    var lines = root.querySelectorAll(".s4-verse-line");
    Array.prototype.forEach.call(lines, function (el, i) {
      tl.fromTo(el, { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 1.1, ease: "sine.out" }, 5.7 + i * .8);
    });
    tl.fromTo(root.querySelector(".s4-ref"), { opacity: 0 },
      { opacity: 1, duration: .9 }, 8);
    tl.call(function () { App.markSceneReady(4); }, null, 8.85);

    if (document.hidden) { tl.pause(); pausedByVisibility = true; }
  }

  App.registerScene(4, {
    init: render,
    enter: function () {
      var root = this.root;
      if (tl) { tl.kill(); tl = null; }
      pausedByVisibility = false;
      App.holdNext(4);
      resetVisual(root);
      fillText(root);
      if (App.ambient) { App.ambient.start(); }
      if (!window.gsap || App.reduced) { staticFinal(root); return; }
      root.classList.add("is-animating");
      buildTimeline(root);
    },
    exit: function () {
      if (tl) { tl.kill(); tl = null; }
      pausedByVisibility = false;
      this.root.classList.remove("is-animating");
    }
  });

  document.addEventListener("visibilitychange", function () {
    if (!tl || App.scene !== 4) { return; }
    if (document.hidden && !tl.paused()) { pausedByVisibility = true; tl.pause(); }
    else if (!document.hidden && pausedByVisibility) { pausedByVisibility = false; tl.resume(); }
  });

  window.addEventListener("invitation:motionchange", function () {
    if (App.reduced && App.scene === 4) {
      if (tl) { tl.kill(); tl = null; }
      pausedByVisibility = false;
      staticFinal(App.scenes[4].root);
    }
  });
})();
