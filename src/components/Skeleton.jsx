import './Skeleton.css';

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-line w-60" />
      <div className="skeleton-line w-40" />
    </div>
  );
}

export function SkeletonStatRow({ count = 4 }) {
  return (
    <div className="stats-row">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="stat-card skeleton-stat">
          <div className="skeleton-line w-30" style={{ height: '26px', marginBottom: '10px' }} />
          <div className="skeleton-line w-50" style={{ height: '11px' }} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTable({ rows = 4 }) {
  return (
    <div className="data-table" style={{ padding: '8px' }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-line w-100" style={{ height: '38px', margin: '8px 12px' }} />
      ))}
    </div>
  );
}