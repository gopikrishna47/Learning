import React, { useEffect, useRef } from 'react';

const MAX_STARS = 180;
const ALPHA_BUCKETS = 8;        // stars are drawn in 8 batched paths instead of 180 separate fills
const FRAME_MS = 1000 / 30;     // the drift is slow — 30 fps looks identical and halves the work

export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let W = 0;
    let H = 0;
    let stars = [];
    let raf = 0;
    let last = 0;
    let resizeTimer = 0;

    const makeStar = () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.2,
      a: Math.random(),
      da: (Math.random() * 0.003 + 0.0005) * (Math.random() > 0.5 ? 1 : -1),
      dy: Math.random() * 0.08 + 0.01,
    });

    function init() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      // Small screens need far fewer stars to look the same
      const count = Math.max(30, Math.min(MAX_STARS, Math.round((W * H) / 9000)));
      stars = Array.from({ length: count }, makeStar);
    }

    function draw(step) {
      ctx.clearRect(0, 0, W, H);
      const buckets = Array.from({ length: ALPHA_BUCKETS }, () => []);

      for (const s of stars) {
        s.a += s.da * step;
        if (s.a <= 0 || s.a >= 1) { s.da *= -1; s.a = Math.min(1, Math.max(0, s.a)); }
        s.y += s.dy * step;
        if (s.y > H + 4) { s.y = -4; s.x = Math.random() * W; }
        buckets[Math.min(ALPHA_BUCKETS - 1, Math.floor(s.a * ALPHA_BUCKETS))].push(s);
      }

      buckets.forEach((group, i) => {
        if (!group.length) return;
        ctx.fillStyle = `rgba(255,255,255,${(((i + 0.5) / ALPHA_BUCKETS) * 0.7).toFixed(3)})`;
        ctx.beginPath();
        for (const s of group) {
          ctx.moveTo(s.x + s.r, s.y);
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        }
        ctx.fill();
      });
    }

    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      draw(last ? Math.min((now - last) / (1000 / 60), 4) : 1);
      last = now;
    }

    function start() {
      if (!raf && !reducedMotion) { last = 0; raf = requestAnimationFrame(loop); }
    }
    function stop() {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    const onVisibility = () => (document.hidden ? stop() : start());
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => { init(); if (reducedMotion) draw(0); }, 150);
    };

    init();
    if (reducedMotion) draw(0); else start();

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', onResize);
    return () => {
      stop();                                   // the old version kept animating after unmount
      clearTimeout(resizeTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <canvas id="starfield" ref={canvasRef} aria-hidden="true" />;
}
