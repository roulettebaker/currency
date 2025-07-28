import { useEffect, useRef } from 'react';
import { useWallet } from '../contexts/WalletContext';

// Debug hook to monitor real-time polling
export function useDebugPolling() {
  const { loading, error, lastUpdated, wallets } = useWallet();
  const pollCountRef = useRef(0);
  const lastLogRef = useRef<Date | null>(null);

  useEffect(() => {
    // Log polling status every 5 seconds
    const debugInterval = setInterval(() => {
      const now = new Date();
      pollCountRef.current++;
      
      console.log(`
🔍 POLLING DEBUG STATUS #${pollCountRef.current}:
  - Time: ${now.toLocaleTimeString()}
  - Loading: ${loading}
  - Error: ${error || 'None'}
  - Last Updated: ${lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
  - Wallets Count: ${wallets.length}
  - Extension Context: ${typeof chrome !== 'undefined' && chrome.runtime ? 'YES' : 'NO'}
  - Network: ${navigator.onLine ? 'ONLINE' : 'OFFLINE'}
  - API Failed Flag: ${localStorage.getItem('api_failed') || 'Not set'}
      `);

      lastLogRef.current = now;
    }, 5000); // Log every 5 seconds

    return () => clearInterval(debugInterval);
  }, [loading, error, lastUpdated, wallets.length]);

  return {
    pollCount: pollCountRef.current,
    lastLog: lastLogRef.current
  };
}
