import './StatusTimeline.css';

const STEPS = ['OPEN', 'ASSIGNED', 'ACCEPTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const STEP_ICONS = {
  OPEN: '📝',
  ASSIGNED: '👤',
  ACCEPTED: '✅',
  IN_PROGRESS: '🔧',
  RESOLVED: '🎯',
  CLOSED: '🔒',
};

function StatusTimeline({ currentStatus, history }) {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="status-timeline cancelled-banner">
        <span>🚫</span>
        <span>This complaint was cancelled before assignment</span>
      </div>
    );
  }

  const currentIndex = STEPS.indexOf(currentStatus);

  // प्रत्येक step साठी, history मधून timestamp शोध (जर असेल तर)
  const getTimestamp = (step) => {
    const entry = history.find((h) => h.newStatus === step);
    return entry ? new Date(entry.changedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : null;
  };

  return (
    <div className="status-timeline">
      {STEPS.map((step, i) => {
        const isDone = i < currentIndex || currentStatus === 'CLOSED';
        const isActive = i === currentIndex && currentStatus !== 'CLOSED';
        const ts = getTimestamp(step);

        return (
          <div key={step} className={`timeline-step ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}>
            {i !== 0 && <div className="step-line" />}
            <div className="step-icon">{isDone ? '✓' : STEP_ICONS[step]}</div>
            <div className="step-label">{step.replace('_', ' ')}</div>
            {ts && <div className="step-date mono">{ts}</div>}
          </div>
        );
      })}
    </div>
  );
}

export default StatusTimeline;