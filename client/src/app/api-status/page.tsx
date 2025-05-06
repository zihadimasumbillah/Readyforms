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
import healthService, { HealthCheckResponse } from "@/lib/api/health-service";

export default function ApiStatusPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [healthStatus, setHealthStatus] = useState<HealthCheckResponse | null>(null);
  const [endpointStatus, setEndpointStatus] = useState<HealthCheckResponse | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    if (logout) {
      logout();
      router.push('/auth/login');
    }
  };

  const checkHealth = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      const health = await healthService.checkApiHealth();
      const endpoints = await healthService.checkEndpoints();
      
      setHealthStatus(health);
      setEndpointStatus(endpoints);
      setLastChecked(new Date());
      
      if (health.status === 'healthy') {
        toast({
          title: "Health Check Complete",
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

  // Ensure user is admin
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
      
      {/* Overall Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            System Status 
            {loading ? (
              <Skeleton className="w-24 h-8" />
            ) : (
              <Badge variant={healthStatus?.status === 'healthy' ? 'default' : 'destructive'}>
                {healthStatus?.status === 'healthy' ? 'Operational' : 'Issues Detected'}
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {lastChecked ? `Last checked: ${lastChecked.toLocaleString()}` : 'Checking system status...'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-primary/10 p-2">
                  {healthStatus?.status === 'healthy' ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{healthStatus?.message}</p>
                  <p className="text-sm text-muted-foreground">API Server</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-primary/10 p-2">
                  <Database className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">
                    Database is {healthStatus?.databaseStatus || 'unavailable'}
                  </p>
                  <p className="text-sm text-muted-foreground">PostgreSQL Database</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Endpoints Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>
            Status of individual API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex justify-between items-center p-3 border rounded-lg">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-16" />
                </div>
              ))
            ) : (
              endpointStatus?.endpoints?.map((endpoint, index) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div className="flex items-center">
                    {endpoint.status === 'healthy' ? (
                      <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
                    )}
                    <span className="font-medium">{endpoint.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={endpoint.status === 'healthy' ? 'outline' : 'destructive'}>
                      {endpoint.status === 'healthy' ? 'Healthy' : 'Unhealthy'}
                    </Badge>
                    {endpoint.responseTime && (
                      <span className="text-sm text-muted-foreground">
                        {endpoint.responseTime}ms
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {!loading && (!endpointStatus?.endpoints || endpointStatus.endpoints.length === 0) && (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No endpoint data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
