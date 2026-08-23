import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { SkeletonStatRow } from '../components/Skeleton';
import {
  getTechnicianDashboardStats,
  getAssignedComplaints,
  acceptComplaint,
  startWork,
  resolveComplaint,
  uploadFile,
} from '../services/api';
import './UserDashboard.css';
import './AdminTechDashboard.css';

const navItems = [
  { path: '/technician/dashboard', label: 'My Work', icon: '🛠️' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

function TechnicianDashboard() {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState({});
  const [resolutionImages, setResolutionImages] = useState({});
  const [uploadingId, setUploadingId] = useState(null);
  const [showResolveFor, setShowResolveFor] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setErrored(false);
    try {
      const [statsRes, complaintsRes] = await Promise.all([
        getTechnicianDashboardStats(),
        getAssignedComplaints(),
      ]);
      setStats(statsRes.data);
      setComplaints(complaintsRes.data);
    } catch (err) {
      console.error('Failed to load technician data', err);
      setErrored(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id) => {
    setActionLoading(id);
    try {
      await acceptComplaint(id);
      loadData();
      toast.success('Complaint accepted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept complaint');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStart = async (id) => {
    setActionLoading(id);
    try {
      await startWork(id);
      loadData();
      toast.success('Work started');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start work');
    } finally {
      setActionLoading(null);
    }
  };

  const handleResolve = async (id) => {
    const notes = resolutionNotes[id];
    if (!notes || notes.trim() === '') {
      toast.error('Please add resolution notes');
      return;
    }
    setActionLoading(id);
    try {
      let imagePath = '';
      const imageFile = resolutionImages[id];
      if (imageFile) {
        setUploadingId(id);
        const uploadRes = await uploadFile(imageFile);
        imagePath = uploadRes.data.filePath;
        setUploadingId(null);
      }
      await resolveComplaint(id, notes, imagePath);
      setShowResolveFor(null);
      loadData();
      toast.success('Complaint resolved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resolve complaint');
    } finally {
      setActionLoading(null);
      setUploadingId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout navItems={navItems}>
        <div className="page-header">
          <div>
            <h1>My Work</h1>
            <p>Complaints assigned to you — accept, work on, and resolve</p>
          </div>
        </div>
        <SkeletonStatRow count={4} />
      </DashboardLayout>
    );
  }

  if (errored || !stats) {
    return (
      <DashboardLayout navItems={navItems}>
        <div className="error-state">
          <h3>Couldn't load your work queue</h3>
          <p>Please check your connection and try again.</p>
          <button className="action-btn primary" onClick={loadData}>Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  const activeWork = complaints.filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED');
  const completedWork = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED');

  return (
    <DashboardLayout navItems={navItems}>
      <div className="page-header">
        <div>
          <h1>My Work</h1>
          <p>Complaints assigned to you — accept, work on, and resolve</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon icon-slate">📋</div>
          <div className="stat-value">{stats.totalAssignedComplaints}</div>
          <div className="stat-label">Assigned</div>
        </div>
        <div className="stat-card accent-amber">
          <div className="stat-icon icon-amber">🔧</div>
          <div className="stat-value">{stats.inProgressComplaints}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card accent-teal">
          <div className="stat-icon icon-teal">✓</div>
          <div className="stat-value">{stats.resolvedComplaints}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-slate">📈</div>
          <div className="stat-value">{stats.resolutionRate.toFixed(0)}%</div>
          <div className="stat-label">Resolution Rate</div>
        </div>
      </div>

      <div className="section-block">
        <div className="section-block-header">
          <h2>Active Work ({activeWork.length})</h2>
        </div>

        {activeWork.length === 0 ? (
          <div className="empty-state">
            <h3>Nothing assigned right now</h3>
            <p>New assignments will show up here</p>
          </div>
        ) : (
          activeWork.map((c) => (
            <div key={c.id} className="complaint-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div className="complaint-card-left">
                  <Link to={`/complaints/${c.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ color: 'var(--color-text-dark)' }}>{c.title}</h3>
                  </Link>
                  <div className="complaint-meta">
                    <span className="mono">#{c.id}</span>
                    <span>•</span>
                    <span>{c.categoryName}</span>
                    <span>•</span>
                    <span>{c.userName}</span>
                  </div>
                </div>
                <span className={`status-badge status-${c.status.toLowerCase()}`}>
                  {c.status.replace('_', ' ')}
                </span>
              </div>

              <p style={{ fontSize: '14px', color: 'var(--color-text-muted)', margin: '12px 0' }}>
                {c.description}
              </p>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {c.status === 'ASSIGNED' && (
                  <button
                    className="action-btn primary"
                    onClick={() => handleAccept(c.id)}
                    disabled={actionLoading === c.id}
                  >
                    {actionLoading === c.id ? 'Accepting...' : 'Accept'}
                  </button>
                )}
                {c.status === 'ACCEPTED' && (
                  <button
                    className="action-btn primary"
                    onClick={() => handleStart(c.id)}
                    disabled={actionLoading === c.id}
                  >
                    {actionLoading === c.id ? 'Starting...' : 'Start Work'}
                  </button>
                )}
                {c.status === 'IN_PROGRESS' && showResolveFor !== c.id && (
                  <button className="action-btn teal" onClick={() => setShowResolveFor(c.id)}>
                    Mark Resolved
                  </button>
                )}
              </div>

              {showResolveFor === c.id && (
                <div style={{ marginTop: '14px', borderTop: '1px solid var(--color-border)', paddingTop: '14px' }}>
                  <textarea
                    className="resolution-textarea"
                    placeholder="Describe how the issue was resolved..."
                    value={resolutionNotes[c.id] || ''}
                    onChange={(e) => setResolutionNotes({ ...resolutionNotes, [c.id]: e.target.value })}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setResolutionImages({ ...resolutionImages, [c.id]: e.target.files[0] })}
                    style={{ fontSize: '13px', marginBottom: '10px', display: 'block' }}
                  />
                  <button
                    className="action-btn teal"
                    onClick={() => handleResolve(c.id)}
                    disabled={actionLoading === c.id}
                  >
                    {uploadingId === c.id ? 'Uploading photo...' : actionLoading === c.id ? 'Submitting...' : 'Confirm Resolution'}
                  </button>
                  <button className="action-btn" onClick={() => setShowResolveFor(null)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="section-block">
        <div className="section-block-header">
          <h2>Completed ({completedWork.length})</h2>
        </div>

        {completedWork.length === 0 ? (
          <div className="empty-state">
            <h3>No completed work yet</h3>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {completedWork.map((c) => (
                <tr key={c.id}>
                  <td className="mono">#{c.id}</td>
                  <td><Link to={`/complaints/${c.id}`} style={{ color: 'var(--color-text-dark)', fontWeight: 600, textDecoration: 'none' }}>{c.title}</Link></td>
                  <td>{c.categoryName}</td>
                  <td>
                    <span className={`status-badge status-${c.status.toLowerCase()}`}>{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  );
}

export default TechnicianDashboard;