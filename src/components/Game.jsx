import { useState } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { useGameState, LINE_CONFIG } from '../hooks/useGameState';
import { LetterCounter, PrestigeProgressBar } from './LetterCounter';
import { BuyModeToggle } from './BuyModeToggle';
import { GeneratorsList } from './GeneratorsList';
import { UpgradesList } from './UpgradesList';
import { ScribeMilestonesList } from './ScribeMilestonesList';
import { PrestigePanel } from './PrestigePanel';
import { FpsDisplay } from './FpsDisplay';
import { SettingsDialog } from './SettingsDialog';
import { OfflineProgressDialog } from './OfflineProgressDialog';

const TABS = [
  { id: 'geradores', label: 'Geradores' },
  { id: 'favores', label: 'Favores' },
  { id: 'escribas', label: 'Escribas' },
  { id: 'prestigio', label: 'Prestígio' },
];

export function Game() {
  const { fps } = useGameLoop();
  const { resetGame, offlineGains, dismissOfflineDialog, saveGameManual, showFps, setShowFps, lastSaveTime, stateRef } = useGameState();
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('geradores');
  const [activeProductionLine, setActiveProductionLine] = useState('letters');
  
  const prestigePoints = stateRef.current.prestigePoints || 0;
  const unlockedLines = LINE_CONFIG.filter(line => prestigePoints >= line.prestigeRequired);
  const hasMultipleLines = unlockedLines.length > 1;

  const handleResetClick = () => setShowResetDialog(true);

  const handleResetConfirm = () => {
    resetGame();
    setShowResetDialog(false);
    setShowSettingsDialog(false);
  };

  const handleResetCancel = () => setShowResetDialog(false);

  return (
    <div className="library-container">
      {showFps && <FpsDisplay fps={fps} />}
      <header className="library-header">
        <LetterCounter productionLine={activeProductionLine} />
        <div className="header-title">
          <h1>A Biblioteca de Babel</h1>
          <p className="subtitle">
            O universo (que outros chamam de Biblioteca) compõe-se de um número indefinido de hexágonos...
          </p>
        </div>
        <BuyModeToggle />
        <PrestigeProgressBar />
      </header>

      {hasMultipleLines && (
        <nav className="production-line-tabs">
          {unlockedLines.map((line) => (
            <button
              key={line.id}
              type="button"
              className={`production-line-tab ${activeProductionLine === line.id ? 'active' : ''}`}
              onClick={() => setActiveProductionLine(line.id)}
            >
              {line.label}
            </button>
          ))}
        </nav>
      )}

      <main className="game-content">
        {activeTab === 'geradores' && (
          <section className="generators-panel">
            <GeneratorsList productionLine={activeProductionLine} />
          </section>
        )}
        {activeTab === 'favores' && (
          <section className="upgrades-panel">
            <UpgradesList productionLine={activeProductionLine} />
          </section>
        )}
        {activeTab === 'escribas' && (
          <section className="scribe-milestones-panel">
            <ScribeMilestonesList />
          </section>
        )}
        {activeTab === 'prestigio' && (
          <section className="prestige-panel">
            <PrestigePanel />
          </section>
        )}
      </main>

      <footer className="library-footer">
        <nav className="footer-actions" aria-label="Menu principal">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
          <button
            type="button"
            className="tab-btn"
            onClick={() => setShowSettingsDialog(true)}
          >
            Configurações
          </button>
        </nav>
        <SettingsDialog
          isOpen={showSettingsDialog}
          onClose={() => setShowSettingsDialog(false)}
          onResetClick={handleResetClick}
          showResetConfirm={showResetDialog}
          onResetConfirm={handleResetConfirm}
          onResetCancel={handleResetCancel}
          onSaveClick={saveGameManual}
          lastSaveTime={lastSaveTime}
          showFps={showFps}
          onShowFpsChange={setShowFps}
        />
        <OfflineProgressDialog
          gains={offlineGains}
          onDismiss={dismissOfflineDialog}
        />
        <p>Inspirado em Jorge Luis Borges — Cada livro é único e infinito</p>
      </footer>
    </div>
  );
}
