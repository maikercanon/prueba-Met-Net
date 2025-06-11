// API Configuration for development and production
const getApiBaseUrl = (): string => {
  // Check if we're in development mode
  if (import.meta.env.DEV) {
    return 'http://localhost:4000/api'
  }
  
  // Production: Use environment variable or default
  return import.meta.env.VITE_API_URL || 'https://your-backend-url.onrender.com/api'
}

export const API_BASE_URL = getApiBaseUrl()

export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
}

// Export for debugging
console.log('🔧 API Configuration:', {
  baseURL: API_BASE_URL,
  environment: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
}) 