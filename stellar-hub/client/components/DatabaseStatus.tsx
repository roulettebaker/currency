import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from './ui/alert';
import { Database, Wifi, WifiOff } from 'lucide-react';

interface DatabaseStatus {
  status: 'ok' | 'degraded' | 'error';
  database: {
    mongodb: {
      connected: boolean;
      error: string | null;
    };
    mockService: {
      available: boolean;
      error: string | null;
    };
  };
}

export function DatabaseStatus() {
  const [status, setStatus] = useState<DatabaseStatus | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const health: DatabaseStatus = await response.json();
        setStatus(health);

        // Show notification if using fallback data
        if (health.status === 'degraded' && !health.database.mongodb.connected) {
          setIsVisible(true);
          // Auto-hide after 5 seconds
          setTimeout(() => setIsVisible(false), 5000);
        } else if (health.status === 'ok' && health.database.mongodb.connected) {
          setIsVisible(false);
        }
        setHasError(false);
      } catch (error) {
        console.warn('Health check failed:', error);
        setHasError(true);
        // Don't show error status in UI to avoid noise
        // The app will work fine with local storage fallbacks
        setIsVisible(false);
        setStatus(null);
      }
    };

    // Initial check with delay to avoid blocking page load, only if not in error state
    const timeoutId = setTimeout(() => {
      if (!hasError) {
        checkHealth();
      }
    }, 2000);

    // Less frequent checks to avoid spamming failed requests
    const interval = setInterval(() => {
      if (!hasError) {
        checkHealth();
      }
    }, 60000); // Check every minute instead of 30 seconds

    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
  }, []);

  if (!status || !isVisible) return null;

  const getStatusConfig = () => {
    if (status.database.mongodb.connected) {
      return {
        icon: <Wifi className="h-4 w-4 text-green-500" />,
        title: "Connected to Database",
        description: "All features are fully operational",
        variant: "default" as const
      };
    } else if (status.database.mockService.available) {
      return {
        icon: <WifiOff className="h-4 w-4 text-yellow-500" />,
        title: "Using Demo Mode",
        description: "Database unavailable - using local demo data. Changes won't be saved permanently.",
        variant: "destructive" as const
      };
    } else {
      return {
        icon: <Database className="h-4 w-4 text-red-500" />,
        title: "Service Unavailable",
        description: "Both database and demo services are unavailable",
        variant: "destructive" as const
      };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert variant={config.variant} className="border-l-4 border-l-current">
        <div className="flex items-start space-x-2">
          {config.icon}
          <div className="flex-1">
            <AlertDescription>
              <div className="font-medium text-sm">{config.title}</div>
              <div className="text-xs mt-1 opacity-90">{config.description}</div>
            </AlertDescription>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-current opacity-50 hover:opacity-100 text-xs"
          >
            ×
          </button>
        </div>
      </Alert>
    </div>
  );
}
