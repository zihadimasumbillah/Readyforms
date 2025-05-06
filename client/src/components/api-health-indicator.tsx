"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { checkApiHealth } from "@/lib/api/health-service";

interface ApiHealthIndicatorProps {
  className?: string;
  size?: number;
  showTooltip?: boolean;
}

export default function ApiHealthIndicator({
  className,
  size = 16,
  showTooltip = true
}: ApiHealthIndicatorProps) {
  const [status, setStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const result = await checkApiHealth();
        setStatus(result.status as 'healthy' | 'unhealthy');
        setLastChecked(new Date());
      } catch (error) {
        console.error("Error checking API health:", error);
        setStatus('unhealthy');
        setLastChecked(new Date());
      }
    };

    checkHealth();
    
    // Check health periodically (every 5 minutes)
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const icon = status === 'checking' ? (
    <Loader2 className="animate-spin" size={size} />
  ) : status === 'healthy' ? (
    <CheckCircle size={size} className="text-green-500" />
  ) : (
    <AlertCircle size={size} className="text-red-500" />
  );

  const tooltipText = status === 'checking' 
    ? 'Checking API status...' 
    : status === 'healthy' 
      ? 'API is online' 
      : 'API connection issues';

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className={cn("flex items-center", className)}>
              {icon}
              {lastChecked && (
                <span className="text-xs ml-2 text-muted-foreground hidden sm:inline">
                  {status === 'checking' ? 'Checking...' : lastChecked.toLocaleTimeString()}
                </span>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <p>{tooltipText}</p>
              {lastChecked && (
                <p className="text-xs text-muted-foreground">
                  Last checked: {lastChecked.toLocaleString()}
                </p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div className={cn("flex items-center", className)}>
      {icon}
      {lastChecked && (
        <span className="text-xs ml-2 text-muted-foreground hidden sm:inline">
          {status === 'checking' ? 'Checking...' : lastChecked.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
}
