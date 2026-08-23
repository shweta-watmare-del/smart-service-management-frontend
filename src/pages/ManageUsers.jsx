import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { getAllUsersAdmin, deleteUser } from '../services/api';
import './UserDashboard.css';
import './AdminTechDashboard.css';
import { SkeletonTable } from '../components/Skeleton';

const navItems = [
  { path: '/admin/dashboard', label: 'Overview', icon: '📊' },
  { path: '/admin/technicians', label: 'Technicians', icon: '🛠️' },
  { path: '/admin/categories', label: 'Categories', icon: '🗂️' },
  { path: '/admin/users', label: 'Users', icon: '👥' },
  { path: '/profile', label: 'Profile', icon: '👤' },
];

function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
    const [errored, setErrored] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

   const loadData = async () => {
    setLoading(true);
    setErrored(false);
    try {
      const res = await getAllUsersAdmin();
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users', err);
      setErrored(true);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await deleteUser(id);
      loadData();
    } catch (err) {
      const message = err.response?.status === 500
        ? 'This user cannot be deleted because they have complaint history on record.'
        : (err.response?.data?.message || 'Failed to delete user');
      alert(message);
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="page-header">
        <div>
          <h1>Manage Users</h1>
          <p>View and manage all registered users</p>
        </div>
      </div>

            {loading ? (
        <SkeletonTable rows={4} />
      ) : errored ? (
        <div className="error-state">
          <h3>Couldn't load users</h3>
          <button className="action-btn primary" onClick={loadData}>Retry</button>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td>
                  <span className="status-badge status-open">{u.role}</span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="action-btn" onClick={() => handleDelete(u.id, u.name)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </DashboardLayout>
  );
}

export default ManageUsers;