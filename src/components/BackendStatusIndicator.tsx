'use client';

import React, { useState, useEffect } from 'react';
import { 
  backendHealthChecker, 
  BackendHealth, 
  getBackendStatusMessage,
  BackendError 
} from '../utils/backend-health';
import { AlertCircle, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface BackendStatusIndicatorProps {
  showDetails?: boolean;
  onStatusChange?: (status: BackendHealth['status']) => void;
}

export default function BackendStatusIndicator({ 
  showDetails = false, 
  onStatusChange 
}: BackendStatusIndicatorProps) {
  const [health, setHealth] = useState<BackendHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<BackendError | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const healthData = await backendHealthChecker.checkHealth();
      setHealth(healthData);
      setLastCheck(new Date());
      
      // Notify parent component of status change
      if (onStatusChange) {
        onStatusChange(healthData.status);
      }
    } catch (err) {
      const backendError = err as BackendError;
      setError(backendError);
      setHealth(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check health on component mount
    checkHealth();
    
    // Set up periodic health checks
    const interval = setInterval(checkHealth, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [onStatusChange]);

  const getStatusIcon = (status: BackendHealth['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: BackendHealth['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'unhealthy':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (loading && !health) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-600">
        <RefreshCw className="w-4 h-4 animate-spin" />
        <span>Checking backend status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 p-2 rounded-md border border-red-200 bg-red-50">
        <XCircle className="w-4 h-4 text-red-500" />
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">Backend Unavailable</p>
          <p className="text-xs text-red-600">{error.message}</p>
        </div>
        <button
          onClick={checkHealth}
          className="text-xs text-red-600 hover:text-red-800 underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!health) {
    return null;
  }

  return (
    <div className="space-y-2">
      {/* Main Status */}
      <div className={`flex items-center space-x-2 p-2 rounded-md border ${getStatusColor(health.status)}`}>
        {getStatusIcon(health.status)}
        <div className="flex-1">
          <p className="text-sm font-medium">
            Backend Status: {health.status.charAt(0).toUpperCase() + health.status.slice(1)}
          </p>
          <p className="text-xs opacity-80">{getBackendStatusMessage(health)}</p>
        </div>
        <button
          onClick={checkHealth}
          disabled={loading}
          className="text-xs opacity-80 hover:opacity-100 underline disabled:opacity-50"
        >
          {loading ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            'Refresh'
          )}
        </button>
      </div>

      {/* Detailed Status (if enabled) */}
      {showDetails && (
        <div className="text-xs space-y-1">
          <div className="flex justify-between">
            <span>Last Check:</span>
            <span>{lastCheck?.toLocaleTimeString() || 'Unknown'}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Flask:</span>
            <span className={`capitalize ${
              health.services.flask === 'running' ? 'text-green-600' : 'text-red-600'
            }`}>
              {health.services.flask}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Qdrant:</span>
            <span className={`capitalize ${
              health.services.qdrant === 'connected' ? 'text-green-600' : 'text-red-600'
            }`}>
              {health.services.qdrant}
            </span>
          </div>
          
          <div className="flex justify-between">
            <span>Database:</span>
            <span className={`capitalize ${
              health.services.database === 'connected' ? 'text-green-600' : 'text-red-600'
            }`}>
              {health.services.database}
            </span>
          </div>
          
          {health.qdrant_stats && (
            <>
              <div className="flex justify-between">
                <span>Collections:</span>
                <span>{health.qdrant_stats.collections}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Points:</span>
                <span>{health.qdrant_stats.total_points.toLocaleString()}</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Warning for degraded/unhealthy status */}
      {health.status !== 'healthy' && (
        <div className="p-2 rounded-md border border-yellow-200 bg-yellow-50">
          <p className="text-xs text-yellow-800">
            ⚠️ Some backend services may not be functioning properly. 
            Uploads and searches may be affected.
          </p>
        </div>
      )}
    </div>
  );
}
