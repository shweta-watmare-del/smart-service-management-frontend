import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import ConfirmModal from '../components/ConfirmModal';
import { SkeletonStatRow, SkeletonCard } from '../components/Skeleton';
import { getMyComplaints, createComplaint, getAllCategories, cancelComplaint, uploadFile } from '../services/api';
import './UserDashboard.css';

const navItems = [
  { path: '/dashboard', label: 'My Complaints', icon: '📋' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

function UserDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [showModal, setShowModal] = useState(false);
   const [formData, setFormData] = useState({ title: '', description: '', categoryId: '', priority: 'MEDIUM', address: '' });
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [cancelTarget, setCancelTarget] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setErrored(false);
    try {
      const [complaintsRes, categoriesRes] = await Promise.all([
        getMyComplaints(),
        getAllCategories(),
      ]);
      setComplaints(complaintsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error('Failed to load data', err);
      setErrored(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateComplaint = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let imagePath = null;
      if (selectedImage) {
        setUploading(true);
        const uploadRes = await uploadFile(selectedImage);
        imagePath = uploadRes.data.filePath;
        setUploading(false);
      }

      await createComplaint({
        ...formData,
        categoryId: parseInt(formData.categoryId),
        imagePath,
      });
      setShowModal(false);
            setFormData({ title: '', description: '', categoryId: '', priority: 'MEDIUM', address: '' });
      setSelectedImage(null);
      loadData();
      toast.success('Complaint raised successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create complaint');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  const confirmCancel = async () => {
    try {
      await cancelComplaint(cancelTarget);
      loadData();
      toast.success('Complaint cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel complaint');
    } finally {
      setCancelTarget(null);
    }
  };

  const stats = {
    total: complaints.length,
    open: complaints.filter((c) => c.status === 'OPEN').length,
    inProgress: complaints.filter((c) => ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'].includes(c.status)).length,
    resolved: complaints.filter((c) => ['RESOLVED', 'CLOSED'].includes(c.status)).length,
  };

  const filteredComplaints = complaints.filter((c) =>
    (statusFilter === 'ALL' || c.status === statusFilter) &&
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout navItems={navItems}>
      <div className="page-header">
        <div>
          <h1>My Complaints</h1>
          <p>Track and manage the service requests you've raised</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Raise Complaint
        </button>
      </div>

      {loading ? (
        <SkeletonStatRow count={4} />
      ) : errored ? (
        <div className="error-state">
          <h3>Couldn't load your complaints</h3>
          <p>Please check your connection and try again.</p>
          <button className="action-btn primary" onClick={loadData}>Retry</button>
        </div>
      ) : (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon icon-slate">📋</div>
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Total Complaints</div>
            </div>
            <div className="stat-card accent-amber">
              <div className="stat-icon icon-amber">🕐</div>
              <div className="stat-value">{stats.open}</div>
              <div className="stat-label">Open</div>
            </div>
            <div className="stat-card accent-amber">
              <div className="stat-icon icon-amber">🔧</div>
              <div className="stat-value">{stats.inProgress}</div>
              <div className="stat-label">In Progress</div>
            </div>
            <div className="stat-card accent-teal">
              <div className="stat-icon icon-teal">✓</div>
              <div className="stat-value">{stats.resolved}</div>
              <div className="stat-label">Resolved</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <input
              type="text"
              placeholder="Search complaints..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, padding: '10px 14px', border: '1.5px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '14px' }}
            />
            <select
              className="select-inline"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ marginRight: 0 }}
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="complaints-list-header">
            <h2>Recent Complaints</h2>
          </div>

          {filteredComplaints.length === 0 ? (
            <div className="empty-state">
              <h3>No complaints found</h3>
              <p>Try adjusting your search or filter</p>
            </div>
          ) : (
            filteredComplaints.map((c) => (
              <div key={c.id} className="complaint-card">
                <div className="complaint-card-left">
                  <Link to={`/complaints/${c.id}`} style={{ textDecoration: 'none' }}>
                    <h3 style={{ color: 'var(--color-text-dark)', cursor: 'pointer' }}>{c.title}</h3>
                  </Link>
                  <div className="complaint-meta">
                    <span className="mono">#{c.id}</span>
                    <span>•</span>
                    <span>{c.categoryName}</span>
                    <span>•</span>
                    <span className={`priority-dot priority-${c.priority.toLowerCase()}`}></span>
                    <span>{c.priority}</span>
                    <span>•</span>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`status-badge status-${c.status.toLowerCase()}`}>{c.status.replace('_', ' ')}</span>
                  {c.status === 'OPEN' && (
                    <button
                      onClick={() => setCancelTarget(c.id)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-coral)', fontSize: '13px', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Raise a New Complaint</h2>
            <form onSubmit={handleCreateComplaint}>
              <div className="form-group-custom">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="e.g. Kitchen tap leaking"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group-custom">
                <label>Description</label>
                <textarea
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
                           <div className="form-group-custom">
                <label>Address</label>
                <input
                  type="text"
                  placeholder="e.g. Flat 302, Sunrise Apartments, MG Road"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div className="form-group-custom">
                <label>Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group-custom">
                <label>Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
              <div className="form-group-custom">
                <label>Photo (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedImage(e.target.files[0])}
                  style={{ fontSize: '13.5px' }}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {uploading ? 'Uploading photo...' : submitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!cancelTarget}
        title="Cancel this complaint?"
        message="This action cannot be undone. The complaint will be marked as cancelled."
        confirmLabel="Yes, Cancel"
        danger
        onConfirm={confirmCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </DashboardLayout>
  );
}

export default UserDashboard;