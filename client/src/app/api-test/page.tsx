"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { ActivityIcon, AlertCircleIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';
import { apiHealth } from '@/lib/api/api-health';
import ApiConfig from '@/lib/api/api-config';

export default function ApiTestPage() {
  const [results, setResults] = useState<{
    ping?: { success: boolean, time: number };
    database?: { success: boolean, time: number };
    full?: { success: boolean, data?: any, error?: string };
    cors?: { success: boolean };
    error?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const runAllTests = async () => {
    setLoading(true);
    setResults({});
    try {
      // Test ping
      const pingStart = Date.now();
      const pingSuccess = await apiHealth.ping();
      const pingTime = Date.now() - pingStart;

      // Test database
      const dbStart = Date.now();
      const dbSuccess = await apiHealth.checkDatabase();
      const dbTime = Date.now() - dbStart;

      // Test full status
      const fullStatus = await apiHealth.getFullStatus();

      setResults({
        ping: { success: pingSuccess, time: pingTime },
        database: { success: dbSuccess, time: dbTime },
        full: fullStatus.success ? fullStatus : { success: false, data: null },
      });
    } catch (error) {
      setResults({
        error: (error as Error).message
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const renderStatusIcon = (success?: boolean) => {
    if (success === undefined) return <ActivityIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
    return success ? 
      <CheckCircleIcon className="h-5 w-5 text-green-500" /> : 
      <XCircleIcon className="h-5 w-5 text-red-500" />;
  };

  return (
    <div className="container py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">API Health Check</h1>
        <p className="text-muted-foreground">
          Test the connection to the ReadyForms API server
        </p>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              API Configuration
              <Badge variant="outline">{process.env.NODE_ENV}</Badge>
            </CardTitle>
            <CardDescription>
              Current API connection settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="font-medium text-sm">Base URL</p>
                <p className="text-sm font-mono">{ApiConfig.BASE_URL}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="font-medium text-sm">Credentials</p>
                <p className="text-sm">{ApiConfig.CREDENTIALS ? 'Enabled' : 'Disabled'}</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-md">
                <p className="font-medium text-sm">Request Timeout</p>
                <p className="text-sm">{ApiConfig.TIMEOUT}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Health Check Results
              <Button 
                variant="outline" 
                size="sm"
                disabled={loading} 
                onClick={runAllTests}
              >
                {loading ? (
                  <>
                    <ActivityIcon className="h-4 w-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : 'Run Tests'}
              </Button>
            </CardTitle>
            <CardDescription>
              API connectivity test results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {results.error && (
              <Alert variant="destructive">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>Test Error</AlertTitle>
                <AlertDescription>{results.error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div>
                  <p className="font-medium">Basic Connectivity</p>
                  <p className="text-sm text-muted-foreground">API ping test</p>
                </div>
                <div className="flex items-center gap-2">
                  {renderStatusIcon(results.ping?.success)}
                  {results.ping?.time && (
                    <span className="text-xs text-muted-foreground">
                      {results.ping.time}ms
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div>
                  <p className="font-medium">Database Connection</p>
                  <p className="text-sm text-muted-foreground">Database health check</p>
                </div>
                <div className="flex items-center gap-2">
                  {renderStatusIcon(results.database?.success)}
                  {results.database?.time && (
                    <span className="text-xs text-muted-foreground">
                      {results.database.time}ms
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div>
                  <p className="font-medium">Full System Status</p>
                  <p className="text-sm text-muted-foreground">Comprehensive API check</p>
                </div>
                {renderStatusIcon(results.full?.success)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {results.full?.data && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed API Response</CardTitle>
            <CardDescription>
              Full health check response data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto text-xs">
              {JSON.stringify(results.full.data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
