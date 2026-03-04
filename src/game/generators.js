import { Generator } from './Generator';

/**
 * Configuração das 5 linhas de produção:
 * - Linha 1 (Letras): 3 recursos / 2s base - tema: escrita/literatura
 * - Linha 2 (Símbolos): 4 recursos / 3s base - tema: místico/arcano
 * - Linha 3 (Ecos): 5 recursos / 4s base - tema: som/vibração
 * - Linha 4 (Memórias): 6 recursos / 5s base - tema: tempo/consciência
 * - Linha 5 (Essências): 7 recursos / 6s base - tema: fundamental/cósmico
 */

const PRODUCTION_LINES = {
  letters: { baseCycleMs: 2000, baseQty: 3, id: 'letters', name: 'Letras' },
  symbols: { baseCycleMs: 3000, baseQty: 4, id: 'symbols', name: 'Símbolos' },
  echoes: { baseCycleMs: 4000, baseQty: 5, id: 'echoes', name: 'Ecos' },
  memories: { baseCycleMs: 5000, baseQty: 6, id: 'memories', name: 'Memórias' },
  essences: { baseCycleMs: 6000, baseQty: 7, id: 'essences', name: 'Essências' },
};

function cycleMs(line, level) {
  return line.baseCycleMs * Math.pow(2, level - 1);
}

function qty(line, level) {
  return level + (line.baseQty - 1);
}

function createLineGenerators(line, generatorDefs) {
  const generators = [];
  let prev = null;
  
  for (const def of generatorDefs) {
    const gen = new Generator(
      def.level,
      def.name,
      def.cost,
      def.costMult,
      prev,
      def.flavor,
      cycleMs(line, def.level),
      qty(line, def.level),
      def.unlock || 0,
      def.prevCost || null,
      def.scribes || null,
      line.id
    );
    generators.push(gen);
    prev = gen;
  }
  
  return generators;
}

const LETTERS_DEFS = [
  { level: 1, name: 'Palavras', cost: 10, costMult: 1.15, flavor: 'A unidade mínima do pensamento.' },
  { level: 2, name: 'Frases', cost: 100, costMult: 1.2, flavor: 'Onde as ideias começam a respirar.', unlock: 25, prevCost: 10, scribes: 2 },
  { level: 3, name: 'Parágrafos', cost: 10e3, costMult: 1.25, flavor: 'Blocos de sentido no infinito.', unlock: 50, prevCost: 50, scribes: 3 },
  { level: 4, name: 'Páginas', cost: 10e9, costMult: 1.28, flavor: 'Folhas que guardam o tempo.', unlock: 100, prevCost: 100, scribes: 4 },
  { level: 5, name: 'Capítulos', cost: 100e12, costMult: 1.3, flavor: 'A divisão que organiza o caos.', unlock: 1000, prevCost: 1000, scribes: 5 },
  { level: 6, name: 'Livros', cost: 1e15, costMult: 1.32, flavor: 'Universos entre capas.', unlock: 100000, prevCost: 100000, scribes: 6 },
  { level: 7, name: 'Obras', cost: 1e18, costMult: 1.34, flavor: 'A marca do autor no eterno.', unlock: 10e6, prevCost: 10e6, scribes: 7 },
  { level: 8, name: 'Coleções', cost: 100e21, costMult: 1.36, flavor: 'Agrupamentos que transcendem.', unlock: 100e6, prevCost: 1e12, scribes: 8 },
  { level: 9, name: 'Prateleiras', cost: 100e24, costMult: 1.37, flavor: 'O primeiro ordenamento do infinito.', unlock: 1e9, prevCost: 100e12, scribes: 9 },
  { level: 10, name: 'Estantes', cost: 1e27, costMult: 1.38, flavor: 'Estruturas que sustentam mundos.', unlock: 10e9, prevCost: 1e18, scribes: 10 },
  { level: 11, name: 'Salas', cost: 10e30, costMult: 1.4, flavor: 'Espaços onde o conhecimento repousa.', unlock: 100e9, prevCost: 10e18, scribes: 11 },
  { level: 12, name: 'Galerias', cost: 100e33, costMult: 1.42, flavor: 'Corredores de infinidade.', unlock: 1e12, prevCost: 100e18, scribes: 12 },
  { level: 13, name: 'Pavilhões', cost: 1e36, costMult: 1.44, flavor: 'Templos do saber.', unlock: 10e12, prevCost: 1e21, scribes: 13 },
  { level: 14, name: 'Seções', cost: 100e36, costMult: 1.46, flavor: 'Divisões do cosmos literário.', unlock: 100e12, prevCost: 100e21, scribes: 14 },
  { level: 15, name: 'Níveis', cost: 1e39, costMult: 1.48, flavor: 'Camadas verticais do eterno.', unlock: 500e12, prevCost: 1e24, scribes: 15 },
  { level: 16, name: 'Torres', cost: 100e39, costMult: 1.5, flavor: 'Pilares que tocam o abismo.', unlock: 1e15, prevCost: 10e24, scribes: 16 },
  { level: 17, name: 'Alas', cost: 1e42, costMult: 1.5, flavor: 'Extensões do edifício universal.', unlock: 10e15, prevCost: 100e24, scribes: 17 },
  { level: 18, name: 'Blocos', cost: 100e42, costMult: 1.5, flavor: 'Fundações da biblioteca.', unlock: 50e15, prevCost: 1e27, scribes: 18 },
  { level: 19, name: 'Setores', cost: 10e45, costMult: 1.5, flavor: 'Regiões do conhecimento.', unlock: 200e15, prevCost: 100e27, scribes: 19 },
  { level: 20, name: 'Módulos', cost: 1e48, costMult: 1.5, flavor: 'Unidades do infinito.', unlock: 1e18, prevCost: 1e30, scribes: 20 },
  { level: 21, name: 'Complexos', cost: 100e48, costMult: 1.5, flavor: 'Conjuntos que espelham o todo.', unlock: 5e18, prevCost: 10e30, scribes: 21 },
  { level: 22, name: 'Edifícios', cost: 1e51, costMult: 1.5, flavor: 'Construções que abrigam o todo.', unlock: 25e18, prevCost: 1e33, scribes: 22 },
  { level: 23, name: 'Acervos', cost: 10e51, costMult: 1.5, flavor: 'A memória condensada.', unlock: 100e18, prevCost: 100e33, scribes: 23 },
  { level: 24, name: 'A Biblioteca', cost: 100e54, costMult: 1.5, flavor: 'O universo em forma de hexágono.', unlock: 500e18, prevCost: 1e36, scribes: 24 },
];

