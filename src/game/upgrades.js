import { Decimal } from './Decimal';

/**
 * Sistema de Melhorias (Upgrades)
 * 
 * Cada gerador tem 2 tipos de melhoria:
 * 1. Velocidade: Reduz o tempo do ciclo pela metade a cada rank (até 0.1s)
 * 2. Produção: Dobra a produção por ciclo a cada rank (sem limite)
 */

const MIN_CYCLE_MS = 100;
const BASE_UPGRADE_COST = 1;
const COST_MULTIPLIER = 2;

export const UPGRADE_TYPES = {
  SPEED: 'speed',
  PRODUCTION: 'production',
};

/**
 * Calcula quantos ranks de velocidade são necessários para chegar a 0.1s
 * Fórmula: baseCycleMs / 2^ranks >= MIN_CYCLE_MS
 * Resolvendo: ranks = floor(log2(baseCycleMs / MIN_CYCLE_MS))
 */
export function getMaxSpeedRanks(baseCycleMs) {
  if (baseCycleMs <= MIN_CYCLE_MS) return 0;
  return Math.floor(Math.log2(baseCycleMs / MIN_CYCLE_MS));
}

/**
 * Calcula o tempo do ciclo após aplicar ranks de velocidade
 */
export function getCycleMsWithUpgrade(baseCycleMs, speedRanks) {
  const reduced = baseCycleMs / Math.pow(2, speedRanks);
  return Math.max(MIN_CYCLE_MS, reduced);
}

/**
 * Calcula a produção por ciclo após aplicar ranks de produção
 */
export function getProductionWithUpgrade(baseProduction, productionRanks) {
  const multiplier = Math.pow(2, productionRanks);
  return baseProduction.mul(multiplier);
}

/**
 * Calcula o custo em Favor para comprar o próximo rank de uma melhoria
 * Custo escala exponencialmente: BASE_COST * 2^currentRank
 */
export function getUpgradeCost(currentRank) {
  return new Decimal(BASE_UPGRADE_COST).mul(Decimal.pow(COST_MULTIPLIER, currentRank));
}

/**
 * Cria o estado inicial de upgrades para todos os geradores
 */
export function createUpgradesState(generators) {
  const state = new Map();
  for (const gen of generators) {
    state.set(gen.name, {
      speedRank: 0,
      productionRank: 0,
    });
  }
  return state;
}

/**
 * Gera informações de upgrade para exibição na UI
 */
export function getUpgradeInfo(generator, upgradesState) {
  const upgrades = upgradesState.get(generator.name) || { speedRank: 0, productionRank: 0 };
  const baseCycleMs = generator.baseCycleDurationMs;
  const baseProduction = generator.baseQuantityPerCycle;
  
  const maxSpeedRanks = getMaxSpeedRanks(baseCycleMs);
  const currentCycleMs = generator.cycleDurationMs;
  const nextCycleMs = upgrades.speedRank < maxSpeedRanks 
    ? getCycleMsWithUpgrade(baseCycleMs, upgrades.speedRank + 1)
    : currentCycleMs;
  
  const currentProduction = generator.quantityPerCycle;
  const nextProduction = getProductionWithUpgrade(baseProduction, upgrades.productionRank + 1);
  
  return {
    generatorName: generator.name,
    generatorLevel: generator.level,
    
    speed: {
      currentRank: upgrades.speedRank,
      maxRank: maxSpeedRanks,
      isMaxed: upgrades.speedRank >= maxSpeedRanks,
      currentValue: currentCycleMs,
      nextValue: nextCycleMs,
      cost: upgrades.speedRank < maxSpeedRanks ? getUpgradeCost(upgrades.speedRank) : null,
    },
    
    production: {
      currentRank: upgrades.productionRank,
      maxRank: null,
      isMaxed: false,
      currentValue: currentProduction,
      nextValue: nextProduction,
      cost: getUpgradeCost(upgrades.productionRank),
    },
  };
}

/**
 * Tenta comprar um upgrade
 * @returns {boolean} true se a compra foi bem sucedida
 */
export function tryBuyUpgrade(upgradesState, generatorName, upgradeType, favor, maxSpeedRanks = Infinity) {
  const upgrades = upgradesState.get(generatorName);
  if (!upgrades) return { success: false, newFavor: favor };
  
  const currentRank = upgradeType === UPGRADE_TYPES.SPEED 
    ? upgrades.speedRank 
    : upgrades.productionRank;
  
  if (upgradeType === UPGRADE_TYPES.SPEED && currentRank >= maxSpeedRanks) {
    return { success: false, newFavor: favor };
  }
  
  const cost = getUpgradeCost(currentRank);
  
  if (!favor.gte(cost)) {
    return { success: false, newFavor: favor };
  }
  
  const newFavor = favor.sub(cost);
  
  if (upgradeType === UPGRADE_TYPES.SPEED) {
    upgrades.speedRank += 1;
  } else {
    upgrades.productionRank += 1;
  }
  
  return { success: true, newFavor };
}
