import { useEffect } from 'react';
import { ResetConfirmDialog } from './ResetConfirmDialog';

export function SettingsDialog({ isOpen, onClose, onResetClick, showResetConfirm, onResetConfirm, onResetCancel }) {
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
        <div className="dialog-header">
          <h2 id="settings-title" className="dialog-title">Configurações</h2>
          <button
            type="button"
            className="settings-close-btn"
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        <div className="settings-content">
          <button type="button" className="reset-btn settings-reset-btn" onClick={onResetClick}>
            Resetar progresso
          </button>
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
