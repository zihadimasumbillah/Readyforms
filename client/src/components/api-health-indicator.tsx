"use client";

import React, { useState, useEffect } from 'react';
import { ActivityIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Link from 'next/link';
import { checkApiHealth } from '@/lib/api/health-service';

const ApiHealthIndicator = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        setIsLoading(true);
        const healthy = await checkApiHealth();
        setIsHealthy(healthy);
      } catch (error) {
        console.error('Error checking API health:', error);
        setIsHealthy(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkHealth();
    
    // Check API health every 60 seconds
    const intervalId = setInterval(checkHealth, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  if (isLoading) {
    return (
      <Button variant="ghost" size="icon" disabled className="opacity-50">
        <ActivityIcon className="h-4 w-4 animate-pulse" />
      </Button>
    );
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon"
            className={isHealthy ? 'text-green-500 hover:text-green-600' : 'text-red-500 hover:text-red-600'}
            asChild
          >
            <Link href="/api-status">
              <ActivityIcon className={`h-4 w-4 ${!isHealthy && 'animate-pulse'}`} />
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>API Status: {isHealthy ? 'Healthy' : 'Issues Detected'}</p>
          <p className="text-xs text-muted-foreground">Click for details</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ApiHealthIndicator;
