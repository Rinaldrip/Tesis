// src/hooks/useAuth.ts
import { useState } from 'react';
import api from '@/services/paciente.api';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await api.post('/auth/login', { username, password });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        return { success: true, data: response.data.data };
      } else {
        setError(response.data.error);
        return { success: false, error: response.data.error };
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Error de conexión';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Opcional: llamar a endpoint de logout en backend
    // api.post('/auth/logout');
  };

  const verifyToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      await api.get('/auth/verify-token');
      return true;
    } catch (error) {
      logout();
      return false;
    }
  };

  const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  return {
    login,
    logout,
    verifyToken,
    getCurrentUser,
    isAuthenticated,
    loading,
    error,
    setError
  };
};