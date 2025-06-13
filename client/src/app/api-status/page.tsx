"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, CheckCircle, AlertCircle, Database } from "lucide-react";
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
          title: "Health Check Successful",
          description: "All systems are operational",
        });
      } else {
        toast({
          title: "Health Check Warning",
          description: "Some systems may not be functioning properly",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error checking API health:", error);
      toast({
        title: "Health Check Failed",
        description: "Unable to complete the health check",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  useEffect(() => {
    if (user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You must be an administrator to view this page",
        variant: "destructive"
      });
      router.push('/dashboard');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Loading</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      user={{
        name: user.name || 'Admin',
        email: user.email || 'admin@example.com',
        isAdmin: user.isAdmin || false
      }}
      onLogout={handleLogout}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">API System Status</h1>
        <Button onClick={checkHealth} disabled={refreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>Health status of essential API endpoints</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array(3).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : endpointStatus?.endpoints && Object.keys(endpointStatus.endpoints).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(endpointStatus.endpoints).map(([name, endpoint], index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-md">
                  <div className="flex items-center">
                    {endpoint.status === 'up' ? (
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                    )}
                    <span className="font-medium">{name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={endpoint.status === 'up' ? 'outline' : 'destructive'}>
                      {endpoint.status === 'up' ? 'Healthy' : 'Unhealthy'}
                    </Badge>
                    {endpoint.responseTime && (
                      <span className="text-sm text-muted-foreground">
                        {endpoint.responseTime}ms
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground">No endpoint data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
