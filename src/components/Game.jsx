import { useState } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { useGameState } from '../hooks/useGameState';
import { LetterCounter } from './LetterCounter';
import { BuyModeToggle } from './BuyModeToggle';
import { GeneratorsList } from './GeneratorsList';
import { FpsDisplay } from './FpsDisplay';
import { SettingsDialog } from './SettingsDialog';
import { OfflineProgressDialog } from './OfflineProgressDialog';

const TABS = [
  { id: 'geradores', label: 'Geradores' },
  { id: 'melhorias', label: 'Melhorias' },
  { id: 'prestigio', label: 'Prestígio' },
];

export function Game() {
  const { fps } = useGameLoop();
  const { resetGame, offlineGains, dismissOfflineDialog } = useGameState();
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('geradores');

  const handleResetClick = () => setShowResetDialog(true);

  const handleResetConfirm = () => {
    resetGame();
    setShowResetDialog(false);
    setShowSettingsDialog(false);
  };

  const handleResetCancel = () => setShowResetDialog(false);

  return (
    <div className="library-container">
      <FpsDisplay fps={fps} />
      <header className="library-header">
        <LetterCounter />
        <div className="header-title">
          <h1>A Biblioteca de Babel</h1>
          <p className="subtitle">
            O universo (que outros chamam de Biblioteca) compõe-se de um número indefinido de hexágonos...
          </p>
        </div>
        <BuyModeToggle />
      </header>

      <main className="game-content">
        {activeTab === 'geradores' && (
          <section className="generators-panel">
            <GeneratorsList />
          </section>
        )}
        {activeTab === 'melhorias' && (
          <section className="tab-panel tab-panel-placeholder">
            <p>Sistema de melhorias em desenvolvimento.</p>
          </section>
        )}
        {activeTab === 'prestigio' && (
          <section className="tab-panel tab-panel-placeholder">
            <p>Sistema de prestígio em desenvolvimento.</p>
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
