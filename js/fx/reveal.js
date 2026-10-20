/* Agulhas Negras Service — "liquid reveal": o cursor pinta a foto "depois" (pintura corrigida) por cima
   da foto "antes" (opaca), com um pincel radial que decai. Mecânica do hero do layer Lumora (GetLayers):
   pontos interpolados entre eventos, destination-out pra decair, source-in pra recortar o pincel. */

export function liquidReveal(root, { radius = 120, decay = 0.016 } = {}) {
  const img = root.querySelector("img"), canvas = root.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const after = new Image();
  after.src = img.dataset.after;
  let W = 0, H = 0, R = 0, diam = 0, cover = null, brush = null, bctx = null, ready = false;
  let points = [], last = null, idle = 0, touched = false;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  function buildCover() {
    if (!W || !after.naturalWidth) return;
    cover = document.createElement("canvas"); cover.width = W; cover.height = H;
    const c = cover.getContext("2d");
    const s = Math.max(W / after.naturalWidth, H / after.naturalHeight);
    const w = after.naturalWidth * s, h = after.naturalHeight * s;
    c.drawImage(after, (W - w) / 2, (H - h) / 2, w, h);
    ready = true;
  }
  function size() {
    const r = root.getBoundingClientRect();
    if (!r.width) return;
    W = Math.round(r.width * dpr); H = Math.round(r.height * dpr);
    canvas.width = W; canvas.height = H;
    canvas.style.width = r.width + "px"; canvas.style.height = r.height + "px";
    R = radius * dpr; diam = Math.ceil(R * 2);
    brush = document.createElement("canvas"); brush.width = brush.height = diam;
    bctx = brush.getContext("2d");
    buildCover();
  }
  after.onload = buildCover;
  if (after.complete) buildCover();
  new ResizeObserver(size).observe(root);
  size();

  function push(x, y) {
    if (x < -R || y < -R || x > W + R || y > H + R) { last = null; return; }
    if (last) {
      const dx = x - last.x, dy = y - last.y, dist = Math.hypot(dx, dy);
      const step = Math.max(R * 0.3, 1), n = Math.min(Math.ceil(dist / step), 60);
      for (let i = 1; i <= n; i++) points.push({ x: last.x + dx * i / n, y: last.y + dy * i / n });
    } else points.push({ x, y });
    last = { x, y };
  }
  function onMove(e) {
    const r = root.getBoundingClientRect();
    const x = (e.clientX - r.left) * dpr, y = (e.clientY - r.top) * dpr;
    if (x >= 0 && y >= 0 && x <= W && y <= H && !touched) { touched = true; root.classList.add("touched"); }
    push(x, y);
  }
  addEventListener("pointermove", onMove, { passive: true });
  root.addEventListener("pointerleave", () => { last = null; });

  function stamp(x, y) {
    bctx.clearRect(0, 0, diam, diam);
    bctx.globalCompositeOperation = "source-over";
    const g = bctx.createRadialGradient(R, R, 0, R, R, R);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.55, "rgba(255,255,255,.82)"); g.addColorStop(1, "rgba(255,255,255,0)");
    bctx.fillStyle = g; bctx.fillRect(0, 0, diam, diam);
    bctx.globalCompositeOperation = "source-in";
    bctx.drawImage(cover, x - R, y - R, diam, diam, 0, 0, diam, diam);
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(brush, x - R, y - R);
  }
  function tick() {
    requestAnimationFrame(tick);
    if (!ready) return;
    const drawing = points.length > 0;
    if (drawing) idle = 0; else { idle++; if (idle > 120) return; }
    const fade = drawing ? decay : Math.min(decay + idle * 0.004, 0.5);
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = `rgba(0,0,0,${fade})`;
    ctx.fillRect(0, 0, W, H);
    if (drawing) { for (const p of points) stamp(p.x, p.y); points.length = 0; }
    if (idle === 120) ctx.clearRect(0, 0, W, H);
  }
  if (!reduce) tick();
  window.__reveal = { push: (x, y) => push(x * dpr, y * dpr), ready: () => ready }; // hook headless

  /** Varredura automática em S (primeira impressão sem cursor). */
  function sweep(ms = 1600) {
    if (reduce) return;
    const t0 = performance.now();
    (function go(now) {
      const k = Math.min(1, (now - t0) / ms);
      const x = W * (0.12 + 0.76 * k), y = H * (0.5 + 0.3 * Math.sin(k * Math.PI * 2.2));
      push(x, y);
      if (k < 1) requestAnimationFrame(go); else last = null;
    })(t0);
  }
  return { sweep };
}
