import { Decimal } from './Decimal';

const SAVE_KEY = 'biblioteca-de-babel-save';

const NAME_MAP = { Escriba: 'Palavras', Tradutor: 'Frases', Linguista: 'Parágrafos' };

export function saveGame(gameState) {
  try {
    const accumulatorsObj = {};
    for (const [name, amount] of gameState.generatorAccumulators) {
      accumulatorsObj[name] = amount.toString();
    }
    const generatorsObj = {};
    for (const gen of gameState.generators) {
      generatorsObj[gen.name] = gen.count.toString();
    }
    const cycleProgressObj = {};
    for (const [name, progress] of gameState.generatorCycleProgress || []) {
      cycleProgressObj[name] = progress;
    }
    const generatorMilestonesObj = {};
    if (gameState.generatorMilestones) {
      for (const [name, index] of gameState.generatorMilestones) {
        generatorMilestonesObj[name] = index;
      }
    }
    const upgradesObj = {};
    if (gameState.upgrades) {
      for (const [name, data] of gameState.upgrades) {
        upgradesObj[name] = {
          speedRank: data.speedRank,
          productionRank: data.productionRank,
        };
      }
    }
    const save = {
      letters: gameState.letters.toString(),
      scribes: (gameState.scribes || new Decimal(0)).toString(),
      generators: generatorsObj,
      accumulators: accumulatorsObj,
      cycleProgress: cycleProgressObj,
      favor: (gameState.favor || new Decimal(0)).toString(),
      generatorMilestones: generatorMilestonesObj,
      upgrades: upgradesObj,
      claimedScribeMilestones: gameState.claimedScribeMilestones || 0,
      scribeUpgradeRank: gameState.scribeUpgradeRank || 0,
      scribeAccumulator: gameState.scribeAccumulator || 0,
      prestigePoints: gameState.prestigePoints || 0,
      lastSaveTime: Date.now(),
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (e) {
    console.warn('Erro ao salvar:', e);
  }
}

export function loadGame(generators) {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const save = JSON.parse(raw);
    if (!save.letters || !save.generators) return null;

    for (const [oldName, newName] of Object.entries(NAME_MAP)) {
      if (save.generators[oldName] !== undefined && save.generators[newName] === undefined) {
        save.generators[newName] = save.generators[oldName];
      }
    }

    const letters = new Decimal(save.letters);
    const generatorCycleProgress = new Map();
    if (save.cycleProgress) {
      for (const [name, progress] of Object.entries(save.cycleProgress)) {
        generatorCycleProgress.set(name, typeof progress === 'number' ? progress : parseFloat(progress));
      }
    }
    for (const gen of generators) {
      if (save.generators[gen.name]) {
        gen.count = new Decimal(save.generators[gen.name]);
      }
    }
    const generatorAccumulators = new Map();
    if (save.accumulators) {
      for (const [name, amount] of Object.entries(save.accumulators)) {
        const newName = NAME_MAP[name] || name;
        generatorAccumulators.set(newName, new Decimal(amount));
      }
    }

    const scribes = save.scribes != null ? new Decimal(save.scribes) : new Decimal(1);
    const favor = save.favor != null ? new Decimal(save.favor) : new Decimal(0);
    const generatorMilestones = new Map();
    if (save.generatorMilestones) {
      for (const [name, index] of Object.entries(save.generatorMilestones)) {
        const newName = NAME_MAP[name] || name;
        generatorMilestones.set(newName, typeof index === 'number' ? index : parseInt(index, 10));
      }
    }
    const upgrades = new Map();
    if (save.upgrades) {
      for (const [name, data] of Object.entries(save.upgrades)) {
        const newName = NAME_MAP[name] || name;
        upgrades.set(newName, {
          speedRank: data.speedRank || 0,
          productionRank: data.productionRank || 0,
        });
      }
    }
    const claimedScribeMilestones = save.claimedScribeMilestones ?? 0;
    const scribeUpgradeRank = save.scribeUpgradeRank ?? 0;
    const scribeAccumulator = save.scribeAccumulator ?? 0;
    const prestigePoints = save.prestigePoints ?? 0;
    return { letters, generatorCycleProgress, scribes, generatorAccumulators, favor, generatorMilestones, upgrades, claimedScribeMilestones, scribeUpgradeRank, scribeAccumulator, prestigePoints, lastSaveTime: save.lastSaveTime };
  } catch (e) {
    console.warn('Erro ao carregar save:', e);
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}
