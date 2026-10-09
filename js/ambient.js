/* One visible canvas: 12 petals + 20 tiny specks, capped at 30 fps / 1.5 DPR.
   No interval, no particle DOM nodes, no animated blur. */
(function () {
  "use strict";
  var App = window.Invitation;
  var host = document.getElementById("ambient");
  var canvas = document.getElementById("ambient-canvas");
  if (!App || !host || !canvas) { return; }
  var ctx = canvas.getContext("2d");
  var active = false, raf = 0, last = 0;
  var width = 0, height = 0;
  var petals = [], specks = [];
  function random(a, b) { return a + Math.random() * (b - a); }
  function petal(initial) {
    return {
      x: random(0, width), y: initial ? random(0, height) : -24,
      size: random(5, 10), speed: random(12, 23),
      sway: random(12, 30), phase: random(0, Math.PI * 2),
      frequency: random(.35, .7), angle: random(0, Math.PI * 2),
      spin: random(-.35, .35), white: Math.random() < .5
    };
  }
  function speck() {
    return {
      x: random(0, width), y: random(0, height), radius: random(.65, 1.4),
      vx: random(-2, 2), vy: random(-7, -3), phase: random(0, Math.PI * 2),
      white: Math.random() < .5
    };
  }
  function resize() {
    if (!ctx) { return; }
    var stage = document.getElementById("stage");
    var oldW = width, oldH = height;
    width = Math.max(1, stage.clientWidth);
    height = Math.max(1, stage.clientHeight);
    var ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    if (width * height > 1000000) { ratio = 1; }
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    if (!petals.length) {
      for (var i = 0; i < 12; i++) { petals.push(petal(true)); }
      for (var j = 0; j < 20; j++) { specks.push(speck()); }
    } else if (oldW && oldH) {
      petals.concat(specks).forEach(function (p) { p.x *= width / oldW; p.y *= height / oldH; });
    }
    if (!document.hidden) { draw(); }
  }
  function update(dt) {
    petals.forEach(function (p, i) {
      p.y += p.speed * dt;
      p.phase += p.frequency * dt;
      p.angle += p.spin * dt;
      if (p.y > height + 24) { petals[i] = petal(false); }
    });
    specks.forEach(function (s) {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.phase += dt * .9;
      if (s.y < -4) { s.y = height + 4; s.x = random(0, width); }
      if (s.x < -4) { s.x = width + 4; }
      if (s.x > width + 4) { s.x = -4; }
    });
  }
  function draw() {
    if (!ctx) { return; }
    ctx.clearRect(0, 0, width, height);
    petals.forEach(function (p) {
      ctx.save();
      ctx.translate(p.x + Math.sin(p.phase) * p.sway, p.y);
      ctx.rotate(p.angle);
      ctx.scale(.55 + Math.abs(Math.cos(p.angle * .7)) * .45, 1);
      ctx.globalAlpha = p.white ? .7 : .5;
      ctx.fillStyle = p.white ? "#FFFFFF" : "#D98C99";
      var s = p.size;
      ctx.beginPath();
      ctx.moveTo(0, -s);
      ctx.bezierCurveTo(-s, -s * .7, -s * .9, s * .6, 0, s);
      ctx.bezierCurveTo(s * .75, s * .5, s * .65, -s * .65, 0, -s);
      ctx.fill();
      ctx.restore();
    });
    specks.forEach(function (s) {
      ctx.globalAlpha = .18 + (Math.sin(s.phase) + 1) * .18;
      ctx.fillStyle = s.white ? "#FFFFFF" : "#B76E79";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }
  function frame(now) {
    raf = 0;
    if (!active || document.hidden || App.reduced || !ctx) { return; }
    var elapsed = now - last;
    if (elapsed >= 1000 / 30) {
      update(Math.min(elapsed / 1000, .08));
      draw();
      last = now;
    }
    raf = requestAnimationFrame(frame);
  }
  function syncMotion() {
    cancelAnimationFrame(raf);
    raf = 0;
    host.classList.toggle("is-static", App.reduced);
    host.classList.toggle("is-paused", document.hidden || App.reduced);
    if (!active || document.hidden) { return; }
    draw();
    if (!App.reduced && ctx) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  }
  App.ambient = {
    start: function () {
      if (!active) {
        active = true;
        host.hidden = false;
        resize();
      }
      syncMotion();
    },
    stop: function () {
      active = false;
      cancelAnimationFrame(raf);
      raf = 0;
      host.hidden = true;
      petals = [];
      specks = [];
    }
  };
  window.addEventListener("resize", function () { if (active) { resize(); } });
  document.addEventListener("visibilitychange", syncMotion);
  window.addEventListener("invitation:motionchange", syncMotion);
})();
