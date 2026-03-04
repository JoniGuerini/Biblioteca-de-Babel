import { useGameState } from '../hooks/useGameState';

export function ScribeMilestonesList() {
  const { getScribeMilestonesDisplay, claimScribeMilestone, buyScribeUpgrade } = useGameState();
  const data = getScribeMilestonesDisplay();

  const nextMilestone = data.milestones.find(m => m.isNext);
  const availableToClaim = data.milestones.filter(m => m.canClaim).length;
  const { upgrade } = data;

  return (
    <div className="scribe-milestones-container">
      <div className="upgrades-list">
        <div className="upgrade-card">
          <div className="upgrade-card-header">
            <span className="upgrade-generator-name">Produção de Escribas</span>
          </div>

          <div className="upgrade-options">
            <div className="upgrade-option">
              <div className="upgrade-option-header">
                <span className="upgrade-type-label">Multiplicador</span>
                <span className="upgrade-rank">Rank {upgrade.rank}</span>
              </div>
              
              <div className="upgrade-current">
                <strong>{upgrade.currentMultiplier}x</strong>
                <span className="upgrade-arrow"> → {upgrade.nextMultiplier}x</span>
              </div>

              <button
                type="button"
                className="upgrade-btn"
                disabled={!upgrade.canAfford}
                onClick={buyScribeUpgrade}
              >
                <span className="upgrade-btn-cost">{upgrade.costFormatted} Favor</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="scribe-milestone-single">
        {nextMilestone ? (
          <div className="scribe-milestone-card next">
            <div className="scribe-milestone-info">
              <span className="scribe-milestone-number">
                Marco #{nextMilestone.id + 1}
              </span>
              <span className="scribe-milestone-bonus">
                +{nextMilestone.bonus} Escriba/s
              </span>
            </div>

            <div className="scribe-milestone-cost">
              <span className={nextMilestone.canClaim ? 'affordable' : ''}>
                {nextMilestone.costFormatted} Letras
              </span>
            </div>

            {availableToClaim > 1 && (
              <div className="scribe-milestone-pending">
                {availableToClaim} marcos disponíveis para resgatar!
              </div>
            )}

            <button
              type="button"
              className="scribe-milestone-btn"
              disabled={!nextMilestone.canClaim}
              onClick={claimScribeMilestone}
            >
              {nextMilestone.canClaim ? 'Resgatar' : 'Letras insuficientes'}
            </button>
          </div>
        ) : (
          <div className="scribe-milestone-card completed">
            <p>Todos os marcos foram resgatados!</p>
          </div>
        )}
      </div>
    </div>
  );
}
