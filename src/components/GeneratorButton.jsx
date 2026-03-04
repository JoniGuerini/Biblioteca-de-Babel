import { useRef } from 'react';
import { useGameState } from '../hooks/useGameState';

export function GeneratorButton({ data }) {
  const { buyGenerator, buyMode } = useGameState();
  const prevProgressRef = useRef(0);
  const cycleKeyRef = useRef(0);

  const progress = data.cycleProgress;
  const isFastCycle = data.cycleDurationSec <= 1;
  
  if (!isFastCycle && progress < prevProgressRef.current - 0.3) {
    cycleKeyRef.current += 1;
  }
  prevProgressRef.current = progress;

  const costText = data.purchaseLocked && data.producerName
    ? `Produzido por ${data.producerName}`
    : data.prevName
      ? `${data.cost} Letras + ${data.prevRequired} ${data.prevName} + ${data.scribesRequired} Escribas`
      : `${data.cost} Letras + ${data.scribesRequired} Escribas`;

  const hasCount = parseFloat(data.count) > 0;

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
              {isFastCycle ? (
                <>
                  <span></span>
                  <span>{data.perSecond} {data.outputName}/s</span>
                </>
              ) : (
                <>
                  <span>{data.cycleDurationSec}s</span>
                  <span>{data.totalPerCycle} {data.outputName}</span>
                </>
              )}
            </div>
            <div className="generator-progress-bar">
              {isFastCycle && hasCount ? (
                <div className="generator-progress-fill generator-progress-continuous" />
              ) : (
                <div
                  key={cycleKeyRef.current}
                  className="generator-progress-fill"
                  style={{ width: `${progress * 100}%` }}
                />
              )}
            </div>
            <div className="generator-footer">
              <span className={`generator-cost ${!data.purchaseLocked && !data.canAfford ? 'generator-cost-insufficient' : ''}`}>
                {costText}
              </span>
              <span className="generator-count">
                ×{data.count}
                {buyMode !== '1x' && data.canBuy > 0 && !data.purchaseLocked && (
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
