"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from "@/components/layouts/admin-layout";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, CheckCircle, AlertCircle, Activity } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import healthService, { EndpointStatusResponse } from "@/lib/api/health-service";

export default function ApiStatusPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [endpointStatus, setEndpointStatus] = useState<EndpointStatusResponse | null>(null);
  const auth = useAuth();
  const router = useRouter();
  const user = auth?.user;
  const logout = auth?.logout;

  const handleLogout = () => {
    if (logout) {
      logout();
      router.push('/auth/login');
    }
  };

  const checkHealth = async () => {
    try {
      setRefreshing(true);
      const status = await healthService.checkEndpoints();
      setEndpointStatus(status);

      if (status.status === 'healthy') {
        toast({
          title: "System Operational",
          description: "All API subsystems are performing normally.",
        });
      } else {
        toast({
          title: "Degraded Performance",
          description: "One or more subsystems reported warnings.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error checking API health:", error);
      toast({
        title: "Health Check Failed",
        description: "Unable to reach API server.",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Activity className="h-8 w-8 animate-spin text-purple-600 mb-2" />
        <p className="text-sm text-muted-foreground">Verifying system metrics...</p>
      </div>
    );
  }

  const LayoutWrapper = user.isAdmin ? AdminLayout : DashboardLayout;
  const layoutProps = user.isAdmin
    ? {}
    : { user, onLogout: handleLogout };

  return (
    <LayoutWrapper {...(layoutProps as any)}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">API System Health & Metrics</h1>
            <p className="text-sm text-muted-foreground">Real-time status monitor of backend microservices and database connectivity</p>
          </div>
          <Button onClick={checkHealth} disabled={refreshing} className="w-fit">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Health Metrics
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-500" />
              Subsystem Endpoint Status
            </CardTitle>
            <CardDescription>Monitored services and response latencies</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : endpointStatus?.endpoints && Object.keys(endpointStatus.endpoints).length > 0 ? (
              <div className="divide-y rounded-xl border">
                {Object.entries(endpointStatus.endpoints).map(([name, endpoint], index) => (
                  <div key={index} className="flex justify-between items-center p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3">
                      {endpoint.status === 'up' ? (
                        <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-600">
                          <AlertCircle className="h-5 w-5" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm">{name}</p>
                        <p className="text-xs text-muted-foreground">Status: {endpoint.status.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={endpoint.status === 'up' ? 'outline' : 'destructive'} className={endpoint.status === 'up' ? 'border-emerald-500 text-emerald-600 bg-emerald-500/10' : ''}>
                        {endpoint.status === 'up' ? 'OPERATIONAL' : 'OFFLINE'}
                      </Badge>
                      {endpoint.responseTime !== undefined && (
                        <span className="text-xs font-mono font-medium text-muted-foreground bg-muted px-2 py-1 rounded">
                          {endpoint.responseTime}ms
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No health data reported by server.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}
