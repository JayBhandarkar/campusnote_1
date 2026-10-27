/**
 * context/AuthContext.jsx — Global Authentication State Provider
 *
 * Provides authentication state to the entire React application:
 *  - Stores current user object and JWT token
 *  - Reads initial session from browser localStorage ('cn_token', 'cn_user')
 *  - On app load, verifies the session with the backend via authApi.getMe()
 *  - Provides login, register, logout, and role helper flags (isStudent, isFaculty, isAdmin)
 *  - Any component can access auth state using the custom hook: `useAuth()`
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cn_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('cn_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify user session on boot
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('cn_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('cn_user', JSON.stringify(res.data.user));
          } else {
            logout();
          }
        } catch {
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    if (res.success && res.data) {
      const { user: loggedInUser, token: authToken } = res.data;
      setUser(loggedInUser);
      setToken(authToken);
      localStorage.setItem('cn_token', authToken);
      localStorage.setItem('cn_user', JSON.stringify(loggedInUser));
      return loggedInUser;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    if (res.success && res.data) {
      const { user: registeredUser, token: authToken } = res.data;
      setUser(registeredUser);
      setToken(authToken);
      localStorage.setItem('cn_token', authToken);
      localStorage.setItem('cn_user', JSON.stringify(registeredUser));
      return registeredUser;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      if (token) {
        await authApi.logout();
      }
    } catch {
      // Ignore network errors during logout
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('cn_token');
      localStorage.removeItem('cn_user');
    }
  };

  const updateUserProfile = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('cn_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    role: user?.role || null,
    isStudent: user?.role === 'Student',
    isFaculty: user?.role === 'Faculty',
    isAdmin: user?.role === 'Admin',
    login,
    register,
    logout,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
