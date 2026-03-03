import { useRef } from 'react';
import { useGameState } from '../hooks/useGameState';

export function GeneratorButton({ data }) {
  const { buyGenerator, buyMode } = useGameState();
  const prevProgressRef = useRef(0);
  const cycleKeyRef = useRef(0);

  const progress = data.cycleProgress;
  if (progress < prevProgressRef.current - 0.3) {
    cycleKeyRef.current += 1;
  }
  prevProgressRef.current = progress;

  const costText = data.producerName
    ? `Produzido por ${data.producerName}`
    : data.prevName
      ? `${data.cost} Letras + ${data.prevRequired} ${data.prevName} + ${data.scribesRequired} Escribas`
      : `${data.cost} Letras + ${data.scribesRequired} Escribas`;

  return (
    <button
      type="button"
      className="generator-btn"
      onClick={() => buyGenerator(data.name)}
      disabled={data.disabled || data.isLocked}
    >
      <div className="generator-info">
        <div className="generator-name">{data.name}</div>
        {data.isLocked ? (
          <p className="generator-unlock-msg">
            Junte {data.unlockPrevRequired} {data.prevName} para desbloquear o gerador {data.name}
          </p>
        ) : (
          <>
            {data.flavorText && (
              <div className="generator-flavor">{data.flavorText}</div>
            )}
            <div className="generator-stats generator-cycle-row">
              <span>{data.cycleDurationSec}s</span>
              <span>{data.totalPerCycle} {data.outputName}</span>
            </div>
            <div className="generator-progress-bar">
              <div
                key={cycleKeyRef.current}
                className="generator-progress-fill"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="generator-footer">
              <span className="generator-cost">{costText}</span>
              <span className="generator-count">
                ×{data.count}
                {buyMode !== '1x' && data.canBuy > 0 && (
                  <span className="generator-can-buy">+{data.canBuy}</span>
                )}
              </span>
            </div>
          </>
        )}
      </div>
    </button>
  );
}
