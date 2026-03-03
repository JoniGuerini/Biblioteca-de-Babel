/**
 * Biblioteca de Babel - Jogo Idle/Incremental
 * Recurso base: Letras
 * Lógica de camadas: Nível 1 → Letras, Nível 2 → Geradores Nível 1, etc.
 * Usa break_eternity.js para números extremamente grandes
 */

const Decimal = typeof window !== 'undefined' && window.Decimal
  ? window.Decimal
  : (typeof globalThis !== 'undefined' && globalThis.Decimal) || (() => { throw new Error('break_eternity.js não carregado'); })();

// ============ FORMATAÇÃO DE NÚMEROS ============
// Escala completa até Decilhão: k, M, B, T, Qa, Qi, Sx, Sp, Oc, No, Dec
const FORMAT_SUFFIXES = ['', 'k', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dec'];

function formatNumber(value) {
  if (!value || (value.eq && value.eq(0))) return '0';
  const d = value instanceof Decimal ? value : new Decimal(value);
  if (d.lt(1000)) return d.toFixed(1).replace(/\.0$/, '');
  const magnitude = Math.floor(d.log10().toNumber() / 3);
  const suffixIndex = Math.min(magnitude, FORMAT_SUFFIXES.length - 1);
  const divisor = Decimal.pow(10, suffixIndex * 3);
  const scaled = d.div(divisor);
  const formatted = scaled.toFixed(1);
  return formatted.replace(/\.0$/, '') + FORMAT_SUFFIXES[suffixIndex];
}

// Para números muito grandes (break_eternity)
// break_eternity usa layer 1 para números >= 9e15, então precisamos tratar isso
function formatBigNumber(value) {
  if (!value || (value.eq && value.eq(0))) return '0';
  const d = value instanceof Decimal ? value : new Decimal(value);
  if (d.layer === 0 && d.mag < 9e15) return formatNumber(d);
  if (d.layer === 1 && d.mag >= 3 && d.mag <= 33) {
    const mag = d.mag;
    const suffixIndex = Math.min(Math.floor(mag / 3), FORMAT_SUFFIXES.length - 1);
    const divisorExp = suffixIndex * 3;
    const scaled = Math.pow(10, mag - divisorExp);
    const formatted = scaled >= 1000 ? Math.floor(scaled).toString() : scaled.toFixed(1).replace(/\.0$/, '');
    return formatted + FORMAT_SUFFIXES[suffixIndex];
  }
  return d.toStringWithDecimalPlaces(2);
}

// ============ CLASSE GENERATOR (LÓGICA DE CAMADAS) ============
class Generator {
  /**
   * @param {number} level - Nível do gerador (1 = gera Letras, 2 = gera geradores nível 1, etc.)
   * @param {string} name - Nome do gerador
   * @param {Decimal} baseCost - Custo base
   * @param {Decimal} baseProduction - Produção base
   * @param {Decimal} costMultiplier - Multiplicador de custo por compra
   * @param {Generator|null} produces - O que este gerador produz (gerador de nível inferior ou null = Letras)
   */
  constructor(level, name, baseCost, baseProduction, costMultiplier, produces = null) {
    this.level = level;
    this.name = name;
    this.baseCost = new Decimal(baseCost);
    this.baseProduction = new Decimal(baseProduction);
    this.costMultiplier = new Decimal(costMultiplier);
    this.produces = produces;
    this.count = new Decimal(0);
  }

  getCost() {
    const exp = Math.min(this.count.toNumber(), 1e15);
    return this.baseCost.mul(Decimal.pow(this.costMultiplier, exp));
  }

  getProduction() {
    return this.baseProduction.mul(this.count);
  }

  produce(deltaTime) {
    const production = this.getProduction();
    if (production.lte(0)) return;
    
    const amount = production.mul(deltaTime / 1000);
    
    if (this.produces === null) {
      return { type: 'letters', amount };
    } else {
      return { type: 'generator', generator: this.produces, amount };
    }
  }

  buy() {
    this.count = this.count.plus(1);
  }
}

// ============ ESTADO DO JOGO ============
const gameState = {
  letters: new Decimal(0),
  lastUpdate: performance.now(),
  generators: [],
  generatorAccumulators: new Map(), // Acumuladores fracionários para geradores produzidos
};

// Hierarquia: Letras <- Palavras <- ... <- A Biblioteca (24 geradores)
// Cada gerador produz 0,1/s do anterior (1 unidade a cada 10 segundos)
function initGenerators() {
  const palavras = new Generator(1, 'Palavras', 10, 0.1, 1.15, null);
  const frases = new Generator(2, 'Frases', 100, 0.1, 1.2, palavras);
  const paragrafos = new Generator(3, 'Parágrafos', 1000, 0.1, 1.25, frases);
  const paginas = new Generator(4, 'Páginas', 10000, 0.1, 1.28, paragrafos);
  const capitulos = new Generator(5, 'Capítulos', 100000, 0.1, 1.3, paginas);
  const livros = new Generator(6, 'Livros', 1000000, 0.1, 1.32, capitulos);
  const obras = new Generator(7, 'Obras', 10000000, 0.1, 1.34, livros);
  const colecoes = new Generator(8, 'Coleções', 100000000, 0.1, 1.36, obras);
  const prateleiras = new Generator(9, 'Prateleiras', 1e9, 0.1, 1.37, colecoes);
  const estantes = new Generator(10, 'Estantes', 1e10, 0.1, 1.38, prateleiras);
  const salas = new Generator(11, 'Salas', 1e11, 0.1, 1.4, estantes);
  const galerias = new Generator(12, 'Galerias', 1e12, 0.1, 1.42, salas);
  const pavilhoes = new Generator(13, 'Pavilhões', 1e13, 0.1, 1.44, galerias);
  const secoes = new Generator(14, 'Seções', 1e14, 0.1, 1.46, pavilhoes);
  const niveis = new Generator(15, 'Níveis', 1e15, 0.1, 1.48, secoes);
  const torres = new Generator(16, 'Torres', 1e16, 0.1, 1.5, niveis);
  const alas = new Generator(17, 'Alas', 1e17, 0.1, 1.5, torres);
  const blocos = new Generator(18, 'Blocos', 1e18, 0.1, 1.5, alas);
  const setores = new Generator(19, 'Setores', 1e19, 0.1, 1.5, blocos);
  const modulos = new Generator(20, 'Módulos', 1e20, 0.1, 1.5, setores);
  const complexos = new Generator(21, 'Complexos', 1e21, 0.1, 1.5, modulos);
  const edificios = new Generator(22, 'Edifícios', 1e22, 0.1, 1.5, complexos);
  const acervos = new Generator(23, 'Acervos', 1e23, 0.1, 1.5, edificios);
  const biblioteca = new Generator(24, 'A Biblioteca', 1e24, 0.1, 1.5, acervos);

  gameState.generators = [palavras, frases, paragrafos, paginas, capitulos, livros,
    obras, colecoes, prateleiras, estantes, salas, galerias, pavilhoes, secoes, niveis,
    torres, alas, blocos, setores, modulos, complexos, edificios, acervos, biblioteca];
}

// ============ PRODUÇÃO EM CASCATA ============
function updateProduction(deltaTime) {
  const produced = { letters: new Decimal(0) };
  const generatorGains = new Map();

  for (const gen of gameState.generators) {
    const result = gen.produce(deltaTime);
    if (!result) continue;

    if (result.type === 'letters') {
      produced.letters = produced.letters.plus(result.amount);
    } else if (result.type === 'generator') {
      const key = result.generator.name;
      const current = generatorGains.get(key) || new Decimal(0);
      generatorGains.set(key, current.plus(result.amount));
    }
  }

  gameState.letters = gameState.letters.plus(produced.letters);

  for (const [name, amount] of generatorGains) {
    const gen = gameState.generators.find(g => g.name === name);
    if (gen) {
      const prevAcc = gameState.generatorAccumulators.get(name) || new Decimal(0);
      const total = prevAcc.plus(amount);
      const whole = total.floor();
      if (whole.gt(0)) {
        gen.count = gen.count.plus(whole);
        gameState.generatorAccumulators.set(name, total.sub(whole));
      } else {
        gameState.generatorAccumulators.set(name, total);
      }
    }
  }
}

// ============ PRODUÇÃO TOTAL DE LETRAS/S ============
function getTotalProduction() {
  let total = new Decimal(0);
  const contributions = new Map();

  for (const gen of gameState.generators) {
    const prod = gen.getProduction();
    if (gen.produces === null) {
      total = total.plus(prod);
    } else {
      const chainProduction = getChainProduction(gen);
      total = total.plus(chainProduction);
    }
  }
  return total;
}

function getChainProduction(generator) {
  let effective = generator.getProduction();
  let current = generator.produces;
  while (current) {
    if (current.produces === null) {
      return effective.mul(current.count.plus(1));
    }
    effective = effective.mul(current.getProduction().plus(current.baseProduction));
    current = current.produces;
  }
  return effective;
}

// Produção de Letras/s: Palavras produzem diretamente; Frases aumentam Palavras que produzem; etc.
function getLettersPerSecond() {
  const palavras = gameState.generators.find(g => g.level === 1);
  if (!palavras) return new Decimal(0);
  return palavras.getProduction();
}

// ============ ATUALIZAÇÃO DA UI ============
let lastGeneratorUpdate = 0;

function updateUI() {
  const letterDisplay = document.getElementById('letterDisplay');
  const productionRate = document.getElementById('productionRate');

  if (letterDisplay) {
    letterDisplay.textContent = formatBigNumber(gameState.letters);
  }

  if (productionRate) {
    productionRate.textContent = formatBigNumber(getLettersPerSecond());
  }

  const now = performance.now();
  if (now - lastGeneratorUpdate >= 100) {
    lastGeneratorUpdate = now;
    updateGeneratorButtons();
  }
}

function isGeneratorAutomated(gen) {
  return gameState.generators.some(g => g.produces === gen && g.count.gt(0));
}

function getProducerName(gen) {
  const producer = gameState.generators.find(g => g.produces === gen && g.count.gt(0));
  return producer ? producer.name : null;
}

function buyGenerator(generatorName) {
  const gen = gameState.generators.find(g => g.name === generatorName);
  if (!gen) return;
  if (isGeneratorAutomated(gen)) return;
  const cost = gen.getCost();
  if (!gameState.letters.gte(cost)) return;
  gameState.letters = gameState.letters.sub(cost);
  gen.buy();
  updateGeneratorButtons();
}

function createGeneratorButtons() {
  const list = document.getElementById('generatorsList');
  if (!list) return;

  list.innerHTML = gameState.generators.map(gen => `
    <button type="button" class="generator-btn" data-generator="${gen.name}">
      <div class="generator-info">
        <div class="generator-name">${gen.name}</div>
        <div class="generator-stats"></div>
        <div class="generator-footer">
          <span class="generator-cost"></span>
          <span class="generator-count"></span>
        </div>
      </div>
    </button>
  `).join('');

  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.generator-btn');
    if (!btn || btn.disabled) return;
    buyGenerator(btn.dataset.generator);
  });
}

