/* Agulhas Negras Service — seções: capítulos (House), camadas explodidas (Artefakt), serviços com foto
   no cursor (Lumora + Originkit), OS ao vivo em janela inclinada (Relay), marcas, configurador, modal, menu. */

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const seg = (p, a, b) => clamp((p - a) / (b - a));
export const ease = (t) => t * t * (3 - 2 * t);
export const lerp = (a, b, t) => a + (b - a) * t;
export const outExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
/** Progresso [0..1] de uma seção com palco sticky (0 = topo encostou, 1 = fim do pin). */
export const prog = (node) => { const r = node.getBoundingClientRect(), span = r.height - innerHeight; return span > 0 ? clamp(-r.top / span) : clamp(-r.top / innerHeight); };
const onScreen = (node) => { const r = node.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; };
const mobile = () => innerWidth < 900;
const WHATSAPP = "551141228222"; // pós-vendas da concessionária: confirmar o número do Service

/* ---------------- janela de vidro que inclina pro cursor (Relay) ---------------- */
export function tilt(el, { max = 6, baseX = 4, baseY = -9 } = {}) {
  if (matchMedia("(hover: none)").matches) { el.style.transform = `perspective(1400px) rotateX(${baseX}deg) rotateY(${baseY}deg)`; return; }
  let tx = 0, ty = 0, cx = 0, cy = 0;
  addEventListener("pointermove", (e) => {
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth, dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
    tx = -dy * max * 2; ty = dx * max * 2;
  }, { passive: true });
  (function loop() {
    requestAnimationFrame(loop);
    if (!onScreen(el)) return;
    cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
    el.style.transform = `perspective(1400px) rotateX(${baseX + cx}deg) rotateY(${baseY + cy}deg)`;
  })();
}

/* ---------------- leque de cartas do hero: inclina e desloca por profundidade ---------------- */
export function fanTilt(stage, { max = 7, shift = 18 } = {}) {
  const cards = [...stage.querySelectorAll(".card")];
  if (matchMedia("(hover: none)").matches) return;
  let tx = 0, ty = 0, cx = 0, cy = 0;
  addEventListener("pointermove", (e) => {
    tx = (e.clientX / innerWidth - 0.5) * 2; ty = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });
  (function loop() {
    requestAnimationFrame(loop);
    if (!onScreen(stage)) return;
    cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
    for (const c of cards) {
      const d = parseFloat(c.dataset.depth || 1);
      c.style.setProperty("--ry", `${cx * max * d}deg`);
      c.style.setProperty("--rx", `${-cy * max * d}deg`);
      c.style.setProperty("--dx", `${cx * shift * d}px`);
      c.style.setProperty("--dy", `${cy * shift * d * 0.6}px`);
    }
  })();
}

/* ---------------- capítulos: palavras nos cantos sobre a foto (House) ---------------- */
export function initChapters() {
  const chapters = [...document.querySelectorAll(".chapter")];
  const parts = chapters.map((c) => ({ c, frame: c.querySelector(".ch-frame"), a: c.querySelector(".ch-a"), b: c.querySelector(".ch-b"), note: c.querySelector(".ch-note"), top: 0, span: 1, sp: -1, last: "" }));
  // geometria em cache: nada de medir layout a cada quadro
  const measure = () => { let y = 0; for (const o of parts) { const r = o.c.getBoundingClientRect(); y = r.top + scrollY; o.top = y; o.span = Math.max(1, o.c.offsetHeight - innerHeight); } };
  addEventListener("resize", measure); measure();
  setTimeout(measure, 1500); // depois de fontes e imagens
  (function loop() {
    requestAnimationFrame(loop);
    const y = scrollY, H = innerHeight, m = mobile();
    for (const o of parts) {
      if (y + H < o.top - 50 || y > o.top + o.span + H + 50) continue;
      const raw = clamp((y - o.top) / o.span, -0.3, 1.1);
      o.sp = o.sp < -0.5 ? raw : o.sp + (raw - o.sp) * 0.22; // suaviza o progresso
      if (Math.abs(raw - o.sp) < 0.0005) o.sp = raw;
      const p = o.sp, key = p.toFixed(4);
      if (key === o.last) continue;
      o.last = key;
      const inA = ease(seg(p, -0.18, 0.4)), inB = ease(seg(p, -0.06, 0.52)), out = ease(seg(p, 0.8, 0.98));
      const sc = lerp(0.8, 1.04, ease(seg(p, 0, 0.7)));
      o.frame.style.transform = `translate3d(-50%, -50%, 0) scale3d(${sc.toFixed(4)}, ${sc.toFixed(4)}, 1)`;
      o.frame.style.opacity = (1 - out).toFixed(3);
      o.a.style.transform = `translate3d(${((1 - inA) * -(m ? 30 : 42)).toFixed(2)}vw, 0, 0)`; o.a.style.opacity = (inA * (1 - out)).toFixed(3);
      o.b.style.transform = `translate3d(${((1 - inB) * (m ? 30 : 42)).toFixed(2)}vw, 0, 0)`; o.b.style.opacity = (inB * (1 - out)).toFixed(3);
      o.note.style.opacity = (seg(p, 0.35, 0.5) * (1 - out)).toFixed(3);
    }
  })();
}

