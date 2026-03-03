# A Biblioteca de Babel

Jogo Idle/Incremental inspirado no conto de Jorge Luis Borges. O recurso base são **Letras**, acumuladas para comprar geradores em camadas.

## Como jogar

1. Execute `npm run dev` e abra http://localhost:5173
2. Compre **Palavras** (10 Letras) para gerar Letras automaticamente.
3. **Frases** geram Palavras, que por sua vez geram mais Letras.
4. **Parágrafos** geram Frases, criando uma cadeia de produção em cascata.

## Estrutura

- **src/game/** – Lógica do jogo: classe `Generator`, formatação de números
- **src/components/** – Componentes React (LetterCounter, GeneratorButton, etc.)
- **src/hooks/** – `useGameState`, `useGameLoop`
- **break_eternity.js** – Biblioteca para números muito grandes (via CDN)

## Tecnologias

- React, Vite
- [break_eternity.js](https://github.com/Patashu/break_eternity.js) para precisão com números extremos

## Scripts

- `npm run dev` – Servidor de desenvolvimento
- `npm run build` – Build de produção
- `npm run preview` – Preview do build
