import { Generator } from './Generator';

/** Ciclo em ms: gerador 1 = 2s, cada um tem o dobro do anterior. */
function cycleMs(level) {
  return 2000 * Math.pow(2, level - 1);
}

export function createGenerators() {
  // Nv, nome, custo letras, costMult, produces, flavor, cycleMs, qty/ciclo, desbloqueio, custo gerador ant., escribas
  const palavras = new Generator(1, 'Palavras', 10, 1.15, null, 'A unidade mínima do pensamento.', cycleMs(1), 3);
  const frases = new Generator(2, 'Frases', 100, 1.2, palavras, 'Onde as ideias começam a respirar.', cycleMs(2), 4, 25, 10, 2);
  const paragrafos = new Generator(3, 'Parágrafos', 10e3, 1.25, frases, 'Blocos de sentido no infinito.', cycleMs(3), 1, 50, 50, 3);
  const paginas = new Generator(4, 'Páginas', 10e9, 1.28, paragrafos, 'Folhas que guardam o tempo.', cycleMs(4), 1, 100, 100, 4);
  const capitulos = new Generator(5, 'Capítulos', 100e12, 1.3, paginas, 'A divisão que organiza o caos.', cycleMs(5), 1, 1000, 1000, 5);
  const livros = new Generator(6, 'Livros', 1e15, 1.32, capitulos, 'Universos entre capas.', cycleMs(6), 1, 100000, 100000, 6);
  const obras = new Generator(7, 'Obras', 1e18, 1.34, livros, 'A marca do autor no eterno.', cycleMs(7), 1, 10e6, 10e6, 7);
  const colecoes = new Generator(8, 'Coleções', 100e21, 1.36, obras, 'Agrupamentos que transcendem.', cycleMs(8), 1, 100e6, 1e12, 8);
  const prateleiras = new Generator(9, 'Prateleiras', 100e24, 1.37, colecoes, 'O primeiro ordenamento do infinito.', cycleMs(9), 1, 1e9, 100e12, 9);
  const estantes = new Generator(10, 'Estantes', 1e27, 1.38, prateleiras, 'Estruturas que sustentam mundos.', cycleMs(10), 1, 10e9, 1e18, 10);
  const salas = new Generator(11, 'Salas', 10e30, 1.4, estantes, 'Espaços onde o conhecimento repousa.', cycleMs(11), 1, 100e9, 10e18, 11);
  const galerias = new Generator(12, 'Galerias', 100e33, 1.42, salas, 'Corredores de infinidade.', cycleMs(12), 1, 1e12, 100e18, 12);
  const pavilhoes = new Generator(13, 'Pavilhões', 1e36, 1.44, galerias, 'Templos do saber.', cycleMs(13), 1, 10e12, 1e21, 13);
  const secoes = new Generator(14, 'Seções', 100e36, 1.46, pavilhoes, 'Divisões do cosmos literário.', cycleMs(14), 1, 100e12, 100e21, 14);
  const niveis = new Generator(15, 'Níveis', 1e39, 1.48, secoes, 'Camadas verticais do eterno.', cycleMs(15), 1, 500e12, 1e24, 15);
  const torres = new Generator(16, 'Torres', 100e39, 1.5, niveis, 'Pilares que tocam o abismo.', cycleMs(16), 1, 1e15, 10e24, 16);
  const alas = new Generator(17, 'Alas', 1e42, 1.5, torres, 'Extensões do edifício universal.', cycleMs(17), 1, 10e15, 100e24, 17);
  const blocos = new Generator(18, 'Blocos', 100e42, 1.5, alas, 'Fundações da biblioteca.', cycleMs(18), 1, 50e15, 1e27, 18);
  const setores = new Generator(19, 'Setores', 10e45, 1.5, blocos, 'Regiões do conhecimento.', cycleMs(19), 1, 200e15, 100e27, 19);
  const modulos = new Generator(20, 'Módulos', 1e48, 1.5, setores, 'Unidades do infinito.', cycleMs(20), 1, 1e18, 1e30, 20);
  const complexos = new Generator(21, 'Complexos', 100e48, 1.5, modulos, 'Conjuntos que espelham o todo.', cycleMs(21), 1, 5e18, 10e30, 21);
  const edificios = new Generator(22, 'Edifícios', 1e51, 1.5, complexos, 'Construções que abrigam o todo.', cycleMs(22), 1, 25e18, 1e33, 22);
  const acervos = new Generator(23, 'Acervos', 10e51, 1.5, edificios, 'A memória condensada.', cycleMs(23), 1, 100e18, 100e33, 23);
  const biblioteca = new Generator(24, 'A Biblioteca', 100e54, 1.5, acervos, 'O universo em forma de hexágono.', cycleMs(24), 1, 500e18, 1e36, 24);

  return [palavras, frases, paragrafos, paginas, capitulos, livros,
    obras, colecoes, prateleiras, estantes, salas, galerias, pavilhoes, secoes, niveis,
    torres, alas, blocos, setores, modulos, complexos, edificios, acervos, biblioteca];
}
