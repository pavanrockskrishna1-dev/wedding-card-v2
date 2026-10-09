/* ============================================================
   js/scene6.js — Scene 6 · closing, blessing & sharing
   All names, family details and verse copy come from config.js.
   ============================================================ */
(function () {
  "use strict";

  var App = window.Invitation;
  var C = window.CONFIG;
  var tl = null;
  var musicTween = null;
  var musicFallbackTimer = null;
  var musicStarted = false;
  var photoControl = null;

  function esc(value) { return App.escapeHtml(value == null ? "" : value); }
  function fillText(root) {
    var data = C.scenes.scene6;
    var names = C.names[App.lang] || C.names.en;
    root.querySelector(".s6-look").textContent = App.txt(data.lookForward);
    root.querySelector(".s6-verse").textContent = App.txt(C.closing.verse.text);
    root.querySelector(".s6-reference").textContent = App.txt(C.closing.verse.ref);
    root.querySelector(".s6-with-love").textContent = App.txt(data.withLove);
    root.querySelector(".s6-groom-name").textContent = names.groomFull;
    root.querySelector(".s6-bride-name").textContent = names.brideFull;
    root.querySelector(".s6-invited-label").textContent = App.txt(C.invitedBy.label);
    root.querySelector(".s6-invited-list").innerHTML = C.invitedBy.list.map(function (name) { return "<li>" + esc(name) + "</li>"; }).join("");
    root.querySelector(".s6-groom-label").textContent = App.txt(C.families.groom.label);
    root.querySelector(".s6-groom-parents").textContent = C.families.groom.parents;
    root.querySelector(".s6-bride-label").textContent = App.txt(C.families.bride.label);
    root.querySelector(".s6-bride-parents").textContent = C.families.bride.parents;
    root.querySelector(".s6-bride-place").textContent = App.txt(C.families.bride.place);
    root.querySelector(".s6-view-again").textContent = App.txt(data.viewAgain);
    root.querySelector(".s6-share").textContent = App.txt(data.share);
    var photo = root.querySelector(".s6-photo");
    photo.alt = names.groomFull + " and " + names.brideFull;
  }
  function render(root) {
    root.innerHTML = '<div class="s6-evening" aria-hidden="true"></div><div class="s6-scroll" tabindex="0" aria-label="' + esc(App.txt(C.ui[App.lang].sceneLabels[5])) + '">' +
      '<div class="s6-content"><div class="s6-photo-frame"><div class="s6-photo-window"><img class="s6-photo" src="' + esc(C.closing.photo) + '" alt="" decoding="async"></div></div>' +
      '<p class="s6-look"></p><div class="s6-rule" aria-hidden="true"></div><p class="s6-verse"></p><p class="s6-reference"></p>' +
      '<p class="s6-with-love"></p><div class="s6-couple-names"><span class="s6-name s6-groom-name"></span><span class="s6-name-amp" aria-hidden="true">&amp;</span><span class="s6-name s6-bride-name"></span><span class="s6-name-shimmer" aria-hidden="true"></span></div>' +
      '<section class="s6-invited"><h2 class="s6-invited-label"></h2><ul class="s6-invited-list"></ul></section>' +
      '<section class="s6-families" aria-label="Families"><div class="s6-family"><p class="s6-groom-label"></p><p class="s6-groom-parents"></p></div><div class="s6-family"><p class="s6-bride-label"></p><p class="s6-bride-parents"></p><p class="s6-bride-place"></p></div></section>' +
      '<div class="s6-actions"><button class="s6-action s6-view-again" type="button"></button><button class="s6-action s6-share" type="button"></button></div>' +
      '</div></div>';
    fillText(root);
    if (window.LivingPhoto && window.LivingPhoto.mount) {
      photoControl = window.LivingPhoto.mount(root.querySelector(".s6-photo-frame"), {
        src: C.closing.photo,
        photo: root.querySelector(".s6-photo-window")
      });
    }
    root.querySelector(".s6-view-again").addEventListener("click", function () {
      App.goToScene(1);
    });
    root.querySelector(".s6-share").addEventListener("click", shareInvitation);
  }
  function shareInvitation() {
    var message = App.txt(C.scenes.scene6.shareText);
    var url = window.location.href;
    var payload = { title: document.title, text: message, url: url };
    if (navigator.share) {
      try {
        var sharing = navigator.share(payload);
        if (sharing && sharing.catch) {
          sharing.catch(function (error) {
            if (!error || error.name !== "AbortError") { openWhatsApp(message, url); }
          });
        }
      } catch (error) {
        openWhatsApp(message, url);
      }
    } else {
      openWhatsApp(message, url);
    }
  }
  function openWhatsApp(message, url) {
    var link = "https://wa.me/?text=" + encodeURIComponent(message + " " + url);
    window.open(link, "_blank", "noopener,noreferrer");
  }
  function cancelMusicFade() {
    if (musicTween && musicTween.kill) { musicTween.kill(); musicTween = null; }
    if (musicFallbackTimer) { clearInterval(musicFallbackTimer); musicFallbackTimer = null; }
  }
  function startMusicFade() {
    if (musicStarted || !C.musicSrc || !App.soundOn) { return; }
    if (!App.music && App.audioUnlocked) {
      try {
        var audio = new Audio(C.musicSrc);
        audio.loop = true;
        audio.volume = 0;
        audio.addEventListener("error", function () { if (App.music === audio) { App.music = null; } });
        App.music = audio;
      } catch (error) { App.music = null; }
    }
    var audioEl = App.music;
    if (!audioEl) { return; }
    musicStarted = true;
    cancelMusicFade();
    audioEl.muted = false;
    audioEl.volume = 0;
    try {
      var play = audioEl.play();
      if (play && play.catch) { play.catch(function () {}); }
    } catch (error) {}
    if (window.gsap && !App.reduced) {
      musicTween = window.gsap.to(audioEl, { volume: .28, duration: 2.6, ease: "sine.out" });
    } else {
      var step = 0;
      musicFallbackTimer = window.setInterval(function () {
        step += .035;
        if (!App.soundOn || !App.music) {
          cancelMusicFade();
          return;
        }
        audioEl.volume = Math.min(.28, step * .28);
        if (audioEl.volume >= .28) { cancelMusicFade(); }
      }, 100);
    }
  }
  function resetVisual(root) {
    root.classList.remove("s6-is-animating");
    if (tl) { tl.kill(); tl = null; }
    if (window.gsap) {
      window.gsap.set(root.querySelectorAll(".s6-photo-frame, .s6-look, .s6-rule, .s6-verse, .s6-reference, .s6-with-love, .s6-couple-names, .s6-invited, .s6-families, .s6-actions, .s6-name-shimmer"), { clearProps: "all" });
    }
    var shimmer = root.querySelector(".s6-name-shimmer");
    if (shimmer) { shimmer.style.opacity = "0"; shimmer.style.transform = "translateX(-130%)"; }
  }
  function staticFinal(root) {
    resetVisual(root);
    App.markSceneReady(6);
    startMusicFade();
  }
  function buildTimeline(root) {
    var g = window.gsap;
    tl = g.timeline({ defaults: { ease: "power2.out" } });
    tl.fromTo(root.querySelector(".s6-photo-frame"), { opacity: 0, y: 12, scale: .985 }, { opacity: 1, y: 0, scale: 1, duration: .8 }, 0);
    tl.fromTo(root.querySelector(".s6-look"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .72 }, .42);
    tl.fromTo(root.querySelector(".s6-rule"), { scaleX: 0 }, { scaleX: 1, duration: .65, ease: "power1.inOut" }, 1.03);
    tl.fromTo(root.querySelector(".s6-verse"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .72 }, 1.28);
    tl.fromTo(root.querySelector(".s6-reference"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .55 }, 1.83);
    tl.fromTo(root.querySelector(".s6-with-love"), { opacity: 0, y: 6 }, { opacity: 1, y: 0, duration: .6 }, 2.15);
    if (App.lang === "te") {
      tl.fromTo(root.querySelector(".s6-couple-names"), { opacity: 0 }, { opacity: 1, duration: .85 }, 2.45);
      tl.fromTo(root.querySelectorAll(".s6-name"), { textShadow: "0 0 18px rgba(217,163,169,.9)" },
        { textShadow: "0 0 2px rgba(217,163,169,.25)", duration: 1.1, stagger: .18 }, 2.45);
    } else {
      tl.fromTo(root.querySelector(".s6-couple-names"), { opacity: 0, y: 7 }, { opacity: 1, y: 0, duration: .8 }, 2.45);
      tl.fromTo(root.querySelector(".s6-name-shimmer"), { xPercent: -130, opacity: 0 }, { xPercent: 130, opacity: .9, duration: 1.45, ease: "power1.inOut" }, 3.02);
      tl.to(root.querySelector(".s6-name-shimmer"), { opacity: 0, duration: .2 }, 4.27);
    }
    tl.fromTo(root.querySelector(".s6-invited"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .65 }, 3.28);
    tl.fromTo(root.querySelector(".s6-families"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .65 }, 3.68);
    tl.fromTo(root.querySelector(".s6-actions"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: .6 }, 4.13);
    tl.call(function () { App.markSceneReady(6); }, null, 4.78);
    tl.call(startMusicFade, null, .3);
  }
  App.registerScene(6, {
    init: render,
    enter: function () {
      var root = this.root;
      /* scenes init at boot in English; rebuild if the guest chose another language */
      if (root.getAttribute("data-lang") !== App.lang) { render(root); root.setAttribute("data-lang", App.lang); }
      App.holdNext(6);
      resetVisual(root);
      root.querySelector(".s6-scroll").scrollTop = 0;
      if (App.ambient) { App.ambient.start(); }
      if (!window.gsap || App.reduced) { staticFinal(root); return; }
      root.classList.add("s6-is-animating");
      buildTimeline(root);
    },
    exit: function () {
      if (tl) { tl.kill(); tl = null; }
      this.root.classList.remove("s6-is-animating");
      if (photoControl && photoControl.wrap) { photoControl.wrap.style.transform = ""; }
    }
  });
  window.addEventListener("invitation:motionchange", function () {
    if (App.reduced && App.scene === 6) { staticFinal(App.scenes[6].root); }
  });
})();
