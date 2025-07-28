// Configuration for different environments
export const API_ENDPOINTS = {
  development: 'http://localhost:8080/api',
  production: 'https://safepal-wallet-backend.onrender.com/api', // Your live Render deployment
  staging: 'https://safepal-wallet-backend-staging.onrender.com/api', // Optional staging environment
  flydev: 'https://e4738d2725b04334ba37a63fd8613dae-01d92bdc91d74ff498bdf627c.fly.dev/api', // Fly.dev deployment
};

export const getCurrentEnvironment = (): keyof typeof API_ENDPOINTS => {
  if (import.meta.env.VITE_NODE_ENV === 'production') {
    return 'production';
  }
  if (import.meta.env.VITE_NODE_ENV === 'staging') {
    return 'staging';
  }
  return 'development';
};

export const getApiBaseUrl = (): string => {
  // Check if running in Chrome Extension
  const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

  if (isExtension) {
    // For Chrome Extension, always use production API (Render backend)
    return 'https://safepal-wallet-backend.onrender.com/api';
  }

  // For web app, use environment-specific URL
  const environment = getCurrentEnvironment();
  return import.meta.env.VITE_API_URL || API_ENDPOINTS[environment];
};

// Security configuration
export const SECURITY_CONFIG = {
  // API request timeout - longer for Chrome extension
  apiTimeout: typeof chrome !== 'undefined' && chrome.runtime ? 15000 : 8000, // 15 seconds for extension, 8 for web

  // Maximum retry attempts for failed requests
  maxRetries: 3,

  // Request headers for API calls
  defaultHeaders: {
    'Content-Type': 'application/json',
    'X-Client-Type': typeof chrome !== 'undefined' && chrome.runtime ? 'chrome-extension' : 'web-app',
    'X-Client-Version': chrome?.runtime?.getManifest?.()?.version || '1.0.0',
  },
};

// Chrome Extension specific configuration
export const EXTENSION_CONFIG = {
  // Storage keys for Chrome Extension local storage
  storageKeys: {
    walletData: 'safepal_wallet_data',
    userPreferences: 'safepal_user_preferences',
    apiCache: 'safepal_api_cache',
  },
  
  // Cache configuration
  cacheExpiry: 5 * 60 * 1000, // 5 minutes in milliseconds
};
