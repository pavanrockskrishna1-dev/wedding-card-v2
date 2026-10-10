/* App shell: existing config, URL, audio and registry APIs retained. */
(function () {
  "use strict";
  var C = window.CONFIG;
  var motion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  var App = {
    cfg: C, lang: null, scene: 0, sceneReady: false,
    soundOn: true, audioUnlocked: false, music: null, narrationAudio: null,
    reduced: !!(motion && motion.matches), scenes: {}, params: {}
  };
  window.Invitation = App;

  var qs = new URLSearchParams(window.location.search);
  if (qs.get("name")) { App.params.name = qs.get("name"); }
  if (qs.get("lang") === "en" || qs.get("lang") === "te") { App.params.lang = qs.get("lang"); }

  App.txt = function (obj) { return obj ? (obj[App.lang] || obj.en || "") : ""; };
  App.ui = function (key) {
    var pack = C.ui[App.lang] || C.ui.en;
    return pack[key] !== undefined ? pack[key] : (C.ui.en[key] !== undefined ? C.ui.en[key] : C.ui.shared[key]);
  };
  App.shared = function (key) { return C.ui.shared[key] || ""; };
  App.escapeHtml = function (value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  };
  App.greetingText = function () {
    var g = C.greeting[App.lang] || C.greeting.en;
    return g.prefix + (App.params.name || g.guest);
  };

  /* Keep the synchronous gesture-time audio unlock; missing files stay silent. */
  App.unlockAudio = function () {
    if (App.audioUnlocked) { return; }
    App.audioUnlocked = true;
    try {
      var m = new Audio(C.musicSrc);
      m.loop = true;
      m.volume = 0;
      m.addEventListener("error", function () { if (App.music === m) { App.music = null; } });
      App.music = m;
      var p = m.play();
      if (p && p.then) {
        p.then(function () { m.pause(); m.currentTime = 0; }).catch(function () {});
      } else { m.pause(); }
    } catch (e) { App.music = null; }
  };
  App.playMusic = function () {
    if (!App.music || !App.soundOn) { return; }
    try {
      App.music.volume = .28;
      App.music.muted = false;
      var p = App.music.play();
      if (p && p.catch) { p.catch(function () {}); }
    } catch (e) {}
  };
  App.playNarration = function (n) {
    if (App.narrationAudio) {
      try { App.narrationAudio.pause(); } catch (e) {}
      App.narrationAudio = null;
    }
    if (!App.soundOn || !App.audioUnlocked) { return; }
    var pack = C.narration[App.lang] || C.narration.en;
    var src = pack && pack["scene" + n];
    if (!src) { return; }
    try {
      var a = new Audio(src);
      a.volume = .9;
      a.addEventListener("error", function () {});
      var p = a.play();
      if (p && p.catch) { p.catch(function () {}); }
      App.narrationAudio = a;
    } catch (e) {}
  };
  App.setSound = function (on) {
    App.soundOn = !!on;
    if (App.music) { App.music.muted = !App.soundOn; }
    if (App.narrationAudio) {
      App.narrationAudio.muted = !App.soundOn;
      try {
        if (!App.soundOn) { App.narrationAudio.pause(); }
        else {
          var p = App.narrationAudio.play();
          if (p && p.catch) { p.catch(function () {}); }
        }
      } catch (e) {}
    }
    if (App.soundOn) { App.playMusic(); }
    updateSoundBtn();
  };

  App.setLang = function (id) {
    App.lang = id === "te" ? "te" : "en";
    document.documentElement.lang = App.lang;
    document.body.classList.toggle("lang-te", App.lang === "te");
    document.title = App.txt(C.meta.pageTitle);
    updateChrome();
  };
  App.registerScene = function (n, impl) {
    App.scenes[n] = impl;
    impl.root = document.getElementById("scene-" + n);
    impl.num = n;
  };

  var navLocked = false;
  var navTimer = null;
  var waitingForMain = false;
  /* Animated scenes hold navigation, then release it at their main finale.
     Existing scenes 3–6 are immediate stubs: their logic is not changed. */
  App.holdNext = function (n) {
    if (n !== App.scene) { return; }
    waitingForMain = true;
    App.sceneReady = false;
    updateChrome();
  };
  App.markSceneReady = function (n) {
    if (n !== App.scene || n < 2) { return; }
    waitingForMain = false;
    App.sceneReady = true;
    updateChrome();
  };
  function activate(n, focus) {
    var to = App.scenes[n];
    App.scene = n;
    App.sceneReady = false;
    waitingForMain = false;
    if (to.root) {
      to.root.classList.add("is-active");
      /* soft light bloom between scenes (not on the envelope) */
      var bloom = document.getElementById("bloom");
      if (bloom && n >= 2 && !App.reduced) {
        bloom.classList.remove("is-blooming");
        void bloom.offsetWidth;
        bloom.classList.add("is-blooming");
      }
      to.root.setAttribute("aria-hidden", "false");
      to.root.inert = false;
      if (focus) { try { to.root.focus({ preventScroll: true }); } catch (e) {} }
    }
    updateChrome();
    if (to.enter) { to.enter(); }
    if (n >= 2 && !waitingForMain) { App.markSceneReady(n); }
    updateChrome();
  }
  App.goToScene = function (n) {
    if (navLocked || n === App.scene || !App.scenes[n]) { return false; }
    navLocked = true;
    clearTimeout(navTimer);
    navTimer = setTimeout(function () { navLocked = false; updateChrome(); }, App.reduced ? 20 : 850);
    var from = App.scenes[App.scene];
    if (from && from.exit) { from.exit(); }
    if (from && from.root) {
      if (from.root.contains(document.activeElement)) { document.activeElement.blur(); }
      from.root.classList.remove("is-active");
      from.root.inert = true;
      from.root.setAttribute("aria-hidden", "true");
    }
    activate(n, true);
    App.playNarration(n);
    return true;
  };
  App.next = function () {
    if (navLocked || !App.sceneReady || App.scene < 2 || App.scene >= 6) { return false; }
    return App.goToScene(App.scene + 1);
  };

  function updateChrome() {
    var nextBtn = document.getElementById("next-btn");
    var soundBtn = document.getElementById("sound-btn");
    if (!nextBtn || !soundBtn) { return; }
    var showNext = App.scene >= 2 && App.scene <= 5 && App.sceneReady && !navLocked;
    nextBtn.hidden = !showNext;
    nextBtn.disabled = !showNext;
    soundBtn.hidden = App.scene < 2;
    document.getElementById("next-btn-label").textContent = App.ui("next");
    var labels = App.ui("sceneLabels") || [];
    for (var n = 1; n <= 6; n++) {
      var root = document.getElementById("scene-" + n);
      if (root && labels[n - 1]) { root.setAttribute("aria-label", labels[n - 1]); }
    }
    updateSoundBtn();
  }
  function updateSoundBtn() {
    var btn = document.getElementById("sound-btn");
    if (!btn) { return; }
    btn.classList.toggle("is-muted", !App.soundOn);
    btn.setAttribute("aria-label", App.ui(App.soundOn ? "soundOnAria" : "soundOffAria"));
    btn.setAttribute("aria-pressed", String(App.soundOn));
  }

  /* Same placeholder content/layout as before; only its accent is recoloured. */
  App.renderStub = function (root, n) {
    var stub = C.scenes["scene" + n].stub;
    root.innerHTML = '<div class="stub-wrap"><div class="stub-card">' +
      '<div class="stub-border-1"></div><div class="stub-border-2"></div>' +
      '<div class="rule-star"><div class="rs-line"></div>' +
      '<svg class="rs-star" width="12" height="12" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 0L8.6 5.4L14 7L8.6 8.6L7 14L5.4 8.6L0 7L5.4 5.4Z" fill="currentColor"/></svg>' +
      '<div class="rs-line"></div></div>' +
      '<p class="stub-title">' + stub.en + '</p>' +
      '<p class="stub-title stub-title-te">' + stub.te + '</p></div></div>';
  };

  function updateFit() {
    var stage = document.getElementById("stage");
    var w = stage.clientWidth, h = stage.clientHeight;
    document.documentElement.style.setProperty("--fit", String(Math.min(1, w / 390, h / 844)));
    document.documentElement.style.setProperty("--s2-fit", String(Math.min(1, Math.max(.35, (h - 140) / 630))));
  }
  var booted = false;
  function boot() {
    if (booted) { return; }
    booted = true;
    App.setLang(App.params.lang || "en");
    for (var n = 1; n <= 6; n++) {
      var s = App.scenes[n];
      if (s && s.root) {
        s.root.inert = true;
        if (s.init) { s.init(s.root); }
      }
    }
    if (App.scenes[1]) { activate(1, false); }
    var stage = document.getElementById("stage");
    document.getElementById("next-btn").addEventListener("click", function () { App.unlockAudio(); App.next(); });
    document.getElementById("sound-btn").addEventListener("click", function () { App.unlockAudio(); App.setSound(!App.soundOn); });

    var touch = null;
    function interactive(target) { return target && target.closest && target.closest("button, a, input, textarea, select, [contenteditable], [data-no-swipe]"); }
    stage.addEventListener("touchstart", function (e) {
      touch = null;
      if (!App.sceneReady || App.scene < 2 || navLocked || interactive(e.target)) { return; }
      if (e.touches && e.touches.length === 1) {
        touch = { x: e.touches[0].clientX, y: e.touches[0].clientY, scene: App.scene };
      }
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      var start = touch;
      touch = null;
      if (!start || start.scene !== App.scene || !e.changedTouches || !e.changedTouches.length) { return; }
      var dx = e.changedTouches[0].clientX - start.x;
      var dy = e.changedTouches[0].clientY - start.y;
      if (dy < -56 && Math.abs(dy) > Math.abs(dx) * 1.15 && !interactive(e.target)) { App.unlockAudio(); App.next(); }
    }, { passive: true });
    stage.addEventListener("touchcancel", function () { touch = null; }, { passive: true });
    window.addEventListener("keydown", function (e) {
      if (interactive(e.target)) { return; }
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown") {
        if (App.sceneReady && App.scene >= 2 && App.scene < 6) { e.preventDefault(); App.unlockAudio(); App.next(); }
      }
    });
    document.addEventListener("visibilitychange", function () {
      stage.classList.toggle("is-paused", document.hidden);
    });
    stage.classList.toggle("is-paused", document.hidden);
    if (motion) {
      var onMotion = function () {
        App.reduced = motion.matches;
        window.dispatchEvent(new Event("invitation:motionchange"));
      };
      if (motion.addEventListener) { motion.addEventListener("change", onMotion); }
      else { motion.addListener(onMotion); }
    }
    window.addEventListener("resize", updateFit);
    updateFit();
  }
  if (document.readyState === "loading") { document.addEventListener("DOMContentLoaded", boot); }
  else { setTimeout(boot, 0); }
})();
