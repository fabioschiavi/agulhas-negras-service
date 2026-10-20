/* Agulhas Negras Service — hero "ignição": sequência de frames (M3 CS vindo pra câmera, faróis acendendo)
   desenhada num canvas conforme o scroll. Frames em img/hero/d (16:9, 1920) e img/hero/m (recorte central, 900).
   Depois do loader toca sozinho até os faróis acenderem (AUTO); o resto é scroll. */

export function carScrub(canvas, { count = 120, auto = 0.32 } = {}) {
  const ctx = canvas.getContext("2d");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = () => innerWidth < 760;
  const BG = "#050607";
  let set = mobile() ? "m" : "d", frames = [], W = 0, H = 0, dpr = 1;
  let autoK = 0, scrollK = 0, shown = -1;

  function load(which) {
    const list = [];
    const order = [];
    // primeiro e último antes, depois de 8 em 8, depois o resto (scrub fica utilizável cedo)
    order.push(0, count - 1);
    for (let s = 8; s >= 1; s = s / 2 | 0) { for (let i = 0; i < count; i += s) if (!order.includes(i)) order.push(i); if (s === 1) break; }
    for (let i = 0; i < count; i++) list[i] = null;
    order.forEach((i) => {
      const img = new Image();
      img.decoding = "async";
      img.src = `img/hero/${which}/${String(i + 1).padStart(3, "0")}.webp`;
      img.onload = () => { list[i] = img; if (shown < 0 || Math.abs(i - target()) < 3) draw(true); };
    });
    return list;
  }
  frames = load(set);

  function size() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = Math.round(canvas.clientWidth * dpr); H = Math.round(canvas.clientHeight * dpr);
    canvas.width = W; canvas.height = H;
    const s = mobile() ? "m" : "d";
    if (s !== set) { set = s; frames = load(set); }
    draw(true);
  }
  addEventListener("resize", size);

  const target = () => Math.round(Math.min(1, Math.max(autoK, scrollK)) * (count - 1));
  function nearest(i) { for (let d = 0; d < count; d++) { if (frames[i - d]) return frames[i - d]; if (frames[i + d]) return frames[i + d]; } return null; }

  function draw(force) {
    const i = target();
    if (!force && i === shown) return;
    const img = nearest(i);
    if (!img || !W) return;
    shown = i;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H);
    const iw = img.naturalWidth, ih = img.naturalHeight;
    let s, x, y;
    if (mobile()) { s = W / iw; x = 0; y = (H - ih * s) * 0.42; } // largura cheia, carro um pouco acima do meio
    else { s = Math.max(W / iw, H / ih); x = (W - iw * s) / 2; y = (H - ih * s) / 2; } // cover
    ctx.globalCompositeOperation = "lighten"; // preto do frame vira o preto do site
    ctx.drawImage(img, x, y, iw * s, ih * s);
    if (mobile()) { // funde as bordas de cima e de baixo do frame
      ctx.globalCompositeOperation = "source-over";
      const fh = ih * s * 0.18;
      let g = ctx.createLinearGradient(0, y, 0, y + fh); g.addColorStop(0, BG); g.addColorStop(1, "rgba(5,6,7,0)");
      ctx.fillStyle = g; ctx.fillRect(0, y - 2, W, fh);
      g = ctx.createLinearGradient(0, y + ih * s - fh, 0, y + ih * s); g.addColorStop(0, "rgba(5,6,7,0)"); g.addColorStop(1, BG);
      ctx.fillStyle = g; ctx.fillRect(0, y + ih * s - fh, W, fh + 2);
    }
  }

  (function loop() { requestAnimationFrame(loop); draw(false); })();
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
    get frame() { return shown; },
  };
}
