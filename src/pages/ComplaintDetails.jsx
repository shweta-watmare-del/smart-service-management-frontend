import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/DashboardLayout';
import StatusTimeline from '../components/StatusTimeline';
import { useAuth } from '../context/AuthContext';
import { getComplaintById, getComplaintHistory, getFeedback, submitFeedback } from '../services/api';
import './UserDashboard.css';
import './AdminTechDashboard.css';
import './ComplaintDetails.css';

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

function ComplaintDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [history, setHistory] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    setErrored(false);
    try {
      const [complaintRes, historyRes] = await Promise.all([
        getComplaintById(id),
        getComplaintHistory(id),
      ]);
      setComplaint(complaintRes.data);
      setHistory(historyRes.data);

      try {
        const feedbackRes = await getFeedback(id);
        setFeedback(feedbackRes.data);
      } catch (err) {
        setFeedback(null);
      }
    } catch (err) {
      console.error('Failed to load complaint details', err);
      setErrored(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    setSubmitting(true);
    try {
      await submitFeedback(id, { rating, comment });
      toast.success('Thanks for your feedback!');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const navItems = navItemsByRole[user?.role] || [];

  if (loading) {
    return (
      <DashboardLayout navItems={navItems}>
        <div className="skeleton-line w-40" style={{ height: '18px', marginBottom: '20px' }} />
        <div className="skeleton-line w-60" style={{ height: '26px', marginBottom: '24px' }} />
        <div className="skeleton-card" style={{ height: '100px' }} />
        <div className="skeleton-card" style={{ height: '140px' }} />
      </DashboardLayout>
    );
  }

  if (errored || !complaint) {
    return (
      <DashboardLayout navItems={navItems}>
        <div className="error-state">
          <h3>Couldn't load this complaint</h3>
          <p>It may not exist, or something went wrong.</p>
          <button className="action-btn primary" onClick={loadData}>Retry</button>
        </div>
      </DashboardLayout>
    );
  }

  const backPath =
    user?.role === 'ADMIN' ? '/admin/dashboard' : user?.role === 'TECHNICIAN' ? '/technician/dashboard' : '/dashboard';

  const canGiveFeedback =
    user?.role === 'USER' &&
    (complaint.status === 'RESOLVED' || complaint.status === 'CLOSED') &&
    !feedback;

  return (
    <DashboardLayout navItems={navItems}>
     
           <div className="details-header">
        <div>
          <h1>{complaint.title}</h1>
        </div>
        <span className={`status-badge status-${complaint.status.toLowerCase()}`}>
          {complaint.status.replace('_', ' ')}
        </span>
      </div>

      <div className="details-card" style={{ padding: '8px 16px 4px' }}>
        <StatusTimeline currentStatus={complaint.status} history={history} />
      </div>

      <div className="details-grid">
        <div>
          <div className="details-card">
            <h3>Description</h3>
            <p>{complaint.description}</p>
            {complaint.imagePath && (
              <img
                src={`http://localhost:8084${complaint.imagePath}`}
                alt="Complaint"
                style={{ width: '100%', maxWidth: '320px', borderRadius: 'var(--radius-sm)', marginTop: '12px', border: '1px solid var(--color-border)' }}
              />
            )}
          </div>

          {complaint.resolutionNotes && (
            <div className="details-card">
              <h3>Resolution Notes</h3>
              <p>{complaint.resolutionNotes}</p>
              {complaint.resolutionImages && (
                <img
                  src={`http://localhost:8084${complaint.resolutionImages}`}
                  alt="Resolution"
                  style={{ width: '100%', maxWidth: '320px', borderRadius: 'var(--radius-sm)', marginTop: '12px', border: '1px solid var(--color-border)' }}
                />
              )}
            </div>
          )}

          <div className="details-card">
            <h3>Activity Log</h3>
            {history.length === 0 ? (
              <p>No activity yet</p>
            ) : (
              <div className="timeline">
                {history.map((h) => (
                  <div key={h.id} className="timeline-item">
                    <div className="timeline-status">
                      {h.previousStatus ? `${h.previousStatus} → ${h.newStatus}` : h.newStatus}
                    </div>
                    {h.remarks && <div className="timeline-remarks">{h.remarks}</div>}
                    <div className="timeline-meta">
                      {h.changedByName} • {new Date(h.changedAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {canGiveFeedback && (
            <div className="details-card">
              <h3>Rate this resolution</h3>
              <form onSubmit={handleSubmitFeedback}>
                <div className="stars-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={`star-btn ${star <= rating ? 'filled' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div className="form-group-custom">
                  <textarea
                    className="resolution-textarea"
                    placeholder="How was the service? (optional)"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>
            </div>
          )}

          {feedback && (
            <div className="details-card">
              <h3>Feedback</h3>
              <div className="feedback-given">
                <div className="stars-display">{'★'.repeat(feedback.rating)}{'☆'.repeat(5 - feedback.rating)}</div>
                {feedback.comment && <p style={{ margin: 0 }}>{feedback.comment}</p>}
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="details-card">
            <h3>Details</h3>
            <div className="info-row">
              <span className="label">Category</span>
              <span className="value">{complaint.categoryName}</span>
            </div>
            <div className="info-row">
              <span className="label">Priority</span>
              <span className="value">
                <span className={`priority-dot priority-${complaint.priority.toLowerCase()}`}></span>{' '}
                {complaint.priority}
              </span>
            </div>
                        <div className="info-row">
              <span className="label">Raised By</span>
              <span className="value">{complaint.userName}</span>
            </div>
            {complaint.address && (
              <div className="info-row">
                <span className="label">Address</span>
                <span className="value" style={{ textAlign: 'right', maxWidth: '60%' }}>{complaint.address}</span>
              </div>
            )}
            <div className="info-row">
              <span className="label">Technician</span>
              <span className="value">{complaint.technicianName || 'Unassigned'}</span>
            </div>
            <div className="info-row">
              <span className="label">Created</span>
              <span className="value">{new Date(complaint.createdAt).toLocaleDateString()}</span>
            </div>
            {complaint.resolvedAt && (
              <div className="info-row">
                <span className="label">Resolved</span>
                <span className="value">{new Date(complaint.resolvedAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ComplaintDetails;