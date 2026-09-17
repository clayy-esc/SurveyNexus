import React, { useState, useEffect } from 'react';
import api from '../lib/api';
import { User } from '../types';
import { AuthContext } from './AuthContextValue';

const readStoredUser = (): User | null => {
  const storedUser = localStorage.getItem('user');
  if (!storedUser) return null;

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(readStoredUser);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(() => Boolean(localStorage.getItem('token')));

  useEffect(() => {
    if (!token) return;

    api.get('/auth/me')
      .then(res => setUser(res.data.user))
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

