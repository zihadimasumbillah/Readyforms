"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { motion } from "framer-motion";
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
import { signIn, getSession } from "next-auth/react";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import { useQueryParams } from "@/hooks/use-query-params";
import { authService, initializeAuthClient } from "@/lib/api/auth-service";

const ROUTES = {
  DASHBOARD: "/dashboard",
  ADMIN: "/admin",
  FORGOT_PASSWORD: "/auth/forgot-password",
  REGISTER: "/auth/register",
} as const;

const ALLOWED_REDIRECT_PREFIXES = ["/dashboard", "/admin", "/templates", "/auth/login"];

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

function validateRedirect(input: string | null): string {
  const DEFAULT_REDIRECT = ROUTES.DASHBOARD;
  if (!input) return DEFAULT_REDIRECT;
  const trimmed = input.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.includes("\0")) {
    return DEFAULT_REDIRECT;
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return DEFAULT_REDIRECT;
  }
  const isAllowed = ALLOWED_REDIRECT_PREFIXES.some(
    (prefix) => trimmed === prefix || trimmed.startsWith(`${prefix}/`)
  );
  return isAllowed ? trimmed : DEFAULT_REDIRECT;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const router = useRouter();
  const queryParams = useQueryParams();
  const redirect = validateRedirect(queryParams.get("redirect"));

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
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Authentication Failed",
          description: "Invalid email or password",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Sign in successful",
        description: "Welcome back!",
      });

      try {
        const session = await getSession();
        const isAdmin = session?.user?.isAdmin;
        const backendToken = session?.user?.backendToken;
        if (backendToken && typeof window !== "undefined") {
          localStorage.setItem("auth_token", backendToken);
          initializeAuthClient(() => backendToken);
        }
        const targetPath = isAdmin
          ? ROUTES.ADMIN
          : redirect === ROUTES.DASHBOARD
          ? ROUTES.DASHBOARD
          : redirect;
        router.push(targetPath);
        router.refresh();
      } catch {
        router.push(redirect);
        router.refresh();
      }
    } catch {
      toast({
        title: "Authentication Failed",
        description: "An unexpected error occurred during sign in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const emailValidation = z.string().email().safeParse(otpEmail);
    if (!emailValidation.success) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address to receive your verification code.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSendingOtp(true);
      await authService.sendOTP(otpEmail, "login");
      setOtpSent(true);
      toast({
        title: "OTP Sent!",
        description: `Check your email (${escapeHtml(otpEmail)}) for your 6-digit verification code.`,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to send verification code.";
      toast({
        title: "OTP Generation Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) return;

    try {
      setIsLoading(true);
      const response = await authService.verifyOTP(otpEmail, otpCode);
      if (response && response.token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("auth_token", response.token);
          initializeAuthClient(() => response.token);
        }
        toast({
          title: "OTP Verified!",
          description: "Welcome back!",
        });
        router.push(redirect);
        router.refresh();
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Invalid or expired verification code.";
      toast({
        title: "Verification Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google") => {
    try {
      setIsLoading(true);
      await signIn(provider, { callbackUrl: redirect });
    } catch {
      toast({
        title: "Authentication Failed",
        description: "OAuth authentication failed. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md space-y-6 relative z-10"
      >
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-black text-white dark:bg-white dark:text-black shadow-md mb-1"
          >
            <ShieldCheck className="h-7 w-7" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight text-black dark:text-white">
            ReadyForms
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Sign in to your account to continue
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn("google")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-5 bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 transition-all rounded-xl shadow-sm text-sm font-semibold"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </Button>
          </div>

          <div className="relative flex items-center justify-center text-xs uppercase">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
            </div>
            <span className="relative bg-white dark:bg-neutral-950 px-3 text-neutral-400 dark:text-neutral-500 font-medium text-[11px]">
              Or continue with email
            </span>
          </div>

          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl border border-neutral-200 dark:border-neutral-800 mb-6">
              <TabsTrigger value="password" className="text-xs font-semibold data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black rounded-lg transition-all">
                Password
              </TabsTrigger>
              <TabsTrigger value="otp" className="text-xs font-semibold data-[state=active]:bg-black data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-black rounded-lg transition-all">
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
                        <FormLabel className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                            <Input 
                              placeholder="you@domain.com" 
                              type="email" 
                              disabled={isLoading}
                              className="pl-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white text-neutral-900 dark:text-neutral-100 rounded-xl"
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
                          <FormLabel className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Password</FormLabel>
                          <Link
                            href={ROUTES.FORGOT_PASSWORD}
                            className="text-xs text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors underline"
                          >
                            Forgot?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                            <Input 
                              placeholder="••••••••" 
                              type="password" 
                              disabled={isLoading}
                              className="pl-10 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 focus:border-black dark:focus:border-white text-neutral-900 dark:text-neutral-100 rounded-xl"
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
                    className="w-full bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-bold py-5 rounded-xl transition-all shadow-md"
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
                  <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Email Address</label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="you@domain.com"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      disabled={otpSent || sendingOtp}
                      className="bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-xl"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={sendingOtp || !otpEmail}
                      onClick={handleSendOtp}
                      className="shrink-0 bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-xl"
                    >
                      {sendingOtp ? "Sending..." : otpSent ? "Resend" : "Send"}
                    </Button>
                  </div>
                </div>

                {otpSent && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-neutral-700 dark:text-neutral-300">Enter 6-Digit Code</span>
                      </div>
                      <Input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        className="font-mono text-center tracking-widest text-lg bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 rounded-xl"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-bold py-5 rounded-xl"
                      disabled={isLoading || otpCode.length < 6}
                    >
                      {isLoading ? "Verifying..." : "Verify & Sign In"}
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center text-xs text-neutral-500 dark:text-neutral-400">
            Don't have an account?{" "}
            <Link href={ROUTES.REGISTER} className="font-semibold text-black dark:text-white hover:underline underline-offset-4">
              Create an Account
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
