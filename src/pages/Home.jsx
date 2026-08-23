import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import heroImage from '../assets/hero-illustration.png';
import './Home.css';

function Home() {
  const steps = [
    { label: 'Open', status: 'done' },
    { label: 'Assigned', status: 'done' },
    { label: 'In Progress', status: 'active' },
    { label: 'Resolved', status: '' },
    { label: 'Closed', status: '' },
  ];

  return (
    <div>
      <Navbar />

      <section className="hero-section">
        <div style={{ display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 550px' }}>
            <div className="hero-content fade-up">
              <span className="hero-eyebrow mono">Complaint Management, Simplified</span>
              <h1 className="hero-title">
                Every complaint,<br />tracked to <span>resolution</span>.
              </h1>
              <p className="hero-subtitle">
                Raise a service request, watch it move through assignment and repair,
                and know exactly who's working on it — in real time.
              </p>
              <div className="hero-cta-group">
                <Link to="/register" className="btn-primary">Raise a Complaint</Link>
                <Link to="/login" className="btn-outline">Sign In</Link>
              </div>
            </div>

            <div className="status-stepper fade-up fade-up-delay-2">
              {steps.map((step, i) => (
                <div key={i} className={`stepper-item ${step.status}`}>
                  {i !== 0 && <div className="stepper-line"></div>}
                  <div className="stepper-dot"></div>
                  <span className="stepper-label mono">{step.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: '1 1 800px' }} className="fade-up fade-up-delay-2">
            <img
              src={heroImage}
              alt="Smart service illustration"
              style={{
                width: '100%',
                maxWidth: '2100px',
                display: 'block',
              }}
            />
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="features-header fade-up">
          <h2>Built for how service teams actually work</h2>
          <p>Three roles, one clear workflow — from the moment a complaint is filed to the moment it's closed.</p>
        </div>

        <div className="features-grid">
          <div className="feature-card card-amber fade-up fade-up-delay-1">
            <div className="feature-icon amber">📋</div>
            <h3>For Users</h3>
            <p>Raise complaints in seconds, track status live, and confirm resolution once the work is done.</p>
          </div>
          <div className="feature-card card-teal fade-up fade-up-delay-2">
            <div className="feature-icon teal">🛠️</div>
            <h3>For Technicians</h3>
            <p>See what's assigned, update progress as you work, and log resolution notes with photos.</p>
          </div>
          <div className="feature-card card-coral fade-up fade-up-delay-3">
            <div className="feature-icon coral">📊</div>
            <h3>For Admins</h3>
            <p>Assign the right technician, set priority, and monitor every complaint from one dashboard.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;