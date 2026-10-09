/* Original names reveal/timings; new rose-gold church and one-pass doves.
   Next is released when the date finishes at 7.3 s, not by decorative loops. */
(function () {
  "use strict";
  var App = window.Invitation, C = window.CONFIG;
  var tl = null, pausedByVisibility = false;
  var SPARKS = [
    { left: "6%", top: "18%", dx: -12, dy: -46, at: 5.2 },
    { left: "84%", top: "12%", dx: 14, dy: -40, at: 5.5 },
    { left: "22%", top: "64%", dx: -10, dy: -52, at: 5.8 },
    { left: "72%", top: "58%", dx: 12, dy: -44, at: 6.1 },
    { left: "46%", top: "8%", dx: 4, dy: -38, at: 6.35 },
    { left: "60%", top: "82%", dx: 10, dy: -50, at: 6.6 }
  ];
  function star(size) {
    return '<svg class="rs-star" width="' + size + '" height="' + size + '" viewBox="0 0 14 14" aria-hidden="true" focusable="false"><path d="M7 0L8.6 5.4L14 7L8.6 8.6L7 14L5.4 8.6L0 7L5.4 5.4Z" fill="currentColor"/></svg>';
  }
  function church() {
    return '<div class="s2-church" aria-hidden="true"><div class="s2-rays"><div class="s2-ray"></div><div class="s2-ray s2-ray-2"></div></div>' +
      '<svg class="church-svg" viewBox="0 0 520 500" width="520" height="500" focusable="false"><defs>' +
      '<filter id="s2-window-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3"/></filter></defs>' +
      '<g><circle class="church-window-glow" cx="260" cy="292" r="24"/>' +
      '<path class="church-window-glow" d="M136 388V345Q136 326 150 317Q164 326 164 345V388Z"/>' +
      '<path class="church-window-glow" d="M356 388V345Q356 326 370 317Q384 326 384 345V388Z"/></g>' +
      '<g class="church-lines">' +
      '<path d="M-60 470Q65 456 150 467T330 467T580 470"/>' +
      '<path d="M260 29V86M245 47H275"/>' +
      '<path d="M225 225V174L260 90L295 174V225M223 174H297M230 159H290"/>' +
      '<path d="M248 159V135L260 108L272 135V159M260 112V158"/>' +
      '<path d="M235 216V184H285V216M245 214V194Q260 177 275 194V214"/>' +
      '<path d="M108 445V286L186 252L260 204L334 252L412 286V445Z"/>' +
      '<path d="M186 445V255L260 204L334 255V445M110 293L186 260L260 212L334 260L410 293"/>' +
      '<path d="M117 443V298M176 441V268M344 441V268M403 443V298M108 401H185M335 401H412"/>' +
      '<circle cx="260" cy="292" r="27"/><circle cx="260" cy="292" r="21"/><circle cx="260" cy="292" r="5"/>' +
      '<path d="M260 265V287M260 297V319M233 292H255M265 292H287M241 273L256 288M264 296L279 311M241 311L256 296M264 288L279 273"/>' +
      '<path d="M249 273Q260 287 271 273M279 281Q265 292 279 303M271 311Q260 297 249 311M241 303Q255 292 241 281"/>' +
      '<path d="M232 444V386Q232 359 260 343Q288 359 288 386V444ZM239 444V386Q239 365 260 352Q281 365 281 386V444M260 354V443M239 388H281"/>' +
      '<path d="M136 388V345Q136 326 150 317Q164 326 164 345V388ZM150 320V388M136 355H164"/>' +
      '<path d="M356 388V345Q356 326 370 317Q384 326 384 345V388ZM370 320V388M356 355H384"/>' +
      '<path d="M96 447H424M102 454H418M111 461H409M216 444V382Q216 350 260 329Q304 350 304 382V444"/>' +
      '</g></svg></div>';
  }
  function dove() {
    return '<svg viewBox="0 0 54 34" focusable="false"><path d="M2 26L13 20C16 16 13 8 8 2C18 4 24 10 27 17C30 12 35 5 44 3C42 11 39 16 35 20C40 17 43 16 46 18L49 20L54 21L49 23C46 27 41 29 34 28L26 27L17 32L19 25L9 29Z"/></svg>';
  }
  function render(root) {
    var sparks = SPARKS.map(function (s) {
      return '<span class="s2-spark" style="left:' + s.left + ';top:' + s.top + '">' + star(10) + '</span>';
    }).join("");
    root.innerHTML = church() +
      '<div class="s2-doves" aria-hidden="true"><div class="s2-dove">' + dove() + '</div><div class="s2-dove s2-dove-2">' + dove() + '</div></div>' +
      '<div class="s2-canvas"><div class="s2-ornament" aria-hidden="true"><div class="rs-line"></div>' + star(12) + '<div class="rs-line"></div></div>' +
      '<p class="s2-greeting"></p><p class="s2-families"></p><div class="s2-names">' +
      '<h1 class="s2-name s2-groom"><span class="s2-name-inner"></span><span class="s2-pen" aria-hidden="true"></span></h1>' +
      '<div class="s2-amp"></div><h1 class="s2-name s2-bride"><span class="s2-name-inner"></span><span class="s2-pen" aria-hidden="true"></span></h1>' +
      '<div class="s2-shimmer" aria-hidden="true"></div><div aria-hidden="true">' + sparks + '</div></div>' +
      '<div class="s2-rule-wrap" aria-hidden="true"><div class="s2-rule"></div></div><p class="s2-date"></p>' +
      '<div class="s2-foot" aria-hidden="true"><div class="rs-line"></div>' + star(10) + '<div class="rs-line"></div></div></div>';
  }
  function fillText(root) {
    var names = C.names[App.lang] || C.names.en;
    root.querySelector(".s2-greeting").textContent = App.greetingText();
    root.querySelector(".s2-families").textContent = App.ui("togetherWith");
    root.querySelector(".s2-groom .s2-name-inner").textContent = names.groomFull;
    root.querySelector(".s2-bride .s2-name-inner").textContent = names.brideFull;
    root.querySelector(".s2-amp").textContent = App.ui("amp");
    root.querySelector(".s2-date").textContent = App.txt(C.date.line);
  }
  function resetVisual(root) {
    root.querySelector(".s2-canvas").classList.remove("is-animating");
    root.querySelector(".s2-church").classList.remove("has-entered");
    if (window.gsap) {
      window.gsap.set(root.querySelectorAll(".s2-greeting, .s2-families, .s2-name, .s2-name-inner, .s2-pen, .s2-amp, .s2-rule, .s2-date, .s2-shimmer"), { clearProps: "all" });
      window.gsap.set(root.querySelectorAll(".s2-spark"), { x: 0, y: 0, scale: 1, opacity: 0 });
    }
    Array.prototype.forEach.call(root.querySelectorAll(".church-lines > *"), function (el) {
      el.style.strokeDasharray = "none";
      el.style.strokeDashoffset = "0";
    });
    Array.prototype.forEach.call(root.querySelectorAll(".church-window-glow, .s2-dove"), function (el) { el.style.cssText = ""; });
  }
  function staticFinal(root) {
    resetVisual(root);
    root.querySelector(".s2-church").classList.add("has-entered");
    Array.prototype.forEach.call(root.querySelectorAll(".s2-dove"), function (el, i) {
      el.style.left = i ? "66%" : "26%";
      el.style.opacity = ".7";
    });
    App.markSceneReady(2);
  }
  function buildTimeline(root) {
    var isTe = App.lang === "te", g = window.gsap;
    tl = g.timeline({ defaults: { ease: "power2.inOut" } });
    var lines = root.querySelectorAll(".church-lines > *");
    Array.prototype.forEach.call(lines, function (el) {
      var length = el.getTotalLength();
      el.style.strokeDasharray = length + " " + length;
      el.style.strokeDashoffset = String(length);
    });
    tl.to(lines, { strokeDashoffset: 0, duration: 2, ease: "power1.inOut" }, 0);
    tl.call(function () {
      Array.prototype.forEach.call(lines, function (el) { el.style.strokeDasharray = "none"; });
    }, null, 2);
    tl.fromTo(root.querySelectorAll(".church-window-glow"), { opacity: 0 }, { opacity: .72, duration: 1.4, stagger: .1 }, .8);
    Array.prototype.forEach.call(root.querySelectorAll(".s2-dove"), function (el, i) {
      var at = i ? 1.15 : .6, duration = i ? 6.05 : 6.2;
      tl.fromTo(el, { x: 0, y: 0 }, { x: root.clientWidth + 180, y: i ? -20 : -34, duration: duration, ease: "none" }, at);
      tl.fromTo(el, { opacity: 0 }, { opacity: .85, duration: .6 }, at);
      tl.to(el, { opacity: 0, duration: .7 }, at + duration - .7);
    });
    tl.fromTo(root.querySelector(".s2-greeting"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 1.2 }, 0);
    tl.fromTo(root.querySelector(".s2-families"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1.1 }, .7);
    var groom = root.querySelector(".s2-groom"), bride = root.querySelector(".s2-bride");
    function revealName(el, at) {
      if (isTe) {
        tl.fromTo(el, { opacity: 0, textShadow: "0 0 18px rgba(217,163,169,.95)" },
          { opacity: 1, textShadow: "0 0 0px rgba(217,163,169,0)", duration: 1.7 }, at);
      } else {
        tl.set(el, { opacity: 1 }, at);
        tl.fromTo(el.querySelector(".s2-name-inner"),
          { clipPath: "inset(0 100% 0 0)", webkitClipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 -5% 0 0)", webkitClipPath: "inset(0 -5% 0 0)", duration: 1.8, ease: "power1.inOut" }, at);
        tl.fromTo(el.querySelector(".s2-pen"), { x: 0, opacity: .85 },
          { x: el.offsetWidth, opacity: 0, duration: 1.8, ease: "power1.inOut" }, at);
      }
    }
    revealName(groom, 1.5);
    tl.fromTo(root.querySelector(".s2-amp"), { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: 1.3 }, 3.3);
    revealName(bride, 4.1);
    tl.fromTo(root.querySelector(".s2-rule"), { scaleX: 0, opacity: 1 }, { scaleX: 1, opacity: 1, duration: 1.2 }, 5.6);
    tl.fromTo(root.querySelector(".s2-date"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 1.1 }, 6.2);
    tl.call(function () { App.markSceneReady(2); }, null, 7.3);
    tl.fromTo(root.querySelector(".s2-shimmer"), { xPercent: -130, opacity: 1 }, { xPercent: 130, duration: 1.7, ease: "power1.inOut" }, 5.3);
    tl.set(root.querySelector(".s2-shimmer"), { opacity: 0 }, 7);
    Array.prototype.forEach.call(root.querySelectorAll(".s2-spark"), function (el, i) {
      var s = SPARKS[i];
      tl.fromTo(el, { opacity: 0, x: 0, y: 0, scale: .5 },
        { opacity: .9, x: s.dx * .4, y: s.dy * .45, scale: 1, duration: 1.2, ease: "power1.out" }, s.at);
      tl.to(el, { opacity: 0, x: s.dx, y: s.dy, duration: 1.3, ease: "power1.in" }, s.at + 1.2);
    });
    if (document.hidden) { tl.pause(); pausedByVisibility = true; }
  }
  App.registerScene(2, {
    init: render,
    enter: function () {
      var root = this.root;
      if (tl) { tl.kill(); tl = null; }
      pausedByVisibility = false;
      App.holdNext(2);
      resetVisual(root);
      fillText(root);
      if (App.ambient) { App.ambient.start(); }
      if (!window.gsap || App.reduced) { staticFinal(root); return; }
      root.querySelector(".s2-canvas").classList.add("is-animating");
      root.querySelector(".s2-church").classList.add("has-entered");
      buildTimeline(root);
    },
    exit: function () {
      if (tl) { tl.kill(); tl = null; }
      pausedByVisibility = false;
      this.root.querySelector(".s2-church").classList.remove("has-entered");
    }
  });
  document.addEventListener("visibilitychange", function () {
    if (!tl || App.scene !== 2) { return; }
    if (document.hidden && !tl.paused()) { pausedByVisibility = true; tl.pause(); }
    else if (!document.hidden && pausedByVisibility) { pausedByVisibility = false; tl.resume(); }
  });
  window.addEventListener("invitation:motionchange", function () {
    if (App.reduced && App.scene === 2) {
      if (tl) { tl.kill(); tl = null; }
      pausedByVisibility = false;
      staticFinal(App.scenes[2].root);
    }
  });
})();
