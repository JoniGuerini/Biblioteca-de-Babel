import { useEffect } from 'react';
import { formatBigNumber, formatInteger } from '../game';

const UNITS = [
  { ms: 365 * 24 * 60 * 60 * 1000, singular: 'ano', plural: 'anos' },
  { ms: 30 * 24 * 60 * 60 * 1000, singular: 'mês', plural: 'meses' },
  { ms: 7 * 24 * 60 * 60 * 1000, singular: 'semana', plural: 'semanas' },
  { ms: 24 * 60 * 60 * 1000, singular: 'dia', plural: 'dias' },
  { ms: 60 * 60 * 1000, singular: 'hora', plural: 'horas' },
  { ms: 60 * 1000, singular: 'minuto', plural: 'minutos' },
  { ms: 1000, singular: 'segundo', plural: 'segundos' },
];

function formatOfflineDuration(ms) {
  if (ms < 1000) return 'menos de 1 segundo';
  let remaining = ms;
  const parts = [];
  for (const { ms: unitMs, singular, plural } of UNITS) {
    if (remaining >= unitMs && parts.length < 2) {
      const value = Math.floor(remaining / unitMs);
      parts.push(`${value} ${value === 1 ? singular : plural}`);
      remaining %= unitMs;
    }
  }
  return parts.join(' e ');
}

export function OfflineProgressDialog({ gains, onDismiss }) {
  useEffect(() => {
    if (!gains) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') onDismiss();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [gains, onDismiss]);

  if (!gains) return null;

  const { lettersProduced, generatorProduced, scribesProduced, elapsedMs } = gains;
  const hasLetters = lettersProduced.gt(0);
  const hasScribes = scribesProduced && scribesProduced.gt(0);
  const hasGenerators = Object.keys(generatorProduced).length > 0;

  if (!hasLetters && !hasScribes && !hasGenerators) return null;

  return (
    <div className="dialog-overlay" onClick={onDismiss} role="dialog" aria-modal="true" aria-labelledby="offline-dialog-title">
      <div className="dialog-panel offline-dialog-panel" onClick={(e) => e.stopPropagation()}>
        <h2 id="offline-dialog-title" className="dialog-title">Bem-vindo de volta!</h2>
        <p className="dialog-message">
          Você esteve ausente por <strong>{formatOfflineDuration(elapsedMs || 0)}</strong>.
          Enquanto isso, sua Biblioteca produziu:
        </p>
        <ul className="offline-gains-list">
          {hasLetters && (
            <li className="offline-gain-item">
              <span className="offline-gain-label">Letras</span>
              <span className="offline-gain-value">+{formatBigNumber(lettersProduced)}</span>
            </li>
          )}
          {hasScribes && (
            <li className="offline-gain-item">
              <span className="offline-gain-label">Escribas</span>
              <span className="offline-gain-value">+{formatInteger(scribesProduced)}</span>
            </li>
          )}
          {Object.entries(generatorProduced).map(([name, amount]) => (
            <li key={name} className="offline-gain-item">
              <span className="offline-gain-label">{name}</span>
              <span className="offline-gain-value">+{formatBigNumber(amount)}</span>
            </li>
          ))}
        </ul>
        <div className="dialog-actions">
          <button type="button" className="dialog-btn dialog-btn-confirm" onClick={onDismiss}>
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
}
