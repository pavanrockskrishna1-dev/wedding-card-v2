/* ============================================================
   js/scene1.js — Scene 1 · sealed envelope
   Matches the approved mockup, with two fixes:
     (a) composition vertically centred on 390×844, nothing
         clipped at the top
     (b) richer wax seal — slightly uneven wax edge and a
         pressed-in inner ring
   All copy comes from js/config.js.
   ============================================================ */
(function () {
  "use strict";

  var App = window.Invitation;
  var C = window.CONFIG;

  var timers = [];
  var opened = false;

  function later(fn, ms) {
    timers.push(setTimeout(fn, ms));
  }

  function clearTimers() {
    timers.forEach(clearTimeout);
    timers = [];
  }

  /* ---- slightly uneven wax edge: smooth closed blob, deterministic ---- */
  function waxPath(cx, cy, r) {
    var n = 18;
    var pts = [];
    var i;
    for (i = 0; i < n; i++) {
      var a = (i / n) * Math.PI * 2;
      var rr = r + Math.sin(i * 2.3 + 1.1) * 1.7 + Math.cos(i * 5.1 + 0.4) * 0.9;
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    var f = function (v) { return v.toFixed(2); };
    var d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
    for (i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n];
      var p1 = pts[i];
      var p2 = pts[(i + 1) % n];
      var p3 = pts[(i + 2) % n];
      var c1x = p1[0] + (p2[0] - p0[0]) / 6;
      var c1y = p1[1] + (p2[1] - p0[1]) / 6;
      var c2x = p2[0] - (p3[0] - p1[0]) / 6;
      var c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += "C" + f(c1x) + " " + f(c1y) + "," + f(c2x) + " " + f(c2y) + "," + f(p2[0]) + " " + f(p2[1]);
    }
    return d + "Z";
  }

  /* ---- one half of the wax seal (full SVG, clipped to a side) ---- */
  function sealSvg(idSuffix) {
    var gid = "waxG-" + idSuffix;
    var mono = C.meta.monogramSeal || "A&E";
    return (
      '<svg class="seal-svg" viewBox="0 0 72 72" aria-hidden="true">' +
      "<defs>" +
      '<radialGradient id="' + gid + '" cx="34%" cy="30%" r="72%">' +
      '<stop offset="0%" stop-color="#b2414a"></stop>' +
      '<stop offset="55%" stop-color="#7b1e25"></stop>' +
      '<stop offset="100%" stop-color="#561118"></stop>' +
      "</radialGradient>" +
      "</defs>" +
      /* uneven wax blob */
      '<path d="' + waxPath(36, 36, 33.2) + '" fill="url(#' + gid + ')"></path>' +
      /* faint wax sheen */
      '<ellipse cx="27" cy="24" rx="12" ry="8" fill="rgba(255,255,255,0.07)" transform="rotate(-24 27 24)"></ellipse>' +
      /* pressed-in inner ring: dark groove below, light lip above */
      '<circle cx="36" cy="37" r="23.2" fill="none" stroke="rgba(18,2,6,0.42)" stroke-width="2.3"></circle>' +
      '<circle cx="36" cy="35.1" r="23.2" fill="none" stroke="rgba(255,214,190,0.30)" stroke-width="1.5"></circle>' +
      /* pressed field inside the ring */
      '<circle cx="36" cy="36" r="22" fill="rgba(10,0,3,0.10)"></circle>' +
      /* pressed monogram (two offset layers + face) */
      '<text x="36" y="37.1" text-anchor="middle" dominant-baseline="central" font-family="Cormorant Garamond, Georgia, serif" font-style="italic" font-weight="600" font-size="19" fill="rgba(20,2,6,0.40)">' + mono + "</text>" +
      '<text x="36" y="35.2" text-anchor="middle" dominant-baseline="central" font-family="Cormorant Garamond, Georgia, serif" font-style="italic" font-weight="600" font-size="19" fill="rgba(255,220,195,0.22)">' + mono + "</text>" +
      '<text x="36" y="36" text-anchor="middle" dominant-baseline="central" font-family="Cormorant Garamond, Georgia, serif" font-style="italic" font-weight="600" font-size="19" fill="#e7c3a0">' + mono + "</text>" +
      "</svg>"
    );
  }

  function starRow(lineWidth) {
    return (
      '<div class="rule-star">' +
      '<div class="rs-line" style="width:' + lineWidth + 'px"></div>' +
      '<svg class="rs-star" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 0 L8.6 5.4 L14 7 L8.6 8.6 L7 14 L5.4 8.6 L0 7 L5.4 5.4 Z" fill="#b08d57"></path></svg>' +
      '<div class="rs-line" style="width:' + lineWidth + 'px"></div>' +
      "</div>"
    );
  }

  function render(root) {
    var mono = C.meta.monogram || "A & E";
    var monoParts = mono.split("&");
    var monoHtml =
      (monoParts[0] || "A ") + '<span class="amp">&amp;</span>' + (monoParts[1] || " E");

    root.innerHTML =
      '<div class="s1-canvas s-sealed">' +

        /* ---- sealed composition (vertically centred) ---- */
        '<div class="s1-flow hint">' +

          '<div class="s1-ornament hint">' +
            starRow(48) +
            '<div class="s1-invited">' + App.shared("invited") + "</div>" +
          "</div>" +

          '<div class="env">' +
            '<div class="env-back"></div>' +

            /* small monogram card inside */
            '<div class="mini">' +
              '<div class="mini-border"></div>' +
              '<div class="mini-mono">' + monoHtml + "</div>" +
              '<div class="mini-rule"></div>' +
            "</div>" +

            /* front pocket */
            '<svg class="env-pocket" width="320" height="214" viewBox="0 0 320 214" aria-hidden="true">' +
              '<path d="M0 0 L160 120 L320 0 L320 214 L0 214 Z" fill="#e8dbc0"></path>' +
              '<path d="M0 214 L160 112 L320 214" fill="none" stroke="rgba(150,115,65,0.25)" stroke-width="1"></path>' +
              '<path d="M8 8 L160 122 L312 8" fill="none" stroke="#b08d57" stroke-width="0.8" opacity="0.7"></path>' +
              '<rect x="6" y="6" width="308" height="202" fill="none" stroke="#b08d57" stroke-width="0.8" opacity="0.55"></rect>' +
            "</svg>" +

            /* flap */
            '<div class="flap">' +
              '<svg width="320" height="132" viewBox="0 0 320 132" aria-hidden="true">' +
                '<path d="M0 0 L320 0 L160 132 Z" fill="#efe4cc"></path>' +
                '<path d="M10 6 L310 6 L160 122 Z" fill="none" stroke="#b08d57" stroke-width="0.8" opacity="0.75"></path>' +
                '<path d="M0 0 L160 132 L320 0" fill="none" stroke="rgba(120,90,50,0.18)" stroke-width="2"></path>' +
              "</svg>" +
              '<svg class="flap-back" width="320" height="132" viewBox="0 0 320 132" aria-hidden="true">' +
                '<path d="M0 0 L320 0 L160 132 Z" fill="#d4bf98"></path>' +
              "</svg>" +
            "</div>" +

            /* wax seal */
            '<button class="seal-btn" type="button" aria-label="' + App.shared("sealAria") + '">' +
              '<div class="half half-l">' +
                '<div class="ribbon-tail"></div>' +
                '<div class="half-clip">' + sealSvg("l") + "</div>" +
              "</div>" +
              '<div class="half half-r">' +
                '<div class="ribbon-tail"></div>' +
                '<div class="half-clip">' + sealSvg("r") + "</div>" +
              "</div>" +
            "</button>" +
          "</div>" +

          '<div class="s1-hint hint">' +
            '<div class="s1-hint-en">' + App.shared("tapSeal") + "</div>" +
            '<div class="s1-hint-te">' + App.shared("tapSealTe") + "</div>" +
          "</div>" +

        "</div>" +

        /* ---- language card ---- */
        '<div class="s1-lang-pos">' +
          '<div class="big">' +
            '<div class="big-border-1"></div>' +
            '<div class="big-border-2"></div>' +
            '<div class="big-mono">' + monoHtml + "</div>" +
            '<div class="big-divider">' +
              '<div class="rs-line" style="width:40px"></div>' +
              '<svg width="10" height="10" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 0 L8.6 5.4 L14 7 L8.6 8.6 L7 14 L5.4 8.6 L0 7 L5.4 5.4 Z" fill="#b08d57"></path></svg>' +
              '<div class="rs-line" style="width:40px"></div>' +
            "</div>" +
            '<div class="big-kind">' + App.shared("kindChoose1") + "</div>" +
            '<div class="big-kind">' + App.shared("kindChoose2") + "</div>" +
            '<div class="big-langs">' +
              C.languages.map(function (L) {
                return (
                  '<button class="lang-btn' + (L.id === "te" ? " lang-btn-te" : "") +
                  '" type="button" data-lang="' + L.id + '">' + L.label + "</button>"
                );
              }).join("") +
            "</div>" +
          "</div>" +
        "</div>" +

      "</div>";

    /* tap the seal */
    root.querySelector(".seal-btn").addEventListener("click", openSeal);

    /* language choice */
    Array.prototype.forEach.call(root.querySelectorAll(".lang-btn"), function (btn) {
      btn.addEventListener("click", function () {
        App.unlockAudio();
        App.setLang(btn.getAttribute("data-lang"));
        App.goToScene(2);
      });
    });
  }

  function setStage(stage) {
    var canvas = document.querySelector("#scene-1 .s1-canvas");
    if (!canvas) { return; }
    canvas.classList.remove("s-sealed", "s-cracked", "s-open", "s-card", "s-full");
    canvas.classList.add("s-" + stage);
  }

  function openSeal() {
    if (opened) { return; }
    opened = true;

    App.unlockAudio();
    if (navigator.vibrate) { try { navigator.vibrate(8); } catch (e) {} }

    /* stage machine — timings from the approved mockup */
    setStage("cracked");
    later(function () { setStage("open"); }, 900);
    later(function () { setStage("card"); }, 2000);

    if (App.params.lang) {
      /* ?lang=en|te — skip the language choice entirely */
      later(function () {
        App.setLang(App.params.lang);
        App.goToScene(2);
      }, 3300);
    } else {
      later(function () { setStage("full"); }, 3300);
    }
  }

  App.registerScene(1, {
    init: render,
    enter: function () {
      /* fresh state (used again by “View again” later) */
      clearTimers();
      opened = false;
      setStage("sealed");
    },
    exit: function () {
      clearTimers();
    }
  });
})();
