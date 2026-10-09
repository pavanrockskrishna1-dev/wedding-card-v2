/* Full-screen envelope. All visible/accessible copy comes from CONFIG. */
(function () {
  "use strict";
  var App = window.Invitation, C = window.CONFIG;
  var tl = null, timer = null, opened = false, pausedByVisibility = false;
  var root;
  function waxPath(cx, cy, r) {
    var n = 18, pts = [], i;
    for (i = 0; i < n; i++) {
      var a = i / n * Math.PI * 2;
      var rr = r + Math.sin(i * 2.3 + 1.1) * 1.7 + Math.cos(i * 5.1 + .4) * .9;
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    function f(v) { return v.toFixed(2); }
    var d = "M" + f(pts[0][0]) + " " + f(pts[0][1]);
    for (i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i];
      var p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += "C" + f(p1[0] + (p2[0] - p0[0]) / 6) + " " + f(p1[1] + (p2[1] - p0[1]) / 6) + "," +
        f(p2[0] - (p3[0] - p1[0]) / 6) + " " + f(p2[1] - (p3[1] - p1[1]) / 6) + "," + f(p2[0]) + " " + f(p2[1]);
    }
    return d + "Z";
  }
  /* The original irregular wax edge, sheen, pressed ring and layered monogram. */
  function sealSvg(side) {
    var wax = "s1-wax-" + side, foil = "s1-foil-" + side;
    var mono = App.escapeHtml(C.meta.monogramSeal);
    var text = ' text-anchor="middle" dominant-baseline="central" font-family="Cormorant Garamond, Georgia, serif" font-style="italic" font-weight="600" font-size="19"';
    return '<svg class="seal-svg" viewBox="0 0 72 72" aria-hidden="true" focusable="false"><defs>' +
      '<radialGradient id="' + wax + '" cx="34%" cy="30%" r="72%"><stop stop-color="#6D1F3A"/><stop offset="55%" stop-color="#4A1228"/><stop offset="100%" stop-color="#4A1228"/></radialGradient>' +
      '<linearGradient id="' + foil + '" x2="1" y2="1"><stop stop-color="#B76E79"/><stop offset="48%" stop-color="#E7B7A3"/><stop offset="100%" stop-color="#B76E79"/></linearGradient></defs>' +
      '<path d="' + waxPath(36, 36, 33.2) + '" fill="url(#' + wax + ')"/>' +
      '<ellipse cx="27" cy="24" rx="12" ry="8" fill="#FFFFFF" opacity=".07" transform="rotate(-24 27 24)"/>' +
      '<circle cx="36" cy="37" r="23.2" fill="none" stroke="#4A1228" stroke-opacity=".7" stroke-width="2.3"/>' +
      '<circle cx="36" cy="35.1" r="23.2" fill="none" stroke="#D9A3A9" stroke-opacity=".3" stroke-width="1.5"/>' +
      '<circle cx="36" cy="36" r="22" fill="#4A1228" opacity=".25"/>' +
      '<text x="36" y="37.1"' + text + ' fill="#4A1228">' + mono + '</text>' +
      '<text x="36" y="35.2"' + text + ' fill="#D9A3A9" opacity=".25">' + mono + '</text>' +
      '<text x="36" y="36"' + text + ' fill="url(#' + foil + ')">' + mono + '</text></svg>';
  }
  function flap(side, path) {
    return '<div class="env-flap env-flap-' + side + '"><div class="flap-paper">' +
      '<svg class="env-folds" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="' + path + '"/></svg></div></div>';
  }
  function render(el) {
    root = el;
    root.innerHTML = '<div class="s1-canvas"><div class="env-full" aria-hidden="true">' +
      '<div class="env-lining"></div><div class="env-light"></div>' +
      flap("bottom", "M0 100L50 50L100 100") + flap("left", "M0 0L50 50L0 100") +
      flap("right", "M100 0L50 50L100 100") + flap("top", "M0 0L50 50L100 0") +
      '</div><div class="s1-border" aria-hidden="true"></div>' +
      '<p class="s1-invited" lang="en">' + App.escapeHtml(App.shared("invited")) + '</p>' +
      '<button class="seal-btn" type="button" aria-label="' + App.escapeHtml(App.shared("sealAria")) + '">' +
      '<span class="half half-l"><span class="half-clip">' + sealSvg("l") + '</span></span>' +
      '<span class="half half-r"><span class="half-clip">' + sealSvg("r") + '</span></span>' +
      '<span class="seal-intact">' + sealSvg("whole") + '</span></button>' +
      '<div class="s1-open-options"' + (App.params.lang ? ' hidden' : '') + '>' +
      '<button class="s1-open-btn" type="button" lang="en" data-lang="en">' + App.escapeHtml(App.shared("openEnglish")) + '</button>' +
      '<button class="s1-open-btn s1-open-btn-te" type="button" lang="te" data-lang="te">' + App.escapeHtml(App.shared("openTelugu")) + '</button></div></div>';
    root.querySelector(".seal-btn").addEventListener("click", function () { openEnvelope(App.params.lang || "en"); });
    Array.prototype.forEach.call(root.querySelectorAll(".s1-open-btn"), function (btn) {
      btn.addEventListener("click", function () { openEnvelope(btn.getAttribute("data-lang")); });
    });
  }
  function finishOpen() {
    if (!opened || App.scene !== 1) { return; }
    clearTimeout(timer);
    timer = null;
    root.setAttribute("aria-busy", "false");
    if (App.ambient) { App.ambient.start(); }
    App.playMusic();
    App.goToScene(2);
  }
  function openEnvelope(lang) {
    if (opened || App.scene !== 1) { return; }
    opened = true;
    /* Both calls occur synchronously inside the click, before animation. */
    App.setLang(lang);
    App.unlockAudio();
    root.setAttribute("aria-busy", "true");
    var paper = root.querySelector(".s1-canvas");
    paper.classList.add("s1-opening");
    Array.prototype.forEach.call(root.querySelectorAll("button"), function (b) { b.disabled = true; });
    if (!App.reduced && navigator.vibrate) { try { navigator.vibrate(8); } catch (e) {} }
    if (!window.gsap || App.reduced) {
      paper.classList.add("s1-static-open");
      timer = setTimeout(finishOpen, App.reduced ? 120 : 300);
      return;
    }
    var g = window.gsap;
    tl = g.timeline({ defaults: { ease: "power2.inOut" } });
    tl.to(root.querySelectorAll(".s1-invited, .s1-open-options"), { opacity: 0, y: -6, duration: .2 }, 0);
    tl.to(root.querySelector(".half-l"), { x: -7, rotation: -5, duration: .16 }, 0);
    tl.to(root.querySelector(".half-r"), { x: 7, rotation: 5, duration: .16 }, 0);
    tl.to(root.querySelector(".half-l"), { x: -65, y: root.clientHeight * .65, rotation: -44, opacity: 0, duration: .76, ease: "power2.in" }, .16);
    tl.to(root.querySelector(".half-r"), { x: 68, y: root.clientHeight * .68, rotation: 40, opacity: 0, duration: .76, ease: "power2.in" }, .16);
    tl.to(root.querySelector(".env-light"), { opacity: 1, scale: 1.05, duration: 1.85 }, .55);
    tl.to(root.querySelector(".env-flap-top"), { rotationX: 160, duration: .65 }, .55);
    tl.to(root.querySelector(".env-flap-left"), { rotationY: -160, duration: .68 }, 1.22);
    tl.to(root.querySelector(".env-flap-right"), { rotationY: 160, duration: .68 }, 1.22);
    tl.to(root.querySelector(".env-flap-bottom"), { rotationX: -160, duration: .68 }, 1.92);
    tl.to(root.querySelector(".s1-border"), { opacity: 0, duration: .4 }, 1.92);
    tl.to(paper, { opacity: 0, scale: 1.035, duration: .4 }, 2.6);
    tl.call(finishOpen, null, 3);
    if (document.hidden) { tl.pause(); pausedByVisibility = true; }
  }
  App.registerScene(1, {
    init: render,
    enter: function () {
      clearTimeout(timer);
      if (tl) { tl.kill(); tl = null; }
      opened = false;
      pausedByVisibility = false;
      if (App.ambient) { App.ambient.stop(); }
      root.querySelector(".s1-canvas").className = "s1-canvas";
      if (window.gsap) { window.gsap.set(root.querySelectorAll(".s1-canvas, .env-flap, .env-light, .half, .s1-border, .s1-invited, .s1-open-options"), { clearProps: "all" }); }
      root.querySelector(".s1-open-options").hidden = !!App.params.lang;
      root.setAttribute("aria-busy", "false");
      Array.prototype.forEach.call(root.querySelectorAll("button"), function (b) { b.disabled = false; });
    },
    exit: function () {
      clearTimeout(timer);
      if (tl) { tl.kill(); tl = null; }
      root.querySelector(".s1-canvas").classList.remove("s1-opening");
      root.setAttribute("aria-busy", "false");
      pausedByVisibility = false;
    }
  });
  document.addEventListener("visibilitychange", function () {
    if (!tl || App.scene !== 1) { return; }
    if (document.hidden && !tl.paused()) { pausedByVisibility = true; tl.pause(); }
    else if (!document.hidden && pausedByVisibility) { pausedByVisibility = false; tl.resume(); }
  });
  window.addEventListener("invitation:motionchange", function () {
    if (App.reduced && opened && App.scene === 1) {
      if (tl) { tl.kill(); tl = null; }
      finishOpen();
    }
  });
})();
