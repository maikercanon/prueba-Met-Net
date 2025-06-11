import { ref, computed, reactive, inject, provide } from 'vue';
import axios from 'axios';
import type { ComputedRef } from 'vue';
import { API_CONFIG } from '../config/api';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
  };
  errors?: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface AuthService {
  user: ComputedRef<User | null>;
  token: ComputedRef<string | null>;
  isLoading: ComputedRef<boolean>;
  error: ComputedRef<string | null>;
  isAuthenticated: ComputedRef<boolean>;
  
  initializeAuth: () => void;
  register: (userData: { name: string; email: string; password: string }) => Promise<{ success: boolean; message: string }>;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; resetToken?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; message: string }>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
}

// Symbol for injection key
const AUTH_INJECTION_KEY = Symbol('auth');

// API Base URL
// const API_BASE_URL = 'http://localhost:4000/api'; // Removed - now using centralized config

export function createAuthProvider(): AuthService {
  // Reactive state
  const state = reactive<AuthState>({
    user: null,
    token: null,
    isLoading: false,
    error: null
  });

  // Computed properties
  const isAuthenticated = computed(() => !!state.token && !!state.user);

  // Setup axios interceptors
  const setupAxiosInterceptors = () => {
    axios.defaults.baseURL = API_CONFIG.baseURL;
    axios.defaults.timeout = API_CONFIG.timeout;
    
    // Add token to requests
    axios.interceptors.request.use((config) => {
      if (state.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
      return config;
    });

    // Handle token expiration
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          logout();
        }
        return Promise.reject(error);
      }
    );
  };

  // Initialize auth from localStorage
  const initializeAuth = () => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (savedToken && savedUser) {
      state.token = savedToken;
      state.user = JSON.parse(savedUser);
    }
    
    setupAxiosInterceptors();
  };

  // Set authentication data
  const setAuthData = (authData: { user: User; token: string }) => {
    state.user = authData.user;
    state.token = authData.token;
    
    // Save to localStorage
    localStorage.setItem('auth_token', authData.token);
    localStorage.setItem('auth_user', JSON.stringify(authData.user));
  };

  // Clear authentication data
  const clearAuthData = () => {
    state.user = null;
    state.token = null;
    
    // Remove from localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  // Register new user
  const register = async (userData: { name: string; email: string; password: string }) => {
    try {
      state.isLoading = true;
      state.error = null;

      const response = await axios.post<AuthResponse>('/auth/register', userData);
      
      if (response.data.success && response.data.data) {
        setAuthData(response.data.data);
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.errors?.join(', ') || 
                          err.message || 
                          'Registration failed';
      state.error = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      state.isLoading = false;
    }
  };

  // Login user
  const login = async (credentials: { email: string; password: string }) => {
    try {
      state.isLoading = true;
      state.error = null;

      const response = await axios.post<AuthResponse>('/auth/login', credentials);
      
      if (response.data.success && response.data.data) {
        setAuthData(response.data.data);
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Login failed';
      state.error = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      state.isLoading = false;
    }
  };

  // Logout user
  const logout = () => {
    clearAuthData();
  };

  // Forgot password
  const forgotPassword = async (email: string) => {
    try {
      state.isLoading = true;
      state.error = null;

      const response = await axios.post('/auth/forgot-password', { email });
      
      return { 
        success: true, 
        message: response.data.message,
        resetToken: response.data.resetToken // For development
      };
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Failed to send reset email';
      state.error = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      state.isLoading = false;
    }
  };

  // Reset password
  const resetPassword = async (token: string, password: string) => {
    try {
      state.isLoading = true;
      state.error = null;

      const response = await axios.post<AuthResponse>(`/auth/reset-password/${token}`, { password });
      
      if (response.data.success && response.data.data) {
        setAuthData(response.data.data);
        return { success: true, message: response.data.message };
      } else {
        throw new Error(response.data.message || 'Password reset failed');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Password reset failed';
      state.error = errorMessage;
      return { success: false, message: errorMessage };
    } finally {
      state.isLoading = false;
    }
  };

  // Fetch user profile
  const fetchProfile = async () => {
    try {
      const response = await axios.get('/auth/profile');
      if (response.data.success && response.data.data?.user) {
        state.user = response.data.data.user;
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      logout();
    }
  };

  // Clear error
  const clearError = () => {
    state.error = null;
  };

  const authService: AuthService = {
    // Reactive state properties
    user: computed(() => state.user),
    token: computed(() => state.token),
    isLoading: computed(() => state.isLoading),
    error: computed(() => state.error),
    isAuthenticated,
    
    // Actions
    initializeAuth,
    register,
    login,
    logout,
    forgotPassword,
    resetPassword,
    fetchProfile,
    clearError
  };

  // Provide the auth service
  provide(AUTH_INJECTION_KEY, authService);

  return authService;
}

// Composable to use auth in components
export function useAuth(): AuthService {
  const authService = inject<AuthService>(AUTH_INJECTION_KEY);
  
  if (!authService) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return authService;
} 