const SYMBOLS_DEFS = [
  { level: 1, name: 'Glifos', cost: 10, costMult: 1.15, flavor: 'Marcas que guardam segredos antigos.' },
  { level: 2, name: 'Runas', cost: 100, costMult: 1.2, flavor: 'Poder gravado em pedra.', unlock: 25, prevCost: 10, scribes: 2 },
  { level: 3, name: 'Sigilos', cost: 10e3, costMult: 1.25, flavor: 'Selos de energia concentrada.', unlock: 50, prevCost: 50, scribes: 3 },
  { level: 4, name: 'Inscrições', cost: 10e9, costMult: 1.28, flavor: 'Mensagens do além.', unlock: 100, prevCost: 100, scribes: 4 },
  { level: 5, name: 'Tábuas', cost: 100e12, costMult: 1.3, flavor: 'Leis cósmicas materializadas.', unlock: 1000, prevCost: 1000, scribes: 5 },
  { level: 6, name: 'Pergaminhos', cost: 1e15, costMult: 1.32, flavor: 'Conhecimento enrolado no tempo.', unlock: 100000, prevCost: 100000, scribes: 6 },
  { level: 7, name: 'Códices', cost: 1e18, costMult: 1.34, flavor: 'Tomos de sabedoria oculta.', unlock: 10e6, prevCost: 10e6, scribes: 7 },
  { level: 8, name: 'Grimórios', cost: 100e21, costMult: 1.36, flavor: 'Livros que contêm o impossível.', unlock: 100e6, prevCost: 1e12, scribes: 8 },
  { level: 9, name: 'Tomos', cost: 100e24, costMult: 1.37, flavor: 'Volumes de poder imenso.', unlock: 1e9, prevCost: 100e12, scribes: 9 },
  { level: 10, name: 'Compêndios', cost: 1e27, costMult: 1.38, flavor: 'Coletâneas do arcano.', unlock: 10e9, prevCost: 1e18, scribes: 10 },
  { level: 11, name: 'Tratados', cost: 10e30, costMult: 1.4, flavor: 'Acordos entre dimensões.', unlock: 100e9, prevCost: 10e18, scribes: 11 },
  { level: 12, name: 'Enciclopédias', cost: 100e33, costMult: 1.42, flavor: 'Todo o conhecimento oculto.', unlock: 1e12, prevCost: 100e18, scribes: 12 },
  { level: 13, name: 'Arquivos', cost: 1e36, costMult: 1.44, flavor: 'Registros do impossível.', unlock: 10e12, prevCost: 1e21, scribes: 13 },
  { level: 14, name: 'Repositórios', cost: 100e36, costMult: 1.46, flavor: 'Depósitos de mistérios.', unlock: 100e12, prevCost: 100e21, scribes: 14 },
  { level: 15, name: 'Câmaras', cost: 1e39, costMult: 1.48, flavor: 'Salas seladas pelo tempo.', unlock: 500e12, prevCost: 1e24, scribes: 15 },
  { level: 16, name: 'Criptas', cost: 100e39, costMult: 1.5, flavor: 'Onde o conhecimento dorme.', unlock: 1e15, prevCost: 10e24, scribes: 16 },
  { level: 17, name: 'Santuários', cost: 1e42, costMult: 1.5, flavor: 'Lugares sagrados do saber.', unlock: 10e15, prevCost: 100e24, scribes: 17 },
  { level: 18, name: 'Templos', cost: 100e42, costMult: 1.5, flavor: 'Monumentos ao infinito.', unlock: 50e15, prevCost: 1e27, scribes: 18 },
  { level: 19, name: 'Reinos', cost: 10e45, costMult: 1.5, flavor: 'Domínios do conhecimento.', unlock: 200e15, prevCost: 100e27, scribes: 19 },
  { level: 20, name: 'Dimensões', cost: 1e48, costMult: 1.5, flavor: 'Planos de existência.', unlock: 1e18, prevCost: 1e30, scribes: 20 },
  { level: 21, name: 'Universos', cost: 100e48, costMult: 1.5, flavor: 'Cosmos de possibilidades.', unlock: 5e18, prevCost: 10e30, scribes: 21 },
  { level: 22, name: 'Multiversos', cost: 1e51, costMult: 1.5, flavor: 'A soma de todas as realidades.', unlock: 25e18, prevCost: 1e33, scribes: 22 },
  { level: 23, name: 'Omniversos', cost: 10e51, costMult: 1.5, flavor: 'Além da compreensão.', unlock: 100e18, prevCost: 100e33, scribes: 23 },
  { level: 24, name: 'O Infinito', cost: 100e54, costMult: 1.5, flavor: 'O fim que é começo.', unlock: 500e18, prevCost: 1e36, scribes: 24 },
];

