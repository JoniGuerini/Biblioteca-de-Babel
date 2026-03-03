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
    const save = {
      letters: gameState.letters.toString(),
      scribes: (gameState.scribes || new Decimal(0)).toString(),
      generators: generatorsObj,
      accumulators: accumulatorsObj,
      cycleProgress: cycleProgressObj,
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
    return { letters, generatorCycleProgress, scribes, generatorAccumulators, lastSaveTime: save.lastSaveTime };
  } catch (e) {
    console.warn('Erro ao carregar save:', e);
    return null;
  }
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}