/* ---------------- camadas explodidas (Artefakt) ---------------- */
export function initCamadas() {
  const sec = document.getElementById("camadas"), stage = document.getElementById("cmStage");
  const plates = [...stage.querySelectorAll(".cm-plate")];
  const items = [...document.querySelectorAll("#cmList li")];
  const RISE = [[0, 0.08], [0.14, 0.32], [0.38, 0.56], [0.62, 0.8]], COLLAPSE = [0.86, 0.98];
  let last = -1;
  // grade acende sob o cursor
  const lat = document.getElementById("lattice");
  lat.addEventListener("pointermove", (e) => { const r = lat.getBoundingClientRect(); lat.style.setProperty("--mx", `${e.clientX - r.left}px`); lat.style.setProperty("--my", `${e.clientY - r.top}px`); }, { passive: true });
  let sp = -1, lastKey = "";
  function update() {
    if (!onScreen(sec)) return;
    const raw = prog(sec), m = mobile();
    sp = sp < 0 ? raw : sp + (raw - sp) * 0.22;
    if (Math.abs(raw - sp) < 0.0005) sp = raw;
    const p = sp, key = p.toFixed(4);
    if (key === lastKey) return;
    lastKey = key;
    const col = ease(seg(p, COLLAPSE[0], COLLAPSE[1]));
    const lift = m ? 44 : 84;
    let active = 0;
    plates.forEach((n, i) => {
      const k = ease(seg(p, RISE[i][0], RISE[i][1]));
      if (k > 0.5) active = i;
      const z = lerp(i * lift * k, i * 14, col);
      n.style.transform = `translate3d(-50%, -50%, 0) rotateX(${lerp(60, 48, col).toFixed(2)}deg) rotateZ(${lerp(-16, -8, col).toFixed(2)}deg) translateZ(${z.toFixed(1)}px)`;
      n.style.opacity = i === 0 ? 1 : k;
      n.classList.toggle("on", k > 0.6 && col < 0.5);
    });
    if (col > 0.5) active = 3;
    if (active !== last) { last = active; items.forEach((it, i) => it.classList.toggle("on", i === active)); }
  }
  (function loop() { requestAnimationFrame(loop); update(); })();
  window.__camadas = update;
}

