import { useGameState, LINE_CONFIG } from '../hooks/useGameState';

export function PrestigePanel() {
  const { displayState, doPrestige } = useGameState();
  const state = displayState.current;
  const prestigePoints = state.prestigePoints || 0;

  const nextLine = LINE_CONFIG.find(line => prestigePoints < line.prestigeRequired);

  return (
    <div className="prestige-panel-container">
      <div className="prestige-layout">
        <div className="prestige-main">
          <div className="prestige-header">
            <h2 className="prestige-title">Prestígio</h2>
            <p className="prestige-description">
              Ao atingir o limite infinito da Biblioteca, você pode reiniciar sua jornada 
              em troca de pontos de prestígio permanentes.
            </p>
          </div>

          <div className="prestige-stats">
            <div className="prestige-stat">
              <span className="prestige-stat-value">{prestigePoints}</span>
              <span className="prestige-stat-label">Pontos de Prestígio</span>
            </div>
            <div className="prestige-stat">
              <span className="prestige-stat-value">{state.prestigeProgressPercent || '0.00%'}</span>
              <span className="prestige-stat-label">Progresso</span>
            </div>
          </div>

          <button
            type="button"
            className="prestige-btn"
            disabled={!state.canPrestige}
            onClick={doPrestige}
          >
            {state.canPrestige 
              ? 'Transcender (+1 Prestígio)' 
              : 'Alcance o Infinito para Transcender'
            }
          </button>
        </div>

        <div className="prestige-lines">
          <h3 className="prestige-lines-title">Linhas de Produção</h3>
          <div className="prestige-lines-grid">
            {LINE_CONFIG.map((line) => {
              const isUnlocked = prestigePoints >= line.prestigeRequired;
              const isNext = line === nextLine;
              
              return (
                <div 
                  key={line.id} 
                  className={`prestige-line-card ${isUnlocked ? 'unlocked' : ''} ${isNext ? 'next' : ''}`}
                >
                  <span className="prestige-line-name">{line.label}</span>
                  <span className="prestige-line-favor">×{line.favorMultiplier}</span>
                  <span className="prestige-line-status">
                    {isUnlocked ? '✓' : `${line.prestigeRequired}★`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
