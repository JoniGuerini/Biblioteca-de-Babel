import { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import { Decimal } from '../game/Decimal';
import {
  createGenerators,
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

export function GameProvider({ children }) {
  const generatorsRef = useRef(createGenerators());
  const upgradesRef = useRef(createUpgradesState(generatorsRef.current));
  const stateRef = useRef({
    letters: new Decimal(10),
    generatorCycleProgress: new Map(),
    scribes: new Decimal(1),
    generatorAccumulators: new Map(),
    favor: new Decimal(0),
    generatorMilestones: new Map(),
    claimedScribeMilestones: 0,
    prestigePoints: 0,
    lastActiveTime: Date.now(),
  });
  const lastSaveTimeRef = useRef(0);
  const hasLoadedRef = useRef(false);
  const displayStateRef = useRef({
    letters: '10',
    scribes: '1',
    favor: '0',
    productionRate: '0',
    generators: [],
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
    saveGame({ ...stateRef.current, generators: generatorsRef.current, upgrades: upgradesRef.current });
    setLastSaveTime(Date.now());
  }, []);

  const saveGameManual = saveGameWithTimestamp;

  const BUY_MODES = ['1x', '1%', '10%', '50%', '100%'];

  const getMaxAffordable = useCallback((gen, state) => {
    const cost = gen.getCost();
    const prevRequired = gen.getPreviousTierRequired();
    const scribesRequired = gen.scribesRequired ?? gen.level;
    const letters = state.letters || new Decimal(0);
    const scribes = state.scribes || new Decimal(0);
    if (!cost.gt(0)) return 0;
    const byLetters = letters.div(cost).floor().toNumber();
    const byPrev = !prevRequired || !gen.produces
      ? Infinity
      : gen.produces.count.div(prevRequired).floor().toNumber();
    const byScribes = scribes.div(scribesRequired).floor().toNumber();
    return Math.max(0, Math.min(byLetters, byPrev, byScribes));
  }, []);

  const getBuyCount = useCallback((gen, state, mode) => {
    const max = getMaxAffordable(gen, state);
    if (max <= 0) return 0;
    if (mode === '1x') return 1;
    if (mode === '100%') return max;
    const pct = mode === '1%' ? 0.01 : mode === '10%' ? 0.1 : 0.5;
    return Math.floor(max * pct);
  }, [getMaxAffordable]);

  const updateDisplay = useCallback(() => {
    const state = stateRef.current;
    const generators = generatorsRef.current;
    const mode = buyMode;
    const lettersPerSec = getLettersPerSecond(generators);

    const { favor, generatorMilestones } = processMilestones(
      generators,
      state.favor || new Decimal(0),
      state.generatorMilestones || new Map()
    );
    stateRef.current.favor = favor;
    stateRef.current.generatorMilestones = generatorMilestones;

    const palavras = generators.find(g => g.level === 1);
    const hasPalavras = palavras && palavras.count.gte(1);
    const claimedScribeMilestones = state.claimedScribeMilestones || 0;
    const scribesPerSec = getTotalScribesPerSecond(claimedScribeMilestones, hasPalavras);
    const prestigeInfo = getPrestigeInfo(state.letters, state.prestigePoints || 0, lettersPerSec);
    displayStateRef.current = {
      letters: formatBigNumber(state.letters),
      scribes: formatInteger(state.scribes || new Decimal(0)),
      favor: formatInteger(favor),
      scribesProductionRate: scribesPerSec,
      productionRate: formatBigNumber(lettersPerSec),
      prestigeProgress: prestigeInfo.progress,
      prestigeProgressPercent: prestigeInfo.progressPercent,
      canPrestige: prestigeInfo.canPrestige,
      prestigePoints: state.prestigePoints || 0,
      prestigeEstimatedTime: prestigeInfo.estimatedTime,
      generators: generators.map(gen => {
        const cost = gen.getCost();
        const prevRequired = gen.getPreviousTierRequired();
        const scribesRequired = gen.scribesRequired ?? gen.level;
        const scribes = state.scribes || new Decimal(0);
        const hasEnoughLetters = state.letters.gte(cost);
        const hasEnoughPrev = !prevRequired || (gen.produces && gen.produces.count.gte(prevRequired));
        const hasEnoughScribes = scribes.gte(scribesRequired);
        const canAfford = hasEnoughLetters && hasEnoughPrev && hasEnoughScribes;
        const automated = isGeneratorAutomated(generators, gen);
        const producerName = getProducerName(generators, gen);
        const cycleSec = (gen.getCycleDurationMs() / 1000);
        const totalPerCycle = gen.getTotalPerCycle();
        const perSecond = gen.getEffectivePerSecond();
        const outputName = gen.produces ? gen.produces.name : 'Letras';
        const cycleProgress = (state.generatorCycleProgress || new Map()).get(gen.name) ?? 0;

        const minToUnlock = gen.getMinPreviousTierToUnlock ? gen.getMinPreviousTierToUnlock() : 0;
        const isLocked = gen.produces && minToUnlock > 0 && gen.produces.count.lt(minToUnlock) && gen.count.lt(1);
        const canBuy = isLocked ? 0 : getBuyCount(gen, state, mode);
        const purchaseLocked = isPurchaseLocked(generators, gen);

        return {
          name: gen.name,
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
          cycleProgress: Math.min(1, Math.max(0, cycleProgress)),
          flavorText: gen.flavorText || '',
          canAfford,
          canBuy,
          isAutomated: automated,
          producerName,
          disabled: isLocked,
          isLocked,
        };
      }),
    };
  }, [buyMode, getBuyCount]);

  const buyGenerator = useCallback((generatorName) => {
    const generators = generatorsRef.current;
    const gen = generators.find(g => g.name === generatorName);
    if (!gen) return;
    if (isPurchaseLocked(generators, gen)) return;

    const state = stateRef.current;
    const count = getBuyCount(gen, state, buyMode);
    if (count <= 0) return;

    const cost = gen.getCost();
    const prevRequired = gen.getPreviousTierRequired();
    const scribesRequired = gen.scribesRequired ?? gen.level;
    const scribes = state.scribes || new Decimal(0);

    const totalCost = cost.mul(count);
    const totalPrev = prevRequired ? prevRequired.mul(count) : new Decimal(0);
    const totalScribes = new Decimal(count * scribesRequired);

    if (!state.letters.gte(totalCost)) return;
    if (prevRequired && gen.produces && !gen.produces.count.gte(totalPrev)) return;
    if (!scribes.gte(totalScribes)) return;

    state.letters = state.letters.sub(totalCost);
    state.scribes = (state.scribes || new Decimal(0)).sub(totalScribes);
    if (gen.produces && totalPrev.gt(0)) {
      gen.produces.count = gen.produces.count.sub(totalPrev);
    }
    for (let i = 0; i < count; i++) gen.buy();
    updateDisplay();
    forceUpdate(n => n + 1);
  }, [buyMode, getBuyCount, updateDisplay]);

  const resetGame = useCallback(() => {
    const generators = generatorsRef.current;
    stateRef.current = {
      letters: new Decimal(10),
      generatorCycleProgress: new Map(),
      scribes: new Decimal(1),
      generatorAccumulators: new Map(),
      favor: new Decimal(0),
      generatorMilestones: new Map(),
      claimedScribeMilestones: 0,
      scribeUpgradeRank: 0,
      prestigePoints: 0,
      lastActiveTime: Date.now(),
    };
    for (const gen of generators) {
      gen.count = new Decimal(0);
      gen.applyUpgrades(0, 0);
    }
    upgradesRef.current = createUpgradesState(generators);
    clearSave();
    updateDisplay();
    forceUpdate(n => n + 1);
  }, [updateDisplay]);

  const doPrestige = useCallback(() => {
    const state = stateRef.current;
    if (!canPrestige(state.letters)) return;

    const generators = generatorsRef.current;
    const currentPrestigePoints = state.prestigePoints || 0;
    
    stateRef.current = {
      letters: new Decimal(10),
      generatorCycleProgress: new Map(),
      scribes: new Decimal(1),
      generatorAccumulators: new Map(),
      favor: new Decimal(0),
      generatorMilestones: new Map(),
      claimedScribeMilestones: 0,
      scribeUpgradeRank: 0,
      prestigePoints: currentPrestigePoints + 1,
      lastActiveTime: Date.now(),
    };
    for (const gen of generators) {
      gen.count = new Decimal(0);
      gen.applyUpgrades(0, 0);
    }
    upgradesRef.current = createUpgradesState(generators);
    updateDisplay();
    forceUpdate(n => n + 1);
  }, [updateDisplay]);

  const buyUpgrade = useCallback((generatorName, upgradeType) => {
    const generators = generatorsRef.current;
    const gen = generators.find(g => g.name === generatorName);
    if (!gen) return;

    const state = stateRef.current;
    const upgrades = upgradesRef.current;
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

  const getUpgradesDisplay = useCallback(() => {
    const generators = generatorsRef.current;
    const upgrades = upgradesRef.current;
    const state = stateRef.current;

    return generators.map(gen => {
      const info = getUpgradeInfo(gen, upgrades);
      const hasGenerator = gen.count.gt(0);
      
      return {
        ...info,
        hasGenerator,
        canAffordSpeed: info.speed.cost && state.favor.gte(info.speed.cost),
        canAffordProduction: state.favor.gte(info.production.cost),
        speedCostFormatted: info.speed.cost ? formatInteger(info.speed.cost) : null,
        productionCostFormatted: formatInteger(info.production.cost),
        currentCycleFormatted: (info.speed.currentValue / 1000).toFixed(1) + 's',
        nextCycleFormatted: (info.speed.nextValue / 1000).toFixed(1) + 's',
        currentProductionFormatted: formatBigNumber(info.production.currentValue),
        nextProductionFormatted: formatBigNumber(info.production.nextValue),
      };
    });
  }, []);

  const getScribeMilestonesDisplay = useCallback(() => {
    const state = stateRef.current;
    const generators = generatorsRef.current;
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
        costFormatted: formatInteger(upgradeCost),
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
      generators: generatorsRef.current,
    };
    const { lettersProduced, generatorProduced, scribesProduced } = processOfflineWithBreakdown(state, elapsed);
    stateRef.current.letters = state.letters;
    stateRef.current.generatorCycleProgress = state.generatorCycleProgress ?? new Map();
    stateRef.current.scribes = state.scribes;
    stateRef.current.generatorAccumulators = state.generatorAccumulators;
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

    const generators = generatorsRef.current;
    const loaded = loadGame(generators);
    if (loaded) {
      stateRef.current.letters = loaded.letters;
      stateRef.current.generatorCycleProgress = loaded.generatorCycleProgress ?? new Map();
      stateRef.current.scribes = loaded.scribes ?? new Decimal(1);
      stateRef.current.generatorAccumulators = loaded.generatorAccumulators;
      stateRef.current.favor = loaded.favor ?? new Decimal(0);
      stateRef.current.generatorMilestones = loaded.generatorMilestones ?? new Map();
      stateRef.current.claimedScribeMilestones = loaded.claimedScribeMilestones ?? 0;
      stateRef.current.scribeUpgradeRank = loaded.scribeUpgradeRank ?? 0;
      stateRef.current.prestigePoints = loaded.prestigePoints ?? 0;
      if (loaded.lastSaveTime) {
        stateRef.current.lastActiveTime = loaded.lastSaveTime;
      }
      if (loaded.upgrades && loaded.upgrades.size > 0) {
        upgradesRef.current = loaded.upgrades;
        for (const gen of generators) {
          const genUpgrades = loaded.upgrades.get(gen.name);
          if (genUpgrades) {
            gen.applyUpgrades(genUpgrades.speedRank, genUpgrades.productionRank);
          }
        }
      } else {
        upgradesRef.current = createUpgradesState(generators);
      }
      setLastSaveTime(loaded.lastSaveTime ?? null);
      const elapsed = Date.now() - (loaded.lastSaveTime || Date.now());
      if (elapsed > 1000) processOfflineProgress(elapsed, true);
      else if (elapsed > 0) processOfflineProgress(elapsed, false);
    } else {
      stateRef.current.letters = new Decimal(10);
      stateRef.current.favor = new Decimal(0);
      stateRef.current.generatorMilestones = new Map();
      stateRef.current.lastActiveTime = Date.now();
      setLastSaveTime(null);
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
    updateProduction,
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
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGameState() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGameState must be used within GameProvider');
  return ctx;
}
