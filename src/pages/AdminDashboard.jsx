import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import DashboardLayout from '../components/DashboardLayout';
import { SkeletonStatRow } from '../components/Skeleton';
import {
  getAdminDashboardStats,
  getAllComplaintsAdmin,
  getAllTechnicians,
  assignTechnicianToComplaint,
} from '../services/api';
import './UserDashboard.css';
import './AdminTechDashboard.css';

const navItems = [
  { path: '/admin/dashboard', label: 'Overview', icon: '📊' },
  { path: '/admin/technicians', label: 'Technicians', icon: '🛠️' },
  { path: '/admin/categories', label: 'Categories', icon: '🗂️' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

const STATUS_COLORS = {
  Open: '#6B7A90',
  Assigned: '#F5A623',
  Accepted: '#F5A623',
  'In Progress': '#D48A0C',
  Resolved: '#1B998B',
  Closed: '#1B998B',
  Cancelled: '#E85D4C',
};

const PRIORITY_COLORS = {
  Low: '#A0AEC0',
  Medium: '#F5A623',
  High: '#E85D4C',
  Urgent: '#C81E3A',
};

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [selectedTech, setSelectedTech] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setErrored(false);
    try {
      const [statsRes, complaintsRes, techRes] = await Promise.all([
        getAdminDashboardStats(),
        getAllComplaintsAdmin(),
        getAllTechnicians(),
      ]);
      setStats(statsRes.data);
      setComplaints(complaintsRes.data);
      setTechnicians(techRes.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
      setErrored(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (complaintId) => {
    const techId = selectedTech[complaintId];
    if (!techId) {
      toast.error('Please select a technician first');
      return;
    }
    setAssigningId(complaintId);
    try {
      await assignTechnicianToComplaint(complaintId, techId);
      loadData();
      toast.success('Technician assigned successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign technician');
    } finally {
      setAssigningId(null);
    }
  };

  if (loading) {
    return (
      <DashboardLayout navItems={navItems}>
        <div className="page-header">
          <div>
            <h1>Admin Overview</h1>
            <p>Monitor complaints, assign technicians, and track resolution across the system</p>
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
          <h3>Couldn't load dashboard data</h3>
          <p>Please check your connection and try again.</p>
          <button className="action-btn primary" onClick={loadData}>Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  const openComplaints = complaints.filter((c) => c.status === 'OPEN');
  const activeComplaints = complaints.filter((c) =>
    ['ASSIGNED', 'ACCEPTED', 'IN_PROGRESS'].includes(c.status)
  );

  // Recent activity — मागच्या ५ complaints, नवीन आधी (existing data वरून, extra API call नाही)
  const recentActivity = [...complaints]
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  const statusData = [
    { name: 'Open', value: stats.openComplaints },
    { name: 'Assigned', value: stats.assignedComplaints },
    { name: 'Accepted', value: stats.acceptedComplaints },
    { name: 'In Progress', value: stats.inProgressComplaints },
    { name: 'Resolved', value: stats.resolvedComplaints },
    { name: 'Closed', value: stats.closedComplaints },
    { name: 'Cancelled', value: stats.cancelledComplaints },
  ].filter((d) => d.value > 0);

  const priorityData = [
    { name: 'Low', value: stats.lowPriorityComplaints },
    { name: 'Medium', value: stats.mediumPriorityComplaints },
    { name: 'High', value: stats.highPriorityComplaints },
    { name: 'Urgent', value: stats.urgentPriorityComplaints },
  ];

  return (
    <DashboardLayout navItems={navItems}>
      <div className="page-header">
        <div>
          <h1>Admin Overview</h1>
          <p>Monitor complaints, assign technicians, and track resolution across the system</p>
        </div>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-icon icon-slate">📋</div>
          <div className="stat-value">{stats.totalComplaints}</div>
          <div className="stat-label">Total Complaints</div>
        </div>
        <div className="stat-card accent-amber">
          <div className="stat-icon icon-amber">🕐</div>
          <div className="stat-value">{stats.openComplaints}</div>
          <div className="stat-label">Open</div>
        </div>
        <div className="stat-card accent-teal">
          <div className="stat-icon icon-teal">✓</div>
          <div className="stat-value">{stats.resolvedComplaints + stats.closedComplaints}</div>
          <div className="stat-label">Resolved</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon icon-slate">📈</div>
          <div className="stat-value">{stats.resolutionRate.toFixed(0)}%</div>
          <div className="stat-label">Resolution Rate</div>
        </div>
      </div>

      {stats.totalComplaints > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' }}>
                   <div className="details-card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-dark)', marginBottom: '16px' }}>
              Status Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={2}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={STATUS_COLORS[entry.name] || '#A0AEC0'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="details-card" style={{ background: 'white', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '20px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text-dark)', marginBottom: '16px' }}>
              Priority Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priorityData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={index} fill={PRIORITY_COLORS[entry.name]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="section-block">
        <div className="section-block-header">
          <h2>Unassigned Complaints ({openComplaints.length})</h2>
        </div>

        {openComplaints.length === 0 ? (
          <div className="empty-state">
            <h3>Nothing to assign</h3>
            <p>All open complaints have a technician assigned</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Raised By</th>
                <th>Assign Technician</th>
              </tr>
            </thead>
            <tbody>
              {openComplaints.map((c) => (
                <tr key={c.id}>
                  <td className="mono">#{c.id}</td>
                  <td><Link to={`/complaints/${c.id}`} style={{ color: 'var(--color-text-dark)', fontWeight: 600, textDecoration: 'none' }}>{c.title}</Link></td>
                  <td>{c.categoryName}</td>
                  <td>
                    <span className={`priority-dot priority-${c.priority.toLowerCase()}`}></span>{' '}
                    {c.priority}
                  </td>
                  <td>{c.userName}</td>
                  <td>
                    <select
                      className="select-inline"
                      value={selectedTech[c.id] || ''}
                      onChange={(e) => setSelectedTech({ ...selectedTech, [c.id]: e.target.value })}
                    >
                      <option value="">Select technician</option>
                      {technicians.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.userName} ({t.specialization})
                        </option>
                      ))}
                    </select>
                    <button
                      className="action-btn primary"
                      onClick={() => handleAssign(c.id)}
                      disabled={assigningId === c.id}
                    >
                      {assigningId === c.id ? 'Assigning...' : 'Assign'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="section-block">
        <div className="section-block-header">
          <h2>In Progress ({activeComplaints.length})</h2>
        </div>

        {activeComplaints.length === 0 ? (
          <div className="empty-state">
            <h3>No active work</h3>
            <p>No complaints are currently being worked on</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Technician</th>
                <th>Status</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {activeComplaints.map((c) => (
                <tr key={c.id}>
                  <td className="mono">#{c.id}</td>
                  <td><Link to={`/complaints/${c.id}`} style={{ color: 'var(--color-text-dark)', fontWeight: 600, textDecoration: 'none' }}>{c.title}</Link></td>
                  <td>{c.technicianName || '—'}</td>
                  <td>
                    <span className={`status-badge status-${c.status.toLowerCase()}`}>
                      {c.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <span className={`priority-dot priority-${c.priority.toLowerCase()}`}></span>{' '}
                    {c.priority}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="section-block">
        <div className="section-block-header">
          <h2>Recent Activity</h2>
        </div>
        {recentActivity.length === 0 ? (
          <div className="empty-state"><h3>No activity yet</h3></div>
        ) : (
          <div className="details-card" style={{ padding: '4px 20px' }}>
            {recentActivity.map((c, i) => (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 0',
                  borderBottom: i !== recentActivity.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <div>
                  <Link to={`/complaints/${c.id}`} style={{ color: 'var(--color-text-dark)', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}>
                    #{c.id} — {c.title}
                  </Link>
                  <div style={{ fontSize: '12.5px', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                    {c.technicianName ? `Assigned to ${c.technicianName}` : 'Not yet assigned'} • {new Date(c.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <span className={`status-badge status-${c.status.toLowerCase()}`}>{c.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default AdminDashboard;