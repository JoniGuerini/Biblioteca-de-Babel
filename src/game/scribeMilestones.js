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

/**
 * Gera a lista de marcos disponíveis
 * @param {number} count - Quantidade de marcos a gerar
 */
export function generateScribeMilestones(count = 20) {
  const milestones = [];
  for (let i = 0; i < count; i++) {
    milestones.push({
      id: i,
      cost: new Decimal(BASE_COST).mul(Decimal.pow(COST_MULTIPLIER, i)),
      bonus: BONUS_PER_MILESTONE,
    });
  }
  return milestones;
}

/**
 * Calcula o bônus total de escribas por segundo baseado nos marcos resgatados
 */
export function getScribeBonusFromMilestones(claimedMilestones) {
  return claimedMilestones * BONUS_PER_MILESTONE;
}

/**
 * Calcula a taxa total de escribas por segundo (base + bônus)
 */
export function getTotalScribesPerSecond(claimedMilestones, hasPalavras) {
  if (!hasPalavras) return 0;
  const baseRate = 1;
  const bonus = getScribeBonusFromMilestones(claimedMilestones);
  return baseRate + bonus;
}

/**
 * Obtém informações do próximo marco disponível
 */
export function getNextMilestoneInfo(claimedMilestones, letters) {
  const milestones = generateScribeMilestones();
  
  if (claimedMilestones >= milestones.length) {
    return null;
  }
  
  const nextMilestone = milestones[claimedMilestones];
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
 * Gera informações de todos os marcos para exibição na UI
 */
export function getAllMilestonesInfo(claimedMilestones, letters) {
  const milestones = generateScribeMilestones();
  
  return milestones.map((milestone, index) => {
    const isClaimed = index < claimedMilestones;
    const isNext = index === claimedMilestones;
    const canClaim = isNext && letters.gte(milestone.cost);
    
    return {
      id: milestone.id,
      cost: milestone.cost,
      bonus: milestone.bonus,
      isClaimed,
      isNext,
      canClaim,
      isLocked: !isClaimed && !isNext,
    };
  });
}
