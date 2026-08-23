import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — फक्त logged-in users ला आत जाऊ देतो
 * allowedRoles दिलं तर, फक्त त्या roles च्या users ला जाऊ देतो
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div style={{ padding: '60px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!user) {
    // Login केलेला नाही → login page वर पाठव
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Login आहे, पण या page साठी योग्य role नाही
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;