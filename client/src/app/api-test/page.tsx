"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Server, RefreshCcw, Database, Fingerprint } from "lucide-react";
import { useRouter } from 'next/navigation';
import axios from 'axios';
import apiClient from '@/lib/api/api-client';
import { useAuth } from '@/contexts/auth-context';

interface EndpointTestResult {
  endpoint: string;
  url: string;
  success: boolean;
  status?: number;
  duration?: string;
  data?: any;
  error?: string;
}

export default function ApiTestPage() {
  const [results, setResults] = useState<EndpointTestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [recommendedEndpoint, setRecommendedEndpoint] = useState("");
  const [backendFeatureTests, setBackendFeatureTests] = useState<any>({});
  const [featureTestsLoading, setFeatureTestsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    runTests();
  }, []);

  const runTests = async () => {
    setLoading(true);
    const testResults: EndpointTestResult[] = [];
    
    const endpoints = {
      production: 'https://readyforms-api.vercel.app/api/ping',
      development: 'http://localhost:3001/api/ping',
      healthProduction: 'https://readyforms-api.vercel.app/health',
      healthDevelopment: 'http://localhost:3001/health',
      statusProduction: 'https://readyforms-api.vercel.app/api/status',
      statusDevelopment: 'http://localhost:3001/api/status',
      debug: 'http://localhost:3001/debug-cors'
    };

    // Test each endpoint
    for (const [name, url] of Object.entries(endpoints)) {
      try {
        const startTime = Date.now();
        const response = await axios.get(url, { 
          timeout: 5000,
          headers: { 'Accept': 'application/json' }
        });
        const duration = Date.now() - startTime;
        
        testResults.push({
          endpoint: name,
          url,
          success: true,
          status: response.status,
          duration: `${duration}ms`,
          data: response.data
        });
        
        // Save first successful endpoint as recommended
        if (!recommendedEndpoint && (name === 'development' || name === 'production')) {
          setRecommendedEndpoint(url.replace('/ping', ''));
        }
      } catch (error: any) {
        testResults.push({
          endpoint: name,
          url,
          success: false,
          error: error.message,
          status: error.response?.status
        });
      }
    }
    
    setResults(testResults);
    setLoading(false);
  };

  // Function to test all backend features
  const runFeatureTests = async () => {
    if (!user) {
      return;
    }

    setFeatureTestsLoading(true);
    const tests = {
      templates: { success: false, data: null, error: null },
      topics: { success: false, data: null, error: null },
      users: { success: false, data: null, error: null },
      auth: { success: false, data: null, error: null }
    };

    try {
      // Test templates endpoint
      const templatesResponse = await apiClient.get('/templates?page=1&limit=5');
      tests.templates = { 
        success: true, 
        data: templatesResponse.data, 
        error: null,
        count: templatesResponse.data.length
      };
    } catch (error: any) {
      tests.templates = { 
        success: false, 
        data: null, 
        error: error.message,
        errorDetails: error.response?.data
      };
    }

    try {
      // Test topics endpoint
      const topicsResponse = await apiClient.get('/topics');
      tests.topics = { 
        success: true, 
        data: topicsResponse.data, 
        error: null,
        count: topicsResponse.data.length
      };
    } catch (error: any) {
      tests.topics = { 
        success: false, 
        data: null, 
        error: error.message,
        errorDetails: error.response?.data
      };
    }

    if (user.isAdmin) {
      try {
        // Test users endpoint (admin only)
        const usersResponse = await apiClient.get('/admin/users');
        tests.users = { 
          success: true, 
          data: usersResponse.data, 
          error: null 
        };
      } catch (error: any) {
        tests.users = { 
          success: false, 
          data: null, 
          error: error.message,
          errorDetails: error.response?.data
        };
      }
    }

    try {
      // Test auth endpoint (current user)
      const authResponse = await apiClient.get('/auth/me');
      tests.auth = { 
        success: true, 
        data: authResponse.data, 
        error: null 
      };
    } catch (error: any) {
      tests.auth = { 
        success: false, 
        data: null, 
        error: error.message,
        errorDetails: error.response?.data
      };
    }

    setBackendFeatureTests(tests);
    setFeatureTestsLoading(false);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">API Connection Test</h1>
          <p className="text-muted-foreground mt-1">
            Diagnostic tool to check API connectivity
          </p>
        </div>
        <div className="flex mt-4 md:mt-0 space-x-2">
          <Button variant="outline" onClick={() => router.push('/dashboard')}>
            Dashboard
          </Button>
          <Button variant="default" onClick={runTests} disabled={loading}>
            {loading ? "Running Tests..." : "Run Tests Again"}
          </Button>
        </div>
      </header>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Server className="mr-2 h-5 w-5" /> API Status
          </CardTitle>
          <CardDescription>
            Testing connectivity between client and API endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Testing API endpoints...</p>
            </div>
          ) : (
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Detailed Results</TabsTrigger>
                <TabsTrigger value="features">Feature Tests</TabsTrigger>
                <TabsTrigger value="help">Troubleshooting</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="bg-muted/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Recommended Endpoint</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {recommendedEndpoint ? (
                          <div className="font-mono text-sm break-all">
                            {recommendedEndpoint}
                          </div>
                        ) : (
                          <div className="text-red-500 font-medium">
                            No working endpoints found
                          </div>
                        )}
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-muted/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Environment</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center space-x-2">
                          <Badge variant={process.env.NODE_ENV === 'production' ? 'destructive' : 'default'}>
                            {process.env.NODE_ENV}
                          </Badge>
                          <span className="text-sm">
                            {process.env.NEXT_PUBLIC_API_URL ? 
                              `Using: ${process.env.NEXT_PUBLIC_API_URL}` : 
                              'No API URL configured in environment'}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="rounded-md border">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted/50">
                            <th className="px-4 py-2 text-left font-medium">Endpoint</th>
                            <th className="px-4 py-2 text-left font-medium">Status</th>
                            <th className="px-4 py-2 text-left font-medium hidden md:table-cell">Response Time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {results.map((result, index) => (
                            <tr key={index} className="hover:bg-muted/50 transition-colors">
                              <td className="px-4 py-2 font-mono text-xs">
                                {result.url}
                              </td>
                              <td className="px-4 py-2">
                                {result.success ? (
                                  <span className="inline-flex items-center text-green-600">
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    OK ({result.status})
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center text-red-600">
                                    <AlertCircle className="h-4 w-4 mr-1" />
                                    Error {result.status && `(${result.status})`}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2 hidden md:table-cell">
                                {result.duration || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="details">
                <div className="space-y-4">
                  {results.map((result, index) => (
                    <Card key={index}>
                      <CardHeader className={`pb-2 ${result.success ? 'bg-green-100/50 dark:bg-green-900/20' : 'bg-red-100/50 dark:bg-red-900/20'}`}>
                        <CardTitle className="text-base flex items-center">
                          {result.success ? (
                            <CheckCircle2 className="h-5 w-5 mr-2 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 mr-2 text-red-600" />
                          )}
                          {result.endpoint}
                        </CardTitle>
                        <CardDescription className="font-mono text-xs break-all">
                          {result.url}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-4">
                        {result.success ? (
                          <>
                            <p className="mb-2">
                              <span className="font-medium">Status:</span> {result.status}
                            </p>
                            <p className="mb-2">
                              <span className="font-medium">Response Time:</span> {result.duration}
                            </p>
                            <div className="mt-4">
                              <p className="font-medium mb-1">Response Data:</p>
                              <pre className="bg-muted p-3 rounded-md overflow-auto max-h-80 text-xs">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </div>
                          </>
                        ) : (
                          <>
                            <p className="text-red-600 mb-2">
                              <span className="font-medium">Error:</span> {result.error}
                            </p>
                            {result.status && (
                              <p className="mb-2">
                                <span className="font-medium">Status Code:</span> {result.status}
                              </p>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="features">
                <div className="mb-4">
                  <Button 
                    onClick={runFeatureTests} 
                    disabled={featureTestsLoading || !user}
                    className="flex items-center gap-2"
                  >
                    {featureTestsLoading ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                        Testing Features...
                      </>
                    ) : (
                      <>
                        <RefreshCcw className="h-4 w-4" />
                        {Object.keys(backendFeatureTests).length > 0 ? "Re-run Feature Tests" : "Run Feature Tests"}
                      </>
                    )}
                  </Button>
                  {!user && (
                    <div className="mt-2 text-amber-600 text-sm">
                      Login required to run feature tests
                    </div>
                  )}
                </div>

                {Object.keys(backendFeatureTests).length > 0 ? (
                  <div className="space-y-4">
                    <Card className={`${backendFeatureTests.templates.success ? 'border-green-300 dark:border-green-800' : 'border-red-300 dark:border-red-800'}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center text-base">
                          <Database className="h-5 w-5 mr-2" />
                          Templates API
                          <Badge variant={backendFeatureTests.templates.success ? "default" : "destructive"} className="ml-auto">
                            {backendFeatureTests.templates.success ? "Success" : "Failed"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {backendFeatureTests.templates.success ? (
                          <div>
                            <p className="mb-2">
                              <span className="font-medium">Count:</span> {backendFeatureTests.templates.count} templates found
                            </p>
                            <pre className="bg-muted p-3 rounded-md overflow-auto max-h-40 text-xs">
                              {JSON.stringify(backendFeatureTests.templates.data.slice(0, 1), null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <div className="text-red-600">
                            <p>Error: {backendFeatureTests.templates.error}</p>
                            {backendFeatureTests.templates.errorDetails && (
                              <pre className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md overflow-auto max-h-40 text-xs mt-2">
                                {JSON.stringify(backendFeatureTests.templates.errorDetails, null, 2)}
                              </pre>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className={`${backendFeatureTests.topics.success ? 'border-green-300 dark:border-green-800' : 'border-red-300 dark:border-red-800'}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center text-base">
                          <Database className="h-5 w-5 mr-2" />
                          Topics API
                          <Badge variant={backendFeatureTests.topics.success ? "default" : "destructive"} className="ml-auto">
                            {backendFeatureTests.topics.success ? "Success" : "Failed"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {backendFeatureTests.topics.success ? (
                          <div>
                            <p className="mb-2">
                              <span className="font-medium">Count:</span> {backendFeatureTests.topics.count} topics found
                            </p>
                            <pre className="bg-muted p-3 rounded-md overflow-auto max-h-40 text-xs">
                              {JSON.stringify(backendFeatureTests.topics.data, null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <div className="text-red-600">
                            <p>Error: {backendFeatureTests.topics.error}</p>
                            {backendFeatureTests.topics.errorDetails && (
                              <pre className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md overflow-auto max-h-40 text-xs mt-2">
                                {JSON.stringify(backendFeatureTests.topics.errorDetails, null, 2)}
                              </pre>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    <Card className={`${backendFeatureTests.auth.success ? 'border-green-300 dark:border-green-800' : 'border-red-300 dark:border-red-800'}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center text-base">
                          <Fingerprint className="h-5 w-5 mr-2" />
                          Authentication API
                          <Badge variant={backendFeatureTests.auth.success ? "default" : "destructive"} className="ml-auto">
                            {backendFeatureTests.auth.success ? "Success" : "Failed"}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {backendFeatureTests.auth.success ? (
                          <div>
                            <p className="mb-2">
                              <span className="font-medium">User:</span> {backendFeatureTests.auth.data.name} ({backendFeatureTests.auth.data.email})
                            </p>
                            <pre className="bg-muted p-3 rounded-md overflow-auto max-h-40 text-xs">
                              {JSON.stringify(backendFeatureTests.auth.data, null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <div className="text-red-600">
                            <p>Error: {backendFeatureTests.auth.error}</p>
                            {backendFeatureTests.auth.errorDetails && (
                              <pre className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md overflow-auto max-h-40 text-xs mt-2">
                                {JSON.stringify(backendFeatureTests.auth.errorDetails, null, 2)}
                              </pre>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {user?.isAdmin && (
                      <Card className={`${backendFeatureTests.users?.success ? 'border-green-300 dark:border-green-800' : 'border-red-300 dark:border-red-800'}`}>
                        <CardHeader>
                          <CardTitle className="flex items-center text-base">
                            <Database className="h-5 w-5 mr-2" />
                            Users API (Admin)
                            <Badge variant={backendFeatureTests.users?.success ? "default" : "destructive"} className="ml-auto">
                              {backendFeatureTests.users?.success ? "Success" : "Failed"}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {backendFeatureTests.users?.success ? (
                            <div>
                              <p className="mb-2">
                                <span className="font-medium">Users count:</span> {backendFeatureTests.users.data.users?.length || 0}
                              </p>
                              <pre className="bg-muted p-3 rounded-md overflow-auto max-h-40 text-xs">
                                {JSON.stringify(backendFeatureTests.users.data.users?.slice(0, 2), null, 2)}
                              </pre>
                            </div>
                          ) : (
                            <div className="text-red-600">
                              <p>Error: {backendFeatureTests.users?.error}</p>
                              {backendFeatureTests.users?.errorDetails && (
                                <pre className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md overflow-auto max-h-40 text-xs mt-2">
                                  {JSON.stringify(backendFeatureTests.users.errorDetails, null, 2)}
                                </pre>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center border rounded-md bg-muted/30">
                    <p className="text-muted-foreground">Click the button above to run feature tests</p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="help">
                <div className="space-y-4">
                  <div className="rounded-md bg-amber-50 dark:bg-amber-950/50 p-4 border border-amber-200 dark:border-amber-900">
                    <h3 className="font-bold text-amber-800 dark:text-amber-300 mb-2">
                      Common CORS Issues
                    </h3>
                    <ul className="list-disc pl-5 space-y-2 text-amber-800 dark:text-amber-300">
                      <li>
                        <strong>Missing CORS Headers:</strong> API server needs to have CORS properly configured
                      </li>
                      <li>
                        <strong>Mismatched Protocol:</strong> HTTP vs HTTPS origin differences
                      </li>
                      <li>
                        <strong>Domain Mismatch:</strong> API server CORS settings need to include your client domain
                      </li>
                      <li>
                        <strong>Credentials Mode:</strong> Issues with withCredentials and wildcard origins
                      </li>
                    </ul>
                  </div>
                  
                  <div className="rounded-md bg-blue-50 dark:bg-blue-950/50 p-4 border border-blue-200 dark:border-blue-900">
                    <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">
                      Troubleshooting Steps
                    </h3>
                    <ol className="list-decimal pl-5 space-y-2 text-blue-800 dark:text-blue-300">
                      <li>Ensure API server is running on <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">http://localhost:3001</code></li>
                      <li>Verify <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">NEXT_PUBLIC_API_URL</code> is set correctly in your .env file</li>
                      <li>Check that CORS is properly configured in the server</li>
                      <li>Try disabling withCredentials in your API client if using * wildcard origins</li>
                      <li>Use browser developer tools Network tab to inspect response headers</li>
                    </ol>
                  </div>
                  
                  <div className="rounded-md bg-green-50 dark:bg-green-950/50 p-4 border border-green-200 dark:border-green-900">
                    <h3 className="font-bold text-green-800 dark:text-green-300 mb-2">
                      Client-Side Config
                    </h3>
                    <p className="mb-2 text-green-800 dark:text-green-300">
                      Make sure your API client configuration is correct:
                    </p>
                    <pre className="bg-green-100/50 dark:bg-green-900/50 p-3 rounded-md overflow-auto text-xs text-green-800 dark:text-green-300">
{`// In your api-client.ts file:
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false // Set to true only for authenticated routes
});`}
                    </pre>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        <CardFooter className="border-t pt-4 flex justify-between">
          <p className="text-xs text-muted-foreground">
            If you're still having issues, check the server logs or contact support.
          </p>
          <Button variant="outline" size="sm" onClick={() => router.push('/')}>
            Return Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
