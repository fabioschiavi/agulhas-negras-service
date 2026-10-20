# Agulhas Negras Service — prévia de landing page

Data: 2026-10-20. Conceito aprovado: **"A luz que revela"**. A primeira versão (direção "Camadas" sobre o motor cinema-scroll do Vértice) foi rejeitada por repetir a estrutura do Vértice e está em `_v1-descartada/`.

## Quem é o cliente

Agulhas Negras Service é o braço de serviços da BMW Agulhas Negras (rede BMW desde 1998, São Bernardo + Ibirapuera). Posicionamento no Instagram: **centro automotivo premium, para todas as marcas: Proteção · Estética · Performance**. Tom das legendas: "enxergar o que quase ninguém vê", "Diferentes marcas. Diferentes histórias. O mesmo cuidado.", "Tudo o que o seu carro precisa, em um só lugar." Logo: águia dentro de um anel, branca sobre preto.

## Conceito

Detailing é luz de inspeção revelando a pintura; a águia é visão. Um feixe de luz atravessa o site inteiro (Relay) e o cursor revela o que toca (Lumora). Nada de carrossel de concessionária: a página vende confiança em camadas de proteção e acompanhamento ao vivo.

## Seções (ordem)

0. **Loader**: fotos do Instagram dadas como cartas; anel conta 000 → 100 e se dobra na águia; painel sobe. Reveals do hero esperam o loader.
1. **Hero**: feixe de luz; headline "Enxergar o que quase *ninguém vê.*"; janela de vidro inclinada com antes/depois no cursor (BMW M3 verde opaca → polida); barra de status.
2. **Capítulos**: Proteção *que se vê* · Estética *que se sente* · Performance *que se ouve*, palavras nos cantos sobre fotos deles, scrubbadas.
3. **Camadas**: vista explodida (pintura corrigida → PPF → cerâmica → manutenção), labels decodificando, grade sob o cursor.
4. **Serviços** (do Instagram): PPF, ClearPlex, vitrificação, correção de pintura, lavagem técnica, funilaria artesanal, mecânica e revisão, personalização. Linhas com hover-fill e foto no cursor.
5. **Portal**: OS ao vivo em janela de vidro (anel, etapas, foto de agora, log).
6. **Números**: painel claro com count-up por scroll.
7. **Marcas**: três fotos do centro + marquee de marcas (texto, sem logos de terceiros).
8. **Configurador**: zonas clicáveis, pacotes, categoria, estimativa, WhatsApp.
9. **Fechamento**: cartão na cor da luz com placa da águia; modal "Agendar" que monta a mensagem do WhatsApp.

## Visual

- Preto profundo `#050607` (sem #000 puro), prata, luz branco-gelo `#e6f6ff` / `#9fd8f5`. Hairlines rgba, raio 16/24/32, ease `cubic-bezier(.16,1,.3,1)`.
- Instrument Sans (display e texto), Instrument Serif itálico em uma palavra por título, JetBrains Mono em labels `[ · ]`.
- Fotos: só reais, do Instagram deles (640px até chegarem as originais). Sem imagem gerada por IA.
- Mobile: feixe com menos fibras e DPR 1; hover desligado; capítulos e camadas simplificados; menu overlay.

## Placeholders a trocar

- Logo vetor oficial; fotos em alta; serviços e preços reais; WhatsApp e endereço do Service; lista de marcas.

## Técnica

Estático, sem build: HTML + CSS + ES modules, Lenis por CDN, WebGL2 puro para o feixe, canvas 2D para o liquid reveal. Verificação por Playwright (`capturas/`).