/* ---------------- serviços: linhas + foto que segue o cursor ---------------- */
export const SERVICOS = [
  { n: "PPF", d: "Película de proteção de pintura, autorregenerativa, cortada por plotter para cada peça.", img: "img/ig/p06-clearplex.jpg", tag: "proteção" },
  { n: "ClearPlex", d: "Película para o para-brisa: absorve o impacto que viraria trinca.", img: "img/ig/p06-clearplex.jpg", tag: "proteção" },
  { n: "Vitrificação cerâmica", d: "Camada hidrofóbica sobre a pintura e o PPF. Brilho profundo, limpeza fácil.", img: "img/ig/p01-detalhe-verde.jpg", tag: "proteção" },
  { n: "Correção de pintura", d: "Descontaminação e polimento técnico em etapas, com medição de camada.", img: "img/ig/r11-bem-vindos.jpg", tag: "estética" },
  { n: "Lavagem técnica", d: "Dois baldes, pré-lavagem, secagem assistida. Sem risco novo.", img: "img/ig/r05-experiencia.jpg", tag: "estética" },
  { n: "Funilaria artesanal", d: "Martelinho de ouro e reparos sem repintura, com a pintura original preservada.", img: "img/ig/p08-proposta.jpg", tag: "estética" },
  { n: "Mecânica e revisão", d: "Técnicos formados na rede BMW, ferramental homologado, para qualquer marca.", img: "img/ig/r03-servicos.jpg", tag: "performance" },
  { n: "Personalização", d: "Rodas, freios, escape, interior. Projeto por carro, registrado no portal.", img: "img/ig/r02-bandcup.jpg", tag: "performance" },
];
export function initServicos() {
  const list = document.getElementById("svList"), hv = document.getElementById("hvImg"), hvImg = hv.querySelector("img");
  list.innerHTML = SERVICOS.map((s, i) => `
    <li class="sv-row" data-i="${i}">
      <span class="sv-idx mono">${String(i + 1).padStart(2, "0")}</span>
      <h3 class="sv-name">${s.n}</h3>
      <p class="sv-desc">${s.d}</p>
      <span class="sv-tag mono">[ ${s.tag} ]</span>
      <span class="sv-arrow" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 17 17 7M8 7h9v9" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
    </li>`).join("");
  if (matchMedia("(hover: none)").matches) return;
  let mx = 0, my = 0, cx = 0, cy = 0, vx = 0, on = false;
  list.addEventListener("pointermove", (e) => { vx = e.clientX - mx; mx = e.clientX; my = e.clientY; }, { passive: true });
  list.querySelectorAll(".sv-row").forEach((row) => {
    row.addEventListener("pointerenter", () => { hvImg.src = SERVICOS[row.dataset.i].img; hv.classList.add("on"); on = true; });
  });
  list.addEventListener("pointerleave", () => { hv.classList.remove("on"); on = false; });
  (function loop() {
    requestAnimationFrame(loop);
    if (!on && Math.abs(cx - mx) < 0.5) return;
    cx += (mx - cx) * 0.12; cy += (my - cy) * 0.12; vx *= 0.9;
    hv.style.transform = `translate(${cx + 24}px, ${cy - 150}px) rotate(${clamp(vx * 0.4, -10, 10)}deg)`;
  })();
}

/* ---------------- OS ao vivo (Relay: "A Tuesday, seen from Relay") ---------------- */
export function initOS() {
  const arc = document.getElementById("osArc"), pct = document.getElementById("osPct"), steps = [...document.querySelectorAll("#osSteps li")], log = document.getElementById("osLog");
  const LOG = [
    ["14:02", "Vistoria 360° concluída · 48 fotos"],
    ["14:11", "Descontaminação química e mecânica"],
    ["14:32", "Correção de pintura · etapa 2/3"],
    ["14:40", "Medição de camada: 112 µm (ok)"],
    ["15:05", "Corte do PPF no plotter · capô"],
    ["15:18", "Aplicação do PPF · para-choque"],
    ["15:46", "Cura · 2h restantes"],
  ];
  const sec = document.getElementById("portal");
  let started = false, i = 0, target = 0, cur = 0;
  function addLine() {
    const [t, m] = LOG[i % LOG.length];
    const li = document.createElement("li"); li.innerHTML = `<span>${t}</span>${m}`;
    log.prepend(li);
    while (log.children.length > 4) log.lastChild.remove();
    const step = Math.min(steps.length - 1, Math.floor((i % LOG.length) / LOG.length * steps.length) + 1);
    steps.forEach((s, k) => { s.classList.toggle("done", k < step); s.classList.toggle("now", k === step); });
    target = 18 + ((i % LOG.length) / (LOG.length - 1)) * 60;
    i++;
  }
  (function loop() {
    requestAnimationFrame(loop);
    cur += (target - cur) * 0.04;
    arc.style.strokeDashoffset = 100 - cur;
    pct.textContent = Math.round(cur) + "%";
  })();
  const io = new IntersectionObserver((es) => { if (es[0].isIntersecting && !started) { started = true; io.disconnect(); addLine(); setInterval(addLine, 2600); } }, { threshold: 0.3 });
  io.observe(sec);
}

