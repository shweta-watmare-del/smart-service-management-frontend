import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

function Register() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(formData);
      navigate('/login', { state: { registered: true } });
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
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
        <h2>Get your issue in front of the right person, fast.</h2>
        <p>Create an account to raise complaints, track their progress, and rate the resolution once it's done.</p>
      </div>

      <div className="auth-form-side">
        <div className="auth-form-box fade-up">
          <h1>Create your account</h1>
          <p className="auth-subtext">Start tracking your service requests</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group-custom">
              <label>Full Name</label>
              <input type="text" name="name" placeholder="Rahul Sharma" value={formData.name} onChange={handleChange} required />
            </div>
            <div className="form-group-custom">
              <label>Email</label>
              <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="form-group-custom">
              <label>Phone</label>
              <input type="tel" name="phone" placeholder="9876543210" value={formData.phone} onChange={handleChange} required />
            </div>
            <div className="form-group-custom">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
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
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <p className="auth-switch-text">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;