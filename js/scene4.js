/* ============================================================
   js/scene4.js — Scene 4 · The Blessing
   Morning light warms the blush; a rose-gold line-art figure
   (or blessing hands) pours three glowing threads around the
   couple's joined hands, then the verse fades in line by line.
   Copy & data: js/config.js (verse, showJesusFigure).
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

  /* Elegant, respectful figure in fine rose-gold line-art: robe
     outline, no facial detail, both hands raised in blessing. */
  function figureGroup() {
    return '<ellipse class="s4-halo" cx="195" cy="84" rx="27" ry="27"/>' +
      '<g class="s4-figure">' +
      '<path d="M180 86a15 15 0 1 0 30 0a15 15 0 1 0-30 0"/>' +
      '<path d="M184 73q-7 15-2 30"/>' +
      '<path d="M206 73q7 15 2 30"/>' +
      '<path d="M179 110q16 9 32 0"/>' +
      '<path d="M179 110c-10 13-19 42-25 76c-4 24-7 44-8 62q49 13 98 0c-1-18-4-38-8-62c-6-34-15-63-25-76"/>' +
      '<path d="M195 121c-2 40-3 82-2 124"/>' +
      '<path d="M168 164q27 11 54 0"/>' +
      '<path d="M177 116c-15-3-27-11-35-24"/>' +
      '<path d="M173 128c-13-3-23-11-29-22"/>' +
      '<path d="M142 92q-2 7 1 14"/>' +
      '<path d="M213 116c15-3 27-11 35-24"/>' +
      '<path d="M217 128c13-3 23-11 29-22"/>' +
      '<path d="M248 92q2 7-1 14"/>' +
      '<path d="M136 90q6 5 12 1"/>' +
      '<path d="M136 89l-7-12M141 90l-3-15M146 90l2-14"/>' +
      '<path d="M254 90q-6 5-12 1"/>' +
      '<path d="M254 89l7-12M249 90l3-15M244 90l-2-14"/>' +
      '</g>';
  }

  /* Alternative: two glowing line-art blessing hands from above. */
  function handsGroup() {
    return '<ellipse class="s4-halo" cx="195" cy="34" rx="36" ry="26"/>' +
      '<g class="s4-figure s4-hands">' +
      '<path d="M138 -6c-2 14 0 28 8 40"/>' +
      '<path d="M162 -6c2 12 0 24-6 36"/>' +
      '<path d="M146 34q7 6 12 2"/>' +
      '<path d="M146 36l-4 13M151 38l-1 14M156 36l3 13"/>' +
      '<path d="M252 -6c2 14 0 28-8 40"/>' +
      '<path d="M228 -6c-2 12 0 24 6 36"/>' +
      '<path d="M244 34q-7 6-12 2"/>' +
      '<path d="M244 36l4 13M239 38l1 14M234 36l-3 13"/>' +
      '</g>';
  }

  /* Slim bride and groom facing each other, hands joined at (195, ~428). */
  function coupleGroup() {
    return '<g class="s4-couple">' +
      '<path d="M147 375a11 11 0 1 0 22 0a11 11 0 1 0-22 0"/>' +
      '<path d="M143 391q15-9 27 0"/>' +
      '<path d="M144 392c-4 26-6 62-6 102"/>' +
      '<path d="M169 393c3 16 4 30 3 44l0 57"/>' +
      '<path d="M166 398c10 7 20 17 26 28"/>' +
      '<path d="M221 375a11 11 0 1 0 22 0a11 11 0 1 0-22 0"/>' +
      '<path d="M243 365q12 17 8 44"/>' +
      '<path d="M218 391q14-9 27 0"/>' +
      '<path d="M219 393c-4 26-10 62-17 101q30 10 61 0c-7-39-13-75-17-101"/>' +
      '<path d="M224 398c-10 7-20 17-26 28"/>' +
      '<path d="M190 424q5 7 10 0"/>' +
      '<path d="M191 429q4 6 8 0"/>' +
      '</g>';
  }

  /* Three fine threads from His hands (or the blessing hands) flowing
     down to the joined hands, ending in a small knot. */
  function threadGroup(withFigure) {
    /* side threads bow wide around the robe, then drop through the open
       gap between the couple's heads down to the joined hands */
    var d1 = withFigure ? "M140 90C116 180 146 272 176 344C184 372 190 406 195 431"
                        : "M146 44C120 160 148 268 176 344C184 372 190 406 195 431";
    var d2 = withFigure ? "M195 170C199 250 190 350 194 418Q195 424 195 431"
                        : "M195 26C199 150 190 350 194 418Q195 424 195 431";
    var d3 = withFigure ? "M250 90C274 180 244 272 214 344C206 372 200 406 195 431"
                        : "M244 44C270 160 242 268 214 344C206 372 200 406 195 431";
    return '<g class="s4-threads">' +
      '<path class="s4-thread s4-th-1" d="' + d1 + '"/>' +
      '<path class="s4-thread s4-th-2" d="' + d2 + '"/>' +
      '<path class="s4-thread s4-th-3" d="' + d3 + '"/>' +
      '<path class="s4-knot" d="M188 430C188 425 194 424 195 430C196 436 202 436 202 430C202 424 196 424 195 430C194 436 188 435 188 430Z"/>' +
      '</g>';
  }

  function render(root) {
    var withFigure = !!C.showJesusFigure;
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
        '<div class="s4-art" aria-hidden="true">' +
          '<svg class="s4-svg" viewBox="0 0 390 560" focusable="false">' +
            '<defs><filter id="s4-soft" x="-60%" y="-60%" width="220%" height="220%">' +
            '<feGaussianBlur stdDeviation="4"/></filter></defs>' +
            /* side threads bow wide, then drop through the open gap
               between the couple's heads down to the joined hands */
            (withFigure ? figureGroup() : handsGroup()) +
            threadGroup(withFigure) +
            coupleGroup() +
          '</svg>' +
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
    var els = root.querySelectorAll(".s4-couple path, .s4-thread, .s4-knot");
    Array.prototype.forEach.call(els, function (el) {
      var length = 320;
      try { length = el.getTotalLength(); } catch (e) {}
      el.style.strokeDasharray = length + " " + length;
      el.style.strokeDashoffset = String(length);
    });
    return els;
  }
  function clearStrokes(root) {
    var els = root.querySelectorAll(".s4-couple path, .s4-thread, .s4-knot");
    Array.prototype.forEach.call(els, function (el) {
      el.style.strokeDasharray = "none";
      el.style.strokeDashoffset = "0";
    });
  }

  function resetVisual(root) {
    root.classList.remove("is-animating");
    if (window.gsap) {
      window.gsap.set(root.querySelectorAll(
        ".s4-glow, .s4-rays, .s4-dust, .s4-halo, .s4-figure, .s4-verse-line, .s4-ref"),
        { clearProps: "all" });
    }
    clearStrokes(root);
  }

  function staticFinal(root) {
    resetVisual(root);
    App.markSceneReady(4);
  }

  /* Slow, calm, reverent — no bounce anywhere. Total ≈ 9 s. */
  function buildTimeline(root) {
    var g = window.gsap;
    tl = g.timeline({ defaults: { ease: "sine.inOut" } });

    /* morning light warms the blush */
    tl.fromTo(root.querySelector(".s4-glow"), { opacity: 0 }, { opacity: 1, duration: 2.6 }, 0);
    tl.fromTo(root.querySelector(".s4-rays"), { opacity: 0 }, { opacity: 1, duration: 2.2 }, .2);
    tl.fromTo(root.querySelector(".s4-dust"), { opacity: 0 }, { opacity: 1, duration: 2.4 }, .4);

    /* the figure rises gently into the light (or the hands appear) */
    tl.fromTo(root.querySelector(".s4-halo"), { opacity: 0 }, { opacity: .75, duration: 2.4 }, .7);
    tl.fromTo(root.querySelector(".s4-figure"), { opacity: 0, y: 34 },
      { opacity: 1, y: 0, duration: 2.6, ease: "power1.out" }, .5);

    /* the couple is drawn in fine line-art */
    var couple = root.querySelectorAll(".s4-couple path");
    prepStrokes(root);
    tl.to(couple, { strokeDashoffset: 0, duration: 2, ease: "power1.inOut", stagger: .06 }, 1.9);

    /* three glowing threads flow down and wrap the joined hands */
    var threads = root.querySelectorAll(".s4-thread");
    Array.prototype.forEach.call(threads, function (el, i) {
      tl.to(el, { strokeDashoffset: 0, duration: 1.6, ease: "power1.inOut" }, 3.7 + i * .4);
    });
    /* …and tie into a small knot */
    tl.to(root.querySelector(".s4-knot"), { strokeDashoffset: 0, duration: .9, ease: "power1.inOut" }, 5.9);
    tl.call(function () { clearStrokes(root); }, null, 7);

    /* the verse fades in line by line, then the embossed reference */
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