/* ---------------- marcas ---------------- */
export const MARCAS = ["BMW", "Mercedes-Benz", "Porsche", "Audi", "Land Rover", "Volvo", "Jaguar", "MINI", "Lexus", "Toyota", "Honda", "Jeep", "RAM", "Tesla", "BYD", "Ferrari", "Lamborghini", "Ford Mustang", "Corvette"];
export function initMarcas() {
  const fill = (id, lista) => { const t = document.getElementById(id); const h = lista.map((m) => `<span>${m}</span>`).join(""); t.innerHTML = h + h; };
  const meio = Math.ceil(MARCAS.length / 2);
  fill("mkRow1", MARCAS.slice(0, meio)); fill("mkRow2", MARCAS.slice(meio));
}

/* ---------------- configurador de proteção ---------------- */
export const ZONAS = {
  parachoque: { nome: "Para-choque dianteiro", preco: 1700 },
  capo: { nome: "Capô", preco: 1900 },
  farois: { nome: "Faróis (par)", preco: 600 },
  paralamas: { nome: "Para-lamas dianteiros (par)", preco: 1400 },
  retrovisores: { nome: "Retrovisores (par)", preco: 450 },
  teto: { nome: "Colunas e teto", preco: 1200 },
  portas: { nome: "Portas e laterais", preco: 2600 },
  traseira: { nome: "Traseira", preco: 1600 },
};
export const PACOTES = {
  frente: { zonas: ["parachoque", "capo", "farois", "paralamas", "retrovisores"], desconto: 0.10, nome: "Frente completa" },
  inteiro: { zonas: Object.keys(ZONAS), desconto: 0.15, nome: "Carro inteiro" },
};
export const CATEGORIAS = { hatch: { nome: "Hatch", fator: 1 }, seda: { nome: "Sedã / cupê", fator: 1.12 }, suv: { nome: "SUV", fator: 1.25 } };
export const ADICIONAIS = { ceramica: { nome: "Vitrificação cerâmica", preco: 900 } };
export const brl = (v) => "R$ " + Math.round(v).toLocaleString("pt-BR");
export function calcular({ zonas, categoria, ceramica }) {
  const fator = CATEGORIAS[categoria].fator;
  let base = zonas.reduce((s, z) => s + ZONAS[z].preco, 0) * fator, pacote = null;
  for (const [id, p] of Object.entries(PACOTES)) if (p.zonas.every((z) => zonas.includes(z)) && (!pacote || p.desconto > PACOTES[pacote].desconto)) pacote = id;
  if (pacote) base *= 1 - PACOTES[pacote].desconto;
  const extra = ceramica && zonas.length ? ADICIONAIS.ceramica.preco * fator : 0;
  return { total: base + extra, pacote, extra };
}
export function initConfigurador() {
  const svg = document.getElementById("cfCar"), list = document.getElementById("cfOpts"), catBox = document.getElementById("cfCat");
  const addon = document.getElementById("cfCeramica"), totalEl = document.getElementById("cfTotal"), countEl = document.getElementById("cfCount"), send = document.getElementById("cfSend");
  document.getElementById("cfCeramicaPreco").textContent = "+ " + brl(ADICIONAIS.ceramica.preco);
  const state = { zonas: new Set(), categoria: "seda", ceramica: false };
  for (const [id, z] of Object.entries(ZONAS)) {
    const li = document.createElement("li");
    li.className = "cf-opt"; li.dataset.zone = id; li.setAttribute("role", "checkbox"); li.setAttribute("aria-checked", "false"); li.tabIndex = 0;
    li.innerHTML = `<i></i><span><b>${z.nome}</b><small>a partir de ${brl(z.preco)}</small></span>`;
    list.appendChild(li);
  }
  const zoneNodes = [...svg.querySelectorAll(".zone")], optNodes = [...list.querySelectorAll(".cf-opt")];
  function render() {
    const zonas = [...state.zonas];
    zoneNodes.forEach((n) => n.classList.toggle("on", state.zonas.has(n.dataset.zone)));
    optNodes.forEach((n) => { const on = state.zonas.has(n.dataset.zone); n.classList.toggle("on", on); n.setAttribute("aria-checked", String(on)); });
    const { total, pacote } = calcular({ zonas, categoria: state.categoria, ceramica: state.ceramica });
    totalEl.textContent = brl(total);
    const n = zonas.length;
    countEl.textContent = n === 0 ? "nenhuma área" : (pacote ? `${PACOTES[pacote].nome} · ` : "") + `${n} ${n === 1 ? "área" : "áreas"}${state.ceramica ? " + cerâmica" : ""}`;
    send.classList.toggle("off", n === 0);
    const msg = `Olá! Montei minha proteção no site da Agulhas Negras Service:\n• Áreas: ${zonas.map((z) => ZONAS[z].nome).join(", ")}${state.ceramica ? "\n• + Vitrificação cerâmica" : ""}\n• Carro: ${CATEGORIAS[state.categoria].nome}\n• Estimativa: ${brl(total)}\nQuero agendar uma avaliação.`;
    send.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`;
  }
  const toggle = (id) => { state.zonas.has(id) ? state.zonas.delete(id) : state.zonas.add(id); render(); };
  zoneNodes.forEach((n) => n.addEventListener("click", () => toggle(n.dataset.zone)));
  optNodes.forEach((n) => { n.addEventListener("click", () => toggle(n.dataset.zone)); n.addEventListener("keydown", (e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); toggle(n.dataset.zone); } }); });
  catBox.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => { state.categoria = b.dataset.cat; catBox.querySelectorAll("button").forEach((x) => { const on = x === b; x.classList.toggle("on", on); x.setAttribute("aria-checked", String(on)); }); render(); }));
  document.querySelectorAll(".pack").forEach((b) => b.addEventListener("click", () => { const id = b.dataset.pack; state.zonas = new Set(id === "limpar" ? [] : PACOTES[id].zonas); if (id === "limpar") { state.ceramica = false; addon.checked = false; } render(); }));
  addon.addEventListener("change", () => { state.ceramica = addon.checked; render(); });
  render();
  window.__config = { state, render, calcular };
}

/* ---------------- modal "Agendar" + menu ---------------- */
export function initModal({ lock, unlock }) {
  const modal = document.getElementById("modal"), panel = modal.querySelector(".md-panel"), form = modal.querySelector("form"), ok = modal.querySelector(".md-ok");
  let lastFocus = null;
  function open() { lastFocus = document.activeElement; modal.hidden = false; requestAnimationFrame(() => modal.classList.add("on")); lock(); setTimeout(() => form.querySelector("input")?.focus(), 350); }
  function close() { modal.classList.remove("on"); unlock(); setTimeout(() => { modal.hidden = true; form.hidden = false; ok.hidden = true; form.reset(); lastFocus?.focus?.(); }, 350); }
  document.querySelectorAll("[data-modal]").forEach((b) => b.addEventListener("click", open));
  modal.querySelectorAll("[data-close]").forEach((b) => b.addEventListener("click", close));
  modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) close(); });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const msg = `Olá! Quero agendar uma avaliação na Agulhas Negras Service.\n• Nome: ${f.get("nome")}\n• Carro: ${f.get("carro")}\n• Serviço: ${f.get("servico")}${f.get("obs") ? `\n• Obs: ${f.get("obs")}` : ""}`;
    const a = document.createElement("a"); a.href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(msg)}`; a.target = "_blank"; a.rel = "noopener"; a.click();
    form.hidden = true; ok.hidden = false;
  });
  // menu overlay (celular)
  const menu = document.getElementById("menu"), burger = document.getElementById("burger");
  const openMenu = () => { menu.hidden = false; requestAnimationFrame(() => menu.classList.add("on")); burger.setAttribute("aria-expanded", "true"); lock(); };
  const closeMenu = () => { menu.classList.remove("on"); burger.setAttribute("aria-expanded", "false"); unlock(); setTimeout(() => (menu.hidden = true), 400); };
  burger.addEventListener("click", () => (menu.hidden ? openMenu() : closeMenu()));
  menu.querySelectorAll("a, [data-close]").forEach((a) => a.addEventListener("click", () => { closeMenu(); if (a.hasAttribute("data-modal")) setTimeout(open, 420); }));
  return { open, close };
}

/* ---------------- nav + relógio ---------------- */
export function initNav() {
  const nav = document.getElementById("nav"), clock = document.getElementById("clock");
  const upd = () => nav.classList.toggle("scrolled", scrollY > 40);
  addEventListener("scroll", upd, { passive: true }); upd();
  const tick = () => { const d = new Date(); clock.textContent = `São Paulo · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };
  tick(); setInterval(tick, 1000 * 20);
}
