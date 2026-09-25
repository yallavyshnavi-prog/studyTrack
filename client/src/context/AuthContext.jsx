import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('studytrack_token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Initialize and check current user
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('studytrack_token');
      if (storedToken) {
        try {
          const res = await api.auth.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err.message);
          localStorage.removeItem('studytrack_token');
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setAuthError(null);
    try {
      const res = await api.auth.login(email, password);
      if (res && res.success && res.token) {
        localStorage.setItem('studytrack_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      const msg = res?.message || 'Invalid email or password';
      setAuthError(msg);
      return { success: false, error: msg };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  const register = async (name, email, password) => {
    setAuthError(null);
    try {
      const res = await api.auth.register(name, email, password);
      if (res && res.success && res.token) {
        localStorage.setItem('studytrack_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      const msg = res?.message || 'Registration failed';
      setAuthError(msg);
      return { success: false, error: msg };
    } catch (err) {
      setAuthError(err.message);
      return { success: false, error: err.message };
    }
  };

  // One-click instant Demo Login
  const loginAsDemo = async () => {
    try {
      // Attempt to login to existing demo account
      const demoEmail = 'demo@studytrack.app';
      const demoPassword = 'password123';
      const loginAttempt = await login(demoEmail, demoPassword);
      if (loginAttempt.success) return { success: true };

      // If doesn't exist, create demo account
      return await register('Alex Rivera (Demo)', demoEmail, demoPassword);
    } catch {
      // In case server is offline or mock, fallback smoothly
      const mockUser = {
        id: 'demo-user-id',
        name: 'Alex Rivera (Demo)',
        email: 'demo@studytrack.app',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alex',
        targetDailyHours: 4,
        xp: 320,
        level: 3,
        streak: 5,
      };
      setUser(mockUser);
      setToken('demo-token');
      localStorage.setItem('studytrack_token', 'demo-token');
      return { success: true };
    }
  };

  const logout = () => {
    localStorage.removeItem('studytrack_token');
    setToken(null);
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        authError,
        login,
        register,
        loginAsDemo,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
