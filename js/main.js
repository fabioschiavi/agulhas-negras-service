/* Agulhas Negras Service — "A luz que revela". Boot: loader (anel conta e vira a águia, fotos como cartas),
   Lenis, feixe de luz guiado pelo scroll, hero com liquid reveal, seções. */
import { createStream } from "./fx/stream.js?v=4";
import { liquidReveal } from "./fx/reveal.js?v=1";
import { carScrub } from "./fx/car.js?v=3";
import { decode, riseWords, reveals, scrollCounters, onView } from "./fx/text.js?v=1";
import { tilt, fanTilt, initChapters, initCamadas, initServicos, initOS, initMarcas, initConfigurador, initModal, initNav } from "./sections.js?v=4";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
scrollTo(0, 0);

/* ---------------- scroll suave + trava ---------------- */
let lenis = null;
if (window.Lenis && !reduce) {
  // wheel e toque pelo mesmo motor: scroll e animações andam no MESMO quadro (sem o atraso de um frame do scroll nativo)
  lenis = new window.Lenis({ lerp: 0.075, wheelMultiplier: 0.85, smoothWheel: true, syncTouch: true, syncTouchLerp: 0.085, touchInertiaMultiplier: 28, touchMultiplier: 1.1, anchors: true, autoRaf: false });
  (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(performance.now());
}
const lock = () => { lenis?.stop(); document.documentElement.classList.add("locked"); };
const unlock = () => { lenis?.start(); document.documentElement.classList.remove("locked"); };

/* ---------------- feixe de luz ---------------- */
const stream = createStream(document.getElementById("stream"));
// alvo do feixe por seção: ângulo, deslocamento (em unidades da altura da tela), abertura, alpha, leque
const KEYS = [
  ["top", { angle: -0.3, ox: 0.2, oy: 0.1, spread: 0.014, alpha: 0.7, fan: 0.9 }],
  ["metodo", { angle: 0.36, ox: -0.2, oy: -0.34, spread: 0.01, alpha: 0.32, fan: 0.6 }],
  ["camadas", { angle: -0.1, ox: 0.3, oy: -0.26, spread: 0.011, alpha: 0.4, fan: 1.2 }],
  ["servicos", { angle: 0.5, ox: 0.45, oy: 0.1, spread: 0.008, alpha: 0.22, fan: 0.4 }],
  ["portal", { angle: -0.26, ox: 0.25, oy: -0.2, spread: 0.012, alpha: 0.5, fan: 0.9 }],
  ["numeros", { angle: 0.2, ox: 0, oy: -0.34, spread: 0.008, alpha: 0.3, fan: 0.5 }],
  ["marcas", { angle: -0.45, ox: 0.2, oy: 0.3, spread: 0.009, alpha: 0.35, fan: 0.8 }],
  ["config", { angle: 0.1, ox: 0.35, oy: -0.2, spread: 0.007, alpha: 0.2, fan: 0.3 }],
  ["agendar", { angle: -0.05, ox: 0, oy: 0.16, spread: 0.014, alpha: 0.9, fan: 1.0 }],
].map(([id, v]) => [document.getElementById(id), v]);
function steerStream() {
  if (!stream) return;
  const mid = innerHeight * 0.5;
  let best = KEYS[0][1];
  for (const [node, v] of KEYS) { const r = node.getBoundingClientRect(); if (r.top <= mid) best = v; }
  stream.set(best);
}
addEventListener("scroll", steerStream, { passive: true });

/* ---------------- carro (antes do loader: o loader conta o download dos frames) ---------------- */
const carCanvas = document.getElementById("carCanvas");
const car = carScrub(carCanvas, { count: 179, auto: 0.3 });
let carFrac = 0;
car.onProgress((f) => (carFrac = f));

/* ---------------- loader ---------------- */
const ready = new Promise((resolve) => {
  const loader = document.getElementById("loader"), count = document.getElementById("loaderCount"), arc = document.getElementById("ringArc");
  const cards = document.getElementById("loaderCards");
  lock();
  const FILL = 1500, t0 = performance.now() + 250, LIMIT = 10000;
  requestAnimationFrame(() => cards.classList.add("in"));
  const easeIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  (function tick(now) {
    const k = Math.min(1, Math.max(0, (now - t0) / FILL));
    const late = now - t0 > LIMIT; // rede ruim: abre mesmo assim
    const frac = late ? 1 : carFrac;
    const v = Math.round(Math.min(easeIO(k), frac) * 100);
    count.textContent = String(v).padStart(3, "0");
    arc.style.strokeDashoffset = 100 - v;
    if (k < 1 || frac < 1) return requestAnimationFrame(tick);
    // 100: cartas voam, anel se dobra na águia, painel sobe
    cards.classList.add("out");
    loader.classList.add("fold");
    setTimeout(() => loader.classList.add("up"), 520);
    setTimeout(() => {
      document.body.classList.remove("is-loading"); document.body.classList.add("is-ready");
      unlock(); stream?.intro(1); loader.remove(); resolve();
    }, 1250);
  })(performance.now());
});
if (reduce) stream?.intro(1);

/* ---------------- hero ---------------- */
/* ---------------- ignição: carro vem pra câmera, texto sobe no scroll ---------------- */
const heroSec = document.getElementById("top"), heroRise = document.getElementById("heroRise"), heroIntro = document.getElementById("heroIntro");
ready.then(() => car.play(1900));
let swept = false, h1shown = false, sp = 0, lastKey = "";
const touch = !lenis && matchMedia("(hover: none)").matches;
// um loop só: lê o scroll a cada quadro; no toque (scroll nativo) suaviza o progresso aqui
function heroFrame() {
  requestAnimationFrame(heroFrame);
  const r = heroSec.getBoundingClientRect(), span = r.height - innerHeight;
  if (r.bottom < -50) return;
  const raw = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
  sp = touch && !reduce ? sp + (raw - sp) * 0.2 : raw;
  if (Math.abs(raw - sp) < 0.0004) sp = raw;
  const p = sp;
  const key = p.toFixed(4);
  if (key === lastKey) return;
  lastKey = key;
  const k = (a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
  const ez = (t) => t * t * (3 - 2 * t);
  car.scrub(k(0, 0.5));
  const rise = ez(k(0.42, 0.82));
  heroRise.style.transform = `translate3d(0, ${((1 - rise) * 100).toFixed(3)}vh, 0)`;
  heroRise.style.opacity = Math.min(1, rise * 1.6).toFixed(3);
  heroIntro.style.opacity = (1 - k(0.02, 0.18)).toFixed(3);
  const carOp = 1 - 0.72 * ez(k(0.45, 0.85));
  carCanvas.style.opacity = carOp.toFixed(3);
  stream?.pause(carOp > 0.995 && r.bottom > innerHeight); // carro opaco cobre a tela: feixe não precisa desenhar
  carCanvas.style.transform = `scale(${(1 + 0.06 * ez(k(0.45, 1))).toFixed(4)})`;
  if (rise > 0.25 && !h1shown) { h1shown = true; h1on(); }
  if (rise > 0.95 && !swept) { swept = true; reveal.sweep(1700); }
}
window.__car = car;

const heroStage = document.getElementById("heroStage");
const reveal = liquidReveal(document.getElementById("heroReveal"), { radius: 90 });
const h1on = riseWords(document.querySelector(".hero h1"), { stagger: 55, delay: 150 });
// as cartas pousam em leque depois do loader (continuidade com as cartas dadas)
heroStage.querySelectorAll(".card").forEach((c, i) => { c.style.transition = `opacity .9s var(--ease) ${120 + i * 110}ms, transform 1.1s var(--ease) ${120 + i * 110}ms`; c.style.setProperty("--dy", "80px"); });
requestAnimationFrame(heroFrame);
ready.then(() => {
  heroStage.querySelectorAll(".card").forEach((c) => c.style.setProperty("--dy", "0px"));
  setTimeout(() => { heroStage.querySelectorAll(".card").forEach((c) => (c.style.transition = "")); fanTilt(heroStage); }, 1500);
});

/* ---------------- seções ---------------- */
reveals(ready);
document.querySelectorAll("[data-decode]").forEach((el) => decode(el));
document.querySelectorAll("[data-lines]").forEach((el) => { const on = riseWords(el, { stagger: 40 }); onView(el, on, 0.3); });
initNav();
initChapters();
initCamadas();
initServicos();
initOS();
tilt(document.getElementById("osGlass"), { max: 5, baseX: 3, baseY: 9 });
scrollCounters();
initMarcas();
initConfigurador();
initModal({ lock, unlock });
steerStream();
window.__ready = ready;
