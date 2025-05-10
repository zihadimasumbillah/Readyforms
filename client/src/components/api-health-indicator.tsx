"use client"

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { checkApiHealth } from '@/lib/api/api-health-check';

interface ApiHealthIndicatorProps {
  showText?: boolean;
}

export default function ApiHealthIndicator({ showText = false }: ApiHealthIndicatorProps) {
  const [apiStatus, setApiStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      setApiStatus('checking');
      try {
        const result = await checkApiHealth();
        setApiStatus(result.status === 'ok' ? 'ok' : 'error');
      } catch (err) {
        setApiStatus('error');
      }
      setLastChecked(new Date());
    };

    checkHealth();
    const interval = setInterval(checkHealth, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            {apiStatus === 'checking' && (
              <Badge variant="outline" className="py-1.5">
                <Clock className="h-4 w-4 animate-pulse" />
                {showText && <span className="ml-2">Checking API</span>}
              </Badge>
            )}
            
            {apiStatus === 'ok' && (
              <Badge variant="outline" className="py-1.5 bg-green-500 text-white hover:bg-green-600">
                <CheckCircle className="h-4 w-4" />
                {showText && <span className="ml-2">API Online</span>}
              </Badge>
            )}
            
            {apiStatus === 'error' && (
              <Badge variant="outline" className="py-1.5 bg-red-500 text-white hover:bg-red-600">
                <AlertCircle className="h-4 w-4" />
                {showText && <span className="ml-2">API Offline</span>}
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div>
            API Status: {apiStatus === 'ok' ? 'Online' : apiStatus === 'error' ? 'Offline' : 'Checking...'}
            {lastChecked && (
              <div className="text-xs text-muted-foreground mt-1">
                Last checked: {lastChecked.toLocaleTimeString()}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Add a named export so it can be imported either way
export { ApiHealthIndicator };
