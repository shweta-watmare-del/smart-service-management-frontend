import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { SkeletonTable } from '../components/Skeleton';
import { getAllTechnicians, getAllUsersAdmin, getAllComplaintsAdmin, createTechnician, updateTechnicianStatus } from '../services/api';
import './UserDashboard.css';
import './AdminTechDashboard.css';

const navItems = [
  { path: '/admin/dashboard', label: 'Overview', icon: '📊' },
  { path: '/admin/technicians', label: 'Technicians', icon: '🛠️' },
  { path: '/admin/categories', label: 'Categories', icon: '🗂️' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

const AVAILABILITY_STYLE = {
  AVAILABLE: { background: 'rgba(27, 153, 139, 0.12)', color: 'var(--color-teal)' },
  BUSY: { background: 'rgba(245, 166, 35, 0.12)', color: 'var(--color-amber-dark)' },
  OFF_DUTY: { background: 'rgba(107, 122, 144, 0.12)', color: 'var(--color-text-muted)' },
};

function ManageTechnicians() {
  const [technicians, setTechnicians] = useState([]);
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ userId: '', specialization: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setErrored(false);
    try {
      const [techRes, usersRes, complaintsRes] = await Promise.all([
        getAllTechnicians(),
        getAllUsersAdmin(),
        getAllComplaintsAdmin(),
      ]);
      setTechnicians(techRes.data);
      setUsers(usersRes.data);
      setComplaints(complaintsRes.data);
    } catch (err) {
      console.error('Failed to load data', err);
      setErrored(true);
    } finally {
      setLoading(false);
    }
  };

  const technicianUserIds = technicians.map((t) => t.userId);
  const eligibleUsers = users.filter(
    (u) => u.role === 'USER' && !technicianUserIds.includes(u.id)
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createTechnician(formData.userId, formData.specialization);
      setShowModal(false);
      setFormData({ userId: '', specialization: '' });
      loadData();
      toast.success('Technician added successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create technician');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (techId, newStatus) => {
    try {
      await updateTechnicianStatus(techId, newStatus);
      loadData();
      toast.success('Availability updated');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // प्रत्येक technician साठी performance काढ (existing complaints data वरून)
  const getPerformance = (techId) => {
    const assigned = complaints.filter((c) => c.technicianId === techId);
    const resolved = assigned.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED');
    const rate = assigned.length > 0 ? Math.round((resolved.length / assigned.length) * 100) : 0;
    return { assigned: assigned.length, resolved: resolved.length, rate };
  };

  if (loading) {
    return (
      <DashboardLayout navItems={navItems}>
        <div className="page-header">
          <div><h1>Manage Technicians</h1><p>Add new technicians and manage their availability</p></div>
        </div>
        <SkeletonTable rows={4} />
      </DashboardLayout>
    );
  }

  if (errored) {
    return (
      <DashboardLayout navItems={navItems}>
        <div className="error-state">
          <h3>Couldn't load technicians</h3>
          <button className="action-btn primary" onClick={loadData}>Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems}>
      <div className="page-header">
        <div>
          <h1>Manage Technicians</h1>
          <p>Add new technicians and monitor their performance</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + Add Technician
        </button>
      </div>

      {technicians.length === 0 ? (
        <div className="empty-state">
          <h3>No technicians yet</h3>
          <p>Add your first technician to start assigning complaints</p>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialization</th>
              <th>Assigned</th>
              <th>Resolved</th>
              <th>Resolution Rate</th>
              <th>Availability</th>
            </tr>
          </thead>
          <tbody>
            {technicians.map((t) => {
              const perf = getPerformance(t.id);
              return (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.userName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{t.email}</div>
                  </td>
                  <td>{t.specialization}</td>
                  <td className="mono">{perf.assigned}</td>
                  <td className="mono">{perf.resolved}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '60px', height: '6px', background: 'var(--color-paper-dim)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${perf.rate}%`, height: '100%', background: 'var(--color-teal)' }} />
                      </div>
                      <span className="mono" style={{ fontSize: '12px' }}>{perf.rate}%</span>
                    </div>
                  </td>
                  <td>
                    <select
                      className="select-inline"
                      value={t.availabilityStatus}
                      onChange={(e) => handleStatusChange(t.id, e.target.value)}
                      style={{ marginRight: 0, ...AVAILABILITY_STYLE[t.availabilityStatus], fontWeight: 600, border: 'none' }}
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="BUSY">Busy</option>
                      <option value="OFF_DUTY">Off Duty</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Technician</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group-custom">
                <label>Select User</label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                  required
                >
                  <option value="">Choose a registered user</option>
                  {eligibleUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group-custom">
                <label>Specialization</label>
                <input
                  type="text"
                  placeholder="e.g. Plumbing, Electrical"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Adding...' : 'Add Technician'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default ManageTechnicians;