import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../services/api';
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

function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
    const [errored, setErrored] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

    const loadData = async () => {
    setLoading(true);
    setErrored(false);
    try {
      const res = await getAllCategories();
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to load categories', err);
      setErrored(true);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  const openEditModal = (cat) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, description: cat.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingId) {
        await updateCategory(editingId, formData);
        toast.success('Category updated');
      } else {
        await createCategory(formData);
        toast.success('Category added');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category? This only works if no complaints use it.')) return;
    try {
      await deleteCategory(id);
      loadData();
      toast.success('Category deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete — category may be in use');
    }
  };

  return (
    <DashboardLayout navItems={navItems}>
      <div className="page-header">
        <div>
          <h1>Manage Categories</h1>
          <p>Add, edit, or remove complaint categories</p>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          + Add Category
        </button>
      </div>
      {loading ? (
        <SkeletonTable rows={3} />
      ) : errored ? (
        <div className="error-state">
          <h3>Couldn't load categories</h3>
          <button className="action-btn primary" onClick={loadData}>Retry</button>
        </div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <h3>No categories yet</h3>
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>{cat.name}</td>
                <td>{cat.description || '—'}</td>
                <td>
                  <button className="action-btn" onClick={() => openEditModal(cat)}>Edit</button>
                  <button className="action-btn" onClick={() => handleDelete(cat.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group-custom">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="e.g. Plumbing"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group-custom">
                <label>Description</label>
                <textarea
                  className="resolution-textarea"
                  placeholder="Brief description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }} disabled={submitting}>
                  {submitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default ManageCategories;