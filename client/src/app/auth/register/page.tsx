"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import Link from "next/link";

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
import { User, Mail, Lock, ShieldCheck, Sparkles, UserPlus } from "lucide-react";

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

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
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
        auth.login(response.token, response.user);
        
        toast({
          title: "Account Created!",
          description: `Welcome to ReadyForms, ${response.user.name}!`,
        });
        
        router.push("/dashboard");
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

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
      
      {/* Ambient Neon Background Blur */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-slate-900 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10 mb-1">
            <UserPlus className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
            Create Account
          </h1>
          <p className="text-sm text-slate-400">
            Join ReadyForms for enterprise forms & analytics
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-8 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-slate-300">Full Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                        <Input 
                          placeholder="Jane Doe" 
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
                    <FormLabel className="text-xs font-medium text-slate-300">Password</FormLabel>
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
                className="w-full bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold py-5 rounded-xl shadow-lg shadow-cyan-500/20 transition-all mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Register New Account"}
              </Button>
            </form>
          </Form>

          <div className="text-center text-xs text-slate-400 pt-2">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-cyan-400 hover:text-cyan-300 underline underline-offset-4">
              Sign in to Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}