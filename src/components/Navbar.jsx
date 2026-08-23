import { Link } from 'react-router-dom';
import './Navbar.css';

function Navbar() {
  return (
    <nav className="navbar-custom">
      <Link to="/" className="navbar-brand-custom">
        <span className="brand-dot"></span>
        ServiceDesk
      </Link>
      <div className="navbar-links">
        <Link to="/login">Log in</Link>
        <Link to="/register" className="btn-primary" style={{ padding: '9px 20px', fontSize: '14px' }}>
          Get Started
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;