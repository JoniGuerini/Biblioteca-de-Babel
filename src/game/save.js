import { Decimal } from './Decimal';

const SAVE_KEY = 'biblioteca-de-babel-save';
const NAME_MAP = { Escriba: 'Palavras', Tradutor: 'Frases', Linguista: 'Parágrafos' };
const LINE_IDS = ['letters', 'symbols', 'echoes', 'memories', 'essences'];

function mapToObject(map) {
  if (!map) return {};
  const obj = {};
  for (const [key, value] of map) {
    if (value instanceof Decimal) {
      obj[key] = value.toString();
    } else if (typeof value === 'number') {
      obj[key] = value;
    } else {
      obj[key] = value;
    }
  }
  return obj;
}

function objectToDecimalMap(obj) {
  const map = new Map();
  if (!obj) return map;
  for (const [key, value] of Object.entries(obj)) {
    const newKey = NAME_MAP[key] || key;
    map.set(newKey, new Decimal(value));
  }
  return map;
}

function objectToNumberMap(obj) {
  const map = new Map();
  if (!obj) return map;
  for (const [key, value] of Object.entries(obj)) {
    const newKey = NAME_MAP[key] || key;
    map.set(newKey, typeof value === 'number' ? value : parseFloat(value));
  }
  return map;
}

function objectToIntMap(obj) {
  const map = new Map();
  if (!obj) return map;
  for (const [key, value] of Object.entries(obj)) {
    const newKey = NAME_MAP[key] || key;
    map.set(newKey, typeof value === 'number' ? value : parseInt(value, 10));
  }
  return map;
}

export function saveGame(gameState) {
  try {
    const save = {
      lastSaveTime: Date.now(),
      scribes: (gameState.scribes || new Decimal(0)).toString(),
      favor: (gameState.favor || new Decimal(0)).toString(),
      claimedScribeMilestones: gameState.claimedScribeMilestones || 0,
      scribeUpgradeRank: gameState.scribeUpgradeRank || 0,
      scribeAccumulator: gameState.scribeAccumulator || 0,
      prestigePoints: gameState.prestigePoints || 0,
      unlockedGenerators: gameState.unlockedGenerators ? Array.from(gameState.unlockedGenerators) : [],
      lines: {},
    };

    for (const lineId of LINE_IDS) {
      const generators = gameState.allGenerators?.[lineId] || [];
      const upgrades = gameState.allUpgrades?.[lineId] || new Map();
      
      const generatorsObj = {};
      for (const gen of generators) {
        generatorsObj[gen.name] = gen.count.toString();
      }
      
      const upgradesObj = {};
      for (const [name, data] of upgrades) {
        upgradesObj[name] = {
          speedRank: data.speedRank || 0,
          productionRank: data.productionRank || 0,
        };
      }
      
      save.lines[lineId] = {
        resource: (gameState[lineId] || new Decimal(10)).toString(),
        generators: generatorsObj,
        cycleProgress: mapToObject(gameState.cycleProgress?.[lineId]),
        accumulators: mapToObject(gameState.accumulators?.[lineId]),
        milestones: mapToObject(gameState.milestones?.[lineId]),
        upgrades: upgradesObj,
      };
    }

    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch (e) {
    console.warn('Erro ao salvar:', e);
  }
}

export function loadGame(allGenerators, allUpgrades) {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const save = JSON.parse(raw);
    
    if (!save.lines && save.letters) {
      return loadLegacySave(save, allGenerators, allUpgrades);
    }
    
    if (!save.lines) return null;

    const result = {
      scribes: save.scribes != null ? new Decimal(save.scribes) : new Decimal(1),
      favor: save.favor != null ? new Decimal(save.favor) : new Decimal(0),
      claimedScribeMilestones: save.claimedScribeMilestones ?? 0,
      scribeUpgradeRank: save.scribeUpgradeRank ?? 0,
      scribeAccumulator: save.scribeAccumulator ?? 0,
      prestigePoints: save.prestigePoints ?? 0,
      unlockedGenerators: new Set(save.unlockedGenerators || []),
      lastSaveTime: save.lastSaveTime,
      cycleProgress: {},
      accumulators: {},
      milestones: {},
    };

    for (const lineId of LINE_IDS) {
      const lineData = save.lines[lineId] || {};
      const generators = allGenerators[lineId] || [];
      const upgrades = allUpgrades[lineId] || new Map();
      
      result[lineId] = lineData.resource != null ? new Decimal(lineData.resource) : new Decimal(10);
      result.cycleProgress[lineId] = objectToNumberMap(lineData.cycleProgress);
      result.accumulators[lineId] = objectToDecimalMap(lineData.accumulators);
      result.milestones[lineId] = objectToIntMap(lineData.milestones);
      
      for (const gen of generators) {
        if (lineData.generators?.[gen.name]) {
          gen.count = new Decimal(lineData.generators[gen.name]);
        }
      }
      
      if (lineData.upgrades) {
        for (const [name, data] of Object.entries(lineData.upgrades)) {
          upgrades.set(name, {
            speedRank: data.speedRank || 0,
            productionRank: data.productionRank || 0,
          });
          const gen = generators.find(g => g.name === name);
          if (gen) {
            gen.applyUpgrades(data.speedRank || 0, data.productionRank || 0);
          }
        }
      }
    }

    return result;
  } catch (e) {
    console.warn('Erro ao carregar save:', e);
    return null;
  }
}

