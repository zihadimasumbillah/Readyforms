"use client";

import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Database, 
  Server, 
  ShieldCheck,
  Loader2,
  CheckCircle2,
  XCircle // Add the XCircle import
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import apiHealthCheck from '@/lib/api/api-health-check';
import apiDebug from '@/lib/api/api-debug';
import { templateService } from '@/lib/api/template-service';
import { authService } from '@/lib/api/auth-service';
import { toast } from '@/components/ui/use-toast';
import { Template } from '@/types';

export default function ApiTestPage() {
  const [activeTab, setActiveTab] = useState('health');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState<any>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [authTest, setAuthTest] = useState<any>(null);
  
  useEffect(() => {
    // Initial health check when page loads
    checkApiHealth();
  }, []);
  
  const checkApiHealth = async () => {
    setIsLoading(true);
    try {
      const status = await apiHealthCheck.checkHealth();
      setApiStatus(status);
    } catch (error) {
      console.error('Error checking API health:', error);
      setApiStatus({
        status: 'unhealthy',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkTemplateAPI = async () => {
    setIsLoading(true);
    try {
      // Try to get templates from API
      const fetchedTemplates = await templateService.getTemplates({ limit: 5 });
      setTemplates(fetchedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const checkAuthAPI = async () => {
    setIsLoading(true);
    try {
      const result = await apiDebug.testAuth();
      setAuthTest(result);
    } catch (error) {
      console.error('Error testing auth API:', error);
      setAuthTest({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">API Test Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        This page helps diagnose connectivity issues between the frontend and backend.
      </p>
      
      <Tabs defaultValue="health" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="health">API Health</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="auth">Authentication</TabsTrigger>
        </TabsList>
        
        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle>API Health Check</CardTitle>
              <CardDescription>
                Tests basic connectivity to the backend API server
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="font-semibold">Status:</div>
                  <div className="flex items-center">
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2 text-muted-foreground" />
                    ) : apiStatus?.status === 'healthy' ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className={apiStatus?.status === 'healthy' ? 'text-green-500' : 'text-red-500'}>
                      {apiStatus?.status || 'Unknown'}
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="font-semibold mb-1">Message:</div>
                  <div className="text-sm">{apiStatus?.message || 'No status message'}</div>
                </div>
                
                {apiStatus?.endpoints && (
                  <div>
                    <div className="font-semibold mb-2">Endpoints:</div>
                    <div className="space-y-2">
                      {Object.entries(apiStatus.endpoints).map(([name, info]: [string, any]) => (
                        <div key={name} className="flex justify-between items-center bg-muted p-2 rounded text-sm">
                          <div className="font-mono">{name}</div>
                          <div className={info.status === 'ok' ? 'text-green-500' : 'text-red-500'}>
                            {info.status.toUpperCase()}
                            {info.responseTime && ` (${info.responseTime}ms)`}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div>
                  <div className="font-semibold">Configuration:</div>
                  <pre className="bg-muted p-4 rounded-md text-xs overflow-auto mt-2 max-h-48">
                    {JSON.stringify(apiDebug.getClientInfo(), null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={checkApiHealth} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Refresh Status
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Template API Test</CardTitle>
              <CardDescription>
                Tests the template API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="font-semibold">Templates API Status:</div>
                  <div>
                    {templates.length > 0 ? (
                      <span className="text-green-500 flex items-center">
                        <CheckCircle2 className="h-5 w-5 mr-2" />
                        Working
                      </span>
                    ) : (
                      <span className="text-orange-500 flex items-center">
                        <XCircle className="h-5 w-5 mr-2" />
                        No templates fetched
                      </span>
                    )}
                  </div>
                </div>
                
                {templates.length > 0 ? (
                  <div>
                    <div className="font-semibold mt-4 mb-2">Fetched Templates:</div>
                    <div className="space-y-2">
                      {templates.map(template => (
                        <div key={template.id} className="bg-muted p-3 rounded">
                          <div className="font-medium">{template.title}</div>
                          <div className="text-sm text-muted-foreground">{template.description}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-10 bg-muted rounded-md">
                    <div className="text-lg font-medium mb-2">No templates</div>
                    <div className="text-sm text-muted-foreground">
                      {isLoading 
                        ? 'Loading templates...' 
                        : 'Either the API is not responding or there are no templates in the database.'}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={checkTemplateAPI} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Fetch Templates
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle>Authentication API Test</CardTitle>
              <CardDescription>
                Tests the authentication API endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="font-semibold">Auth API Status:</div>
                  <div>
                    {authTest ? (
                      <span className={`flex items-center ${authTest.success ? 'text-green-500' : 'text-red-500'}`}>
                        {authTest.success ? (
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                        ) : (
                          <XCircle className="h-5 w-5 mr-2" />
                        )}
                        {authTest.success ? 'Working' : 'Error'}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Not tested yet</span>
                    )}
                  </div>
                </div>
                
                {authTest && (
                  <div>
                    <div className="font-semibold mb-1">Message:</div>
                    <div className="text-sm">{authTest.message}</div>
                    
                    {authTest.isAuthenticated !== undefined && (
                      <div className="mt-2">
                        <span className="font-semibold">Authentication status: </span>
                        <span className={authTest.isAuthenticated ? 'text-green-500' : 'text-muted-foreground'}>
                          {authTest.isAuthenticated ? 'Authenticated' : 'Not authenticated'}
                        </span>
                      </div>
                    )}
                    
                    {authTest.user && (
                      <div className="mt-4">
                        <div className="font-semibold mb-1">User Information:</div>
                        <pre className="bg-muted p-4 rounded-md text-xs overflow-auto max-h-48">
                          {JSON.stringify(authTest.user, null, 2)}
                        </pre>
                      </div>
                    )}
                    
                    {authTest.error && (
                      <div className="mt-4">
                        <div className="font-semibold mb-1">Error Details:</div>
                        <pre className="bg-red-50 dark:bg-red-900/20 p-4 rounded-md text-xs overflow-auto text-red-800 dark:text-red-300 max-h-48">
                          {JSON.stringify(authTest.error, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                )}
                
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-semibold mb-2">Authentication Quick Test</h3>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          const result = await authService.login('user@example.com', 'user123');
                          alert(result.success ? 'Login successful!' : `Login failed: ${result.message}`);
                        } catch (error) {
                          alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading}
                    >
                      Test Login
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          setIsLoading(true);
                          const testUser = {
                            name: `Test User ${Math.floor(Math.random() * 1000)}`,
                            email: `test${Math.floor(Math.random() * 10000)}@example.com`,
                            password: 'password123'
                          };
                          const result = await authService.register(testUser.name, testUser.email, testUser.password);
                          alert(result.success ? 
                            `Registration successful! Email: ${testUser.email}` : 
                            `Registration failed: ${result.message}`
                          );
                        } catch (error) {
                          alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      disabled={isLoading}
                    >
                      Test Registration
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={checkAuthAPI} disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Test Auth API
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