const ECHOES_DEFS = [
  { level: 1, name: 'Sussurros', cost: 10, costMult: 1.15, flavor: 'Sons que mal existem.' },
  { level: 2, name: 'Murmúrios', cost: 100, costMult: 1.2, flavor: 'Vozes que se formam.', unlock: 25, prevCost: 10, scribes: 2 },
  { level: 3, name: 'Vozes', cost: 10e3, costMult: 1.25, flavor: 'Pensamentos audíveis.', unlock: 50, prevCost: 50, scribes: 3 },
  { level: 4, name: 'Cantos', cost: 10e9, costMult: 1.28, flavor: 'Melodias primordiais.', unlock: 100, prevCost: 100, scribes: 4 },
  { level: 5, name: 'Hinos', cost: 100e12, costMult: 1.3, flavor: 'Louvores ao cosmos.', unlock: 1000, prevCost: 1000, scribes: 5 },
  { level: 6, name: 'Sinfonias', cost: 1e15, costMult: 1.32, flavor: 'Harmonias complexas.', unlock: 100000, prevCost: 100000, scribes: 6 },
  { level: 7, name: 'Óperas', cost: 1e18, costMult: 1.34, flavor: 'Narrativas sonoras.', unlock: 10e6, prevCost: 10e6, scribes: 7 },
  { level: 8, name: 'Orquestras', cost: 100e21, costMult: 1.36, flavor: 'Conjuntos que transcendem.', unlock: 100e6, prevCost: 1e12, scribes: 8 },
  { level: 9, name: 'Concertos', cost: 100e24, costMult: 1.37, flavor: 'Apresentações eternas.', unlock: 1e9, prevCost: 100e12, scribes: 9 },
  { level: 10, name: 'Festivais', cost: 1e27, costMult: 1.38, flavor: 'Celebrações de som.', unlock: 10e9, prevCost: 1e18, scribes: 10 },
  { level: 11, name: 'Ressonâncias', cost: 10e30, costMult: 1.4, flavor: 'Vibrações que permanecem.', unlock: 100e9, prevCost: 10e18, scribes: 11 },
  { level: 12, name: 'Frequências', cost: 100e33, costMult: 1.42, flavor: 'Padrões fundamentais.', unlock: 1e12, prevCost: 100e18, scribes: 12 },
  { level: 13, name: 'Ondas', cost: 1e36, costMult: 1.44, flavor: 'Propagações infinitas.', unlock: 10e12, prevCost: 1e21, scribes: 13 },
  { level: 14, name: 'Vibrações', cost: 100e36, costMult: 1.46, flavor: 'O tecido do som.', unlock: 100e12, prevCost: 100e21, scribes: 14 },
  { level: 15, name: 'Harmônicos', cost: 1e39, costMult: 1.48, flavor: 'Sobretons cósmicos.', unlock: 500e12, prevCost: 1e24, scribes: 15 },
  { level: 16, name: 'Reverberações', cost: 100e39, costMult: 1.5, flavor: 'Ecos que não cessam.', unlock: 1e15, prevCost: 10e24, scribes: 16 },
  { level: 17, name: 'Pulsações', cost: 1e42, costMult: 1.5, flavor: 'Batimentos universais.', unlock: 10e15, prevCost: 100e24, scribes: 17 },
  { level: 18, name: 'Ritmos', cost: 100e42, costMult: 1.5, flavor: 'Cadências eternas.', unlock: 50e15, prevCost: 1e27, scribes: 18 },
  { level: 19, name: 'Ciclos', cost: 10e45, costMult: 1.5, flavor: 'Repetições sagradas.', unlock: 200e15, prevCost: 100e27, scribes: 19 },
  { level: 20, name: 'Espirais', cost: 1e48, costMult: 1.5, flavor: 'Padrões que ascendem.', unlock: 1e18, prevCost: 1e30, scribes: 20 },
  { level: 21, name: 'Vórtices', cost: 100e48, costMult: 1.5, flavor: 'Redemoinhos de som.', unlock: 5e18, prevCost: 10e30, scribes: 21 },
  { level: 22, name: 'Cascatas', cost: 1e51, costMult: 1.5, flavor: 'Quedas harmônicas.', unlock: 25e18, prevCost: 1e33, scribes: 22 },
  { level: 23, name: 'Tsunamis', cost: 10e51, costMult: 1.5, flavor: 'Ondas avassaladoras.', unlock: 100e18, prevCost: 100e33, scribes: 23 },
  { level: 24, name: 'O Silêncio', cost: 100e54, costMult: 1.5, flavor: 'O som absoluto.', unlock: 500e18, prevCost: 1e36, scribes: 24 },
];

