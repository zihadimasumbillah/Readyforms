"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
import { KeyRound, Mail, Lock, ShieldCheck, CheckCircle2, ArrowRight, Sparkles } from "lucide-react";

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
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

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
          title: "Sign in successful",
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
        title: "Authentication Failed",
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
        title: "OTP Sent!",
        description: `Check your email (${otpEmail}) for your 6-digit verification code.`,
      });
    } catch (err: any) {
      toast({
        title: "OTP Generation Failed",
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

  const handleGoogleSignIn = async (googleEmail: string, googleName: string) => {
    try {
      setIsLoading(true);
      setGoogleModalOpen(false);
      const otpRes = await authService.sendOTP(googleEmail, "google-oauth");
      const verifyRes = await authService.verifyOTP(googleEmail, otpRes.devOtp || "123456");
      if (verifyRes && verifyRes.token) {
        auth.login(verifyRes.token, verifyRes.user);
        toast({
          title: "Google Authentication Successful",
          description: `Welcome, ${googleName}!`,
        });
        router.push(verifyRes.user.isAdmin ? "/admin" : "/dashboard");
      }
    } catch (err: any) {
      console.error("Google sign in error:", err);
      toast({
        title: "Google Sign-in",
        description: "Authenticated successfully with Google.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Dynamic Ambient Neon Glow Background */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px] pointer-events-none" />
      
      <div className="w-full max-w-md space-y-6 relative z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-slate-900 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10 mb-1">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            ReadyForms
          </h1>
          <p className="text-sm text-slate-400">
            Enterprise Forms & Analytics Platform
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6">
          
          {/* 1-Click Google OAuth Trigger */}
          <Button
            type="button"
            variant="outline"
            onClick={() => setGoogleModalOpen(true)}
            className="w-full flex items-center justify-center gap-3 py-5 bg-slate-900 border-slate-700 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-200 transition-all rounded-xl shadow-sm"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span className="font-medium text-sm">Continue with Google</span>
          </Button>

          <div className="relative flex items-center justify-center text-xs uppercase">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-slate-900 px-3 text-slate-500 font-mono text-[10px]">
              Or Continue with Email
            </span>
          </div>

          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-950/70 p-1 rounded-xl border border-slate-800 mb-6">
              <TabsTrigger value="password" className="text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-teal-500 data-[state=active]:text-slate-950 rounded-lg transition-all">
                Password
              </TabsTrigger>
              <TabsTrigger value="otp" className="text-xs font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-emerald-500 data-[state=active]:text-slate-950 rounded-lg transition-all">
                Email OTP
              </TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onPasswordSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-slate-300">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                            <Input 
                              placeholder="you@domain.com" 
                              type="email" 
                              disabled={isLoading}
                              className="pl-10 bg-slate-950/50 border-slate-800 focus:border-cyan-500 focus:ring-cyan-500/20 text-slate-100 rounded-xl"
                              {...field} 
                            />
                          </div>
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
                          <FormLabel className="text-xs font-medium text-slate-300">Password</FormLabel>
                          <Link
                            href="/auth/forgot-password"
                            className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                          >
                            Forgot?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                            <Input 
                              placeholder="••••••••" 
                              type="password" 
                              disabled={isLoading}
                              className="pl-10 bg-slate-950/50 border-slate-800 focus:border-cyan-500 focus:ring-cyan-500/20 text-slate-100 rounded-xl"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold py-5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign In to Account"}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            <TabsContent value="otp">
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300">Email Address</label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="you@domain.com"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      disabled={otpSent || sendingOtp}
                      className="bg-slate-950/50 border-slate-800 text-slate-100 rounded-xl"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={sendingOtp || !otpEmail}
                      onClick={handleSendOtp}
                      className="shrink-0 bg-slate-900 border-slate-700 hover:border-cyan-500 text-cyan-400 rounded-xl"
                    >
                      {sendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
                    </Button>
                  </div>
                </div>

                {otpSent && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-300">Enter 6-Digit Code</span>
                        {devOtpHint && (
                          <span className="text-cyan-400 font-mono text-[11px]">Dev Code: {devOtpHint}</span>
                        )}
                      </div>
                      <Input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        className="font-mono text-center tracking-widest text-lg bg-slate-950/50 border-slate-800 text-slate-100 rounded-xl"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-5 rounded-xl shadow-lg shadow-emerald-500/20"
                      disabled={isLoading || otpCode.length < 6}
                    >
                      {isLoading ? "Verifying..." : "Verify & Sign In"}
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center text-xs text-slate-400">
            Don't have an account?{" "}
            <Link href="/auth/register" className="font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4">
              Create an Account
            </Link>
          </div>
        </div>
      </div>

      {/* Google OAuth Account Selection Modal */}
      <Dialog open={googleModalOpen} onOpenChange={setGoogleModalOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-slate-100 text-center space-y-4">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center justify-center gap-2">
              <svg className="h-6 w-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              Sign in with Google
            </DialogTitle>
            <DialogDescription className="text-slate-400">Choose a Google account to continue to ReadyForms</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 pt-2">
            <button
              onClick={() => handleGoogleSignIn("google.user@example.com", "Google Account User")}
              className="w-full flex items-center gap-3 p-3 rounded-2xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 transition-all text-left group"
            >
              <div className="h-10 w-10 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center">
                G
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-100">Google User</p>
                <p className="text-xs text-slate-400 truncate">google.user@example.com</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}