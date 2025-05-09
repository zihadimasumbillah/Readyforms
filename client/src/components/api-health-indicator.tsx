"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, CloudCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import apiClient from "@/lib/api/api-client";
import { useRouter } from "next/navigation";

interface ApiHealthIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export default function ApiHealthIndicator({ 
  className = "", 
  showLabel = false 
}: ApiHealthIndicatorProps) {
  const [status, setStatus] = useState<"loading" | "online" | "offline">("loading");
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const router = useRouter();

  const checkApiStatus = async () => {
    setStatus("loading");
    try {
      await apiClient.get("/ping");
      setStatus("online");
    } catch (error) {
      console.error("API health check failed:", error);
      setStatus("offline");
    } finally {
      setLastChecked(new Date());
    }
  };

  useEffect(() => {
    checkApiStatus();
    // Set up a timer to check every 5 minutes
    const interval = setInterval(checkApiStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClick = () => {
    router.push("/api-test");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={`${className} relative`}
            onClick={handleClick}
          >
            <CloudCog className="h-5 w-5" />
            <span
              className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ${
                status === "online"
                  ? "bg-green-500"
                  : status === "offline"
                  ? "bg-red-500"
                  : "bg-amber-500 animate-pulse"
              }`}
            />
            <span className="sr-only">API Status: {status}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <div className="flex items-center gap-2">
              {status === "online" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : status === "offline" ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <div className="h-4 w-4 rounded-full bg-amber-500 animate-pulse" />
              )}
              <span>
                API {status === "loading" ? "Checking..." : `${status}`}
              </span>
            </div>
            {lastChecked && (
              <div className="text-xs text-muted-foreground mt-1">
                Last checked: {lastChecked.toLocaleTimeString()}
              </div>
            )}
            <div className="text-xs mt-1">Click to view API diagnostics</div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
