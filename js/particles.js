/* ========================================
   3D Particle Wave Field
   Inspired by Three.js wave pattern
   Pure Canvas 2D with 3D projection
   ======================================== */

(function () {
  "use strict";

  const SEPARATION = 28;
  const AMOUNTX = 70;
  const AMOUNTY = 70;
  const BASE_COLOR = { r: 178, g: 199, b: 255 }; // light blue #B2C7FF
  const LIGHT_COLOR = { r: 195, g: 214, b: 255 }; // even lighter #C3D6FF

  let canvas, ctx;
  let particles = [];
  let count = 0;
  let mouseX = 0, mouseY = 0;
  let camX = 0, camY = 0;
  let width, height;
  let animId;
  let isVisible = true;

  // Camera settings
  const camera = {
    fov: 500,
    x: 0,
    y: 350,
    z: 380
  };

  function init() {
    canvas = document.getElementById("particleCanvas");
    if (!canvas) return;

    ctx = canvas.getContext("2d");

    resize();

    // Build grid
    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        particles.push({
          x: ix * SEPARATION - (AMOUNTX * SEPARATION) / 2,
          y: 0,
          z: iy * SEPARATION - (AMOUNTY * SEPARATION) / 2,
          ix: ix,
          iy: iy
        });
      }
    }

    document.addEventListener("mousemove", onMouseMove, false);
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("resize", resize, false);

    // Intersection observer to pause when not visible
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
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
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

  // Project 3D point to 2D screen
  function project(x, y, z) {
    const px = x - camX;
    const py = y - camY;
    const pz = z;
    const scale = camera.fov / (camera.fov + pz + camera.z);
    return {
      x: px * scale + width / 2,
      y: py * scale + height / 2,
      scale: scale
    };
  }

  function animate() {
    if (!isVisible) {
      animId = null;
      return;
    }

    animId = requestAnimationFrame(animate);
    render();
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Smooth camera follow
    camX += (mouseX * 0.15 - camX) * 0.02;
    camY += (-mouseY * 0.1 - 80 - camY) * 0.02;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const ix = p.ix;
      const iy = p.iy;

      // Wave function - gentle movement
      p.y =
        Math.sin((ix + count) * 0.2) * 12 +
        Math.sin((iy + count) * 0.4) * 12;

      // Scale based on wave
      const waveScale =
        (Math.sin((ix + count) * 0.3) + 1) * 1.2 +
        (Math.sin((iy + count) * 0.5) + 1) * 1.2;

      // Project to 2D
      const proj = project(p.x, p.y, p.z);

      // Only render if on screen
      if (
        proj.x < -20 || proj.x > width + 20 ||
        proj.y < -20 || proj.y > height + 20 ||
        proj.scale <= 0
      ) continue;

      const radius = Math.max(0.3, waveScale * proj.scale * 0.7);
      const alpha = Math.min(0.5, Math.max(0.05, proj.scale * 0.6));

      // Blend between primary and light color based on height
      const blend = (p.y + 60) / 120;
      const r = Math.round(BASE_COLOR.r + (LIGHT_COLOR.r - BASE_COLOR.r) * blend);
      const g = Math.round(BASE_COLOR.g + (LIGHT_COLOR.g - BASE_COLOR.g) * blend);
      const b = Math.round(BASE_COLOR.b + (LIGHT_COLOR.b - BASE_COLOR.b) * blend);

      ctx.beginPath();
      ctx.arc(proj.x, proj.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fill();
    }

    count += 0.015;
  }

  // Start when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
