/* Agulhas Negras Service — hero "ignição": sequência de frames (M3 CS vindo pra câmera, faróis acendendo)
   desenhada num canvas conforme o scroll. Frames em img/hero/d (16:9, 1920) e img/hero/m (recorte central, 900).
   Fluidez estilo Apple: o frame é um número contínuo que persegue o alvo com amortecimento, e dois frames
   vizinhos são misturados (crossfade) — nada de degrau entre quadros. Frames pré-decodificados em ImageBitmap. */

export function carScrub(canvas, { count = 179, auto = 0.3, damping = 0.14 } = {}) {
  const ctx = canvas.getContext("2d", { alpha: false });
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = () => innerWidth < 760;
  const BG = "#050607";
  let set = mobile() ? "m" : "d", frames = [], W = 0, H = 0, gen = 0;
  let autoK = 0, scrollK = 0, cur = 0, drawn = -1, dirty = true, done = 0;
  let resolveLoaded, progressCb = () => {};
  const loaded = new Promise((r) => (resolveLoaded = r));

  function load(which) {
    const my = ++gen, list = new Array(count).fill(null), order = [0, count - 1];
    for (let s = 16; s >= 1; s >>= 1) for (let i = 0; i < count; i += s) if (!order.includes(i)) order.push(i);
    let next = 0;
    done = 0;
    const pump = () => { // 6 downloads em paralelo, na ordem grossa → fina
      if (my !== gen || next >= order.length) return;
      const i = order[next++];
      const img = new Image();
      img.src = `img/hero/${which}/${String(i + 1).padStart(3, "0")}.webp`;
      img.decode().then(() => (window.createImageBitmap ? createImageBitmap(img) : img)).then((bmp) => {
        if (my !== gen) return;
        list[i] = bmp; dirty = true;
      }).catch(() => {}).finally(() => {
        if (my !== gen) return;
        done++; progressCb(done / count);
        if (done >= count) resolveLoaded();
        pump();
      });
    };
    for (let k = 0; k < 6; k++) pump();
    return list;
  }
  frames = load(set);

  function size() {
    const dpr = Math.min(devicePixelRatio || 1, mobile() ? 2 : 1.5);
    W = Math.round(canvas.clientWidth * dpr); H = Math.round(canvas.clientHeight * dpr);
    canvas.width = W; canvas.height = H;
    const s = mobile() ? "m" : "d";
    if (s !== set) { set = s; frames = load(set); }
    dirty = true;
  }
  addEventListener("resize", size);

  // frame carregado mais próximo, nos dois sentidos (nunca salta pra muito atrás)
  const near = (i) => { for (let d = 0; d < count; d++) { if (frames[i + d]) return frames[i + d]; if (frames[i - d]) return frames[i - d]; } return null; };

  function place(img) {
    const iw = img.width, ih = img.height;
    if (mobile()) { const s = W / iw; return [0, (H - ih * s) * 0.42, iw * s, ih * s]; }
    const s = Math.max(W / iw, H / ih); return [(W - iw * s) / 2, (H - ih * s) / 2, iw * s, ih * s];
  }

  function draw() {
    const f = Math.min(count - 1, Math.max(0, cur)), i0 = Math.floor(f), t = f - i0;
    const a = frames[i0] || near(i0);
    if (!a || !W) return;
    const b = t > 0.02 && i0 + 1 < count ? frames[i0 + 1] : null;
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighten"; // preto do frame vira o preto do site
    const r = place(a);
    ctx.drawImage(a, r[0], r[1], r[2], r[3]);
    if (b) { ctx.globalCompositeOperation = "source-over"; ctx.globalAlpha = t; ctx.drawImage(b, r[0], r[1], r[2], r[3]); ctx.globalAlpha = 1; }
    if (mobile()) { // funde as bordas de cima e de baixo do frame
      ctx.globalCompositeOperation = "source-over";
      const y = r[1], h = r[3], fh = h * 0.18;
      let g = ctx.createLinearGradient(0, y, 0, y + fh); g.addColorStop(0, BG); g.addColorStop(1, "rgba(5,6,7,0)");
      ctx.fillStyle = g; ctx.fillRect(0, y - 2, W, fh);
      g = ctx.createLinearGradient(0, y + h - fh, 0, y + h); g.addColorStop(0, "rgba(5,6,7,0)"); g.addColorStop(1, BG);
      ctx.fillStyle = g; ctx.fillRect(0, y + h - fh, W, fh + 2);
      ctx.fillStyle = BG; ctx.fillRect(0, 0, W, Math.max(0, y)); ctx.fillRect(0, y + h, W, H);
    }
    drawn = f;
  }

  (function loop() {
    requestAnimationFrame(loop);
    const target = Math.min(1, Math.max(autoK, scrollK)) * (count - 1);
    const diff = target - cur;
    cur = Math.abs(diff) < 0.002 ? target : cur + diff * (reduce ? 1 : damping);
    if (dirty || Math.abs(cur - drawn) > 0.001) { dirty = false; draw(); }
  })();
  size();

  return {
    /** toca a ignição até `auto` (faróis acesos) */
    play(ms = 1800) {
      if (reduce) { autoK = 1; return; }
      const t0 = performance.now();
      (function go(now) {
        const k = Math.min(1, (now - t0) / ms);
        autoK = auto * (1 - Math.pow(1 - k, 3));
        if (k < 1) requestAnimationFrame(go);
      })(t0);
    },
    /** progresso do scroll [0..1] mapeado no trecho depois da ignição */
    scrub(k) { scrollK = auto + (1 - auto) * k; },
    get frame() { return Math.round(drawn); },
    /** resolve quando todos os frames do conjunto atual carregaram */
    loaded,
    onProgress(fn) { progressCb = fn; fn(done / count); },
  };
}
