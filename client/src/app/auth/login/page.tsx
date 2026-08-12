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
import { signIn } from "next-auth/react";
import { Mail, Lock, ShieldCheck, Github, Chrome } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryParams } from "@/hooks/use-query-params";
import { authService } from "@/lib/api/auth-service";

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

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);

  const router = useRouter();
  const queryParams = useQueryParams();
  const redirect = queryParams.get("redirect") || "/dashboard";
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
        description: `Welcome back!`,
      });

      router.push(redirect);
      router.refresh();
    } catch (error: any) {
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
      if (response && response.token) {
        toast({
          title: "OTP Verified!",
          description: `Welcome back!`,
        });
        router.push(redirect);
        router.refresh();
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

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    try {
      setIsLoading(true);
      await signIn(provider, { callbackUrl: redirect });
    } catch (err: any) {
      toast({
        title: "Authentication Failed",
        description: err.message || "OAuth authentication failed",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6"
      >
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 mb-1"
          >
            <ShieldCheck className="h-7 w-7" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            ReadyForms
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign in to your account to continue
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn("google")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-5 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all rounded-xl shadow-sm text-xs font-medium"
            >
              <Chrome className="h-4 w-4" />
              <span>Google</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => handleOAuthSignIn("github")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-5 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-all rounded-xl shadow-sm text-xs font-medium"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
            </Button>
          </div>

          <div className="relative flex items-center justify-center text-xs uppercase">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800" />
            </div>
            <span className="relative bg-white dark:bg-slate-900 px-3 text-slate-400 dark:text-slate-500 font-medium text-[11px]">
              Or continue with email
            </span>
          </div>

          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 mb-6">
              <TabsTrigger value="password" className="text-xs font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg transition-all">
                Password
              </TabsTrigger>
              <TabsTrigger value="otp" className="text-xs font-semibold data-[state=active]:bg-indigo-600 data-[state=active]:text-white rounded-lg transition-all">
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
                        <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                            <Input 
                              placeholder="you@domain.com" 
                              type="email" 
                              disabled={isLoading}
                              className="pl-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 rounded-xl"
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
                          <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">Password</FormLabel>
                          <Link
                            href="/auth/forgot-password"
                            className="text-xs text-indigo-600 hover:text-indigo-500 transition-colors"
                          >
                            Forgot?
                          </Link>
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                            <Input 
                              placeholder="••••••••" 
                              type="password" 
                              disabled={isLoading}
                              className="pl-10 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-indigo-500/20 text-slate-900 dark:text-slate-100 rounded-xl"
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
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all"
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
                  <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="you@domain.com"
                      value={otpEmail}
                      onChange={(e) => setOtpEmail(e.target.value)}
                      disabled={otpSent || sendingOtp}
                      className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={sendingOtp || !otpEmail}
                      onClick={handleSendOtp}
                      className="shrink-0 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-indigo-600 dark:text-indigo-400 rounded-xl"
                    >
                      {sendingOtp ? "Sending..." : otpSent ? "Resend" : "Send"}
                    </Button>
                  </div>
                </div>

                {otpSent && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-700 dark:text-slate-300">Enter 6-Digit Code</span>
                        {devOtpHint && (
                          <span className="text-indigo-600 font-mono text-[11px]">Dev Code: {devOtpHint}</span>
                        )}
                      </div>
                      <Input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        className="font-mono text-center tracking-widest text-lg bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-xl shadow-lg shadow-indigo-500/20"
                      disabled={isLoading || otpCode.length < 6}
                    >
                      {isLoading ? "Verifying..." : "Verify & Sign In"}
                    </Button>
                  </div>
                )}
              </form>
            </TabsContent>
          </Tabs>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{" "}
            <Link href="/auth/register" className="font-semibold text-indigo-600 hover:text-indigo-500 underline underline-offset-4">
              Create an Account
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
