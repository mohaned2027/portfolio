import { useState, createContext, useContext, useEffect } from 'react';
import { isAuthenticated, removeAuthToken, apiFetch, setAuthToken } from '../api/request';
import { useNavigate } from 'react-router-dom';

// Auth Context
const AuthContext = createContext(null);

// Custom hook
export const useAuth = () => useContext(AuthContext);

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      if (isAuthenticated()) {
        // In a real app, you'd fetch user data from API
        // For now, setting a placeholder user to indicate logged in state
        setUser({
          id: 1,
          name: 'Admin',
          email: 'admin@example.com',
          role: 'admin'
        });
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiFetch('/auth/login', 'POST', { email, password });
      
      // Backend returns status 200 for success
      if (response.status === 200) {
        // In your backend, user info might be in response.data.user or you might need another fetch
        // For now, we set the user based on successful login
        setUser({
          id: 1,
          name: 'Admin',
          email: email,
          role: 'admin'
        });
        return { success: true };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', 'POST');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeAuthToken();
      setUser(null);
      navigate('/admin/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
