import { useGameState } from '../hooks/useGameState';

export function PrestigePanel() {
  const { displayState, doPrestige } = useGameState();
  const state = displayState.current;

  return (
    <div className="prestige-panel-container">
      <div className="prestige-card">
        <div className="prestige-card-header">
          <h2 className="prestige-title">Prestígio</h2>
          <p className="prestige-description">
            Ao atingir o limite infinito da Biblioteca, você pode reiniciar sua jornada 
            em troca de pontos de prestígio permanentes.
          </p>
        </div>

        <div className="prestige-status">
          <div className="prestige-current-points">
            <span className="prestige-label">Pontos de Prestígio</span>
            <span className="prestige-value">{state.prestigePoints || 0}</span>
          </div>

          <div className="prestige-progress-display">
            <span className="prestige-label">Progresso</span>
            <span className="prestige-value">{state.prestigeProgressPercent || '0.00%'}</span>
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

        {state.prestigePoints > 0 && (
          <div className="prestige-note">
            <p>Melhorias de prestígio em breve...</p>
          </div>
        )}
      </div>
    </div>
  );
}
