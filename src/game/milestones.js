import { Decimal } from './Decimal';

/** Marcos: 10, 100, 1k, 10k, 100k, 1M, 10M, 100M, 1B, 10B, ... */
const MILESTONE_COUNT = 40;
export const MILESTONE_THRESHOLDS = [];
for (let i = 1; i <= MILESTONE_COUNT; i++) {
  MILESTONE_THRESHOLDS.push(Decimal.pow(10, i));
}

/**
 * Calcula quanto Favor um marco específico concede.
 * Marco 1 (10 unidades) = 1 Favor
 * Marco 2 (100 unidades) = 2 Favor
 * Marco 3 (1k unidades) = 3 Favor
 * E assim por diante...
 * @param {number} milestoneIndex - Índice do marco (0-based)
 */
export function getFavorForMilestone(milestoneIndex) {
  return milestoneIndex + 1;
}

/**
 * Processa os marcos dos geradores e concede Favores.
 * Para cada gerador, verifica se a quantidade atingiu um novo marco (10, 100, 1k, ...).
 * Cada marco concede Favor igual ao seu nível (marco 1 = 1, marco 2 = 2, etc.).
 * @param {import('./Generator').Generator[]} generators
 * @param {Decimal} favor - quantidade atual de Favores
 * @param {Map<string, number>} generatorMilestones - genName -> índice do último marco concedido (0-based)
 * @returns {{ favor: Decimal, generatorMilestones: Map<string, number> }}
 */
export function processMilestones(generators, favor, generatorMilestones) {
  let newFavor = favor instanceof Decimal ? favor : new Decimal(favor);
  const newMap = new Map(generatorMilestones || []);

  for (const gen of generators) {
    const count = gen.count;
    if (!count || !count.gte) continue;

    const lastIndex = (newMap.get(gen.name) ?? -1) + 1;
    for (let i = lastIndex; i < MILESTONE_THRESHOLDS.length; i++) {
      const threshold = MILESTONE_THRESHOLDS[i];
      if (count.gte(threshold)) {
        const favorGained = getFavorForMilestone(i);
        newFavor = newFavor.add(favorGained);
        newMap.set(gen.name, i);
      } else {
        break;
      }
    }
  }

  return { favor: newFavor, generatorMilestones: newMap };
}
