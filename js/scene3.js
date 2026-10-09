/* ============================================================
   js/scene3.js — Scene 3 · "Our Story" photo cards
   Stacked blush prints with rose-gold frames: slow Ken Burns
   on the top card, swipe/tap/auto advance, rose-gold dots.
   Copy & data: js/config.js (photos, scenes.scene3.heading).
   ============================================================ */
(function () {
  "use strict";
  var App = window.Invitation, C = window.CONFIG;

  var TILTS = [-4, 3, -2];              /* prints resting on a table */
  var AUTO_MS = 5000;                   /* advances on its own */
  var KB_SECONDS = 6;                   /* Ken Burns: scale 1 → 1.08 */
  var SWIPE_PX = 64;                    /* distance that commits a swipe */
  var SLOTS = [                         /* front → back resting places */
    { x: 0,   y: 0,  scale: 1,   dr: 0   },
    { x: 16,  y: 12, scale: .96, dr: 1.5 },
    { x: -14, y: 22, scale: .92, dr: -2  }
  ];
  var Z_ORDER = [3, 2, 1];

  var root = null, cards = [], dots = [], stack = [];
  var tlEnter = null, kbTween = null, autoTimer = null;
  var animating = false, revealed = false, photosLoaded = false;
  var pausedByVisibility = false, drag = null;

  function hasGsap() { return !!window.gsap; }
  function tiltOf(card) { return TILTS[Number(card.getAttribute("data-index")) % TILTS.length]; }
  function slotOf(card, slot) {
    var s = SLOTS[slot];
    return { x: s.x, y: s.y, scale: s.scale, rotation: tiltOf(card) + s.dr };
  }
  function mix(target, extra) { for (var k in extra) { target[k] = extra[k]; } return target; }

  function placeholderStar() {
    return '<svg class="s3-ph" viewBox="0 0 14 14" aria-hidden="true" focusable="false">' +
      '<path d="M7 0L8.6 5.4L14 7L8.6 8.6L7 14L5.4 8.6L0 7L5.4 5.4Z" fill="currentColor"/></svg>';
  }

  function render(r) {
    root = r;
    var photos = C.photos || [];
    var cardsHtml = photos.map(function (p, i) {
      return '<figure class="s3-card" data-index="' + i + '">' +
        '<div class="s3-frame"><div class="s3-photo">' + placeholderStar() +
        '<img alt="" loading="lazy" decoding="async" data-src="' + App.escapeHtml(p.src) + '"></div></div>' +
        '<figcaption class="s3-caption"></figcaption></figure>';
    }).join("");
    var dotsHtml = photos.map(function (p, i) {
      return '<span class="s3-dot' + (i === 0 ? " is-on" : "") + '"></span>';
    }).join("");
    r.innerHTML = '<div class="s3-wrap">' +
      '<header class="s3-head"><h2 class="s3-title"></h2>' +
      '<div class="s3-rule" aria-hidden="true"></div></header>' +
      '<div class="s3-stage"><div class="s3-stack">' + cardsHtml + '</div></div>' +
      '<div class="s3-dots" aria-hidden="true">' + dotsHtml + '</div></div>';
    cards = Array.prototype.slice.call(r.querySelectorAll(".s3-card"));
    dots = Array.prototype.slice.call(r.querySelectorAll(".s3-dot"));
    stack = cards.slice();
    bindGestures();
  }

  function fillText() {
    var title = root.querySelector(".s3-title");
    if (title) { title.textContent = App.txt(C.scenes.scene3.heading); }
    var photos = C.photos || [];
    cards.forEach(function (card, i) {
      var p = photos[i];
      if (!p) { return; }
      var text = App.txt(p.caption);
      var cap = card.querySelector(".s3-caption");
      var img = card.querySelector(".s3-photo img");
      if (cap) { cap.textContent = text; }
      if (img) { img.alt = text; }
    });
  }

  /* Photos are lazy: src is only assigned the first time the scene
     is entered, so nothing is fetched at boot. A missing file stays
     silent — the img hides itself and the blush placeholder shows. */
  function loadPhotos() {
    if (photosLoaded) { return; }
    photosLoaded = true;
    var photos = C.photos || [];
    cards.forEach(function (card, i) {
      var img = card.querySelector(".s3-photo img");
      if (!img || !photos[i]) { return; }
      img.addEventListener("error", function () { img.classList.add("is-missing"); });
      img.src = photos[i].src;
    });
  }

  /* Instant (gsap-free) layout: used for reduced motion and as the
     starting point of the animated entrance. */
  function layoutInstant() {
    stack.forEach(function (card, slot) {
      card.style.zIndex = String(Z_ORDER[slot]);
      var t = slotOf(card, slot);
      if (hasGsap()) {
        window.gsap.set(card, mix(t, { opacity: 1 }));
      } else {
        card.style.transform = "translate(" + t.x + "px," + t.y + "px) rotate(" + t.rotation + "deg) scale(" + t.scale + ")";
        card.style.opacity = "1";
      }
      card.classList.toggle("is-top", slot === 0);
    });
    updateDots();
  }

  function updateDots() {
    var topIdx = cards.indexOf(stack[0]);
    dots.forEach(function (d, i) { d.classList.toggle("is-on", i === topIdx); });
  }

  function startKenBurns() {
    if (kbTween) { kbTween.kill(); kbTween = null; }
    if (!hasGsap() || App.reduced) { return; }
    var top = stack[0];
    var img = top && top.querySelector(".s3-photo img");
    if (!img) { return; }
    kbTween = window.gsap.fromTo(img, { scale: 1 },
      { scale: 1.08, duration: KB_SECONDS, ease: "sine.inOut" });
  }

  function scheduleAuto() {
    clearTimeout(autoTimer);
    autoTimer = null;
    if (!hasGsap() || App.reduced || !revealed || document.hidden ||
        App.scene !== 3 || stack.length < 2) { return; }
    autoTimer = setTimeout(function () { advance(1); }, AUTO_MS);
  }

  /* dir 1 = next via swipe-left / tap / auto (glides off left),
     dir -1 = swipe right (glides off right). Either way the card
     settles at the back of the stack. */
  function advance(dir) {
    if (animating || !stack.length) { return; }
    clearTimeout(autoTimer);
    autoTimer = null;
    if (!hasGsap() || App.reduced || stack.length < 2) {
      stack.push(stack.shift());
      layoutInstant();
      return;
    }
    animating = true;
    if (kbTween) { kbTween.kill(); kbTween = null; }
    var exitCard = stack[0];
    var incoming = stack.length > 1 ? stack[1] : null;
    var middle = stack.length > 2 ? stack[2] : null;
    var stageW = root.clientWidth || window.innerWidth || 390;
    var dist = stageW / 2 + exitCard.offsetWidth / 2 + 30;
    var exitX = dir >= 0 ? -dist : dist;
    var g = window.gsap;
    var tl = g.timeline({
      onComplete: function () { animating = false; scheduleAuto(); }
    });
    tl.to(exitCard, {
      x: exitX, y: 8, rotation: tiltOf(exitCard) + (dir >= 0 ? -8 : 8),
      duration: .7, ease: "power2.in"
    });
    tl.add(function () {
      stack.push(stack.shift());
      stack.forEach(function (card, slot) { card.style.zIndex = String(Z_ORDER[slot]); });
      exitCard.classList.remove("is-top");
      if (stack[0]) { stack[0].classList.add("is-top"); }
      var back = slotOf(exitCard, 2);
      g.set(exitCard, mix(back, { opacity: 0 }));
      updateDots();
    });
    if (incoming) { tl.to(incoming, mix(slotOf(incoming, 0), { duration: .6, ease: "power2.out" }), "<"); }
    if (middle) { tl.to(middle, mix(slotOf(middle, 1), { duration: .6, ease: "power2.out" }), "<"); }
    tl.to(exitCard, { opacity: 1, duration: .55, ease: "power1.inOut" }, "<0.1");
    tl.add(function () { startKenBurns(); });
  }

  function buildEnter() {
    var g = window.gsap;
    tlEnter = g.timeline({ defaults: { ease: "power2.out" } });
    var title = root.querySelector(".s3-title");
    var rule = root.querySelector(".s3-rule");
    var dotsWrap = root.querySelector(".s3-dots");
    tlEnter.fromTo(title, { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: .6 }, 0);
    tlEnter.fromTo(rule, { scaleX: 0 }, { scaleX: 1, duration: .7, ease: "power1.inOut" }, .25);
    /* back card surfaces first, the top card lands last (~1.4 s) */
    var seq = [];
    for (var s = stack.length - 1; s >= 0; s--) { seq.push({ card: stack[s], slot: s }); }
    seq.forEach(function (item, i) {
      var t = slotOf(item.card, item.slot);
      tlEnter.fromTo(item.card,
        { x: t.x, y: t.y + 30, scale: t.scale, rotation: t.rotation, opacity: 0 },
        { y: t.y, opacity: 1, duration: .8 }, .35 + i * .13);
    });
    tlEnter.fromTo(dotsWrap, { opacity: 0 }, { opacity: 1, duration: .6 }, .9);
    tlEnter.call(function () {
      revealed = true;
      App.markSceneReady(3);
      startKenBurns();
      scheduleAuto();
    }, null, 1.5);
    if (document.hidden) { tlEnter.pause(); pausedByVisibility = true; }
  }

  function resetVisual() {
    cards.forEach(function (card) {
      card.classList.remove("is-top");
      if (hasGsap()) {
        window.gsap.set(card, { clearProps: "all" });
        var img = card.querySelector(".s3-photo img");
        if (img) { window.gsap.set(img, { clearProps: "transform" }); }
      } else {
        card.style.transform = "";
        card.style.opacity = "";
        card.style.zIndex = "";
      }
    });
    if (hasGsap()) {
      window.gsap.set(root.querySelectorAll(".s3-title, .s3-rule, .s3-dots"), { clearProps: "all" });
    }
  }

  function killAll() {
    if (tlEnter) { tlEnter.kill(); tlEnter = null; }
    if (kbTween) { kbTween.kill(); kbTween = null; }
    clearTimeout(autoTimer);
    autoTimer = null;
    animating = false;
    drag = null;
  }

  /* ---- gestures: drag / swipe / tap on the stack only.
     Horizontal motion never bubbles into scene navigation
     (main.js navigates on swipe-up alone). ---- */
  function snapBack(card) {
    if (!card) { return; }
    if (hasGsap() && !App.reduced) {
      window.gsap.to(card, { x: 0, rotation: tiltOf(card), duration: .45, ease: "power2.out" });
    } else {
      var t = slotOf(card, 0);
      card.style.transform = "translate(" + t.x + "px," + t.y + "px) rotate(" + t.rotation + "deg) scale(" + t.scale + ")";
    }
    scheduleAuto();
  }
  function onPointerDown(e) {
    if (App.scene !== 3 || animating || !stack.length) { return; }
    if (e.pointerType === "mouse" && e.button !== 0) { return; }
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, t0: Date.now(), applied: false };
  }
  function onPointerMove(e) {
    if (!drag || e.pointerId !== drag.id || App.scene !== 3 || animating) { return; }
    var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
    /* let vertical (swipe-up navigation) gestures pass through untouched */
    if (!drag.applied && (Math.abs(dx) < 7 || Math.abs(dx) < Math.abs(dy) * .9)) { return; }
    drag.applied = true;
    if (hasGsap() && !App.reduced) {
      var top = stack[0];
      window.gsap.set(top, { x: dx, rotation: tiltOf(top) + dx * .03 });
    }
  }
  function onPointerEnd(e, cancelled) {
    var d = drag;
    drag = null;
    if (!d || e.pointerId !== d.id || App.scene !== 3) { return; }
    var top = stack[0];
    if (cancelled || animating) { snapBack(top); return; }
    var dx = e.clientX - d.x0, dy = e.clientY - d.y0;
    var dt = Date.now() - d.t0;
    var isTap = Math.abs(dx) < 10 && Math.abs(dy) < 10 && dt < 600;
    var isSwipe = Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.1;
    if (isTap) { advance(1); return; }
    if (isSwipe) { advance(dx < 0 ? 1 : -1); return; }
    snapBack(top);
  }
  function bindGestures() {
    var area = root.querySelector(".s3-stack");
    area.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", function (e) { onPointerEnd(e, false); });
    window.addEventListener("pointercancel", function (e) { onPointerEnd(e, true); });
  }

  App.registerScene(3, {
    init: render,
    enter: function () {
      root = this.root;
      killAll();
      pausedByVisibility = false;
      revealed = false;
      App.holdNext(3);
      stack = cards.slice();
      resetVisual();
      fillText();
      loadPhotos();
      if (App.ambient) { App.ambient.start(); }
      layoutInstant();
      if (!hasGsap() || App.reduced) {
        App.markSceneReady(3);
        revealed = true;
        return;
      }
      buildEnter();
    },
    exit: function () {
      killAll();
      pausedByVisibility = false;
      revealed = false;
    }
  });

  document.addEventListener("visibilitychange", function () {
    if (App.scene !== 3) { return; }
    if (document.hidden) {
      pausedByVisibility = true;
      if (tlEnter && !tlEnter.paused()) { tlEnter.pause(); }
      if (kbTween) { kbTween.pause(); }
      clearTimeout(autoTimer);
      autoTimer = null;
    } else if (pausedByVisibility) {
      pausedByVisibility = false;
      if (tlEnter && tlEnter.paused()) { tlEnter.resume(); }
      if (kbTween && kbTween.paused()) { kbTween.resume(); }
      scheduleAuto();
    }
  });

  window.addEventListener("invitation:motionchange", function () {
    if (App.reduced && App.scene === 3) {
      killAll();
      revealed = true;
      layoutInstant();
      App.markSceneReady(3);
    }
  });
})();
