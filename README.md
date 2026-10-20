# Agulhas Negras Service — prévia "A luz que revela"

Landing page de prévia para o Agulhas Negras Service (centro automotivo premium, todas as marcas: proteção, estética e performance). Metáfora: a luz de inspeção que revela a pintura; a águia que enxerga o que quase ninguém vê. Um feixe de luz atravessa o site inteiro e o cursor revela o que toca.

Site estático, sem build. Abra por um servidor local (`python -m http.server 4190`, ou a configuração `agulhas-negras` em `.claude/launch.json`) ou pelo GitHub Pages.

## Mecânicas e de onde vieram

| Seção | Mecânica | Referência estudada |
|---|---|---|
| Loader | Fotos do Instagram dadas como cartas; anel conta `000 → 100` e se dobra na águia; painel sobe | Northwall + Relay + Lumora (GetLayers) |
| Feixe de luz | `js/fx/stream.js`: um fragment shader WebGL2, 20 fibras (núcleo + bainha), pulsos que entram por uma borda, cursor agarra o feixe; ângulo/posição/alpha interpolados por seção (`KEYS` em `js/main.js`) | Light Cables (Originkit) + feixe único do Relay |
| Hero · ignição | Sequência de 120 frames (M3 CS vindo pra câmera, faróis acendendo) desenhada num canvas conforme o scroll (`js/fx/car.js`, frames em `img/hero/d` 1920 e `img/hero/m` recorte 900). Depois do loader toca sozinho até os faróis acenderem; o resto é scroll. Fonte: vídeo 4K em `capturas/hero-video/original.mp4` | Scroll-sequence estilo Apple |
| Hero · texto | Título, botões e leque de cartas sobem por cima do carro, que escurece; a carta da direita tem o **liquid reveal** (`js/fx/reveal.js`) | Lumora |
| Capítulos | Palavras gigantes nos cantos sobre a foto, scrubbadas pelo scroll | House |
| Camadas | Vista explodida em CSS 3D, labels que decodificam de ruído, grade acende sob o cursor | Artefakt |
| Serviços | Linhas que enchem no hover, foto segue o cursor | Lumora + Originkit (hover image reveal) |
| Portal | OS ao vivo: anel de progresso, etapas, log que cresce, janela inclinada | Relay ("A Tuesday, seen from Relay") |
| Números | Painel claro com count-up por progresso de scroll | Lumora |
| Configurador | Vista superior com zonas clicáveis, pacotes, categoria, estimativa, mensagem pronta pro WhatsApp | próprio |
| Fechamento | Cartão cheio na cor da luz com placa da águia; modal "Agendar" monta mensagem pro WhatsApp | Relay (rodapé) + Lumora (modal) |

Detalhes das referências: `docs/REFERENCIAS.md`. Prompt integral do Lumora: `docs/refs/lumora-prompt.md`. Design system do ui-ux-pro-max: `design-system/agulhas-negras-service/MASTER.md`.

## Estrutura

| Arquivo | O quê |
|---|---|
| `index.html` | Conteúdo e seções |
| `css/style.css` | Tokens, base, loader, nav, seções, overlays, responsivo |
| `js/main.js` | Boot: Lenis, loader, feixe guiado pelo scroll, hero, inicialização das seções |
| `js/fx/stream.js` | Feixe de luz (shader) |
| `js/fx/reveal.js` | Liquid reveal (canvas 2D) |
| `js/fx/text.js` | Decode de labels, palavras que sobem, reveals, contadores por scroll |
| `js/sections.js` | Capítulos, camadas, serviços (`SERVICOS`), OS ao vivo, marcas (`MARCAS`), configurador (`ZONAS`, `PACOTES`, `CATEGORIAS`, `ADICIONAIS`), modal, menu, nav, `WHATSAPP` |
| `img/ig/` | Fotos públicas do @agulhasnegrasservice (640px) e versões "antes" geradas; `img/logo-mask.png` = águia com alfa a partir da foto de perfil |
| `capturas/` | Folhas de contato das referências (`refs/`), script de download do Instagram, capturas de verificação |
| `_v1-descartada/` | Primeira versão (cópia do Vértice), rejeitada; só histórico |

## Trocar quando o material oficial chegar

- Logo vetor: substituir `img/logo-mask.png` (ou trocar por SVG nos `<img>` que o usam).
- Fotos em 1080+: mesmos nomes em `img/ig/`; regenerar as versões "-antes" com `capturas/baixar_ig.py` (função `before`).
- Serviços, preços e marcas: `js/sections.js`.
- WhatsApp e endereço: `WHATSAPP` em `js/sections.js` e os links `wa.me` em `index.html` (hoje: pós-vendas da concessionária, 11 4122-8222).

## Verificação

Playwright: `scrollTo` + evento `scroll` + espera ~1,4 s + screenshot (o pane do Claude oculto devolve frame preto). Hooks headless: `window.__ready`, `__stream`, `__reveal`, `__camadas`, `__config`. Conferido em 1440×900 e 390×844, sem erros de console.
