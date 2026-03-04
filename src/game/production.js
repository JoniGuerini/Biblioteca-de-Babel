import { Decimal } from './Decimal';
import { getTotalScribesPerSecond } from './scribeMilestones';

const OFFLINE_CHUNK_MS = 10000;
const MAX_OFFLINE_MS = 30 * 24 * 60 * 60 * 1000;

export function processOfflineWithBreakdown(gameState, elapsedMs) {
  const generators = gameState.generators;
  const lettersBefore = new Decimal(gameState.letters.toString());
  const scribesBefore = gameState.scribes ? new Decimal(gameState.scribes.toString()) : new Decimal(0);
  const countsBefore = new Map();
  for (const gen of generators) {
    countsBefore.set(gen.name, new Decimal(gen.count.toString()));
  }

  let remaining = Math.min(Math.max(0, elapsedMs), MAX_OFFLINE_MS);
  while (remaining > 0) {
    const chunk = Math.min(OFFLINE_CHUNK_MS, remaining);
    const result = updateProduction(gameState, chunk);
    gameState.letters = result.letters;
    gameState.generatorCycleProgress = result.generatorCycleProgress;
    gameState.generatorAccumulators = result.generatorAccumulators;
    gameState.scribes = result.scribes;
    gameState.scribeAccumulator = result.scribeAccumulator;
    remaining -= chunk;
  }

  gameState.lastActiveTime = Date.now();

  const lettersProduced = gameState.letters.minus(lettersBefore);
  const scribesProduced = gameState.scribes.minus(scribesBefore);
  const generatorProduced = {};
  for (const gen of generators) {
    const delta = gen.count.minus(countsBefore.get(gen.name));
    if (delta.gt(0)) {
      generatorProduced[gen.name] = delta;
    }
  }

  return { lettersProduced, generatorProduced, scribesProduced };
}

export function updateProduction(gameState, deltaTime) {
  const generatorGains = new Map();
  let lettersProduced = new Decimal(0);
  const newCycleProgress = new Map(gameState.generatorCycleProgress || []);

  const palavras = gameState.generators.find(g => g.level === 1);
  const hasPalavras = palavras && palavras.count.gte(1);
  const claimedScribeMilestones = gameState.claimedScribeMilestones || 0;
  const scribeUpgradeRank = gameState.scribeUpgradeRank || 0;
  const scribesPerSecond = getTotalScribesPerSecond(claimedScribeMilestones, hasPalavras, scribeUpgradeRank);
  
  // Acumula tempo para produzir escribas apenas a cada segundo completo
  const prevAccumulator = gameState.scribeAccumulator || 0;
  const scribeAccumulator = prevAccumulator + deltaTime;
  const completeSeconds = Math.floor(scribeAccumulator / 1000);
  const newScribeAccumulator = scribeAccumulator % 1000;
  const scribesGain = new Decimal(completeSeconds).mul(scribesPerSecond);
  const newScribes = (gameState.scribes || new Decimal(0)).plus(scribesGain);

  for (const gen of gameState.generators) {
    const cycleProgress = newCycleProgress.get(gen.name) ?? 0;
    const result = gen.produce(deltaTime, cycleProgress);
    if (!result) continue;

    newCycleProgress.set(gen.name, result.cycleProgress);

    if (result.amount.lte(0)) continue;

    if (result.type === 'letters') {
      lettersProduced = lettersProduced.plus(result.amount);
    } else if (result.type === 'generator') {
      const key = result.generator.name;
      const current = generatorGains.get(key) || new Decimal(0);
      generatorGains.set(key, current.plus(result.amount));
    }
  }

  const newLetters = gameState.letters.plus(lettersProduced);

  const newAccumulators = new Map(gameState.generatorAccumulators);

  for (const [name, amount] of generatorGains) {
    const gen = gameState.generators.find(g => g.name === name);
    if (gen && amount.gt(0)) {
      const prevAcc = newAccumulators.get(name) || new Decimal(0);
      const total = prevAcc.plus(amount);
      const whole = total.floor();
      if (whole.gt(0)) {
        gen.count = gen.count.plus(whole);
        newAccumulators.set(name, total.sub(whole));
      } else {
        newAccumulators.set(name, total);
      }
    }
  }

  return {
    letters: newLetters,
    generatorCycleProgress: newCycleProgress,
    generatorAccumulators: newAccumulators,
    scribes: newScribes,
    scribeAccumulator: newScribeAccumulator,
  };
}

export function getLettersPerSecond(generators) {
  const palavras = generators.find(g => g.level === 1);
  if (!palavras) return new Decimal(0);
  return palavras.getEffectivePerSecond();
}

export function isGeneratorAutomated(generators, gen) {
  return generators.some(g => g.produces === gen && g.count.gt(0));
}

/** Pode comprar: o gerador mais alto que tem, o anterior e o próximo (para progredir).
 *  Ex: com Frases → pode comprar Palavras, Frases e Parágrafos.
 *  Ex: com Páginas → pode comprar Parágrafos, Páginas e Capítulos. */
export function isPurchaseLocked(generators, gen) {
  const highestOwned = Math.max(0, ...generators.filter(g => g.count.gte(1)).map(g => g.level));
  if (highestOwned === 0) return false;
  const maxLevel = Math.max(...generators.map(g => g.level));
  const canBuyLevels = [
    highestOwned - 1,
    highestOwned,
    highestOwned + 1,
  ].filter(l => l >= 1 && l <= maxLevel);
  return !canBuyLevels.includes(gen.level);
}

export function getProducerName(generators, gen) {
  const producer = generators.find(g => g.produces === gen && g.count.gt(0));
  return producer ? producer.name : null;
}
