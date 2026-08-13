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
import { User, Mail, Lock, UserPlus, Chrome } from "lucide-react";
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

  const handleOAuthSignIn = async (provider: "google") => {
    try {
      setIsLoading(true);
      setGoogleModalOpen(false);
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
    <div className="relative min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
      {/* Background Subtle Mesh Grid */}
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
            <UserPlus className="h-7 w-7" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight text-black dark:text-white">
            Create Account
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Join ReadyForms for enterprise forms & analytics
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 shadow-2xl rounded-2xl p-6 sm:p-8 space-y-5"
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 h-4 w-4 text-neutral-400" />
                        <Input 
                          placeholder="Jane Doe" 
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
                    <FormLabel className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Password</FormLabel>
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
                className="w-full bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-bold py-5 rounded-xl shadow-md transition-all mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Register New Account"}
              </Button>
            </form>
          </Form>

          <div className="relative flex items-center justify-center text-xs uppercase pt-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
            </div>
            <span className="relative bg-white dark:bg-neutral-950 px-3 text-neutral-400 dark:text-neutral-500 font-medium text-[11px]">
              Or continue with
            </span>
          </div>

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

          <div className="text-center text-xs text-neutral-500 dark:text-neutral-400 pt-2">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-black dark:text-white hover:underline underline-offset-4">
              Sign in to Account
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
