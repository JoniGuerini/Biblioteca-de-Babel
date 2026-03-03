import { useEffect } from 'react';

export function ResetConfirmDialog({ isOpen, onConfirm, onCancel }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="dialog-title">
      <div className="dialog-panel" onClick={(e) => e.stopPropagation()}>
        <h2 id="dialog-title" className="dialog-title">Resetar progresso</h2>
        <p className="dialog-message">Tem certeza que deseja resetar todo o progresso?</p>
        <div className="dialog-actions">
          <button type="button" className="dialog-btn dialog-btn-cancel" onClick={onCancel}>
            Cancelar
          </button>
          <button type="button" className="dialog-btn dialog-btn-confirm" onClick={onConfirm}>
            Sim, resetar
          </button>
        </div>
      </div>
    </div>
  );
}
