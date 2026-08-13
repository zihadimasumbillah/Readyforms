"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldAlert, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "CredentialsSignin";

  const getErrorMessage = (errType: string) => {
    switch (errType) {
      case "CredentialsSignin":
        return "Invalid email or password. Please check your login credentials.";
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
        return "Could not authenticate with Google OAuth. Please try signing in again.";
      case "EmailCreateAccount":
      case "EmailSignin":
        return "Email authentication error. Please try again.";
      case "SessionRequired":
        return "You must be signed in to access this page.";
      default:
        return "An unexpected authentication error occurred. Please try logging in again.";
    }
  };

  return (
    <Card className="w-full max-w-md border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black text-black dark:text-white shadow-2xl rounded-2xl">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center mb-3 font-bold shadow-md">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-extrabold tracking-tight">Authentication Notice</CardTitle>
        <CardDescription className="text-neutral-500 dark:text-neutral-400 mt-1">
          {getErrorMessage(error)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-xs font-mono text-neutral-600 dark:text-neutral-400">
          Error Code: {error}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-2">
        <Button asChild className="w-full h-11 bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-bold rounded-xl shadow-md">
          <Link href="/auth/login">
            <RefreshCw className="mr-2 h-4 w-4" />
            Back to Sign In
          </Link>
        </Button>
        <Button asChild variant="outline" className="w-full h-11 border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-semibold rounded-xl">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return Home
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black px-4 py-12 transition-colors">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black dark:border-white border-t-transparent" />
          <p className="text-sm text-neutral-500 font-medium">Loading...</p>
        </div>
      }>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
