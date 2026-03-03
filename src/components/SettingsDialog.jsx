import { useEffect } from 'react';
import { ResetConfirmDialog } from './ResetConfirmDialog';

export function SettingsDialog({
  isOpen,
  onClose,
  onResetClick,
  showResetConfirm,
  onResetConfirm,
  onResetCancel,
  onSaveClick,
  lastSaveTime,
  showFps,
  onShowFpsChange,
}) {
  const lastSaveText = lastSaveTime
    ? new Date(lastSaveTime).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Nunca';

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape' && !showResetConfirm) onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, showResetConfirm, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="dialog-overlay"
      onClick={showResetConfirm ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div className="dialog-panel settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header dialog-header-centered">
          <h2 id="settings-title" className="dialog-title">Configurações</h2>
        </div>
        <div className="settings-content">
          <section className="settings-section">
            <h3 className="settings-section-title">Progresso</h3>
            <div className="settings-row">
              <button type="button" className="settings-btn" onClick={onSaveClick}>
                Salvar jogo
              </button>
              <p className="settings-last-save">Último save: {lastSaveText}</p>
            </div>
            <div className="settings-row">
              <button type="button" className="settings-btn settings-btn-danger" onClick={onResetClick}>
                Resetar progresso
              </button>
            </div>
          </section>
          <section className="settings-section">
            <h3 className="settings-section-title">Interface</h3>
            <label className="settings-toggle-row">
              <span className="settings-toggle-label">Exibir FPS</span>
              <button
                type="button"
                role="switch"
                aria-checked={showFps}
                className={`settings-switch ${showFps ? 'settings-switch-on' : ''}`}
                onClick={() => onShowFpsChange(!showFps)}
              >
                <span className="settings-switch-thumb" />
              </button>
            </label>
          </section>
        </div>
        <ResetConfirmDialog
          isOpen={showResetConfirm}
          onConfirm={onResetConfirm}
          onCancel={onResetCancel}
        />
      </div>
    </div>
  );
}
