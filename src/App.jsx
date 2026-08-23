import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import ManageTechnicians from './pages/ManageTechnicians';
import ManageCategories from './pages/ManageCategories';
import ManageUsers from './pages/ManageUsers';
import Profile from './pages/Profile';
import ComplaintDetails from './pages/ComplaintDetails';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={['USER']}>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/technicians"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ManageTechnicians />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ManageCategories />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ManageUsers />
              </ProtectedRoute>
            }
          />

          <Route
            path="/technician/dashboard"
            element={
              <ProtectedRoute allowedRoles={['TECHNICIAN']}>
                <TechnicianDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/complaints/:id"
            element={
              <ProtectedRoute>
                <ComplaintDetails />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;