function updateGeneratorButtons() {
  const list = document.getElementById('generatorsList');
  if (!list) return;

  gameState.generators.forEach(gen => {
    const btn = list.querySelector(`[data-generator="${gen.name}"]`);
    if (!btn) return;

    const automated = isGeneratorAutomated(gen);
    const cost = gen.getCost();
    const canAfford = gameState.letters.gte(cost);
    const prod = gen.produces
      ? `${formatBigNumber(gen.getProduction())} ${gen.produces.name}(s)/s`
      : `${formatBigNumber(gen.getProduction())} Letras/s`;

    btn.querySelector('.generator-stats').textContent = prod;
    const producerName = getProducerName(gen);
    btn.querySelector('.generator-cost').textContent = producerName ? `Produzido por ${producerName}` : formatBigNumber(cost) + ' Letras';
    btn.querySelector('.generator-count').textContent = '×' + formatBigNumber(gen.count);
    btn.disabled = !producerName && !canAfford;
  });
}

// ============ SISTEMA DE SAVE ============
const SAVE_KEY = 'biblioteca-de-babel-save';
const SAVE_INTERVAL_MS = 5000;
let lastSaveTime = 0;

function saveGame() {
  try {
    const accumulatorsObj = {};
    for (const [name, amount] of gameState.generatorAccumulators) {
      accumulatorsObj[name] = amount.toString();
    }
    const generatorsObj = {};
    for (const gen of gameState.generators) {
      generatorsObj[gen.name] = gen.count.toString();
    }
    const save = {
      letters: gameState.letters.toString(),
      generators: generatorsObj,
      accumulators: accumulatorsObj,
      lastSaveTime: Date.now(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (e) {
    console.warn('Erro ao salvar:', e);
  }
}

function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;
    const save = JSON.parse(raw);
    if (!save.letters || !save.generators) return false;

    // Migração: nomes antigos -> novos
    const nameMap = { Escriba: 'Palavras', Tradutor: 'Frases', Linguista: 'Parágrafos' };
    for (const [oldName, newName] of Object.entries(nameMap)) {
      if (save.generators[oldName] !== undefined && save.generators[newName] === undefined) {
        save.generators[newName] = save.generators[oldName];
      }
    }

    gameState.letters = new Decimal(save.letters);
    for (const gen of gameState.generators) {
      if (save.generators[gen.name]) {
        gen.count = new Decimal(save.generators[gen.name]);
      }
    }
    gameState.generatorAccumulators.clear();
    if (save.accumulators) {
      for (const [name, amount] of Object.entries(save.accumulators)) {
        const newName = nameMap[name] || name;
        gameState.generatorAccumulators.set(newName, new Decimal(amount));
      }
    }
    if (save.lastSaveTime) {
      lastActiveTime = save.lastSaveTime;
    }
    return true;
  } catch (e) {
    console.warn('Erro ao carregar save:', e);
    return false;
  }
}

// ============ PROGRESSO EM SEGUNDO PLANO ============
let lastActiveTime = Date.now();

function processOfflineProgress() {
  const now = Date.now();
  const elapsed = now - lastActiveTime;
  if (elapsed > 0) {
    updateProduction(elapsed);
  }
  lastActiveTime = now;
}

function setupOfflineProgress() {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      lastActiveTime = Date.now();
      saveGame();
    } else {
      processOfflineProgress();
      updateGeneratorButtons();
    }
  });

  window.addEventListener('focus', () => {
    processOfflineProgress();
    updateGeneratorButtons();
  });

  window.addEventListener('beforeunload', saveGame);
  window.addEventListener('pagehide', saveGame);
}

