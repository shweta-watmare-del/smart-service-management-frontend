import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userData = await login(formData.email, formData.password);

      if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else if (userData.role === 'TECHNICIAN') {
        navigate('/technician/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid email or password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual fade-up">
        <Link to="/" className="brand">
          <span className="brand-dot"></span>
          ServiceDesk
        </Link>
        <h2>Track every complaint from raise to resolve.</h2>
        <p>Sign in to view your open requests, assigned work, or team dashboard — depending on your role.</p>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-box fade-up">
          <h1>Welcome back</h1>
          <p className="auth-subtext">Sign in to continue to your dashboard</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group-custom">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group-custom">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  style={{ paddingRight: '42px', width: '100%' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '16px',
                    padding: 0,
                    color: 'var(--color-text-muted)',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary auth-submit-btn" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="auth-switch-text">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;