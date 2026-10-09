/* ============================================================
   js/main.js — app shell
   Language, URL params, navigation (swipe up / Next), audio
   unlock, narration (silent if file missing), scene registry.
   ============================================================ */
(function () {
  "use strict";

  var C = window.CONFIG;

  var App = {
    cfg: C,
    lang: null,
    scene: 0,
    soundOn: true,
    audioUnlocked: false,
    music: null,
    narrationAudio: null,
    reduced: !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches),
    scenes: {},
    params: {}
  };
  window.Invitation = App;

  /* ---------------- URL params ---------------- */
  var qs = new URLSearchParams(window.location.search);
  var urlName = qs.get("name");
  var urlLang = qs.get("lang");
  if (urlName) { App.params.name = urlName; }
  if (urlLang === "en" || urlLang === "te") { App.params.lang = urlLang; }

  /* ---------------- text helpers ---------------- */
  App.txt = function (obj) {
    if (!obj) { return ""; }
    return obj[App.lang] || obj.en || "";
  };

  App.ui = function (key) {
    var pack = C.ui[App.lang] || C.ui.en;
    return pack[key] !== undefined ? pack[key] : (C.ui.en[key] !== undefined ? C.ui.en[key] : C.ui.shared[key]);
  };

  App.shared = function (key) {
    return C.ui.shared[key] || "";
  };

  App.greetingText = function () {
    var g = C.greeting[App.lang] || C.greeting.en;
    var who = App.params.name || g.guest;
    return g.prefix + who;
  };

  /* ---------------- audio ---------------- */
  App.unlockAudio = function () {
    if (App.audioUnlocked) { return; }
    App.audioUnlocked = true;
    /* prepare the music element so later scenes can fade it in;
       if the file is missing the error handler stays silent */
    try {
      var m = new Audio(C.musicSrc);
      m.loop = true;
      m.volume = 0;
      m.addEventListener("error", function () { App.music = null; });
      App.music = m;
      /* silent play/pause on the user gesture unlocks the element */
      var p = m.play();
      if (p && p.then) {
        p.then(function () { m.pause(); m.currentTime = 0; }).catch(function () {});
      } else {
        m.pause();
      }
    } catch (e) { App.music = null; }
  };

  App.playMusic = function () {
    if (!App.music || !App.soundOn) { return; }
    try {
      App.music.volume = 0.28;
      var p = App.music.play();
      if (p && p.catch) { p.catch(function () {}); }
    } catch (e) { /* silent */ }
  };

  App.playNarration = function (n) {
    if (!App.soundOn || !App.audioUnlocked) { return; }
    var pack = C.narration[App.lang] || C.narration.en;
    var src = pack["scene" + n];
    if (!src) { return; }
    if (App.narrationAudio) {
      try { App.narrationAudio.pause(); } catch (e) {}
      App.narrationAudio = null;
    }
    try {
      var a = new Audio(src);
      a.volume = 0.9;
      a.addEventListener("error", function () { /* silent, no error */ });
      var p = a.play();
      if (p && p.catch) { p.catch(function () {}); }
      App.narrationAudio = a;
    } catch (e) { /* silent */ }
  };

  App.setSound = function (on) {
    App.soundOn = !!on;
    if (App.music) { App.music.muted = !App.soundOn; }
    if (App.narrationAudio) {
      App.narrationAudio.muted = !App.soundOn;
      if (!App.soundOn) {
        try { App.narrationAudio.pause(); } catch (e) {}
      }
    }
    updateSoundBtn();
  };

  /* ---------------- language ---------------- */
  App.setLang = function (id) {
    if (id !== "en" && id !== "te") { id = "en"; }
    App.lang = id;
    document.documentElement.lang = id === "te" ? "te" : "en";
    document.body.classList.toggle("lang-te", id === "te");
    document.title = App.txt(C.meta.pageTitle);
    updateChrome();
  };

  /* ---------------- scene registry & navigation ---------------- */
  App.registerScene = function (n, impl) {
    App.scenes[n] = impl;
    impl.root = document.getElementById("scene-" + n);
    impl.num = n;
  };

  var navLocked = false;

  App.goToScene = function (n) {
    if (navLocked || n === App.scene || !App.scenes[n]) { return; }
    navLocked = true;
    setTimeout(function () { navLocked = false; }, 850);

    var from = App.scenes[App.scene];
    var to = App.scenes[n];
    if (from && from.exit) { from.exit(); }
    if (from && from.root) { from.root.classList.remove("is-active"); }

    App.scene = n;
    if (to && to.root) { to.root.classList.add("is-active"); }
    if (to && to.enter) { to.enter(); }

    updateChrome();
    App.playNarration(n);
  };

  App.next = function () {
    if (App.scene >= 1 && App.scene < 6) {
      App.goToScene(App.scene + 1);
    }
  };

  /* ---------------- chrome (Next / sound) ---------------- */
  function updateChrome() {
    var nextBtn = document.getElementById("next-btn");
    var soundBtn = document.getElementById("sound-btn");
    /* Next: after the envelope, scenes 2–5 (6 is the closing scene) */
    var showNext = App.scene >= 2 && App.scene <= 5;
    var showSound = App.scene >= 2;
    nextBtn.hidden = !showNext;
    soundBtn.hidden = !showSound;
    document.getElementById("next-btn-label").textContent = App.ui("next");
    updateSoundBtn();
  }

  function updateSoundBtn() {
    var soundBtn = document.getElementById("sound-btn");
    if (!soundBtn) { return; }
    soundBtn.classList.toggle("is-muted", !App.soundOn);
    soundBtn.setAttribute("aria-label", App.soundOn ? App.ui("soundOnAria") : App.ui("soundOffAria"));
  }

  /* ---------------- stub renderer (scenes 3–6 placeholders) ---------------- */
  App.renderStub = function (root, n) {
    var stub = C.scenes["scene" + n].stub;
    root.innerHTML =
      '<div class="stub-wrap"><div class="stub-card">' +
      '<div class="stub-border-1"></div><div class="stub-border-2"></div>' +
      '<div class="rule-star"><div class="rs-line"></div>' +
      '<svg class="rs-star" width="12" height="12" viewBox="0 0 14 14" aria-hidden="true"><path d="M7 0 L8.6 5.4 L14 7 L8.6 8.6 L7 14 L5.4 8.6 L0 7 L5.4 5.4 Z" fill="#b08d57"></path></svg>' +
      '<div class="rs-line"></div></div>' +
      '<p class="stub-title">' + stub.en + "</p>" +
      '<p class="stub-title stub-title-te">' + stub.te + "</p>" +
      "</div></div>";
  };

  /* ---------------- fit scale (small screens) ---------------- */
  function updateFit() {
    var stage = document.getElementById("stage");
    var w = stage.clientWidth;
    var h = stage.clientHeight;
    var fit = Math.min(1, w / 390, h / 844);
    document.documentElement.style.setProperty("--fit", String(fit));
  }

  /* ---------------- boot ---------------- */
  var booted = false;

  function boot() {
    if (booted) { return; }
    booted = true;

    if (App.params.lang) { App.setLang(App.params.lang); }
    else { App.setLang("en"); } /* pre-language screens use shared copy */

    /* init all scenes */
    for (var n = 1; n <= 6; n++) {
      var s = App.scenes[n];
      if (s && s.init) { s.init(s.root); }
    }

    /* start on scene 1 */
    var first = App.scenes[1];
    App.scene = 1;
    if (first && first.root) { first.root.classList.add("is-active"); }
    if (first && first.enter) { first.enter(); }
    updateChrome();

    /* events */
    document.getElementById("next-btn").addEventListener("click", function () {
      App.unlockAudio();
      App.next();
    });

    document.getElementById("sound-btn").addEventListener("click", function () {
      App.setSound(!App.soundOn);
    });

    /* swipe up = next (also swipe down-left guard: forward only per design) */
    var touchY = null;
    var stage = document.getElementById("stage");
    stage.addEventListener("touchstart", function (e) {
      if (e.touches && e.touches.length === 1) { touchY = e.touches[0].clientY; }
    }, { passive: true });
    stage.addEventListener("touchend", function (e) {
      if (touchY === null || !e.changedTouches || !e.changedTouches.length) { return; }
      var dy = e.changedTouches[0].clientY - touchY;
      touchY = null;
      if (dy < -56) {
        var t = e.target;
        if (t && t.closest && t.closest("button")) { return; }
        App.unlockAudio();
        App.next();
      }
    }, { passive: true });

    /* keyboard for desktop preview */
    window.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowRight" || e.key === "PageDown") {
        App.unlockAudio();
        App.next();
      }
    });

    window.addEventListener("resize", updateFit);
    updateFit();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    /* defer one tick so scene files that load after us can register first */
    setTimeout(boot, 0);
  }
})();
