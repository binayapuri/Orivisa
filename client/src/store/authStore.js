import { create } from 'zustand';
import api from '../lib/axios';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  
  login: async (email, password, role) => {
    try {
      // Backend uses generic /auth/login route - role is determined from user account
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      // Optional: Verify the user's role matches the expected role
      if (role && user.role !== role) {
        const error = new Error(`This account is for ${user.role}s. Please use the ${user.role} login page.`);
        error.roleMismatch = true;
        error.actualRole = user.role;
        throw error;
      }
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      set({ user, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      return { success: false, error: errorMessage, roleMismatch: error.roleMismatch, actualRole: error.actualRole };
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