import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'customer' | 'admin';
}

interface AuthValue {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const { user } = await api.get<{ user: User | null }>('/auth/me');
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (email: string, password: string) => {
    const { user } = await api.post<{ user: User }>('/auth/login', { email, password });
    setUser(user);
  };

  const register = async (name: string, email: string, password: string) => {
    const { user } = await api.post<{ user: User }>('/auth/register', { name, email, password });
    setUser(user);
  };

  const logout = async () => {
    await api.post('/auth/logout');
    setUser(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await api.post('/auth/password', { currentPassword, newPassword });
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isAdmin: user?.role === 'admin', login, register, logout, changePassword, refresh }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
