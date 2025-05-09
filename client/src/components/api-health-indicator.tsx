"use client";

import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { apiDebug } from '@/lib/api/api-debug';
import { authService } from '@/lib/api/auth-service';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ApiStatus = 'loading' | 'online' | 'offline';
type AuthStatus = 'loading' | 'valid' | 'invalid' | 'none';

function isAuthResponse(authStatus: any): authStatus is { 
  success: boolean; 
  isAuthenticated: boolean;
  user?: { name: string }
} {
  return authStatus && 
    typeof authStatus === 'object' && 
    'success' in authStatus && 
    'isAuthenticated' in authStatus;
}

export default function ApiHealthIndicator() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>('loading');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const connectionInfo = await apiDebug.testConnection();
        setApiStatus(connectionInfo.success ? 'online' : 'offline');
        
        if (authService.isLoggedIn()) {
          try {
            const authDebugInfo = await apiDebug.testAuth();
            setAuthStatus(authDebugInfo.isAuthenticated ? 'valid' : 'invalid');
          } catch (error) {
            setAuthStatus('invalid');
          }
        } else {
          setAuthStatus('none');
        }
      } catch (error) {
        setApiStatus('offline');
        setAuthStatus('none');
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000); 

    return () => clearInterval(interval);
  }, []);

  const getStatusDetails = () => {
    if (apiStatus === 'loading' || authStatus === 'loading') {
      return { label: 'Checking API...', variant: 'outline' as const };
    }

    if (apiStatus === 'offline') {
      return { label: 'API Offline', variant: 'destructive' as const };
    }

    if (authStatus === 'invalid') {
      return { label: 'Auth Invalid', variant: 'secondary' as const };
    }

    return { label: 'API Online', variant: 'default' as const };
  };

  const statusDetails = getStatusDetails();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={statusDetails.variant} className="cursor-help mr-2">
            {statusDetails.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>
            API: {apiStatus === 'loading' ? 'Checking...' : apiStatus === 'online' ? 'Connected' : 'Disconnected'}
            <br />
            Auth: {authStatus === 'loading' ? 'Checking...' : authStatus === 'valid' ? 'Valid' : authStatus === 'invalid' ? 'Invalid' : 'Not Logged In'}
          </p>
          {authStatus && isAuthResponse(authStatus) && authStatus.success && authStatus.isAuthenticated && (
            <div className="mt-2 text-sm text-green-600">
              Authenticated as: {authStatus.user?.name || 'Unknown user'}
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
