import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { generalApi } from '../lib/api';

export default function MongoDBStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected' | 'error'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkConnection = async () => {
    setStatus('checking');
    try {
      const response = await generalApi.healthCheck();
      if (response.database === 'connected') {
        setStatus('connected');
        console.log('✅ MongoDB Atlas connection verified');
      } else {
        setStatus('disconnected');
        console.log('⚠��� MongoDB Atlas not connected');
      }
      setLastChecked(new Date());
    } catch (error) {
      setStatus('error');
      console.error('❌ Health check failed:', error);
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkConnection();
    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Database className="w-4 h-4 text-gray-500 animate-pulse" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'connected':
        return 'MongoDB Atlas';
      case 'disconnected':
        return 'Mock Data';
      case 'error':
        return 'Connection Error';
      default:
        return 'Checking...';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'text-green-500';
      case 'disconnected':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div 
      className="flex items-center space-x-2 cursor-pointer"
      onClick={checkConnection}
      title={`Database Status: ${getStatusText()}${lastChecked ? ` (${lastChecked.toLocaleTimeString()})` : ''}`}
    >
      {getStatusIcon()}
      <span className={`text-xs ${getStatusColor()}`}>
        {getStatusText()}
      </span>
    </div>
  );
}
