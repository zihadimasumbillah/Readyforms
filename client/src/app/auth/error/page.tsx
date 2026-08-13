"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ShieldAlert, ArrowLeft, RefreshCw, Mail, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "CredentialsSignin";

  const isBlocked =
    error === "AccountBlocked" ||
    error === "AccessDenied" ||
    error.toLowerCase().includes("block");

  const getErrorMessage = (errType: string) => {
    if (isBlocked) {
      return "Your account has been suspended or blocked by a system administrator. You cannot access ReadyForms at this time.";
    }
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
        return "An unexpected authentication notice occurred. Please try logging in again.";
    }
  };

  return (
    <Card className={`w-full max-w-md bg-card text-foreground shadow-2xl rounded-2xl ${isBlocked ? 'border-red-500/50 shadow-red-500/5' : 'border-border'}`}>
      <CardHeader className="text-center pb-4">
        <div className={`mx-auto h-14 w-14 rounded-2xl flex items-center justify-center mb-3 font-bold shadow-md ${
          isBlocked 
            ? 'bg-red-500/10 text-red-600 border border-red-500/30' 
            : 'bg-foreground text-background'
        }`}>
          <ShieldAlert className="h-7 w-7" />
        </div>
        <CardTitle className={`text-2xl font-extrabold tracking-tight ${isBlocked ? 'text-red-600 dark:text-red-400' : ''}`}>
          {isBlocked ? "Account Access Restricted" : "Authentication Notice"}
        </CardTitle>
        <CardDescription className="text-muted-foreground mt-1 text-sm">
          {getErrorMessage(error)}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 text-center">
        {isBlocked ? (
          <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-left space-y-2">
            <p className="text-xs font-semibold text-red-600 dark:text-red-300">
              Need to resolve this issue?
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If you believe this restriction is a mistake or require reactivation, please contact our support team or reach out directly to your organization administrator.
            </p>
          </div>
        ) : (
          <div className="p-3 bg-muted/50 rounded-xl border text-xs font-mono text-muted-foreground">
            Error Code: {error}
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-2">
        {isBlocked && (
          <Button
            asChild
            className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md gap-2"
          >
            <a href="mailto:support@readyforms.com?subject=Account%20Unblock%20Request&body=Hello%20Administrator,%0A%0AMy%20account%20has%20been%20blocked%20and%20I%20would%20like%20to%20request%20access%20reactivation.%0A%0AThank%20you.">
              <Mail className="h-4 w-4" />
              <span>Contact System Administrator</span>
            </a>
          </Button>
        )}

        <Button asChild className={`w-full h-11 font-bold rounded-xl shadow-md ${isBlocked ? 'variant-outline border' : 'bg-primary text-primary-foreground'}`}>
          <Link href="/auth/login">
            <RefreshCw className="mr-2 h-4 w-4" />
            Back to Sign In
          </Link>
        </Button>
        
        <Button asChild variant="ghost" className="w-full h-11 text-muted-foreground font-semibold rounded-xl">
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
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 transition-colors">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground font-medium">Loading...</p>
        </div>
      }>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}
