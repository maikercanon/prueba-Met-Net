import { ref, computed, reactive, inject, provide } from 'vue';
import axios from 'axios';
import type { ComputedRef } from 'vue';
import { API_CONFIG } from '../config/api';
import router from '../router';

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
  
  initializeAuth: () => Promise<void>;
  validateToken: () => Promise<void>;
  isTokenExpired: () => boolean;
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
  const isAuthenticated = computed(() => {
    return !!state.token && !!state.user && !isTokenExpired();
  });

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
  const initializeAuth = async () => {
    const savedToken = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('auth_user');
    
    if (savedToken && savedUser) {
      // Check if token is expired first (client-side check)
      if (isTokenExpired()) {
        console.log('Token expired, clearing auth data...');
        clearAuthData();
        return;
      }
      
      state.token = savedToken;
      state.user = JSON.parse(savedUser);
      
      // Only validate token if we're on a protected route
      const currentPath = window.location.pathname;
      if (currentPath === '/dashboard' || currentPath.startsWith('/dashboard')) {
        await validateToken();
      }
    }
    
    setupAxiosInterceptors();
  };

  // Validate token by making a request to the server
  const validateToken = async () => {
    try {
      await fetchProfile();
    } catch (err) {
      // Token is invalid, clear auth data
      console.log('Token validation failed, logging out...');
      logout();
    }
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
    // Redirect to login page
    router.push('/login');
  };

  // Check if token is expired (client-side check)
  const isTokenExpired = () => {
    const token = state.token || localStorage.getItem('auth_token');
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp && payload.exp < currentTime;
    } catch (error) {
      return true; // If token is malformed, consider it expired
    }
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
    validateToken,
    isTokenExpired,
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