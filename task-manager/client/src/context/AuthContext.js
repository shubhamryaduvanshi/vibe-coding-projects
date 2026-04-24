import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authService, TOKEN_KEY } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await authService.me();
      setUser(response.user);
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    localStorage.setItem(TOKEN_KEY, response.token);
    setUser(response.user);
    return response.user;
  };

  const register = async (name, email, password) => {
    const response = await authService.register({ name, email, password });
    localStorage.setItem(TOKEN_KEY, response.token);
    setUser(response.user);
    return response.user;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