function loadLegacySave(save, allGenerators, allUpgrades) {
  for (const [oldName, newName] of Object.entries(NAME_MAP)) {
    if (save.generators[oldName] !== undefined && save.generators[newName] === undefined) {
      save.generators[newName] = save.generators[oldName];
    }
  }

  const result = {
    letters: new Decimal(save.letters),
    symbols: save.symbols != null ? new Decimal(save.symbols) : new Decimal(10),
    echoes: new Decimal(10),
    memories: new Decimal(10),
    essences: new Decimal(10),
    scribes: save.scribes != null ? new Decimal(save.scribes) : new Decimal(1),
    favor: save.favor != null ? new Decimal(save.favor) : new Decimal(0),
    claimedScribeMilestones: save.claimedScribeMilestones ?? 0,
    scribeUpgradeRank: save.scribeUpgradeRank ?? 0,
    scribeAccumulator: save.scribeAccumulator ?? 0,
    prestigePoints: save.prestigePoints ?? 0,
    unlockedGenerators: new Set(save.unlockedGenerators || []),
    lastSaveTime: save.lastSaveTime,
    cycleProgress: {
      letters: objectToNumberMap(save.cycleProgress),
      symbols: objectToNumberMap(save.symbolCycleProgress),
      echoes: new Map(),
      memories: new Map(),
      essences: new Map(),
    },
    accumulators: {
      letters: objectToDecimalMap(save.accumulators),
      symbols: objectToDecimalMap(save.symbolAccumulators),
      echoes: new Map(),
      memories: new Map(),
      essences: new Map(),
    },
    milestones: {
      letters: objectToIntMap(save.generatorMilestones),
      symbols: objectToIntMap(save.symbolMilestones),
      echoes: new Map(),
      memories: new Map(),
      essences: new Map(),
    },
  };

  const lettersGens = allGenerators.letters || [];
  for (const gen of lettersGens) {
    if (save.generators?.[gen.name]) {
      gen.count = new Decimal(save.generators[gen.name]);
    }
  }
  if (save.upgrades) {
    for (const [name, data] of Object.entries(save.upgrades)) {
      const newName = NAME_MAP[name] || name;
      const upgrades = allUpgrades.letters;
      if (upgrades) {
        upgrades.set(newName, {
          speedRank: data.speedRank || 0,
          productionRank: data.productionRank || 0,
        });
        const gen = lettersGens.find(g => g.name === newName);
        if (gen) gen.applyUpgrades(data.speedRank || 0, data.productionRank || 0);
      }
    }
  }

  const symbolGens = allGenerators.symbols || [];
  for (const gen of symbolGens) {
    if (save.symbolGenerators?.[gen.name]) {
      gen.count = new Decimal(save.symbolGenerators[gen.name]);
    }
  }
  if (save.symbolUpgrades) {
    for (const [name, data] of Object.entries(save.symbolUpgrades)) {
      const upgrades = allUpgrades.symbols;
      if (upgrades) {
        upgrades.set(name, {
          speedRank: data.speedRank || 0,
          productionRank: data.productionRank || 0,
        });
        const gen = symbolGens.find(g => g.name === name);
        if (gen) gen.applyUpgrades(data.speedRank || 0, data.productionRank || 0);
      }
    }
  }

  return result;
}

export function clearSave() {
  localStorage.removeItem(SAVE_KEY);
}
