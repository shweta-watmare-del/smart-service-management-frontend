import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

function DashboardLayout({ children, navItems }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // मुख्य dashboard पेजेस वर Back बटण दाखवायची गरज नाही (आधीच "home" आहे तिथे)
  const mainDashboardPaths = ['/dashboard', '/admin/dashboard', '/technician/dashboard'];
  const showBackButton = !mainDashboardPaths.includes(location.pathname);

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <Link to="/" className="sidebar-brand">
          <span className="brand-dot"></span>
          Smart Service Management
        </Link>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
          <button
            className="sidebar-link"
            onClick={handleLogout}
            style={{ marginTop: '4px' }}
          >
            <span>⏻</span>
            Logout
          </button>
        </div>
      </aside>

      <main className="dashboard-main">
        {showBackButton && (
          <button
            onClick={() => navigate(-1)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'none',
              border: 'none',
              color: 'var(--color-text-muted)',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '20px',
              padding: 0,
            }}
          >
            ← Back
          </button>
        )}
        {children}
      </main>
    </div>
  );
}

export default DashboardLayout;