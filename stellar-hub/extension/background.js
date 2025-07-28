// Background service worker for SafePal Wallet Extension
// Handles extension lifecycle, storage management, and API communication

// Initialize extension on install
chrome.runtime.onInstalled.addListener((details) => {
  console.log('SafePal Wallet Extension installed:', details.reason);
  
  // Set default values in storage
  chrome.storage.local.set({
    safepal_wallet_initialized: true,
    safepal_api_endpoint: 'https://safepal-wallet-backend.onrender.com/api'
  });
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('SafePal Wallet Extension started');
});

// Handle messages from popup/content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request);
  
  if (request.action === 'ping') {
    sendResponse({ status: 'pong', timestamp: Date.now() });
    return true;
  }
  
  if (request.action === 'getApiEndpoint') {
    chrome.storage.local.get(['safepal_api_endpoint'], (result) => {
      sendResponse({ 
        endpoint: result.safepal_api_endpoint || 'https://safepal-wallet-backend.onrender.com/api' 
      });
    });
    return true;
  }
  
  // Handle API requests with CORS support
  if (request.action === 'apiRequest') {
    handleApiRequest(request, sendResponse);
    return true;
  }
});

// Handle API requests from popup to avoid CORS issues
async function handleApiRequest(request, sendResponse) {
  try {
    const { url, method = 'GET', headers = {}, body } = request;
    
    const fetchOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Type': 'chrome-extension',
        'X-Client-Version': chrome.runtime.getManifest().version,
        ...headers
      }
    };
    
    if (body && method !== 'GET') {
      fetchOptions.body = JSON.stringify(body);
    }
    
    const response = await fetch(url, fetchOptions);
    const data = await response.json();
    
    sendResponse({
      success: true,
      status: response.status,
      data: data
    });
  } catch (error) {
    console.error('API request failed:', error);
    sendResponse({
      success: false,
      error: error.message
    });
  }
}

// Handle storage changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  console.log('Storage changed:', changes, 'in', areaName);
});

// Cleanup on suspension (for service worker lifecycle)
self.addEventListener('beforeunload', () => {
  console.log('SafePal Wallet Extension service worker suspending');
});
