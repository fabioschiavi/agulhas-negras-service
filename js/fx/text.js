/* Agulhas Negras Service — texto: labels mono que "decodificam" de ruído (Artefakt), linhas que sobem
   por máscara palavra a palavra (Lumora), reveals ao entrar na tela, contadores por progresso de scroll. */

const GLYPHS = "█▓▒░ABCDEFGHJKLMNPQRSTUVWXYZ0123456789·/[]-";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

export function onView(el, cb, threshold = 0.4) {
  const io = new IntersectionObserver((es) => { for (const e of es) if (e.isIntersecting) { io.disconnect(); cb(e); } }, { threshold });
  io.observe(el);
}

/** Decodifica o texto: cada caractere cicla glifos aleatórios e assenta da esquerda pra direita. */
export function decode(el, { duration = 900, delay = 0 } = {}) {
  const text = el.textContent;
  el.setAttribute("aria-label", text);
  if (reduce) return;
  const chars = [...text];
  const spans = chars.map((c) => { const s = document.createElement("span"); s.textContent = c; s.setAttribute("aria-hidden", "true"); return s; });
  el.textContent = ""; spans.forEach((s) => el.appendChild(s));
  let started = false;
  const run = () => {
    if (started) return; started = true;
    const t0 = performance.now() + delay;
    (function tick(now) {
      const k = Math.min(1, Math.max(0, (now - t0) / duration));
      spans.forEach((s, i) => {
        const c = chars[i];
        if (c === " ") return;
        const settle = i / chars.length;
        if (k >= settle + 0.12) s.textContent = c;
        else if (k >= settle - 0.25) s.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        else s.textContent = "·";
      });
      if (k < 1) requestAnimationFrame(tick); else spans.forEach((s, i) => (s.textContent = chars[i]));
    })(performance.now());
  };
  onView(el, run, 0.1);
  return run;
}

/** Palavras que sobem por máscara (mantém <em> e outros filhos). */
export function riseWords(el, { stagger = 45, delay = 0 } = {}) {
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        const parts = n.textContent.split(/(\s+)/);
        parts.forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(" ")); return; }
          const o = document.createElement("span"); o.className = "w";
          const i = document.createElement("span"); i.className = "wi"; i.textContent = p;
          o.appendChild(i); frag.appendChild(o);
        });
        node.replaceChild(frag, n);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  el.setAttribute("aria-label", el.textContent.trim());
  walk(el);
  el.querySelectorAll(".wi").forEach((w, i) => (w.style.transitionDelay = `${delay + i * stagger}ms`));
  el.classList.add("rise");
  return () => el.classList.add("on");
}

/** Reveal fade+sobe ao entrar (data-reveal). Elementos com data-wait só disparam depois do loader. */
export function reveals(ready) {
  document.querySelectorAll("[data-reveal]").forEach((el, i) => {
    el.classList.add("reveal");
    const show = () => el.classList.add("on");
    onView(el, () => (el.hasAttribute("data-wait") ? ready.then(show) : show()), 0.2);
  });
}

/** Contador dirigido pelo scroll: 0 quando o topo encosta embaixo da tela, alvo quando o centro chega ao centro. */
export function scrollCounters(selector = "[data-count]") {
  const nodes = [...document.querySelectorAll(selector)].map((n) => ({
    n, target: parseFloat(n.dataset.count), dec: (n.dataset.count.includes(".") ? 1 : 0), suffix: n.dataset.suffix || "", prefix: n.dataset.prefix || "",
  }));
  let last = 0;
  const fmt = (o, v) => o.prefix + v.toLocaleString("pt-BR", { minimumFractionDigits: o.dec, maximumFractionDigits: o.dec }) + o.suffix;
  function update(now) {
    if (now - last < 30) return; last = now;
    const H = innerHeight;
    for (const o of nodes) {
      const r = o.n.getBoundingClientRect();
      const start = H, end = H / 2 - r.height / 2; // top bottom → center center
      const p = Math.min(1, Math.max(0, (start - r.top) / (start - end)));
      o.n.textContent = fmt(o, Math.round(o.target * p * (10 ** o.dec)) / (10 ** o.dec));
    }
  }
  addEventListener("scroll", () => update(performance.now()), { passive: true });
  update(performance.now());
}
