"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookTemplate, Sparkles, CheckCircle, BarChart, Zap } from 'lucide-react';
import { DashboardPreview } from '@/components/home/dashboard-preview';

export default function HomePage() {
  const router = useRouter();
  const auth = useAuth();
  
  useEffect(() => {
    if (auth?.isAuthenticated) {
      router.push('/dashboard');
    }
  }, [auth?.isAuthenticated, router]);
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between space-x-4 sm:space-x-0">
          <div className="flex items-center gap-2">
            <BookTemplate className="h-6 w-6" />
            <span className="text-xl font-bold">ReadyForms</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </Link>
            <Link href="#benefits" className="text-muted-foreground hover:text-foreground transition-colors">
              Benefits
            </Link>
            <Link href="#preview" className="text-muted-foreground hover:text-foreground transition-colors">
              Preview
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/auth/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted/30 border-y">
        <div className="container grid gap-8 md:grid-cols-2 md:gap-12">
          <div className="space-y-4 flex flex-col justify-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Create Forms and Surveys with Ease</h1>
            <p className="max-w-[600px] text-muted-foreground md:text-xl">
              Build interactive forms, quizzes, and surveys in minutes. Collect responses, analyze results, and make data-driven decisions.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-4">
              <Link href="/auth/register">
                <Button size="lg" className="gap-1">
                  <Sparkles className="h-4 w-4" />
                  Get started
                </Button>
              </Link>
              <Link href="#preview">
                <Button size="lg" variant="outline">
                  See it in action
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-sm">
              <div className="absolute -top-6 -left-6 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-6 -right-6 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />
              <div className="relative border rounded-lg shadow-lg bg-background">
                <img 
                  src="/dashboard-preview.png" 
                  alt="ReadyForms Dashboard" 
                  className="rounded-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://placehold.co/600x400?text=ReadyForms+Dashboard";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features */}
      <section id="features" className="w-full py-12 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-[600px] text-center mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl">Everything you need to create forms</h2>
            <p className="mt-2 text-muted-foreground">
              Our intuitive platform provides all the tools you need to build and manage forms and surveys.
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Easy Form Building</h3>
              <p className="text-muted-foreground">
                Create custom forms with our intuitive drag-and-drop builder. No coding skills required.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <BarChart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-muted-foreground">
                View response data in real time with beautiful charts and graphs. Export data for deeper analysis.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Deployment</h3>
              <p className="text-muted-foreground">
                Share your forms instantly with a unique link. Embed them on your website or send via email.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Preview */}
      <section id="preview" className="w-full py-12 md:py-24 bg-muted/30 border-y">
        <div className="container">
          <div className="mx-auto max-w-[600px] text-center mb-12">
            <h2 className="text-2xl font-bold sm:text-3xl">See it in action</h2>
            <p className="mt-2 text-muted-foreground">
              Preview our intuitive dashboard and form builder
            </p>
          </div>
          <div className="border rounded-lg shadow-lg overflow-hidden bg-background">
            <DashboardPreview />
          </div>
          <div className="mt-8 text-center">
            <Link href="/auth/register">
              <Button size="lg" className="gap-1">
                <Sparkles className="h-4 w-4" />
                Start building forms
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="w-full py-6 border-t">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
          <div className="flex items-center gap-2">
            <BookTemplate className="h-5 w-5" />
            <span className="text-lg font-semibold">ReadyForms</span>
          </div>
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} ReadyForms. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}