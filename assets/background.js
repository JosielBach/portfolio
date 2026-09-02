(function () {
  'use strict';

  var canvas = document.getElementById('bgCanvas');
  if (!canvas || !canvas.getContext) return;

  var ctx    = canvas.getContext('2d');
  var root   = document.documentElement;
  var orbit  = document.getElementById('orbit');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasPath2D = typeof window.Path2D === 'function';

  var COLORS   = ['59,130,246', '59,130,246', '139,92,246', '16,185,129'];
  var BUCKETS  = 6;
  var GRID_AMP = 16;
  var TILT_AMP = 14;
  var TILT_DEG = 4.5;
  var IDLE_MS  = 2600;

  var w = 0, h = 0, dpr = 1;
  var LINK = 132, MOUSE_R = 190;
  var particles = [];
  var TAU = Math.PI * 2;

  var pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2, active: false };
  var aim     = { x: pointer.x, y: pointer.y };
  var smooth  = { x: pointer.x, y: pointer.y };
  var glow    = { x: pointer.x, y: pointer.y };
  var lastMove = -1e9;
  var idleT = Math.random() * TAU;

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;

    var area = w * h;
    var diag = Math.sqrt(w * w + h * h);

    dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (area > 3000000) dpr = Math.min(dpr, 1.5);

    canvas.width  = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width  = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 1;

    LINK    = Math.max(112, Math.min(178, diag * 0.076));
    MOUSE_R = Math.max(150, Math.min(268, diag * 0.112));

    seed(Math.round(Math.min(190, Math.max(34, area / 13000))));
  }

  function seed(target) {
    while (particles.length > target) particles.pop();
    while (particles.length < target) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.26,
        vy: (Math.random() - 0.5) * 0.26,
        r: 0.9 + Math.random() * 1.5,
        c: COLORS[(Math.random() * COLORS.length) | 0]
      });
    }
  }

  function update(now) {
    var idle = now - lastMove > IDLE_MS;
    if (idle) pointer.active = false;

    if (idle) {

      idleT += 0.0022;
      aim.x = w / 2 + Math.cos(idleT) * w * 0.24;
      aim.y = h / 2 + Math.sin(idleT * 0.83) * h * 0.22;
    } else {
      aim.x = pointer.x;
      aim.y = pointer.y;
    }

    smooth.x += (aim.x - smooth.x) * 0.085;
    smooth.y += (aim.y - smooth.y) * 0.085;

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      p.x += p.vx;
      p.y += p.vy;

      var dx = p.x - smooth.x;
      var dy = p.y - smooth.y;
      var d2 = dx * dx + dy * dy;
      if (d2 > 0.01 && d2 < MOUSE_R * MOUSE_R) {
        var d = Math.sqrt(d2);
        var force = (1 - d / MOUSE_R) * 0.9;
        p.x += (dx / d) * force;
        p.y += (dy / d) * force;
      }

      if (p.x < -24) p.x = w + 24; else if (p.x > w + 24) p.x = -24;
      if (p.y < -24) p.y = h + 24; else if (p.y > h + 24) p.y = -24;
    }
  }

  function makePaths(n) {
    var out = [];
    for (var i = 0; i < n; i++) out.push(hasPath2D ? new Path2D() : null);
    return out;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    var links  = makePaths(BUCKETS);
    var beams  = makePaths(3);
    var dots   = {};
    var i, j, k;

    for (i = 0; i < COLORS.length; i++) dots[COLORS[i]] = hasPath2D ? new Path2D() : null;

    var LINK2 = LINK * LINK;
    var M2    = MOUSE_R * MOUSE_R;

    for (i = 0; i < particles.length; i++) {
      var a = particles[i];

      for (j = i + 1; j < particles.length; j++) {
        var b  = particles[j];
        var dx = a.x - b.x;
        if (dx > LINK || dx < -LINK) continue;
        var dy = a.y - b.y;
        if (dy > LINK || dy < -LINK) continue;

        var d2 = dx * dx + dy * dy;
        if (d2 >= LINK2) continue;

        k = (((1 - Math.sqrt(d2) / LINK) * BUCKETS) | 0);
        if (k >= BUCKETS) k = BUCKETS - 1;
        if (links[k]) { links[k].moveTo(a.x, a.y); links[k].lineTo(b.x, b.y); }
      }

      if (pointer.active) {
        var mx = a.x - smooth.x;
        var my = a.y - smooth.y;
        var m2 = mx * mx + my * my;
        if (m2 < M2) {
          k = (((1 - Math.sqrt(m2) / MOUSE_R) * 3) | 0);
          if (k > 2) k = 2;
          if (beams[k]) { beams[k].moveTo(a.x, a.y); beams[k].lineTo(smooth.x, smooth.y); }
        }
      }

      var dp = dots[a.c];
      if (dp) { dp.moveTo(a.x + a.r, a.y); dp.arc(a.x, a.y, a.r, 0, TAU); }
    }

    if (!hasPath2D) return;

    for (k = 0; k < BUCKETS; k++) {
      ctx.strokeStyle = 'rgba(59,130,246,' + (0.035 + k * 0.032).toFixed(3) + ')';
      ctx.stroke(links[k]);
    }
    for (k = 0; k < 3; k++) {
      ctx.strokeStyle = 'rgba(96,165,250,' + (0.09 + k * 0.13).toFixed(3) + ')';
      ctx.stroke(beams[k]);
    }
    for (var c in dots) {
      ctx.fillStyle = 'rgba(' + c + ',0.55)';
      ctx.fill(dots[c]);
    }
  }

  function parallax() {
    glow.x += (smooth.x - glow.x) * 0.14;
    glow.y += (smooth.y - glow.y) * 0.14;

    root.style.setProperty('--gx', glow.x.toFixed(1) + 'px');
    root.style.setProperty('--gy', glow.y.toFixed(1) + 'px');

    var nx = (glow.x / w - 0.5) * 2;
    var ny = (glow.y / h - 0.5) * 2;

    root.style.setProperty('--gridx', (-nx * GRID_AMP).toFixed(1) + 'px');
    root.style.setProperty('--gridy', (-ny * GRID_AMP).toFixed(1) + 'px');

    if (orbit) {
      orbit.style.setProperty('--tx', (nx * TILT_AMP).toFixed(1) + 'px');
      orbit.style.setProperty('--ty', (ny * TILT_AMP).toFixed(1) + 'px');
      orbit.style.setProperty('--ry', (nx * TILT_DEG).toFixed(2) + 'deg');
      orbit.style.setProperty('--rx', (-ny * TILT_DEG).toFixed(2) + 'deg');
    }
  }

  function frame(now) {
    if (!document.hidden && !root.classList.contains('panel-open')) {
      update(now);
      draw();
      parallax();
    }
    requestAnimationFrame(frame);
  }

  function onMove(e) {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
    pointer.active = true;
    lastMove = performance.now();
  }

  window.addEventListener('resize', function () {
    resize();
    if (reduce) draw();
  });
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onMove, { passive: true });
  document.addEventListener('pointerleave', function () { pointer.active = false; });
  window.addEventListener('blur', function () { pointer.active = false; });

  resize();

  if (reduce) {
    draw();
  } else {
    requestAnimationFrame(frame);
  }
})();
