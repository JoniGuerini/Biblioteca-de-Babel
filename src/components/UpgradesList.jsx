import { useGameState } from '../hooks/useGameState';

export function UpgradesList() {
  const { getUpgradesDisplay, buyUpgrade, UPGRADE_TYPES } = useGameState();
  const upgrades = getUpgradesDisplay();

  const availableUpgrades = upgrades.filter(u => u.hasGenerator);

  if (availableUpgrades.length === 0) {
    return (
      <div className="upgrades-empty">
        <p>Compre geradores para desbloquear melhorias.</p>
        <p className="upgrades-hint">Cada gerador possui duas melhorias que podem ser compradas com Favor.</p>
      </div>
    );
  }

  return (
    <div className="upgrades-list">
      {availableUpgrades.map((upgrade) => (
        <div key={upgrade.generatorName} className="upgrade-card">
          <div className="upgrade-card-header">
            <span className="upgrade-generator-name">{upgrade.generatorName}</span>
          </div>

          <div className="upgrade-options">
            <div className="upgrade-option">
              <div className="upgrade-option-header">
                <span className="upgrade-type-label">Velocidade</span>
                <span className="upgrade-rank">
                  {upgrade.speed.isMaxed ? 'MAX' : `${upgrade.speed.currentRank}/${upgrade.speed.maxRank}`}
                </span>
              </div>
              
              <div className="upgrade-current">
                Ciclo: <strong>{upgrade.currentCycleFormatted}</strong>
                {!upgrade.speed.isMaxed && (
                  <span className="upgrade-arrow"> → {upgrade.nextCycleFormatted}</span>
                )}
              </div>

              <button
                type="button"
                className="upgrade-btn"
                disabled={upgrade.speed.isMaxed || !upgrade.canAffordSpeed}
                onClick={() => buyUpgrade(upgrade.generatorName, UPGRADE_TYPES.SPEED)}
              >
                {upgrade.speed.isMaxed ? (
                  'Máximo'
                ) : (
                  <>
                    <span className="upgrade-btn-cost">{upgrade.speedCostFormatted} Favor</span>
                  </>
                )}
              </button>
            </div>

            <div className="upgrade-option">
              <div className="upgrade-option-header">
                <span className="upgrade-type-label">Produção</span>
                <span className="upgrade-rank">Rank {upgrade.production.currentRank}</span>
              </div>
              
              <div className="upgrade-current">
                Por ciclo: <strong>{upgrade.currentProductionFormatted}</strong>
                <span className="upgrade-arrow"> → {upgrade.nextProductionFormatted}</span>
              </div>

              <button
                type="button"
                className="upgrade-btn"
                disabled={!upgrade.canAffordProduction}
                onClick={() => buyUpgrade(upgrade.generatorName, UPGRADE_TYPES.PRODUCTION)}
              >
                <span className="upgrade-btn-cost">{upgrade.productionCostFormatted} Favor</span>
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
