// Chrome Extension API utilities
// Handles communication between popup and background script for API calls

interface ApiRequest {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
}

interface ApiResponse {
  success: boolean;
  status?: number;
  data?: any;
  error?: string;
}

/**
 * Make API requests through the background script to avoid CORS issues
 */
export async function extensionApiRequest(request: ApiRequest): Promise<ApiResponse> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      // Fallback to direct fetch if not in extension context
      fetch(request.url, {
        method: request.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...request.headers
        },
        body: request.body ? JSON.stringify(request.body) : undefined
      })
      .then(response => response.json())
      .then(data => resolve({ success: true, data }))
      .catch(error => resolve({ success: false, error: error.message }));
      return;
    }

    chrome.runtime.sendMessage(
      { action: 'apiRequest', ...request },
      (response: ApiResponse) => {
        if (chrome.runtime.lastError) {
          console.error('Extension API error:', chrome.runtime.lastError);
          resolve({
            success: false,
            error: chrome.runtime.lastError.message || 'Unknown extension error'
          });
        } else {
          resolve(response);
        }
      }
    );
  });
}

/**
 * Get the API endpoint from extension storage
 */
export async function getApiEndpoint(): Promise<string> {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.runtime) {
      resolve('https://safepal-wallet-backend.onrender.com/api');
      return;
    }

    chrome.runtime.sendMessage(
      { action: 'getApiEndpoint' },
      (response: { endpoint: string }) => {
        if (chrome.runtime.lastError) {
          console.error('Failed to get API endpoint:', chrome.runtime.lastError);
          resolve('https://safepal-wallet-backend.onrender.com/api');
        } else {
          resolve(response.endpoint);
        }
      }
    );
  });
}

/**
 * Check if running in Chrome extension context
 */
export function isExtensionContext(): boolean {
  return typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
}

/**
 * Store data in Chrome extension storage
 */
export async function storeData(key: string, data: any): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isExtensionContext()) {
      // Fallback to localStorage
      localStorage.setItem(key, JSON.stringify(data));
      resolve();
      return;
    }

    chrome.storage.local.set({ [key]: data }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Retrieve data from Chrome extension storage
 */
export async function retrieveData(key: string): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!isExtensionContext()) {
      // Fallback to localStorage
      const data = localStorage.getItem(key);
      resolve(data ? JSON.parse(data) : null);
      return;
    }

    chrome.storage.local.get([key], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result[key] || null);
      }
    });
  });
}
