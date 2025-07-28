// Network utility functions for handling offline scenarios

export function isOnline(): boolean {
  return navigator.onLine;
}

export function shouldSkipAPICall(): boolean {
  // Force live API usage in Chrome Extension
  const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  if (isExtension) {
    console.log('🔌 Chrome Extension: Always using live API');
    return false; // Never skip API calls in extension
  }

  // Check if we're offline
  if (!isOnline()) {
    return true;
  }

  // Check if API has been marked as failing
  if (localStorage.getItem('api_failed') === 'true') {
    return true;
  }

  return false;
}

export function markAPIAsFailed(): void {
  localStorage.setItem('api_failed', 'true');
  localStorage.setItem('api_failed_time', Date.now().toString());
}

export function markAPIAsWorking(): void {
  localStorage.removeItem('api_failed');
  localStorage.removeItem('api_failed_time');
  console.log('✅ API marked as working');
}

// Clear API failed state for Chrome Extension
export function clearAPIFailedState(): void {
  const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;
  if (isExtension) {
    localStorage.removeItem('api_failed');
    localStorage.removeItem('api_failed_time');
    console.log('🔌 Chrome Extension: Cleared API failed state');
  }
}

export function shouldRetryAPI(): boolean {
  const failedTime = localStorage.getItem('api_failed_time');
  if (!failedTime) {
    return true;
  }
  
  // Retry after 5 minutes
  const fiveMinutes = 5 * 60 * 1000;
  return Date.now() - parseInt(failedTime) > fiveMinutes;
}

// Simple connectivity test
export async function testConnectivity(): Promise<boolean> {
  if (!isOnline()) {
    return false;
  }
  
  try {
    // Try to fetch a small resource with short timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    await fetch('/api/ping', {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-cache'
    });
    
    clearTimeout(timeoutId);
    return true;
  } catch {
    return false;
  }
}
