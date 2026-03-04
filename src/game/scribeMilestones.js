import { Decimal } from './Decimal';

/**
 * Sistema de Marcos de Escribas
 * 
 * O jogador pode trocar letras por aumentos permanentes na produção de escribas.
 * Cada marco custa 10x mais que o anterior.
 * Começa em 500 letras para +1 escriba/s.
 */

const BASE_COST = 500;
const COST_MULTIPLIER = 10;
const BONUS_PER_MILESTONE = 1;

const SCRIBE_UPGRADE_BASE_COST = 5;
const SCRIBE_UPGRADE_COST_MULTIPLIER = 2;

/**
 * Calcula o custo de um marco específico
 * @param {number} index - Índice do marco (0-based)
 */
export function getMilestoneCost(index) {
  return new Decimal(BASE_COST).mul(Decimal.pow(COST_MULTIPLIER, index));
}

/**
 * Gera um marco específico por índice
 * @param {number} index - Índice do marco
 */
export function getMilestone(index) {
  return {
    id: index,
    cost: getMilestoneCost(index),
    bonus: BONUS_PER_MILESTONE,
  };
}

/**
 * Calcula o bônus total de escribas por segundo baseado nos marcos resgatados
 */
export function getScribeBonusFromMilestones(claimedMilestones) {
  return claimedMilestones * BONUS_PER_MILESTONE;
}

/**
 * Calcula o multiplicador de produção baseado no rank do upgrade
 */
export function getScribeProductionMultiplier(upgradeRank) {
  return Math.pow(2, upgradeRank);
}

/**
 * Calcula o custo do próximo upgrade de produção de escribas
 */
export function getScribeUpgradeCost(currentRank) {
  return new Decimal(SCRIBE_UPGRADE_BASE_COST).mul(Decimal.pow(SCRIBE_UPGRADE_COST_MULTIPLIER, currentRank));
}

/**
 * Calcula a taxa total de escribas por segundo (base + bônus) * multiplicador
 */
export function getTotalScribesPerSecond(claimedMilestones, hasPalavras, upgradeRank = 0) {
  if (!hasPalavras) return 0;
  const baseRate = 1;
  const bonus = getScribeBonusFromMilestones(claimedMilestones);
  const multiplier = getScribeProductionMultiplier(upgradeRank);
  return (baseRate + bonus) * multiplier;
}

/**
 * Tenta comprar upgrade de produção de escribas
 */
export function tryBuyScribeUpgrade(currentRank, favor) {
  const cost = getScribeUpgradeCost(currentRank);
  
  if (!favor.gte(cost)) {
    return { success: false, newFavor: favor, newRank: currentRank };
  }
  
  return {
    success: true,
    newFavor: favor.sub(cost),
    newRank: currentRank + 1,
  };
}

/**
 * Obtém informações do próximo marco disponível (infinito)
 */
export function getNextMilestoneInfo(claimedMilestones, letters) {
  const nextMilestone = getMilestone(claimedMilestones);
  const canClaim = letters.gte(nextMilestone.cost);
  
  return {
    id: nextMilestone.id,
    cost: nextMilestone.cost,
    bonus: nextMilestone.bonus,
    canClaim,
    currentRate: getTotalScribesPerSecond(claimedMilestones, true),
    nextRate: getTotalScribesPerSecond(claimedMilestones + 1, true),
  };
}

/**
 * Tenta resgatar o próximo marco
 * @returns {{ success: boolean, newLetters: Decimal, newClaimedCount: number }}
 */
export function tryClaimMilestone(claimedMilestones, letters) {
  const info = getNextMilestoneInfo(claimedMilestones, letters);
  
  if (!info || !info.canClaim) {
    return { 
      success: false, 
      newLetters: letters, 
      newClaimedCount: claimedMilestones 
    };
  }
  
  return {
    success: true,
    newLetters: letters.sub(info.cost),
    newClaimedCount: claimedMilestones + 1,
  };
}

/**
 * Gera informações dos marcos para exibição na UI (mostra apenas o próximo)
 * Sistema infinito - sempre há um próximo marco disponível
 */
export function getAllMilestonesInfo(claimedMilestones, letters) {
  const nextMilestone = getMilestone(claimedMilestones);
  const canClaim = letters.gte(nextMilestone.cost);
  
  return [{
    id: nextMilestone.id,
    cost: nextMilestone.cost,
    bonus: nextMilestone.bonus,
    isClaimed: false,
    isNext: true,
    canClaim,
    isLocked: false,
  }];
}
