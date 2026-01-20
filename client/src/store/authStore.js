import { create } from 'zustand';
import api from '../lib/axios';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (email, password, role) => {
    try {
      const response = await api.post(`/auth/${role}/login`, { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ user, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    api.defaults.headers.common['Authorization'] = '';
    set({ user: null, isAuthenticated: false });
  },
  
  checkAuth: () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ user: JSON.parse(user), isAuthenticated: true });
    }
  }
}));