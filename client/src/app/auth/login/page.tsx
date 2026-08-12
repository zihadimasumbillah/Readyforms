"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { authService } from "@/lib/api/auth-service";
import { KeyRound, Mail, Lock, Sparkles, CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

type FormData = z.infer<typeof formSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const router = useRouter();
  const auth = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onPasswordSubmit = async (formData: FormData) => {
    try {
      setIsLoading(true);
      
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });
      
      if (response && response.token && response.user) {
        auth.login(response.token, response.user);
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${response.user.name}!`,
        });
        
        if (response.user.isAdmin) {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!otpEmail || !otpEmail.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address to receive OTP code.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSendingOtp(true);
      const res = await authService.sendOTP(otpEmail, "login");
      setOtpSent(true);
      if (res.devOtp) {
        setDevOtpHint(res.devOtp);
        setOtpCode(res.devOtp);
      }
      toast({
        title: "OTP Code Sent!",
        description: `Check your email (${otpEmail}) for your 6-digit verification code.`,
      });
    } catch (err: any) {
      toast({
        title: "OTP Failed",
        description: err.message || "Failed to send OTP code.",
        variant: "destructive",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) return;

    try {
      setIsLoading(true);
      const response = await authService.verifyOTP(otpEmail, otpCode);
      if (response && response.token && response.user) {
        auth.login(response.token, response.user);
        toast({
          title: "OTP Verified!",
          description: `Welcome back, ${response.user.name}!`,
        });
        if (response.user.isAdmin) {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      }
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err.message || "Invalid or expired OTP code.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight">
          ReadyForms
        </h1>
        <p className="text-sm text-muted-foreground">
          Enterprise Form Engine & Analytics Platform
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card border shadow-xl rounded-2xl p-6 sm:p-8">
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="password" className="text-xs sm:text-sm">Password Sign In</TabsTrigger>
              <TabsTrigger value="otp" className="text-xs sm:text-sm">Email OTP Login</TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="you@example.com" 
                            type="email" 
                            disabled={isLoading}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <Link
                            href="/auth/forgot-password"
                            className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <Input 
                            placeholder="••••••••" 
                            type="password" 
                            disabled={isLoading}
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md shadow-purple-500/20" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In with Password"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="otp">
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email Address</label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      disabled={otpSent || sendingOtp}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={sendingOtp || !otpEmail}
                      onClick={handleSendOtp}
                      className="shrink-0"
                    >
                      {sendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Get OTP"}
                    </Button>
                  </div>
                </div>

                {otpSent && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center justify-between">
                        <span>Enter 6-Digit OTP Code</span>
                        {devOtpHint && (
                          <span className="text-xs text-purple-600 font-mono">Dev Code: {devOtpHint}</span>
                        )}
                      </label>
                      <Input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        className="font-mono text-center tracking-widest text-lg"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                      />
                    </div>

                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading || otpCode.length < 6}>
                      {isLoading ? "Verifying..." : "Verify & Sign In"}
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/auth/register" className="font-semibold text-purple-600 dark:text-purple-400 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}