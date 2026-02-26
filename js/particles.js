/* ========================================
   3D Particle Nebula Field
   Perlin noise driven, glow particles,
   deep perspective, randomized opacity
   ======================================== */

(function () {
  "use strict";

  // --- Config ---
  const SEPARATION = 18;
  const AMOUNTX = 100;
  const AMOUNTY = 100;
  const TOTAL = AMOUNTX * AMOUNTY;

  let canvas, ctx;
  let particles = [];
  let count = 0;
  let mouseX = 0, mouseY = 0;
  let camX = 0, camY = 0;
  let width, height;
  let animId;
  let isVisible = true;

  // Deeper camera for more dramatic perspective
  const camera = {
    fov: 600,
    z: 500
  };

  // -----------------------------------------------
  // Simplex-inspired noise (fast 2D)
  // -----------------------------------------------
  const PERM = new Uint8Array(512);
  const GRAD = [[1,1],[-1,1],[1,-1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];
  (function seedPerm() {
    const p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) p[i] = i;
    for (let i = 255; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [p[i], p[j]] = [p[j], p[i]];
    }
    for (let i = 0; i < 512; i++) PERM[i] = p[i & 255];
  })();

  function dot2(g, x, y) { return g[0] * x + g[1] * y; }

  function noise2D(x, y) {
    const F2 = 0.5 * (Math.sqrt(3) - 1);
    const G2 = (3 - Math.sqrt(3)) / 6;
    const s = (x + y) * F2;
    const i = Math.floor(x + s);
    const j = Math.floor(y + s);
    const t = (i + j) * G2;
    const X0 = i - t, Y0 = j - t;
    const x0 = x - X0, y0 = y - Y0;
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    const x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
    const x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
    const ii = i & 255, jj = j & 255;

    let n0 = 0, n1 = 0, n2 = 0;
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 > 0) { t0 *= t0; n0 = t0 * t0 * dot2(GRAD[PERM[ii + PERM[jj]] % 8], x0, y0); }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 > 0) { t1 *= t1; n1 = t1 * t1 * dot2(GRAD[PERM[ii + i1 + PERM[jj + j1]] % 8], x1, y1); }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 > 0) { t2 *= t2; n2 = t2 * t2 * dot2(GRAD[PERM[ii + 1 + PERM[jj + 1]] % 8], x2, y2); }

    return 70 * (n0 + n1 + n2); // range roughly -1..1
  }

  // Multi-octave fractal noise
  function fbm(x, y, octaves) {
    let value = 0, amp = 1, freq = 1, max = 0;
    for (let i = 0; i < octaves; i++) {
      value += noise2D(x * freq, y * freq) * amp;
      max += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return value / max;
  }

  // -----------------------------------------------
  // Init
  // -----------------------------------------------
  function init() {
    canvas = document.getElementById("particleCanvas");
    if (!canvas) return;
    ctx = canvas.getContext("2d");
    resize();

    // Build particle grid with random per-particle properties
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        particles.push({
          x: ix * SEPARATION - (AMOUNTX * SEPARATION) / 2,
          y: 0,
          z: iy * SEPARATION - (AMOUNTY * SEPARATION) / 2,
          ix: ix,
          iy: iy,
          // Randomized base opacity between 0.15 and 0.55
          baseAlpha: 0.15 + Math.random() * 0.4,
          // Slight random offset for organic feel
          noiseOffsetX: Math.random() * 100,
          noiseOffsetY: Math.random() * 100
        });
      }
    }

    document.addEventListener("mousemove", onMouseMove, false);
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("resize", resize, false);

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
        if (isVisible && !animId) animate();
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    animate();
  }

  function resize() {
    width = canvas.parentElement.offsetWidth;
    height = canvas.parentElement.offsetHeight;
    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  }

  function onMouseMove(e) {
    mouseX = e.clientX - width / 2;
    mouseY = e.clientY - height / 2;
  }

  function onTouchMove(e) {
    if (e.touches.length > 0) {
      mouseX = e.touches[0].clientX - width / 2;
      mouseY = e.touches[0].clientY - height / 2;
    }
  }

  // 3D → 2D projection with deep perspective
  function project(x, y, z) {
    const px = x - camX;
    const py = y - camY;
    const depth = z + camera.z;
    if (depth <= 0) return null;
    const scale = camera.fov / depth;
    return {
      x: px * scale + width / 2,
      y: py * scale + height / 2,
      scale: scale,
      depth: depth
    };
  }

  // -----------------------------------------------
  // Animation loop
  // -----------------------------------------------
  function animate() {
    if (!isVisible) { animId = null; return; }
    animId = requestAnimationFrame(animate);
    render();
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Slow smooth camera follow
    camX += (mouseX * 0.08 - camX) * 0.015;
    camY += (-mouseY * 0.06 - 50 - camY) * 0.015;

    const time = count * 0.4;

    for (let i = 0; i < TOTAL; i++) {
      const p = particles[i];
      const ix = p.ix;
      const iy = p.iy;

      // Multi-layered organic wave using Perlin noise + sine
      const nx = (ix + p.noiseOffsetX) * 0.025;
      const ny = (iy + p.noiseOffsetY) * 0.025;
      const noiseVal = fbm(nx + time * 0.15, ny + time * 0.12, 3);

      p.y =
        noiseVal * 25 +
        Math.sin((ix * 0.15) + time * 0.3) * 8 +
        Math.sin((iy * 0.12) + time * 0.25) * 6;

      // Project to 2D
      const proj = project(p.x, p.y, p.z);
      if (!proj) continue;

      // Cull offscreen
      if (proj.x < -30 || proj.x > width + 30 || proj.y < -30 || proj.y > height + 30) continue;

      // Depth-based sizing: near = larger, far = tiny dust
      const depthFactor = Math.max(0, Math.min(1, (camera.z + 400 - p.z) / 1200));
      const baseRadius = 0.4 + depthFactor * 1.8;
      const waveBoost = (Math.sin((ix + count * 2) * 0.2) + 1) * 0.3;
      const radius = Math.max(0.2, (baseRadius + waveBoost) * proj.scale);

      // Depth-based alpha: far particles are dimmer
      const depthAlpha = depthFactor * depthFactor;
      const alpha = p.baseAlpha * depthAlpha * Math.min(1, proj.scale * 1.5);

      if (alpha < 0.01 || radius < 0.15) continue;

      // Pure flat dot — no glow
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fill();
    }

    // Very slow drift
    count += 0.008;
  }

  // -----------------------------------------------
  // Boot
  // -----------------------------------------------
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
