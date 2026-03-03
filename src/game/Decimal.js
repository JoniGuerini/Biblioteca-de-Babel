/**
 * Acesso ao Decimal do break_eternity.js (carregado via CDN)
 */
export const Decimal = typeof window !== 'undefined' && window.Decimal
  ? window.Decimal
  : (typeof globalThis !== 'undefined' && globalThis.Decimal) || (() => { throw new Error('break_eternity.js não carregado'); })();
