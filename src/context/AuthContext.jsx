import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // App सुरू होताना localStorage मध्ये token असेल तर user restore कर
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  /**
   * Login function
   * Backend कडून token + user data घेतो, localStorage + state मध्ये save करतो
   */
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, userId, email: userEmail, name, role } = response.data;

    const userData = { userId, email: userEmail, name, role };

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);

    return userData;
  };

  /**
   * Register function
   */
  const register = async (formData) => {
    const response = await api.post('/auth/register', formData);
    return response.data;
  };

  /**
   * Logout function
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Custom hook — कोणत्याही component मध्ये सोप्या पद्धतीने वापरायला
 * उदा: const { user, login, logout } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}