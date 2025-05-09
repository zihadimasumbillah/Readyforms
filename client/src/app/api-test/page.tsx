"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { testApiConnectivity } from '@/lib/api/api-test';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ApiTestPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");

  const runTest = async () => {
    setLoading(true);
    try {
      const testResults = await testApiConnectivity();
      setResults(testResults);
    } catch (error) {
      console.error('Error running API test:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">API Connection Test</h1>
      <p className="text-muted-foreground mb-6">
        Use this tool to diagnose API connectivity issues between your client and server.
      </p>
      
      <div className="flex items-center gap-4 mb-8">
        <Button onClick={runTest} disabled={loading}>
          {loading ? "Testing..." : "Run API Test"}
        </Button>
        {results && (
          <p className={results.successful ? "text-green-500" : "text-red-500"}>
            {results.successful ? "✓ Found working endpoints" : "✗ No working endpoints found"}
          </p>
        )}
      </div>
      
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>
              Environment: {results.environment}, 
              API URL from env: {results.nextPublicApiUrl || "not set"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="raw">Raw Data</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-4">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader className="py-2">
                        <CardTitle className="text-sm">Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className={results.successful ? "text-green-500 font-bold" : "text-red-500 font-bold"}>
                          {results.successful ? "CONNECTED" : "DISCONNECTED"}
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="py-2">
                        <CardTitle className="text-sm">Recommended Endpoint</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="font-mono text-xs break-all">
                          {results.recommendedEndpoint || "None found"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader className="py-2">
                      <CardTitle className="text-sm">Endpoint Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {results.tests.map((test: any, i: number) => (
                          <div key={i} className="flex justify-between items-center px-2 py-1 rounded bg-muted/50">
                            <span>{test.endpoint}: {test.url}</span>
                            <span className={test.success ? "text-green-500" : "text-red-500"}>
                              {test.success ? `✓ (${test.duration || 'OK'})` : "✗ Failed"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="details" className="mt-4">
                <div className="space-y-4">
                  {results.tests.map((test: any, i: number) => (
                    <Card key={i}>
                      <CardHeader>
                        <CardTitle className={test.success ? "text-green-500" : "text-red-500"}>
                          {test.endpoint} {test.success ? "✓" : "✗"}
                        </CardTitle>
                        <CardDescription className="font-mono text-xs break-all">
                          {test.url}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {test.success ? (
                          <div>
                            <p>Status: {test.status}</p>
                            <p>Duration: {test.duration}</p>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs">
                              {JSON.stringify(test.data, null, 2)}
                            </pre>
                          </div>
                        ) : (
                          <div>
                            <p>Error: {test.error}</p>
                            {test.status && <p>Status: {test.status}</p>}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="raw" className="mt-4">
                <pre className="p-4 bg-muted rounded overflow-auto max-h-[500px]">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={runTest}>
              Run Test Again
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {!results && !loading && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Click "Run API Test" to check connectivity to the backend server.
            </p>
          </CardContent>
        </Card>
      )}
      
      {loading && (
        <Card>
          <CardContent className="py-8">
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
              <p>Testing API connectivity...</p>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Troubleshooting Steps</h2>
        <div className="space-y-2">
          <p className="text-muted-foreground">If you're having connection issues:</p>
          <ol className="list-decimal list-inside space-y-2 ml-4">
            <li>Ensure your server is running on <code className="bg-muted px-1 rounded">http://localhost:3001</code></li>
            <li>Check that CORS is properly configured on your server</li>
            <li>Verify your <code className="bg-muted px-1 rounded">NEXT_PUBLIC_API_URL</code> environment variable</li>
            <li>Check for network issues or firewalls blocking connections</li>
            <li>Verify the routes in your API are correctly configured</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
