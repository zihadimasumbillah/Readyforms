"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Server } from "lucide-react";
import { useRouter } from 'next/navigation';
import axios from 'axios';

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
  const router = useRouter();

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
        if (!recommendedEndpoint && name.includes('development')) {
          setRecommendedEndpoint(url.replace('/ping', '').replace('/health', ''));
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