const MEMORIES_DEFS = [
  { level: 1, name: 'Instantes', cost: 10, costMult: 1.15, flavor: 'Fragmentos de tempo.' },
  { level: 2, name: 'Momentos', cost: 100, costMult: 1.2, flavor: 'Tempo que importa.', unlock: 25, prevCost: 10, scribes: 2 },
  { level: 3, name: 'Lembranças', cost: 10e3, costMult: 1.25, flavor: 'O passado preservado.', unlock: 50, prevCost: 50, scribes: 3 },
  { level: 4, name: 'Recordações', cost: 10e9, costMult: 1.28, flavor: 'Memórias profundas.', unlock: 100, prevCost: 100, scribes: 4 },
  { level: 5, name: 'Reminiscências', cost: 100e12, costMult: 1.3, flavor: 'Ecos do que foi.', unlock: 1000, prevCost: 1000, scribes: 5 },
  { level: 6, name: 'Nostalgias', cost: 1e15, costMult: 1.32, flavor: 'Saudades cristalizadas.', unlock: 100000, prevCost: 100000, scribes: 6 },
  { level: 7, name: 'Legados', cost: 1e18, costMult: 1.34, flavor: 'O que permanece.', unlock: 10e6, prevCost: 10e6, scribes: 7 },
  { level: 8, name: 'Tradições', cost: 100e21, costMult: 1.36, flavor: 'Padrões herdados.', unlock: 100e6, prevCost: 1e12, scribes: 8 },
  { level: 9, name: 'Ancestralidades', cost: 100e24, costMult: 1.37, flavor: 'Raízes profundas.', unlock: 1e9, prevCost: 100e12, scribes: 9 },
  { level: 10, name: 'Heranças', cost: 1e27, costMult: 1.38, flavor: 'Dons do passado.', unlock: 10e9, prevCost: 1e18, scribes: 10 },
  { level: 11, name: 'Eras', cost: 10e30, costMult: 1.4, flavor: 'Períodos imensos.', unlock: 100e9, prevCost: 10e18, scribes: 11 },
  { level: 12, name: 'Épocas', cost: 100e33, costMult: 1.42, flavor: 'Tempos definidores.', unlock: 1e12, prevCost: 100e18, scribes: 12 },
  { level: 13, name: 'Idades', cost: 1e36, costMult: 1.44, flavor: 'Ciclos maiores.', unlock: 10e12, prevCost: 1e21, scribes: 13 },
  { level: 14, name: 'Éons', cost: 100e36, costMult: 1.46, flavor: 'Vastidões temporais.', unlock: 100e12, prevCost: 100e21, scribes: 14 },
  { level: 15, name: 'Eternidades', cost: 1e39, costMult: 1.48, flavor: 'Tempo sem fim.', unlock: 500e12, prevCost: 1e24, scribes: 15 },
  { level: 16, name: 'Infinitudes', cost: 100e39, costMult: 1.5, flavor: 'Além do tempo.', unlock: 1e15, prevCost: 10e24, scribes: 16 },
  { level: 17, name: 'Perpétuos', cost: 1e42, costMult: 1.5, flavor: 'O que sempre foi.', unlock: 10e15, prevCost: 100e24, scribes: 17 },
  { level: 18, name: 'Imortais', cost: 100e42, costMult: 1.5, flavor: 'Consciências eternas.', unlock: 50e15, prevCost: 1e27, scribes: 18 },
  { level: 19, name: 'Transcendentes', cost: 10e45, costMult: 1.5, flavor: 'Além da existência.', unlock: 200e15, prevCost: 100e27, scribes: 19 },
  { level: 20, name: 'Absolutos', cost: 1e48, costMult: 1.5, flavor: 'Verdades imutáveis.', unlock: 1e18, prevCost: 1e30, scribes: 20 },
  { level: 21, name: 'Primordiais', cost: 100e48, costMult: 1.5, flavor: 'O início de tudo.', unlock: 5e18, prevCost: 10e30, scribes: 21 },
  { level: 22, name: 'Origens', cost: 1e51, costMult: 1.5, flavor: 'Fontes primeiras.', unlock: 25e18, prevCost: 1e33, scribes: 22 },
  { level: 23, name: 'Gêneses', cost: 10e51, costMult: 1.5, flavor: 'Criações absolutas.', unlock: 100e18, prevCost: 100e33, scribes: 23 },
  { level: 24, name: 'O Sempre', cost: 100e54, costMult: 1.5, flavor: 'Tempo como substância.', unlock: 500e18, prevCost: 1e36, scribes: 24 },
];

