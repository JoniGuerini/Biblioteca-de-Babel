import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { Decimal } from '../game/Decimal';
import {
  createGenerators,
  createSymbolGenerators,
  createEchoGenerators,
  createMemoryGenerators,
  createEssenceGenerators,
  updateProduction,
  processOfflineWithBreakdown,
  getLettersPerSecond,
  isGeneratorAutomated,
  isPurchaseLocked,
  getProducerName,
  formatBigNumber,
  formatInteger,
  saveGame,
  loadGame,
  clearSave,
  processMilestones,
  UPGRADE_TYPES,
  getUpgradeInfo,
  tryBuyUpgrade,
  createUpgradesState,
  getAllMilestonesInfo,
  tryClaimMilestone,
  getTotalScribesPerSecond,
  getPrestigeInfo,
  canPrestige,
  getScribeUpgradeCost,
  tryBuyScribeUpgrade,
  getScribeProductionMultiplier,
} from '../game';

const SAVE_INTERVAL_MS = 5000;
const UI_UPDATE_INTERVAL_MS = 100;

const GameContext = createContext(null);

export const LINE_CONFIG = [
  { id: 'letters', label: 'Letras', prestigeRequired: 0, favorMultiplier: 1 },
  { id: 'symbols', label: 'Símbolos', prestigeRequired: 1, favorMultiplier: 2 },
  { id: 'echoes', label: 'Ecos', prestigeRequired: 2, favorMultiplier: 3 },
  { id: 'memories', label: 'Memórias', prestigeRequired: 3, favorMultiplier: 4 },
  { id: 'essences', label: 'Essências', prestigeRequired: 4, favorMultiplier: 5 },
];

const LINE_CREATORS = {
  letters: createGenerators,
  symbols: createSymbolGenerators,
  echoes: createEchoGenerators,
  memories: createMemoryGenerators,
  essences: createEssenceGenerators,
};

function createInitialState() {
  return {
    letters: new Decimal(10),
    symbols: new Decimal(10),
    echoes: new Decimal(10),
    memories: new Decimal(10),
    essences: new Decimal(10),
    scribes: new Decimal(1),
    favor: new Decimal(0),
    cycleProgress: {
      letters: new Map(),
      symbols: new Map(),
      echoes: new Map(),
      memories: new Map(),
      essences: new Map(),
    },
    accumulators: {
      letters: new Map(),
      symbols: new Map(),
      echoes: new Map(),
      memories: new Map(),
      essences: new Map(),
    },
    milestones: {
      letters: new Map(),
      symbols: new Map(),
      echoes: new Map(),
      memories: new Map(),
      essences: new Map(),
    },
    unlockedGenerators: new Set(),
    claimedScribeMilestones: 0,
    scribeUpgradeRank: 0,
    scribeAccumulator: 0,
    prestigePoints: 0,
    lastActiveTime: Date.now(),
  };
}

