# Biblioteca de Babel

Jogo Idle/Incremental inspirado no conto de Jorge Luis Borges. O recurso base são **Letras**, acumuladas para comprar geradores em camadas.

## Como jogar

1. Abra `index.html` no navegador (ou use um servidor local).
2. Compre **Escribas** (10 Letras) para gerar Letras automaticamente.
3. **Tradutores** geram Escribas, que por sua vez geram mais Letras.
4. **Linguistas** geram Tradutores, criando uma cadeia de produção em cascata.

## Estrutura

- **game.js** – Lógica do jogo: classe `Generator`, game loop a 60fps, formatação de números
- **styles.css** – Interface com tema biblioteca/pergaminho e efeito glitch
- **break_eternity.js** – Biblioteca para números muito grandes (via CDN)

## Tecnologias

- HTML5, CSS3, JavaScript
- [break_eternity.js](https://github.com/Patashu/break_eternity.js) para precisão com números extremos
