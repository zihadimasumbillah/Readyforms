"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { healthService } from "@/lib/api/health-service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { authService } from "@/lib/api/auth-service";
import { isApiReachable } from "@/lib/api/api-health-check";
import { TemplateGallery } from "@/components/template/template-gallery";

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [apiReachable, setApiReachable] = useState<boolean | null>(null);

  // Check if the user is logged in on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = authService.getUser();
      if (currentUser) {
        setUser(currentUser);
      }
    };
    checkAuth();
  }, []);

  // Check API reachability
  useEffect(() => {
    const checkApiStatus = async () => {
      const reachable = await isApiReachable();
      setApiReachable(reachable);
    };
    checkApiStatus();
  }, []);

  const { data: healthData, isLoading, isError } = useQuery({
    queryKey: ['health'],
    queryFn: async () => await healthService.checkHealth(),
    retry: 1
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex justify-between items-center py-4">
          <h1 className="text-2xl font-bold tracking-tight">ReadyForms</h1>
          <nav className="flex items-center gap-4">
            {!user ? (
              <>
                <Link href="/auth/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/auth/register">
                  <Button>Register</Button>
                </Link>
              </>
            ) : (
              <>
                <span className="text-sm text-muted-foreground">Welcome, {user.name}</span>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    authService.logout();
                    setUser(null);
                  }}
                >
                  Logout
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto py-12">
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>API Status</CardTitle>
                <CardDescription>Backend connection status</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading && <p>Checking connection...</p>}
                {isError && <p className="text-destructive">Connection failed. Backend may be unavailable.</p>}
                {healthData && (
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <span>API Connected</span>
                  </div>
                )}
                {apiReachable === false && (
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <span>API Unavailable</span>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <p className="text-xs text-muted-foreground">
                  {healthData ? `Server message: ${JSON.stringify(healthData)}` : "No health data available"}
                </p>
                <Link href="/api-test" className="text-xs text-blue-500 hover:underline">
                  Run API tests
                </Link>
              </CardFooter>
            </Card>
            
           
          {/* Add Template Gallery Section */}
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Featured Templates</h2>
            <TemplateGallery />
          </section>
        </div>
      </main>
      
      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ReadyForms. All rights reserved.
          </p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link href="/about" className="text-sm text-muted-foreground hover:underline">
              About
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}