// RaceWise home page: the three small things you can try. Everything also reads correctly without this script.
(function () {
  // The week: each button turns one event on or off; tiles and notes for it are shown by CSS classes on the list.
  const week = document.querySelector(".week");
  const bar = document.querySelector(".toggles");
  const live = document.querySelector(".week-live");
  if (week && bar) {
    const buttons = [...bar.querySelectorAll(".tog")];
    const update = () => {
      buttons.forEach(b => week.classList.toggle("on-" + b.dataset.ev, b.getAttribute("aria-pressed") === "true"));
      const notes = [...week.querySelectorAll(".note.v-ev")].filter(n => n.offsetParent !== null).map(n => n.textContent.replace(/Pro$/, "").trim());
      live.textContent = notes.length ? notes.join(" ") : live.dataset.none;
    };
    buttons.forEach(b => {
      b.setAttribute("aria-pressed", "false");
      b.addEventListener("click", () => { b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true"); update(); });
    });
    bar.hidden = false;
    week.classList.remove("on-busy", "on-hrv", "on-swim");
    live.textContent = "";
  }

  // Heat: the same bands as the app (temperature + dew point in °F; slowdown at the top of each band).
  const bands = [[100, 0], [110, .005], [120, .01], [130, .02], [140, .03], [150, .045], [160, .06], [170, .08], [180, .10]];
  const f = c => c * 9 / 5 + 32;
  const mmss = s => { s = Math.round(s); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };
  const heat = document.querySelector("form.heat");
  if (heat) {
    const [easyLo, easyHi] = heat.dataset.base.split(",").map(Number);
    const levels = heat.dataset.levels.split("|");
    const out = k => heat.querySelector(`[data-o="${k}"]`);
    const run = () => {
      const t = +heat.t.value;
      if (+heat.d.value > t) heat.d.value = t;          // dew point can't be above the air temperature
      const d = +heat.d.value, i = f(t) + f(d);
      let slow = 0, level = 0;
      if (i > 180) { slow = .10; level = 3; }
      else if (i > 100) {
        let lo = 100, sd = 0;
        for (const [up, s] of bands.slice(1)) { if (i <= up) { slow = sd + (s - sd) * (i - lo) / (up - lo); break; } lo = up; sd = s; }
        level = i > 160 ? 3 : i > 130 ? 2 : 1;
      }
      slow = Math.round(slow * 1000) / 1000;
      out("t").textContent = t + "°C"; out("d").textContent = d + "°C"; out("deg").textContent = t + "°";
      out("pace").textContent = mmss(easyLo * (1 + slow)) + "–" + mmss(easyHi * (1 + slow)) + " /km";
      out("slow").textContent = slow ? (slow * 100).toFixed(1) + "%" : heat.dataset.none;
      out("level").textContent = levels[level];
      heat.dataset.level = level;
    };
    heat.addEventListener("input", run);
    run();
  }

  // Hike: effort km = route km + every 100 m of climb.
  const effort = document.querySelector("form.effort");
  if (effort) {
    const run = () => {
      const km = Math.max(0, +effort.km.value || 0), climb = Math.max(0, +effort.climb.value || 0);
      const e = km + climb / 100;
      effort.out.querySelector("b").textContent = Number.isInteger(e) ? e : e.toFixed(1);
    };
    effort.addEventListener("input", run);
    run();
  }
})();
