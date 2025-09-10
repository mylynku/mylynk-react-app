import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'user' | 'lynker';
  photoURL?: string;
  provider?: 'local' | 'google' | 'apple';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, type: 'user' | 'lynker') => Promise<void>;
  loginWithGoogle: () => void;
  loginWithApple: () => void;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

  // Extract user from response data
  const extractUser = (data: any): User | null => {
    if (!data || !data.user) return null;
    return {
      id: data.user.userId || data.user._id,
      name: data.user.fullname || data.user.name || '',
      email: data.user.email,
      type: data.user.typeofuser === 'lynker' ? 'lynker' : 'user',
      photoURL: data.user.profilePicture || data.user.photoURL || '',
      provider: data.user.provider || 'local',
    };
  };

  // Check authentication status on app load
  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      try {
        // Check if user is authenticated via HTTP-only cookie
        const response = await api.get('/auth/me');
        const userData = extractUser(response.data);
        setUser(userData);
      } catch (error) {
        // User not authenticated or token expired
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const userData = extractUser(response.data);
      setUser(userData);
    } catch (error: any) {
      setUser(null);
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, type: 'user' | 'lynker') => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register', {
        fullname: name,
        email,
        password,
        typeofuser: type === 'lynker' ? 'lynker' : 'normal_user',
      });
      const userData = extractUser(response.data);
      setUser(userData);
    } catch (error: any) {
      setUser(null);
      throw new Error(error.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  // For OAuth2, redirect to backend OAuth endpoints
  const loginWithGoogle = () => {
    const redirectUri = `${window.location.origin}`;
    window.location.href = `${API_URL}/auth/google?redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  const loginWithApple = () => {
    const redirectUri = `${window.location.origin}`;
    window.location.href = `${API_URL}/auth/apple?redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
      setUser(null);
    } catch (error) {
      // Even if logout request fails, clear user state
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    signup,
    loginWithGoogle,
    loginWithApple,
    logout,
    loading,
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
