"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { motion } from "framer-motion";
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
import { User, Mail, Lock, UserPlus, Github, Chrome } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQueryParams } from "@/hooks/use-query-params";
import { authService } from "@/lib/api/auth-service";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
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

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [githubModalOpen, setGithubModalOpen] = useState(false);

  const router = useRouter();
  const queryParams = useQueryParams();
  const redirect = queryParams.get("redirect") || "/dashboard";
  const auth = useAuth();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (formData: FormData) => {
    try {
      setIsLoading(true);
      
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (response && response.token && response.user) {
        toast({
          title: "Account Created!",
          description: `Welcome to ReadyForms, ${response.user.name}!`,
        });
        
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Please try again with different credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    try {
      setIsLoading(true);
      setGoogleModalOpen(false);
      setGithubModalOpen(false);
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
            <UserPlus className="h-7 w-7" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Create Account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Join ReadyForms for enterprise forms & analytics
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
              Or register with details
            </span>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                        <Input 
                          placeholder="Jane Doe" 
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
                    <FormLabel className="text-xs font-medium text-slate-700 dark:text-slate-300">Password</FormLabel>
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
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-xl shadow-lg shadow-indigo-500/20 transition-all mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Register New Account"}
              </Button>
            </form>
          </Form>

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-indigo-600 hover:text-indigo-500 underline underline-offset-4">
              Sign in to Account
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
