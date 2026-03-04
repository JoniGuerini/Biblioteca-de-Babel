import { useGameState, LINE_CONFIG } from '../hooks/useGameState';

export function LetterCounter({ productionLine = 'letters' }) {
  const { displayState } = useGameState();
  const state = displayState.current;
  
  const lineConfig = LINE_CONFIG.find(l => l.id === productionLine);
  const lineData = state.lines?.[productionLine] || {};
  const resourceLabel = lineData.label || lineConfig?.label || 'Letras';
  const resourceValue = lineData.resource || '0';
  const productionRate = lineData.productionRate || '0';

  return (
    <div className="header-counters">
      <div className="header-counter">
        <span className="counter-label">{resourceLabel}</span>
        <div className="letter-counter">{resourceValue}</div>
        <p className="production-rate">
          Produção: <span>{productionRate}</span>/s
        </p>
      </div>
      <div className="header-counter">
        <span className="counter-label">Escribas</span>
        <div className="letter-counter">{state.scribes}</div>
        <p className="production-rate">
          Produção: <span>{state.scribesProductionRate ?? 0}</span>/s
        </p>
      </div>
      <div className="header-counter">
        <span className="counter-label">Favor</span>
        <div className="letter-counter">{state.favor || '0'}</div>
        <p className="production-rate">
          Marcos atingidos nos geradores
        </p>
      </div>
    </div>
  );
}

export function PrestigeProgressBar() {
  const { displayState } = useGameState();
  const state = displayState.current;
  const progress = (state.prestigeProgress || 0) * 100;

  return (
    <div className="prestige-progress-container">
      <div className="prestige-progress-bar">
        <div 
          className="prestige-progress-fill"
          style={{ width: `${progress}%` }}
        />
        <div className="prestige-progress-info prestige-progress-info-dark">
          <span className="prestige-progress-percent">
            {state.prestigeProgressPercent || '0.00%'}
          </span>
          <span className="prestige-progress-text">
            Progresso até o Infinito
          </span>
          <span className="prestige-progress-eta">
            {state.prestigeEstimatedTime || '∞'}
          </span>
        </div>
        <div 
          className="prestige-progress-info prestige-progress-info-light"
          style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
        >
          <span className="prestige-progress-percent">
            {state.prestigeProgressPercent || '0.00%'}
          </span>
          <span className="prestige-progress-text">
            Progresso até o Infinito
          </span>
          <span className="prestige-progress-eta">
            {state.prestigeEstimatedTime || '∞'}
          </span>
        </div>
      </div>
    </div>
  );
}
