/* The World wheel is the network WHEELY9000, drawn from one supplied picture.
   Layers were separated here: the wooden wheel turns about its hub, the stand
   stays put, and the hamster is the original sprite. There is no API sleep
   field, so this view never calls a stopped wheel "asleep". */
(function () {
  "use strict";
  var canvas = document.getElementById("wvCanvas");
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext("2d");
  var HUB_X = 325, HUB_Y = 294, ROT_C = 300;
  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var bg = new Image(), rotor = new Image(), stand = new Image(), ham = new Image();
  var ready = 0, need = 4;
  function loaded() { ready++; if (ready === need) draw(); }
  [bg, rotor, stand, ham].forEach(function (img) { img.onload = loaded; });
  bg.src = "assets/wheel/bg.png";
  rotor.src = "assets/wheel/rotor.png";
  stand.src = "assets/wheel/stand.png";
  ham.src = "assets/wheel/ham.png";

  var mode = "loading";
  var rpm = 0;
  var angle = 0;
  var bob = 0;
  var raf = 0;
  var last = 0;

  function label(left, right) {
    var a = document.getElementById("wheelStateTxt");
    var b = document.getElementById("wheelRpmTxt");
    if (a) a.textContent = left || "";
    if (b) b.textContent = right || "";
  }

  function spinning() {
    return mode === "run" && rpm > 0 && !reduce && !document.hidden && canvas.offsetParent !== null;
  }

  function draw() {
    if (ready < need) return;
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bg, 0, 0);
    ctx.save();
    ctx.translate(HUB_X, HUB_Y);
    ctx.rotate(angle * Math.PI / 180);
    ctx.drawImage(rotor, -ROT_C, -ROT_C);
    ctx.restore();
    ctx.drawImage(stand, 0, 0);
    ctx.drawImage(ham, 0, bob);
  }

  function frame(t) {
    raf = 0;
    if (!spinning()) { draw(); return; }
    if (!last) last = t;
    var dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    angle = (angle + rpm * 6 * dt) % 360;
    bob = Math.floor(t / 160) % 2 ? -2 : 0;
    draw();
    raf = requestAnimationFrame(frame);
  }

  function kick() {
    if (spinning()) {
      if (!raf) { last = 0; raf = requestAnimationFrame(frame); }
    } else {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      bob = 0;
      if (mode !== "run") angle = 0;
      draw();
    }
  }

  /* measurement is the object from GET /v1/status, or null. */
  function apply(m) {
    if (!m) {
      mode = "unavailable";
      rpm = 0;
      label("Unavailable", "");
      kick();
      return;
    }
    var core = m.coreStatus || "—";
    var speed = (m.rpmMilli || 0) / 1000;
    var fresh = m.freshness;
    var ageOk = false;
    if (fresh === "online") ageOk = true;
    else if (fresh !== "stale") {
      var stamp = Date.parse(m.receivedAt || m.observedAt || "");
      var limit = (m.staleAfterSeconds || 120) * 1000;
      ageOk = !!stamp && (Date.now() - stamp) < limit;
    }
    if (!ageOk) {
      mode = "stale";
      rpm = 0;
      label("Stale", "last " + speed.toFixed(1) + " RPM");
      kick();
      return;
    }
    if (core === "COUNTER_FAULT") {
      mode = "fault";
      rpm = 0;
      label("COUNTER_FAULT", "held");
      kick();
      return;
    }
    if (speed > 0) {
      mode = "run";
      rpm = speed;
      label(core, speed.toFixed(1) + " RPM");
      kick();
      return;
    }
    mode = "stopped";
    rpm = 0;
    label(core, "0.0 RPM · stopped");
    kick();
  }

  function hold() {
    mode = "unavailable";
    rpm = 0;
    label("Update failed", "held");
    kick();
  }

  /* Test hook. Does not pretend the fixture is a live reading. */
  function preview(spec) {
    spec = spec || {};
    apply({
      coreStatus: spec.coreStatus || "ACTIVE",
      rpmMilli: Math.round((spec.rpm || 0) * 1000),
      freshness: spec.freshness || "online",
      receivedAt: new Date().toISOString(),
      staleAfterSeconds: 120
    });
    if (spec.mode === "stale") apply({ coreStatus: spec.coreStatus || "IDLE", rpmMilli: Math.round((spec.rpm || 12) * 1000), freshness: "stale" });
    if (spec.mode === "fault") apply({ coreStatus: "COUNTER_FAULT", rpmMilli: 0, freshness: "online", receivedAt: new Date().toISOString() });
    if (spec.mode === "unavailable") apply(null);
    if (spec.mode === "stopped") apply({ coreStatus: spec.coreStatus || "IDLE", rpmMilli: 0, freshness: "online", receivedAt: new Date().toISOString() });
  }

  document.addEventListener("visibilitychange", function () { last = 0; kick(); });
  window.addEventListener("resize", kick);
  label("Loading the wheel", "");
  window.SqueekWheel = { apply: apply, hold: hold, preview: preview, state: function () { return { mode: mode, rpm: rpm, angle: angle, reduce: reduce }; } };
})();
