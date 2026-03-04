import { Decimal } from './Decimal';

/**
 * Sistema de Prestígio
 * 
 * O jogador acumula letras até atingir o limite da biblioteca (1.79e308).
 * Ao atingir, pode resetar o progresso para ganhar 1 ponto de prestígio.
 */

export const INFINITY_LIMIT = new Decimal('1e33');

/**
 * Calcula a porcentagem do progresso até o limite infinito
 * Escala linear: porcentagem real de letras / limite
 */
export function getPrestigeProgress(letters) {
  if (!letters || letters.lte(0)) return 0;
  if (letters.gte(INFINITY_LIMIT)) return 1;
  
  const progress = letters.div(INFINITY_LIMIT).toNumber();
  return Math.min(1, Math.max(0, progress));
}

/**
 * Verifica se o jogador pode fazer prestígio
 */
export function canPrestige(letters) {
  return letters.gte(INFINITY_LIMIT);
}

/**
 * Formata o progresso para exibição
 */
export function formatPrestigeProgress(letters) {
  const progress = getPrestigeProgress(letters);
  return (progress * 100).toFixed(2) + '%';
}

/**
 * Formata segundos em uma string legível com até duas unidades
 */
function formatTime(totalSeconds) {
  if (totalSeconds < 1) return '< 1s';
  
  const SECONDS_PER_MINUTE = 60;
  const SECONDS_PER_HOUR = 3600;
  const SECONDS_PER_DAY = 86400;
  const SECONDS_PER_YEAR = 31536000;
  const SECONDS_PER_DECADE = SECONDS_PER_YEAR * 10;
  const SECONDS_PER_CENTURY = SECONDS_PER_YEAR * 100;
  const SECONDS_PER_MILLENNIUM = SECONDS_PER_YEAR * 1000;
  
  const totalMillennia = totalSeconds / SECONDS_PER_MILLENNIUM;
  
  if (totalMillennia >= 1e9) return `${(totalMillennia / 1e9).toFixed(1)}B mil`;
  if (totalMillennia >= 1e6) return `${(totalMillennia / 1e6).toFixed(1)}M mil`;
  if (totalMillennia >= 1000) return `${(totalMillennia / 1000).toFixed(1)}mil mil`;
  
  const millennia = Math.floor(totalSeconds / SECONDS_PER_MILLENNIUM);
  const centuries = Math.floor((totalSeconds % SECONDS_PER_MILLENNIUM) / SECONDS_PER_CENTURY);
  const decades = Math.floor((totalSeconds % SECONDS_PER_CENTURY) / SECONDS_PER_DECADE);
  const years = Math.floor((totalSeconds % SECONDS_PER_DECADE) / SECONDS_PER_YEAR);
  const days = Math.floor((totalSeconds % SECONDS_PER_YEAR) / SECONDS_PER_DAY);
  const hours = Math.floor((totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR);
  const minutes = Math.floor((totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE);
  const seconds = Math.floor(totalSeconds % SECONDS_PER_MINUTE);
  
  if (millennia > 0) {
    if (centuries > 0) return `${millennia}mil ${centuries}séc`;
    return `${millennia}mil`;
  }
  
  if (centuries > 0) {
    if (decades > 0) return `${centuries}séc ${decades}déc`;
    return `${centuries}séc`;
  }
  
  if (decades > 0) {
    if (years > 0) return `${decades}déc ${years}a`;
    return `${decades}déc`;
  }
  
  if (years > 0) {
    if (days > 0) return `${years}a ${days}d`;
    return `${years}a`;
  }
  
  if (days > 0) {
    if (hours > 0) return `${days}d ${hours}h`;
    return `${days}d`;
  }
  
  if (hours > 0) {
    if (minutes > 0) return `${hours}h ${minutes}min`;
    return `${hours}h`;
  }
  
  if (minutes > 0) {
    if (seconds > 0) return `${minutes}min ${seconds}s`;
    return `${minutes}min`;
  }
  
  return `${seconds}s`;
}

/**
 * Calcula o tempo estimado para atingir o infinito
 * Tempo = (Limite - Letras atuais) / Produção por segundo
 * @param {Decimal} letters - Letras atuais
 * @param {Decimal} lettersPerSecond - Taxa de produção por segundo
 * @returns {string} Tempo formatado ou null se não aplicável
 */
export function getEstimatedTimeToInfinity(letters, lettersPerSecond) {
  if (!letters || letters.lte(0)) return null;
  if (!lettersPerSecond || lettersPerSecond.lte(0)) return '∞';
  if (letters.gte(INFINITY_LIMIT)) return 'Completo!';
  
  const remaining = INFINITY_LIMIT.sub(letters);
  const secondsRemaining = remaining.div(lettersPerSecond);
  
  const seconds = secondsRemaining.toNumber();
  
  if (!isFinite(seconds) || seconds > 1e20) return '∞';
  
  return formatTime(seconds);
}

/**
 * Retorna informações do prestígio para a UI
 */
export function getPrestigeInfo(letters, prestigePoints, lettersPerSecond) {
  const progress = getPrestigeProgress(letters);
  const canDoPrestige = canPrestige(letters);
  const estimatedTime = getEstimatedTimeToInfinity(letters, lettersPerSecond);
  
  return {
    progress,
    progressPercent: formatPrestigeProgress(letters),
    canPrestige: canDoPrestige,
    currentPoints: prestigePoints,
    nextPoints: prestigePoints + 1,
    estimatedTime,
  };
}
