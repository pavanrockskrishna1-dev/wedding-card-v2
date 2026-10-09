/* ============================================================
   js/scene5.js — Scene 5 · save the date, ceremony & lunch
   All invitation copy and venue details come from config.js.
   ============================================================ */
(function () {
  "use strict";

  var App = window.Invitation;
  var C = window.CONFIG;
  var tl = null;
  var countdownTimer = null;
  var activeTouch = null;

  function esc(value) { return App.escapeHtml(value == null ? "" : value); }
  function copy(value) {
    if (typeof value === "string") { return value; }
    return App.txt(value);
  }
  function dayParts() {
    var match = String(C.date.iso || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    var date = match ? { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) } : null;
    if (!date || !date.year || date.month < 1 || date.month > 12) {
      var fallback = new Date(C.date.iso);
      date = { year: fallback.getFullYear(), month: fallback.getMonth() + 1, day: fallback.getDate() };
    }
    return date;
  }
  function calendarMarkup() {
    var d = dayParts();
    var first = new Date(Date.UTC(d.year, d.month - 1, 1)).getUTCDay();
    var count = new Date(Date.UTC(d.year, d.month, 0)).getUTCDate();
    var monthTitle = new Intl.DateTimeFormat(App.lang, { month: "long", year: "numeric", timeZone: "UTC" })
      .format(new Date(Date.UTC(d.year, d.month - 1, 1)));
    var weekdays = [];
    var baseSunday = Date.UTC(2023, 0, 1);
    for (var w = 0; w < 7; w++) {
      var wd = new Intl.DateTimeFormat(App.lang, { weekday: "narrow", timeZone: "UTC" })
        .format(new Date(baseSunday + w * 86400000));
      weekdays.push('<span class="s5-weekday" aria-hidden="true">' + esc(wd) + "</span>");
    }
    var cells = [];
    for (var blank = 0; blank < first; blank++) { cells.push('<span class="s5-day s5-day-empty" aria-hidden="true"></span>'); }
    for (var day = 1; day <= count; day++) {
      if (day === d.day) {
        cells.push('<span class="s5-day s5-day-marked" aria-label="' + esc(day + " " + monthTitle) + '"><span class="s5-day-number">' + day +
          '</span><svg class="s5-day-ring" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path class="s5-ring-path" d="M20.2 3.8C27.8 3.1 35.2 9.1 35.7 18.1C36.1 27.7 29.4 35.4 20.1 35.8C10.6 36.2 4.1 29.5 4.2 19.4C4.3 10.2 11.5 4.5 20.2 3.8Z"/><path class="s5-heart" d="M30.1 30.8C27.8 28.8 26.7 27.8 26.7 26.5C26.7 25.3 28.2 24.8 29.1 26C30 24.8 31.6 25.3 31.5 26.5C31.5 27.8 30.4 28.8 28.9 30.1"/></svg></span>');
      } else {
        cells.push('<span class="s5-day" aria-hidden="true"><span class="s5-day-number">' + day + "</span></span>");
      }
    }
    return '<section class="s5-calendar" aria-label="' + esc(monthTitle) + '"><div class="s5-month">' + esc(monthTitle) +
      '</div><div class="s5-calendar-grid s5-weekdays">' + weekdays.join("") + '</div><div class="s5-calendar-grid s5-days">' + cells.join("") + '</div></section>';
  }
  function churchIcon() {
    return '<svg class="s5-card-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><path d="M24 4v8M21 7h6M9 42V21l15-9 15 9v21M5 42h38M18 42V29a6 6 0 0 1 12 0v13M14 24v6M34 24v6M20 22v-4l4-3 4 3v4Z"/><path d="M22 19h4M24 18v4"/></svg>';
  }
  function lunchIcon() {
    return '<svg class="s5-card-icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><circle cx="23" cy="26" r="13"/><circle cx="23" cy="26" r="8"/><path d="M5 13v13M9 13v13M5 20h4M7 26v14M39 13v27M39 13c-5 4-6 9-6 14h6M28 9c4-4 9-3 11 0-4 0-6 2-7 6M27 12c1-5-1-8-5-9 2 4 1 7-1 10"/></svg>';
  }
  function render(root) {
    root.innerHTML = '<div class="s5-scroll" tabindex="0" aria-label="' + esc(App.txt(C.scenes.scene5.saveTheDate)) + '">' +
      '<div class="s5-content"><header class="s5-header"><h1 class="s5-heading">' + esc(App.txt(C.scenes.scene5.saveTheDate)) +
      '</h1><div class="s5-rule" aria-hidden="true"></div></header>' + calendarMarkup() +
      '<section class="s5-card s5-ceremony"><div class="s5-card-heading">' + churchIcon() + '<h2>' + esc(App.txt(C.scenes.scene5.ceremonyLabel)) + '</h2></div>' +
      '<p class="s5-venue-name"></p><p class="s5-address"></p><p class="s5-date-line"></p><p class="s5-time"></p>' +
      '<div class="s5-officiants"><p class="s5-officiants-label"></p><ul class="s5-officiants-list"></ul></div>' +
      '<a class="s5-directions s5-church-directions" target="_blank" rel="noopener noreferrer"><span></span><svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3 15 15 3M6 3h9v9"/></svg></a></section>' +
      '<section class="s5-card s5-lunch"><div class="s5-card-heading">' + lunchIcon() + '<h2>' + esc(App.txt(C.scenes.scene5.receptionLabel)) + '</h2></div>' +
      '<p class="s5-venue-name"></p><p class="s5-time"></p><p class="s5-address"></p>' +
      '<a class="s5-directions s5-reception-directions" target="_blank" rel="noopener noreferrer"><span></span><svg viewBox="0 0 18 18" aria-hidden="true"><path d="M3 15 15 3M6 3h9v9"/></svg></a></section>' +
      '<section class="s5-countdown" aria-live="polite"><h2 class="s5-countdown-title"></h2><div class="s5-countdown-grid"></div></section>' +
      '<p class="s5-after-date" hidden></p><button class="s5-calendar-btn" type="button"><span></span></button>' +
      '</div></div>';
    fillText(root);
    bindScrollGate(root);
    root.querySelector(".s5-calendar-btn").addEventListener("click", downloadCalendar);
  }
  function fillText(root) {
    var data = C.scenes.scene5;
    var ceremony = root.querySelector(".s5-ceremony");
    var lunch = root.querySelector(".s5-lunch");
    ceremony.querySelector(".s5-venue-name").textContent = App.txt(C.church.name);
    ceremony.querySelector(".s5-address").textContent = App.txt(C.church.address);
    ceremony.querySelector(".s5-date-line").textContent = App.txt(C.date.line);
    ceremony.querySelector(".s5-time").textContent = App.txt(C.church.time);
    ceremony.querySelector(".s5-officiants-label").textContent = App.txt(C.officiants.label);
    ceremony.querySelector(".s5-officiants-list").innerHTML = C.officiants.list.map(function (name) { return "<li>" + esc(name) + "</li>"; }).join("");
    lunch.querySelector(".s5-venue-name").textContent = App.txt(C.reception.name);
    lunch.querySelector(".s5-time").textContent = App.txt(C.reception.time);
    lunch.querySelector(".s5-address").textContent = App.txt(C.reception.address);
    [[ceremony.querySelector(".s5-church-directions"), C.church.mapsUrl], [lunch.querySelector(".s5-reception-directions"), C.reception.mapsUrl]].forEach(function (pair) {
      pair[0].href = pair[1] || "#";
      pair[0].querySelector("span").textContent = App.txt(data.directions);
      pair[0].setAttribute("aria-label", App.txt(data.directions) + " — " + (pair[0] === ceremony.querySelector(".s5-church-directions") ? App.txt(C.church.name) : App.txt(C.reception.name)));
    });
    root.querySelector(".s5-countdown-title").textContent = App.txt(data.countdownTitle);
    root.querySelector(".s5-countdown-grid").innerHTML = ["days", "hours", "minutes", "seconds"].map(function (key) {
      return '<div class="s5-count-unit"><span class="s5-count-clip"><span class="s5-count-value" data-unit="' + key + '">00</span></span><span class="s5-count-label">' + esc(App.txt(data.countdown[key])) + "</span></div>";
    }).join("");
    root.querySelector(".s5-calendar-btn span").textContent = App.txt(data.addToCalendar);
  }
  function bindScrollGate(root) {
    var scroller = root.querySelector(".s5-scroll");
    scroller.addEventListener("touchstart", function (event) {
      event.stopPropagation();
      activeTouch = null;
      if (event.touches && event.touches.length === 1) {
        activeTouch = { x: event.touches[0].clientX, y: event.touches[0].clientY };
      }
    }, { passive: true });
    scroller.addEventListener("touchend", function (event) {
      event.stopPropagation();
      var start = activeTouch;
      activeTouch = null;
      if (!start || !event.changedTouches || !event.changedTouches.length) { return; }
      var dx = event.changedTouches[0].clientX - start.x;
      var dy = event.changedTouches[0].clientY - start.y;
      var atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 8;
      if (atBottom && dy < -56 && Math.abs(dy) > Math.abs(dx) * 1.15 && App.scene === 5 && App.sceneReady) {
        App.unlockAudio();
        App.next();
      }
    }, { passive: true });
    scroller.addEventListener("touchcancel", function (event) { event.stopPropagation(); activeTouch = null; }, { passive: true });
  }
  function countdownCopy() {
    var scene = C.scenes.scene5;
    var value = scene.afterDate || scene.thankYou || C.closing.thankYou;
    return copy(value);
  }
  function updateCountdown(root, animate) {
    var target = new Date(C.date.iso).getTime();
    var remain = target - Date.now();
    var countdown = root.querySelector(".s5-countdown");
    var after = root.querySelector(".s5-after-date");
    if (!isFinite(target) || remain <= 0) {
      if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
      countdown.hidden = true;
      var text = countdownCopy();
      after.textContent = text;
      after.hidden = !text;
      return;
    }
    after.hidden = true;
    countdown.hidden = false;
    var total = Math.floor(remain / 1000);
    var values = {
      days: Math.floor(total / 86400),
      hours: Math.floor((total % 86400) / 3600),
      minutes: Math.floor((total % 3600) / 60),
      seconds: total % 60
    };
    Object.keys(values).forEach(function (key) {
      var node = root.querySelector('[data-unit="' + key + '"]');
      var next = String(values[key]).padStart(2, "0");
      if (node.textContent !== next) {
        node.textContent = next;
        if (animate && !App.reduced && window.gsap) {
          window.gsap.killTweensOf(node);
          window.gsap.fromTo(node, { yPercent: 72, opacity: .4 }, { yPercent: 0, opacity: 1, duration: .36, ease: "power2.out" });
        }
      }
    });
  }
  function resetVisual(root) {
    root.classList.remove("s5-is-animating");
    if (tl) { tl.kill(); tl = null; }
    if (window.gsap) {
      window.gsap.set(root.querySelectorAll(".s5-heading, .s5-rule, .s5-calendar, .s5-card, .s5-countdown, .s5-after-date, .s5-calendar-btn, .s5-count-value"), { clearProps: "all" });
    }
    var ring = root.querySelector(".s5-ring-path");
    if (ring) { ring.style.strokeDasharray = "none"; ring.style.strokeDashoffset = "0"; }
  }
  function staticFinal(root) {
    resetVisual(root);
    updateCountdown(root, false);
    App.markSceneReady(5);
  }
  function buildTimeline(root) {
    var g = window.gsap;
    var ring = root.querySelector(".s5-ring-path");
    var length = ring ? ring.getTotalLength() : 0;
    if (ring && length) {
      ring.style.strokeDasharray = length + " " + length;
      ring.style.strokeDashoffset = String(length);
    }
    tl = g.timeline({ defaults: { ease: "power2.out" } });
    tl.fromTo(root.querySelector(".s5-heading"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .65 }, 0);
    tl.fromTo(root.querySelector(".s5-rule"), { scaleX: 0 }, { scaleX: 1, duration: .65, ease: "power1.inOut" }, .25);
    tl.fromTo(root.querySelector(".s5-calendar"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .65 }, .28);
    if (ring && length) {
      tl.to(ring, { strokeDashoffset: 0, duration: 1.05, ease: "power1.inOut" }, .72);
      tl.fromTo(root.querySelector(".s5-heart"), { opacity: 0, scale: .4, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: .38 }, 1.42);
    }
    tl.fromTo(root.querySelector(".s5-ceremony"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .72 }, 1.3);
    tl.fromTo(root.querySelector(".s5-lunch"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .72 }, 2.05);
    tl.fromTo(root.querySelector(".s5-countdown"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .55 }, 2.35);
    tl.fromTo(root.querySelector(".s5-after-date"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .55 }, 2.35);
    tl.fromTo(root.querySelector(".s5-calendar-btn"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .5 }, 2.55);
    tl.call(function () { App.markSceneReady(5); }, null, 2.85);
  }
  function escapeIcs(value) {
    return String(value == null ? "" : value).replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
  }
  function formatUtc(date) {
    return date.getUTCFullYear() + String(date.getUTCMonth() + 1).padStart(2, "0") + String(date.getUTCDate()).padStart(2, "0") +
      "T" + String(date.getUTCHours()).padStart(2, "0") + String(date.getUTCMinutes()).padStart(2, "0") + String(date.getUTCSeconds()).padStart(2, "0") + "Z";
  }
  function downloadCalendar() {
    var start = new Date(C.date.iso);
    if (!isFinite(start.getTime())) { return; }
    var end = new Date(start.getTime() + 3 * 60 * 60 * 1000);
    var names = C.names[App.lang] || C.names.en;
    var title = "Wedding of " + names.groomShort + " & " + names.brideShort;
    var location = App.txt(C.church.name) + ", " + App.txt(C.church.address);
    var stamp = formatUtc(new Date());
    var uid = "wedding-" + start.getTime() + "@invitation.local";
    var lines = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Invitation//Save the Date//EN", "CALSCALE:GREGORIAN", "METHOD:PUBLISH",
      "BEGIN:VEVENT", "UID:" + uid, "DTSTAMP:" + stamp, "DTSTART:" + formatUtc(start), "DTEND:" + formatUtc(end),
      "SUMMARY:" + escapeIcs(title), "LOCATION:" + escapeIcs(location), "END:VEVENT", "END:VCALENDAR"
    ];
    var blob = new Blob([lines.join("\r\n") + "\r\n"], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "wedding-invitation.ics";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  App.registerScene(5, {
    init: render,
    enter: function () {
      var root = this.root;
      /* scenes init at boot in English; rebuild if the guest chose another language */
      if (root.getAttribute("data-lang") !== App.lang) { render(root); root.setAttribute("data-lang", App.lang); }
      App.holdNext(5);
      resetVisual(root);
      root.querySelector(".s5-scroll").scrollTop = 0;
      if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
      updateCountdown(root, false);
      if (root.querySelector(".s5-countdown").hidden) {
        root.querySelector(".s5-after-date").style.opacity = "1";
      }
      countdownTimer = window.setInterval(function () { updateCountdown(root, true); }, 1000);
      if (App.ambient) { App.ambient.start(); }
      if (!window.gsap || App.reduced) { staticFinal(root); return; }
      root.classList.add("s5-is-animating");
      buildTimeline(root);
    },
    exit: function () {
      if (tl) { tl.kill(); tl = null; }
      if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null; }
      activeTouch = null;
      this.root.classList.remove("s5-is-animating");
    }
  });
  window.addEventListener("invitation:motionchange", function () {
    if (App.reduced && App.scene === 5) { staticFinal(App.scenes[5].root); }
  });
})();
