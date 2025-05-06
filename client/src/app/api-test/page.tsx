"use client";

import { useState, useEffect } from "react";
import { checkApiConnectivity, type HealthCheckResponse } from "@/lib/api/api-health-check";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApiTestPage() {
  const [results, setResults] = useState<HealthCheckResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const testResults = await checkApiConnectivity();
      setResults(testResults);
    } catch (err: any) {
      setError(err.message || "An error occurred while testing API connectivity");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const anySuccessful = results.some(result => result.success);
  const allSuccessful = results.length > 0 && results.every(result => result.success);

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Connectivity Test</h1>
          <p className="text-muted-foreground mt-2">
            This page tests the connectivity between the frontend and backend API.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Button onClick={runTests} disabled={isLoading}>
            {isLoading ? "Testing..." : "Run Tests Again"}
          </Button>
          
          <div className="flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${allSuccessful ? 'bg-green-500' : anySuccessful ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
            <p className="text-sm">
              {allSuccessful 
                ? "All endpoints reachable" 
                : anySuccessful 
                  ? "Some endpoints reachable" 
                  : "No endpoints reachable"}
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-md">
            <p className="font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        )}

        <div className="grid gap-4">
          {results.map((result, index) => (
            <Card key={index} className={`border-l-4 ${result.success ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between">
                  <span>Endpoint: {result.endpoint}</span>
                  <span className={result.success ? 'text-green-500' : 'text-red-500'}>
                    {result.success ? 'Success' : 'Failed'}
                  </span>
                </CardTitle>
                <CardDescription>Response time: {result.duration}ms</CardDescription>
              </CardHeader>
              <CardContent>
                {result.success ? (
                  <p className="text-sm text-muted-foreground">{result.message}</p>
                ) : (
                  <p className="text-sm text-destructive">{result.error}</p>
                )}
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Tested at: {new Date(result.timestamp).toLocaleString()}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}