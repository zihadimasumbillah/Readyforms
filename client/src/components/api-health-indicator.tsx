"use client";

import { useState, useEffect } from 'react';
import { apiHealth } from '@/lib/api/api-health';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ActivityIcon, AlertCircleIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';

interface ApiHealthIndicatorProps {
  className?: string;
  showText?: boolean;
}

export default function ApiHealthIndicator({ className, showText = false }: ApiHealthIndicatorProps) {
  const [status, setStatus] = useState<'healthy' | 'unhealthy' | 'checking'>('checking');
  const [details, setDetails] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Run a health check on mount and periodically
  useEffect(() => {
    const checkApiHealth = async () => {
      setStatus('checking');
      try {
        const checkResult = await apiHealth.checkAll();
        
        if (checkResult.allHealthy) {
          setStatus('healthy');
          setDetails('All API services are operational');
        } else {
          setStatus('unhealthy');
          
          // Determine which service is down
          const failedServices = [];
          if (!checkResult.ping) failedServices.push('API');
          if (!checkResult.database) failedServices.push('Database');
          
          setDetails(`Service${failedServices.length !== 1 ? 's' : ''} down: ${failedServices.join(', ')}`);
        }
      } catch (error) {
        setStatus('unhealthy');
        setDetails('API health check failed');
      }
    };
    
    // Check API health immediately
    checkApiHealth();
    
    // Then check every 60 seconds
    const interval = setInterval(checkApiHealth, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const renderIcon = () => {
    switch (status) {
      case 'healthy':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'unhealthy':
        return <XCircleIcon className="w-4 h-4 text-red-500" />;
      case 'checking':
      default:
        return <ActivityIcon className="w-4 h-4 text-yellow-500 animate-pulse" />;
    }
  };
  
  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <div 
            className={cn(
              "cursor-pointer flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-muted",
              className
            )}
            role="button" 
            aria-label="API Health Status"
          >
            <span className="sr-only">API Status</span>
            {renderIcon()}
            {showText && (
              <span className={cn(
                "text-xs font-medium",
                status === 'healthy' ? 'text-green-500' :
                status === 'unhealthy' ? 'text-red-500' : 'text-yellow-500'
              )}>
                {status === 'checking' ? 'Checking...' : status}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="center" className="bg-popover text-popover-foreground">
          <div className="flex flex-col gap-1 py-1">
            <div className="font-medium">API Status: {status === 'checking' ? 'Checking...' : status}</div>
            {details && <div className="text-xs text-muted-foreground">{details}</div>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Add named export for components that import as { ApiHealthIndicator }
export { ApiHealthIndicator };