const ESSENCES_DEFS = [
  { level: 1, name: 'Partículas', cost: 10, costMult: 1.15, flavor: 'Os menores blocos.' },
  { level: 2, name: 'Átomos', cost: 100, costMult: 1.2, flavor: 'Unidades fundamentais.', unlock: 25, prevCost: 10, scribes: 2 },
  { level: 3, name: 'Moléculas', cost: 10e3, costMult: 1.25, flavor: 'Combinações primeiras.', unlock: 50, prevCost: 50, scribes: 3 },
  { level: 4, name: 'Elementos', cost: 10e9, costMult: 1.28, flavor: 'Substâncias puras.', unlock: 100, prevCost: 100, scribes: 4 },
  { level: 5, name: 'Compostos', cost: 100e12, costMult: 1.3, flavor: 'Uniões complexas.', unlock: 1000, prevCost: 1000, scribes: 5 },
  { level: 6, name: 'Matérias', cost: 1e15, costMult: 1.32, flavor: 'Substância do real.', unlock: 100000, prevCost: 100000, scribes: 6 },
  { level: 7, name: 'Energias', cost: 1e18, costMult: 1.34, flavor: 'Força em movimento.', unlock: 10e6, prevCost: 10e6, scribes: 7 },
  { level: 8, name: 'Forças', cost: 100e21, costMult: 1.36, flavor: 'Interações fundamentais.', unlock: 100e6, prevCost: 1e12, scribes: 8 },
  { level: 9, name: 'Campos', cost: 100e24, costMult: 1.37, flavor: 'Influências invisíveis.', unlock: 1e9, prevCost: 100e12, scribes: 9 },
  { level: 10, name: 'Potenciais', cost: 1e27, costMult: 1.38, flavor: 'Possibilidades latentes.', unlock: 10e9, prevCost: 1e18, scribes: 10 },
  { level: 11, name: 'Quanta', cost: 10e30, costMult: 1.4, flavor: 'Pacotes discretos.', unlock: 100e9, prevCost: 10e18, scribes: 11 },
  { level: 12, name: 'Flutuações', cost: 100e33, costMult: 1.42, flavor: 'Variações do vácuo.', unlock: 1e12, prevCost: 100e18, scribes: 12 },
  { level: 13, name: 'Virtualidades', cost: 1e36, costMult: 1.44, flavor: 'O quase-existente.', unlock: 10e12, prevCost: 1e21, scribes: 13 },
  { level: 14, name: 'Probabilidades', cost: 100e36, costMult: 1.46, flavor: 'Chances manifestas.', unlock: 100e12, prevCost: 100e21, scribes: 14 },
  { level: 15, name: 'Superposições', cost: 1e39, costMult: 1.48, flavor: 'Estados simultâneos.', unlock: 500e12, prevCost: 1e24, scribes: 15 },
  { level: 16, name: 'Entrelaçamentos', cost: 100e39, costMult: 1.5, flavor: 'Conexões instantâneas.', unlock: 1e15, prevCost: 10e24, scribes: 16 },
  { level: 17, name: 'Singularidades', cost: 1e42, costMult: 1.5, flavor: 'Pontos de infinito.', unlock: 10e15, prevCost: 100e24, scribes: 17 },
  { level: 18, name: 'Horizontes', cost: 100e42, costMult: 1.5, flavor: 'Limites do conhecível.', unlock: 50e15, prevCost: 1e27, scribes: 18 },
  { level: 19, name: 'Branas', cost: 10e45, costMult: 1.5, flavor: 'Membranas dimensionais.', unlock: 200e15, prevCost: 100e27, scribes: 19 },
  { level: 20, name: 'Cordas', cost: 1e48, costMult: 1.5, flavor: 'Vibrações fundamentais.', unlock: 1e18, prevCost: 1e30, scribes: 20 },
  { level: 21, name: 'Espumas', cost: 100e48, costMult: 1.5, flavor: 'Tecido do espaço-tempo.', unlock: 5e18, prevCost: 10e30, scribes: 21 },
  { level: 22, name: 'Vácuos', cost: 1e51, costMult: 1.5, flavor: 'O nada que é tudo.', unlock: 25e18, prevCost: 1e33, scribes: 22 },
  { level: 23, name: 'Pleroma', cost: 10e51, costMult: 1.5, flavor: 'A plenitude divina.', unlock: 100e18, prevCost: 100e33, scribes: 23 },
  { level: 24, name: 'O Uno', cost: 100e54, costMult: 1.5, flavor: 'A essência de tudo.', unlock: 500e18, prevCost: 1e36, scribes: 24 },
];

export function createGenerators() {
  return createLineGenerators(PRODUCTION_LINES.letters, LETTERS_DEFS);
}

export function createSymbolGenerators() {
  return createLineGenerators(PRODUCTION_LINES.symbols, SYMBOLS_DEFS);
}

export function createEchoGenerators() {
  return createLineGenerators(PRODUCTION_LINES.echoes, ECHOES_DEFS);
}

export function createMemoryGenerators() {
  return createLineGenerators(PRODUCTION_LINES.memories, MEMORIES_DEFS);
}

export function createEssenceGenerators() {
  return createLineGenerators(PRODUCTION_LINES.essences, ESSENCES_DEFS);
}

export { PRODUCTION_LINES };