export function GameProvider({ children }) {
  const generatorsRef = useRef({
    letters: createGenerators(),
    symbols: createSymbolGenerators(),
    echoes: createEchoGenerators(),
    memories: createMemoryGenerators(),
    essences: createEssenceGenerators(),
  });
  const upgradesRef = useRef({
    letters: createUpgradesState(generatorsRef.current.letters),
    symbols: createUpgradesState(generatorsRef.current.symbols),
    echoes: createUpgradesState(generatorsRef.current.echoes),
    memories: createUpgradesState(generatorsRef.current.memories),
    essences: createUpgradesState(generatorsRef.current.essences),
  });
  const stateRef = useRef(createInitialState());
  const lastSaveTimeRef = useRef(0);
  const hasLoadedRef = useRef(false);
  const displayStateRef = useRef({
    lines: {},
    scribes: '1',
    favor: '0',
    generators: {},
  });
  const [offlineGains, setOfflineGains] = useState(null);
  const [buyMode, setBuyMode] = useState('1x');
  const [showFps, setShowFps] = useState(() => {
    try {
      const stored = localStorage.getItem('biblioteca-show-fps');
      return stored !== 'false';
    } catch {
      return true;
    }
  });
  const [lastSaveTime, setLastSaveTime] = useState(null);
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem('biblioteca-show-fps', String(showFps));
    } catch {}
  }, [showFps]);

  const saveGameWithTimestamp = useCallback(() => {
    saveGame({ 
      ...stateRef.current, 
      allGenerators: generatorsRef.current, 
      allUpgrades: upgradesRef.current,
    });
    setLastSaveTime(Date.now());
  }, []);

  const saveGameManual = saveGameWithTimestamp;

  const BUY_MODES = ['1x', '1%', '10%', '50%', '100%'];

  const getMaxAffordable = useCallback((gen, resource, scribes) => {
    const cost = gen.getCost();
    const prevRequired = gen.getPreviousTierRequired();
    const scribesRequired = gen.scribesRequired ?? gen.level;
    if (!cost.gt(0)) return 0;
    const byResource = resource.div(cost).floor().toNumber();
    const byPrev = !prevRequired || !gen.produces
      ? Infinity
      : gen.produces.count.div(prevRequired).floor().toNumber();
    const byScribes = scribes.div(scribesRequired).floor().toNumber();
    return Math.max(0, Math.min(byResource, byPrev, byScribes));
  }, []);

  const getBuyCount = useCallback((gen, resource, scribes, mode) => {
    const max = getMaxAffordable(gen, resource, scribes);
    if (max <= 0) return 0;
    if (mode === '1x') return 1;
    if (mode === '100%') return max;
    const pct = mode === '1%' ? 0.01 : mode === '10%' ? 0.1 : 0.5;
    return Math.max(1, Math.floor(max * pct));
  }, [getMaxAffordable]);

  const mapGeneratorDisplay = useCallback((generators, state, lineId, mode) => {
    const resource = state[lineId] || new Decimal(0);
    const cycleProgressMap = state.cycleProgress[lineId] || new Map();
    const unlockedGenerators = state.unlockedGenerators || new Set();
    const scribes = state.scribes || new Decimal(0);
    const lineConfig = LINE_CONFIG.find(l => l.id === lineId);
    const resourceName = lineConfig?.label || lineId;
    
    return generators.map(gen => {
      const cost = gen.getCost();
      const prevRequired = gen.getPreviousTierRequired();
      const scribesRequired = gen.scribesRequired ?? gen.level;
      const hasEnoughResource = resource.gte(cost);
      const hasEnoughPrev = !prevRequired || (gen.produces && gen.produces.count.gte(prevRequired));
      const hasEnoughScribes = scribes.gte(scribesRequired);
      const canAfford = hasEnoughResource && hasEnoughPrev && hasEnoughScribes;
      const automated = isGeneratorAutomated(generators, gen);
      const producerName = getProducerName(generators, gen);
      const cycleSec = (gen.getCycleDurationMs() / 1000);
      const totalPerCycle = gen.getTotalPerCycle();
      const perSecond = gen.getEffectivePerSecond();
      const outputName = gen.produces ? gen.produces.name : resourceName;
      const cycleProgress = cycleProgressMap.get(gen.name) ?? 0;

      const minToUnlock = gen.getMinPreviousTierToUnlock ? gen.getMinPreviousTierToUnlock() : 0;
      const alreadyUnlocked = unlockedGenerators.has(gen.name);
      const meetsUnlockCondition = !gen.produces || minToUnlock === 0 || gen.produces.count.gte(minToUnlock);
      
      if (!alreadyUnlocked && meetsUnlockCondition) {
        unlockedGenerators.add(gen.name);
      }
      
      const isLocked = !alreadyUnlocked && !meetsUnlockCondition;
      const canBuy = isLocked ? 0 : getBuyCount(gen, resource, scribes, mode);
      const purchaseLocked = isPurchaseLocked(generators, gen);

      return {
        name: gen.name,
        productionLine: gen.productionLine,
        purchaseLocked,
        count: formatBigNumber(gen.count),
        cost: formatBigNumber(cost),
        prevRequired: prevRequired ? formatBigNumber(prevRequired) : null,
        unlockPrevRequired: minToUnlock > 0 ? formatBigNumber(minToUnlock) : null,
        prevName: gen.produces?.name ?? null,
        scribesRequired,
        cycleDurationSec: cycleSec,
        totalPerCycle: formatBigNumber(totalPerCycle),
        perSecond: formatBigNumber(perSecond),
        outputName,
        resourceName,
        cycleProgress: Math.min(1, Math.max(0, cycleProgress)),
        flavorText: gen.flavorText || '',
        canAfford,
        hasEnoughLetters: hasEnoughResource,
        hasEnoughPrev,
        hasEnoughScribes,
        canBuy,
        isAutomated: automated,
        producerName,
        disabled: isLocked,
        isLocked,
      };
    });
  }, [getBuyCount]);

  const updateDisplay = useCallback(() => {
    const state = stateRef.current;
    const allGenerators = generatorsRef.current;
    const mode = buyMode;

    for (const lineConfig of LINE_CONFIG) {
      const lineId = lineConfig.id;
      const generators = allGenerators[lineId];
      const { favor, generatorMilestones } = processMilestones(
        generators,
        state.favor || new Decimal(0),
        state.milestones[lineId] || new Map(),
        lineConfig.favorMultiplier
      );
      state.favor = favor;
      state.milestones[lineId] = generatorMilestones;
    }

    const lettersGenerators = allGenerators.letters;
    const palavras = lettersGenerators.find(g => g.level === 1);
    const hasPalavras = palavras && palavras.count.gte(1);
    const claimedScribeMilestones = state.claimedScribeMilestones || 0;
    const scribeUpgradeRank = state.scribeUpgradeRank || 0;
    const scribesPerSec = getTotalScribesPerSecond(claimedScribeMilestones, hasPalavras, scribeUpgradeRank);

    const allResources = LINE_CONFIG.map(l => state[l.id] || new Decimal(0));
    const allProductionRates = LINE_CONFIG.map(l => getLettersPerSecond(allGenerators[l.id]));
    const prestigeInfo = getPrestigeInfo(allResources, state.prestigePoints || 0, allProductionRates);

    const lines = {};
    const generators = {};
    for (const lineConfig of LINE_CONFIG) {
      const lineId = lineConfig.id;
      const lineGenerators = allGenerators[lineId];
      const productionRate = getLettersPerSecond(lineGenerators);
      lines[lineId] = {
        resource: formatBigNumber(state[lineId] || new Decimal(0)),
        productionRate: formatBigNumber(productionRate),
        label: lineConfig.label,
      };
      generators[lineId] = mapGeneratorDisplay(lineGenerators, state, lineId, mode);
    }

    displayStateRef.current = {
      lines,
      generators,
      scribes: formatInteger(state.scribes || new Decimal(0)),
      favor: formatBigNumber(state.favor),
      scribesProductionRate: scribesPerSec,
      prestigeProgress: prestigeInfo.progress,
      prestigeProgressPercent: prestigeInfo.progressPercent,
      canPrestige: prestigeInfo.canPrestige,
      prestigePoints: state.prestigePoints || 0,
      prestigeEstimatedTime: prestigeInfo.estimatedTime,
    };
  }, [buyMode, mapGeneratorDisplay]);

  const buyGenerator = useCallback((generatorName, lineId = 'letters') => {
    const generators = generatorsRef.current[lineId];
    const gen = generators.find(g => g.name === generatorName);
    if (!gen) return;
    if (isPurchaseLocked(generators, gen)) return;

    const state = stateRef.current;
    const resource = state[lineId] || new Decimal(0);
    const scribes = state.scribes || new Decimal(0);
    const count = getBuyCount(gen, resource, scribes, buyMode);
    if (count <= 0) return;

    const cost = gen.getCost();
    const prevRequired = gen.getPreviousTierRequired();
    const scribesRequired = gen.scribesRequired ?? gen.level;

    const totalCost = cost.mul(count);
    const totalPrev = prevRequired ? prevRequired.mul(count) : new Decimal(0);
    const totalScribes = new Decimal(count * scribesRequired);

    if (!resource.gte(totalCost)) return;
    if (prevRequired && gen.produces && !gen.produces.count.gte(totalPrev)) return;
    if (!scribes.gte(totalScribes)) return;

    state[lineId] = resource.sub(totalCost);
    state.scribes = scribes.sub(totalScribes);
    if (gen.produces && totalPrev.gt(0)) {
      gen.produces.count = gen.produces.count.sub(totalPrev);
    }
    for (let i = 0; i < count; i++) gen.buy();
    updateDisplay();
    forceUpdate(n => n + 1);
  }, [buyMode, getBuyCount, updateDisplay]);

  const resetGame = useCallback(() => {
    const allGenerators = generatorsRef.current;
    stateRef.current = createInitialState();
    for (const lineId of Object.keys(allGenerators)) {
      for (const gen of allGenerators[lineId]) {
        gen.count = new Decimal(0);
        gen.applyUpgrades(0, 0);
      }
      upgradesRef.current[lineId] = createUpgradesState(allGenerators[lineId]);
    }
    clearSave();
    updateDisplay();
    forceUpdate(n => n + 1);
  }, [updateDisplay]);

  const doPrestige = useCallback(() => {
    const state = stateRef.current;
    const allResources = LINE_CONFIG.map(l => state[l.id] || new Decimal(0));
    if (!canPrestige(...allResources)) return;

    const allGenerators = generatorsRef.current;
    const currentPrestigePoints = state.prestigePoints || 0;

    stateRef.current = {
      ...createInitialState(),
      prestigePoints: currentPrestigePoints + 1,
    };
    
    for (const lineId of Object.keys(allGenerators)) {
      for (const gen of allGenerators[lineId]) {
        gen.count = new Decimal(0);
        gen.applyUpgrades(0, 0);
      }
      upgradesRef.current[lineId] = createUpgradesState(allGenerators[lineId]);
    }
    updateDisplay();
    forceUpdate(n => n + 1);
  }, [updateDisplay]);

  const buyUpgrade = useCallback((generatorName, upgradeType, lineId = 'letters') => {
    const generators = generatorsRef.current[lineId];
    const upgrades = upgradesRef.current[lineId];
    
    const gen = generators.find(g => g.name === generatorName);
    if (!gen) return;

    const state = stateRef.current;
    const maxSpeedRanks = gen.getMaxSpeedRanks();

    const { success, newFavor } = tryBuyUpgrade(
      upgrades,
      generatorName,
      upgradeType,
      state.favor,
      maxSpeedRanks
    );

    if (success) {
      state.favor = newFavor;
      const genUpgrades = upgrades.get(generatorName);
      gen.applyUpgrades(genUpgrades.speedRank, genUpgrades.productionRank);
      updateDisplay();
      forceUpdate(n => n + 1);
    }
  }, [updateDisplay]);

  const getUpgradesDisplay = useCallback((lineId = 'letters') => {
    const generators = generatorsRef.current[lineId];
    const upgrades = upgradesRef.current[lineId];
    const state = stateRef.current;
    const favor = state.favor;

    return generators.map(gen => {
      const info = getUpgradeInfo(gen, upgrades);
      const hasGenerator = gen.count.gt(0);

      return {
        ...info,
        productionLine: gen.productionLine,
        hasGenerator,
        canAffordSpeed: info.speed.cost && favor.gte(info.speed.cost),
        canAffordProduction: favor.gte(info.production.cost),
        speedCostFormatted: info.speed.cost ? formatBigNumber(info.speed.cost) : null,
        productionCostFormatted: formatBigNumber(info.production.cost),
        currentCycleFormatted: (info.speed.currentValue / 1000).toFixed(1) + 's',
        nextCycleFormatted: (info.speed.nextValue / 1000).toFixed(1) + 's',
        currentProductionFormatted: formatBigNumber(info.production.currentValue),
        nextProductionFormatted: formatBigNumber(info.production.nextValue),
      };
    });
  }, []);

  const getScribeMilestonesDisplay = useCallback(() => {
    const state = stateRef.current;
    const generators = generatorsRef.current.letters;
    const palavras = generators.find(g => g.level === 1);
    const hasPalavras = palavras && palavras.count.gte(1);
    const claimedCount = state.claimedScribeMilestones || 0;
    const upgradeRank = state.scribeUpgradeRank || 0;
    const currentRate = getTotalScribesPerSecond(claimedCount, hasPalavras, upgradeRank);
    
    const milestones = getAllMilestonesInfo(claimedCount, state.letters);
    
    const upgradeCost = getScribeUpgradeCost(upgradeRank);
    const canAffordUpgrade = state.favor.gte(upgradeCost);
    const currentMultiplier = getScribeProductionMultiplier(upgradeRank);
    const nextMultiplier = getScribeProductionMultiplier(upgradeRank + 1);
    
    return {
      currentRate,
      hasPalavras,
      claimedCount,
      milestones: milestones.map(m => ({
        ...m,
        costFormatted: formatBigNumber(m.cost),
      })),
      upgrade: {
        rank: upgradeRank,
        cost: upgradeCost,
        costFormatted: formatBigNumber(upgradeCost),
        canAfford: canAffordUpgrade,
        currentMultiplier,
        nextMultiplier,
      },
    };
  }, []);

  const claimScribeMilestone = useCallback(() => {
    const state = stateRef.current;
    const claimedCount = state.claimedScribeMilestones || 0;
    
    const { success, newLetters, newClaimedCount } = tryClaimMilestone(
      claimedCount,
      state.letters
    );
    
    if (success) {
      state.letters = newLetters;
      state.claimedScribeMilestones = newClaimedCount;
      updateDisplay();
      forceUpdate(n => n + 1);
    }
  }, [updateDisplay]);

  const buyScribeUpgrade = useCallback(() => {
    const state = stateRef.current;
    const currentRank = state.scribeUpgradeRank || 0;
    
    const { success, newFavor, newRank } = tryBuyScribeUpgrade(currentRank, state.favor);
    
    if (success) {
      state.favor = newFavor;
      state.scribeUpgradeRank = newRank;
      updateDisplay();
      forceUpdate(n => n + 1);
    }
  }, [updateDisplay]);

  const processOfflineProgress = useCallback((elapsed, showDialog = true) => {
    if (elapsed <= 0) return;
    const state = {
      ...stateRef.current,
      generators: generatorsRef.current.letters,
    };
    const { lettersProduced, generatorProduced, scribesProduced } = processOfflineWithBreakdown(state, elapsed);
    stateRef.current.letters = state.letters;
    stateRef.current.cycleProgress.letters = state.generatorCycleProgress ?? new Map();
    stateRef.current.scribes = state.scribes;
    stateRef.current.accumulators.letters = state.generatorAccumulators;
    stateRef.current.lastActiveTime = state.lastActiveTime;

    const hasGains = lettersProduced.gt(0) || (scribesProduced && scribesProduced.gt(0)) || Object.keys(generatorProduced).length > 0;
    if (showDialog && hasGains) {
      setOfflineGains({
        lettersProduced,
        generatorProduced,
        scribesProduced: scribesProduced || new Decimal(0),
        elapsedMs: elapsed,
      });
    }
  }, []);

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const allGenerators = generatorsRef.current;
    const loaded = loadGame(allGenerators, upgradesRef.current);
    if (loaded) {
      for (const lineId of Object.keys(allGenerators)) {
        stateRef.current[lineId] = loaded[lineId] ?? new Decimal(10);
        stateRef.current.cycleProgress[lineId] = loaded.cycleProgress?.[lineId] ?? new Map();
        stateRef.current.accumulators[lineId] = loaded.accumulators?.[lineId] ?? new Map();
        stateRef.current.milestones[lineId] = loaded.milestones?.[lineId] ?? new Map();
      }
      stateRef.current.scribes = loaded.scribes ?? new Decimal(1);
      stateRef.current.favor = loaded.favor ?? new Decimal(0);
      stateRef.current.unlockedGenerators = loaded.unlockedGenerators ?? new Set();
      stateRef.current.claimedScribeMilestones = loaded.claimedScribeMilestones ?? 0;
      stateRef.current.scribeUpgradeRank = loaded.scribeUpgradeRank ?? 0;
      stateRef.current.scribeAccumulator = loaded.scribeAccumulator ?? 0;
      stateRef.current.prestigePoints = loaded.prestigePoints ?? 0;
      if (loaded.lastSaveTime) {
        stateRef.current.lastActiveTime = loaded.lastSaveTime;
      }
      setLastSaveTime(loaded.lastSaveTime ?? null);
      const elapsed = Date.now() - (loaded.lastSaveTime || Date.now());
      if (elapsed > 1000) processOfflineProgress(elapsed, true);
      else if (elapsed > 0) processOfflineProgress(elapsed, false);
    }
    updateDisplay();
    forceUpdate(n => n + 1);
  }, [processOfflineProgress, updateDisplay]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stateRef.current.lastActiveTime = Date.now();
        saveGameWithTimestamp();
      } else {
        const elapsed = Date.now() - stateRef.current.lastActiveTime;
        if (elapsed > 0) {
          processOfflineProgress(elapsed, false);
        }
        updateDisplay();
        forceUpdate(n => n + 1);
      }
    };

    const handleBeforeUnload = () => {
      saveGameWithTimestamp();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handleBeforeUnload);
    };
  }, [processOfflineProgress, updateDisplay, saveGameWithTimestamp]);

  const dismissOfflineDialog = useCallback(() => setOfflineGains(null), []);

  const value = {
    displayState: displayStateRef,
    generatorsRef,
    stateRef,
    buyGenerator,
    resetGame,
    updateDisplay,
    lastSaveTimeRef,
    saveGameWithTimestamp,
    forceUpdate,
    SAVE_INTERVAL_MS,
    UI_UPDATE_INTERVAL_MS,
    offlineGains,
    dismissOfflineDialog,
    buyMode,
    setBuyMode,
    BUY_MODES,
    saveGameManual,
    showFps,
    setShowFps,
    lastSaveTime,
    buyUpgrade,
    getUpgradesDisplay,
    UPGRADE_TYPES,
    getScribeMilestonesDisplay,
    claimScribeMilestone,
    buyScribeUpgrade,
    doPrestige,
    LINE_CONFIG,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameState() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameState must be used within GameProvider');
  return ctx;
}
