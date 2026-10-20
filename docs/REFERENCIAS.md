# Referências estudadas (2026-10-20)

Material em `capturas/refs/<layer>/` (vídeo de demo do GetLayers + folhas de contato extraídas com ffmpeg, 1 frame/s) e `capturas/ig-sheet.jpg` (fotos públicas do @agulhasnegrasservice, 640px). Prompt completo e gratuito do layer Lumora em `docs/refs/lumora-prompt.md` (mostra como o GetLayers especifica um site: grid em rem, molas, reveals, loader, liquid reveal).

## GetLayers — o que cada layer faz e o que levo

| Layer | Mecânica vista no vídeo | Levo para o Service |
|---|---|---|
| **Relay** (preto + lima) | Um único feixe de luz em fitas atravessa o site inteiro, do hero ao rodapé. Anel lima conta a página e se dobra no logo. Hero: janela de vidro inclinada com um fluxo rodando ao vivo. Labels mono `[ · ]`. Cards "Boring in the ways that matter". Dashboard "A Tuesday, seen from Relay" com anel 75%. Números grandes com sparkline. Rodapé: cartão cheio na cor de acento com placa do logo e um input. | O feixe contínuo (vira "luz de inspeção" que revela a pintura), o anel que conta e vira a águia, a janela de vidro inclinada com a OS ao vivo, o rodapé-cartão na cor de acento. |
| **Lumora** (prompt completo) | Loader `000→100` que sobe. Hero full-bleed com **liquid reveal**: o cursor pinta uma segunda foto sobre a primeira (pincel radial, decay 0.016, raio 143). Marca d'água gigante. Faixa de pílulas "We / Build / → / Better". Linhas de serviço que preenchem no hover. Painel preto de números com count-up por progresso de scroll. Modal de pedido. | Liquid reveal = **antes/depois do polimento e PPF** (a parte mais vendedora para detailing). Linhas de serviço, painel de números, modal "Agendar". |
| **Artefakt** (near-black, grade) | Grade/lattice que acende sob o cursor. Jaqueta 3D segue o cursor. Labels mono "decodificam" de ruído. Seção **"Technology engineered to endure"**: camadas da jaqueta em vista explodida, flutuando com linhas de chamada. | A vista explodida das **camadas de proteção** (correção → PPF → cerâmica), grade sob o cursor, labels que decodificam. |
| **House** | Fly-through scrubbado pelo scroll sobre foto/vídeo full-bleed, palavras gigantes presas nos cantos ("Harmony / in / House", "Precision / through / Detail"), números sobre foto, rodapé com wordmark letra a letra. | Palavras gigantes nos cantos sobre as fotos deles: "Proteção / Estética / Performance". |
| **Northwall** | Monograma enche como medidor no loader; fotos distribuídas como cartas, a última cresce e vira o hero; 5 passos de processo que desfocam atrás de uma foto que inclina para a mão. | Fotos do Instagram "dadas como cartas" no loader; processo em 5 passos com foto inclinando. |
| **Codescan** | Lente segue o cursor e faz foco (rack focus) no que você toca. | Foco por cursor na galeria. |
| **AI Studio** | Estrela cromada, scroll cinematográfico, celulares em leque, galeria atravessada. | Já usado no Vértice: **não repetir**. |
| **Clarix** | Logo que se monta de milhares de partículas. | Águia montando de partículas no fechamento (opcional). |

## Originkit (originkit.dev) — catálogo relevante

Biblioteca React/Framer com CLI (`npx originkit add <slug>`); código fechado sem login, mas as fichas descrevem a mecânica. Categorias: Background (253), Interactive Elements (118), Animations (78), Image Gallery (46), Text (83), Cursor (23), Sections (92: hero 48–55, stats, cta, testimonials).

- **Light Cables** (Hero 48): até 48 tubos de fibra em um só fragment shader (triângulo full-screen), núcleo brilhante + bainha suave, pulsos que entram por uma borda e morrem antes da outra, cursor "agarra" o feixe por janela gaussiana, dither por hash para não banding. Base do nosso feixe de luz.
- **Cursor Ring Field**: campo de cápsulas, anel segue o cursor e empurra pontos (estado em textura float).
- **Kinetic Grid**, **Aura Cursor**, **Axis Cursor**: cursores.
- **Hover Image Reveal**, **Cursor Image Trail**, **Spotlight Frames**, **Gallery Tunnel**, **Circular Gallery**: galerias.
- **Mask Text Reveal**, **Focus Reveal**, **Flicker Text**, **Random Letter Swap**: texto.
- **Glassbound**, **Scroll Wave Field**, **Accretion Disc**, **Hex Shaft**, **Mosaic Lens**: fundos.

## ui-ux-pro-max

`design-system/agulhas-negras-service/MASTER.md`. Padrão: Immersive/Interactive (CTA após a interação + opção de pular; fallback mobile obrigatório). Estilo: Modern Dark cinematográfico (sem #000 puro, hairlines rgba, blur 20, ease `cubic-bezier(.16,1,.3,1)`, raio 16). Tipografia sugerida para luxo: Bodoni Moda/Jost ou Space Grotesk/DM Sans; automotivo: Syncopate/Space Mono. Checklist: sem emoji como ícone, hover 150–300ms, contraste 4.5:1, foco visível, reduced-motion, 375/768/1024/1440.

## Instagram @agulhasnegrasservice

Bio: "Seu carro. Nosso padrão de excelência. Centro automotivo premium • Para todas as marcas. Proteção • Estética • Performance. São Paulo." Legendas (tom da marca): "enxergar o que quase ninguém vê", "Diferentes marcas. Diferentes histórias. O mesmo cuidado.", "Tudo o que o seu carro precisa, em um só lugar.", "Estética, proteção, manutenção e personalização", ClearPlex (película de para-brisa), Valentina Piaz (piloto de drift) nas boas-vindas. Fotos em `img/ig/` (640px, públicas, sem login não há 1080).
