# Prompt gratuito do layer "Lumora" (GetLayers) — referência de como eles especificam um site

Copiado em 2026-10-20 do botão "Copy prompt" do layer gratuito (licença comercial). Guardado como referência de método: grid adaptativo em rem, helper de mola, reveals de texto, loader, **liquid reveal** (antes/depois pelo cursor), linhas de serviço com hover-fill, painel de números com count-up por progresso de scroll, modal de pedido. Trechos-chave (o texto integral tem ~45 KB; o essencial está abaixo).

## Shell

- Única `index.html`, sem build; ES modules + importmap só para Lenis (`https://unpkg.com/lenis@1.3.23/dist/lenis.mjs`).
- `window.scrollTo(0,0)` no load; `new Lenis({ smoothWheel:true })` com raf manual.
- Scroll lock: `lenis.stop()` + `html{position:relative;overflow:hidden;height:100%}`; `lenis.start()` remove.
- Grid em rem: `@media (max-width:1920px){html{font-size:.833333vw}} 1440→1.111111vw, 1024→1.5625vw, 640→4.444444vw`; acima de 1920 escala por JS (`coef 0.6666`).
- Reset: `*{box-sizing:border-box;margin:0;padding:0}`, `:focus-visible{outline:2px solid <accent>}`, `prefers-reduced-motion` mata animações.

## Molas (react-spring → rAF)

`accel = tension*(target-x) - friction*v`, dt≈1/60, assenta em `|target-x|<.001 && |v|<.001`. Equivalências CSS: `{210,26}` ≈ `cubic-bezier(.22,1,.36,1)` 0.7s; `{200,24}`/`{180,26}` ≈ `cubic-bezier(.16,1,.3,1)` 0.8s; hovers `{320,18}` ≈ 0.35s `cubic-bezier(.2,.8,.2,1)`. Hovers desligados no touch.

## Reveals de texto (uma vez, IntersectionObserver, gated no loader)

- Linha: span `overflow:hidden`, inner `translateY(100%→0)` + opacity, stagger por linha (`lineStagger 120ms`), 900ms easeOutCubic `cubic-bezier(.215,.61,.355,1)`.
- Palavra: `translateY(24px→0)` + opacity, stagger 35ms, 700ms easeOutQuart `cubic-bezier(.165,.84,.44,1)`.

## Loader

Painel fixo `#0a0a0a`, `border-radius:0 0 2rem 2rem`, z 120. Logo + tagline; trilho de 1px com fill na cor de acento, contador `000→100` em 1300ms easeInOutCubic, tabular, zero-padded. Ao chegar em 100: painel sobe `translateY(-100%)` ({220,30} ≈ .7s), conteúdo some (`opacity 0, translateY -12px`); no fim seta `ready`, libera scroll, remove do DOM. Todo reveal do hero espera `ready`.

## Liquid reveal (hero antes/depois) — mecânica exata

- Contêiner com `<img>` base (sempre visível, LCP) + `<canvas>` por cima que pinta a segunda imagem no rastro do cursor.
- `brushRadius = 143` px CSS, `decay = 0.016` por frame, `dpr = min(devicePixelRatio, 2)`.
- Canvas principal no tamanho do contêiner × dpr; offscreen "cover" com a segunda imagem em object-fit cover; "brush" offscreen quadrado `diam = ceil(radius*2)`.
- `pointermove` na window → coordenadas × dpr; ignora pontos a mais de `radius` fora; interpola entre último ponto e novo com `step = max(radius*.3, 1)`, `n = min(ceil(dist/step), 60)`.
- Tick (rAF): se há pontos `idle=0`, senão `idle++` e sai após 120. `fade = drawing ? decay : min(decay + idle*.004, .5)`; `destination-out` + `fillRect` com `rgba(0,0,0,fade)` (o rastro decai). Se desenhando: `stamp` cada ponto. Em `idle == 120`: `clearRect` total.
- `stamp(x,y)`: no brush: clear, gradiente radial (0 → 1, .55 → .82, 1 → 0), fill; `source-in` + `drawImage(cover, x-c, y-c, diam, diam, 0, 0, diam, diam)`; no canvas principal `source-over` + `drawImage(brush, x-c, y-c)`.
- `prefers-reduced-motion`: sem canvas, só a imagem base.

## Seções

- Hero: vinheta `linear-gradient(to bottom, rgba(255,255,255,.35), transparent, rgba(255,255,255,.35))`; marca d'água `13rem` com `opacity .4`; coluna esquerda com eyebrow (ponto + texto), H1 em 3 linhas (`max-width:18ch`, `line-height:.98`, `letter-spacing:-.02em`), linha de avaliação (5 estrelas + "200+ brands shipped"), 2 pílulas; coluna direita com card-carrossel de vidro (`backdrop-filter: blur(12px)`, ring 1px) e grade de parceiros; barra de status embaixo (`Working since 2014 · Remote-first · Scroll to explore ↓`).
- Faixa de pílulas "We / Build / → / Better": 4 pílulas `height:10rem`, variantes light/accent-gradient/dark/ghost, hover `scale 1.03`.
- Portfolio: cards pretos `border-radius:2rem`, `min-height:26rem`, badge seta que gira 45° no hover do card, marca d'água central.
- Serviços: linhas com `border-top:1px solid`, hover enche `rgba(241,240,238,1)` e desloca padding (`1.5rem→2rem`), índice `01`, título `2.25rem`, seta em círculo que anda `translateX 5px`.
- Números: painel preto `border-radius:2rem`, count-up por progresso de scroll (`start "top bottom"` → `end "center center"`, `round(progress*valor)`, throttle 30ms).
- Rodapé preto: CTA grande + pílula light, 4 colunas, legal, marca d'água `13rem` a `rgba(255,255,255,.05)`.
- Menu overlay full-screen com itens `3.75rem` entrando em stagger 45ms; modal de pedido com backdrop `blur(16px)`, painel `max-width:32rem`, submit stub → estado de sucesso.

## Tokens do Lumora (só pra referência de escala)

`--radius-pill:9999px --radius-card:2rem --radius-card-sm:1.25rem --radius-control:.875rem --text-watermark:13rem --container-shell:88rem`. Breakpoints sm 640 / md 768 / lg 1024. Fonte única Onest 400–700.

Assets do Lumora ficam em `https://api.getlayers.ai/storage/v1/object/public/public/assets/lumora-e8b711fc68/hero/{before,after}.jpg` (não usar; só o método).
