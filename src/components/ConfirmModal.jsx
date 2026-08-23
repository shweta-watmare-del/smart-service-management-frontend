import './ConfirmModal.css';

function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="confirm-modal-box" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn-cancel" onClick={onCancel}>Cancel</button>
          <button
            className={danger ? 'action-btn' : 'action-btn primary'}
            style={danger ? { flex: 1, background: 'var(--color-coral)', borderColor: 'var(--color-coral)', color: 'white' } : { flex: 1 }}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;