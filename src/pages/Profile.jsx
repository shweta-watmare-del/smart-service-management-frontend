import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { getUserProfile, updateUserProfile } from '../services/api';
import './UserDashboard.css';

const navItemsByRole = {
  USER: [
    { path: '/dashboard', label: 'My Complaints', icon: '📋' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ],
  ADMIN: [
    { path: '/admin/dashboard', label: 'Overview', icon: '📊' },
    { path: '/admin/technicians', label: 'Technicians', icon: '🛠️' },
    { path: '/admin/categories', label: 'Categories', icon: '🗂️' },
    { path: '/admin/users', label: 'Users', icon: '👥' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ],
  TECHNICIAN: [
    { path: '/technician/dashboard', label: 'My Work', icon: '🛠️' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ],
};

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const res = await getUserProfile();
      setProfile(res.data);
      setFormData({ name: res.data.name, phone: res.data.phone });
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateUserProfile(profile.id, formData);
      toast.success('Profile updated successfully');
      loadProfile();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const navItems = navItemsByRole[user?.role] || [];
  const initials = profile?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  if (loading || !profile) {
    return (
      <DashboardLayout navItems={navItems}>
        <div className="skeleton-line w-40" style={{ height: '18px', marginBottom: '20px' }} />
        <div className="skeleton-card" style={{ height: '260px', maxWidth: '440px' }} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout navItems={navItems}>
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p>Update your personal information</p>
        </div>
      </div>

      <div style={{ maxWidth: '440px' }}>
               <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--color-amber)', color: 'var(--color-ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '18px' }}>
              {initials}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-dark)' }}>{profile.name}</div>
              <span className="status-badge status-open">{profile.role}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group-custom">
              <label>Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group-custom">
              <label>Email</label>
              <input type="email" value={profile.email} disabled style={{ background: 'var(--color-paper-dim)', color: 'var(--color-text-muted)' }} />
            </div>
            <div className="form-group-custom">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
            <div className="form-group-custom">
              <label>Member Since</label>
              <input type="text" value={new Date(profile.createdAt).toLocaleDateString()} disabled style={{ background: 'var(--color-paper-dim)', color: 'var(--color-text-muted)' }} />
            </div>

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default Profile;