// ============ GAME LOOP (60 FPS) ============
const TARGET_FPS = 60;
const FRAME_INTERVAL = 1000 / TARGET_FPS;
let lastFrameTime = performance.now();
let accumulator = 0;

let fps = 60;
let fpsFrames = 0;
let fpsLastUpdate = performance.now();

function gameLoop(currentTime) {
  const deltaTime = Math.min(currentTime - lastFrameTime, 100);
  lastFrameTime = currentTime;
  accumulator += deltaTime;

  fpsFrames++;
  const fpsElapsed = currentTime - fpsLastUpdate;
  if (fpsElapsed >= 500) {
    fps = Math.round((fpsFrames * 1000) / fpsElapsed);
    fpsFrames = 0;
    fpsLastUpdate = currentTime;
    const fpsEl = document.getElementById('fpsDisplay');
    if (fpsEl) fpsEl.textContent = fps + ' FPS';
  }

  while (accumulator >= FRAME_INTERVAL) {
    updateProduction(FRAME_INTERVAL);
    accumulator -= FRAME_INTERVAL;
  }

  lastActiveTime = Date.now();
  if (Date.now() - lastSaveTime >= SAVE_INTERVAL_MS) {
    lastSaveTime = Date.now();
    saveGame();
  }
  updateUI();
  requestAnimationFrame(gameLoop);
}

// ============ RESET ============
function resetGame() {
  if (!confirm('Tem certeza que deseja resetar todo o progresso?')) return;

  gameState.letters = new Decimal(10);
  gameState.generatorAccumulators.clear();
  for (const gen of gameState.generators) {
    gen.count = new Decimal(0);
  }
  localStorage.removeItem(SAVE_KEY);
  lastActiveTime = Date.now();
  updateGeneratorButtons();
}

// ============ INICIALIZAÇÃO ============
function init() {
  initGenerators();
  const loaded = loadGame();
  if (!loaded) {
    gameState.letters = new Decimal(10);
    lastActiveTime = Date.now();
  } else {
    processOfflineProgress();
  }
  createGeneratorButtons();
  updateGeneratorButtons();
  setupOfflineProgress();

  document.getElementById('resetBtn')?.addEventListener('click', resetGame);
  lastFrameTime = performance.now();
  requestAnimationFrame(gameLoop);
}

document.addEventListener('DOMContentLoaded', init);
