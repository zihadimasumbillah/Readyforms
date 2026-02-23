import React from 'react';
import { Metadata } from 'next';
import { Sparkles, Users, Shield, Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About ReadyForms | AI-Powered Form Builder',
  description: 'Learn about ReadyForms - the AI-powered platform for creating, managing, and analyzing forms and surveys.',
};

export default function AboutPage() {
  return (
    <div className="container max-w-5xl mx-auto py-10 px-4 md:py-16">
      <div className="space-y-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">About ReadyForms</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            The AI-powered platform that transforms how you create and manage forms
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Our Story</h2>
          <p className="leading-7">
            ReadyForms was born from a simple idea: form creation should take seconds, not hours. By combining the power of AI with an intuitive form builder, we've created a platform that lets anyone create professional forms by simply describing what they need.
          </p>
          <p className="leading-7">
            Our team brings together expertise in AI, web development, and user experience to build a platform that serves businesses, educational institutions, and individuals who need to collect data efficiently.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Our Mission</h2>
          <p className="leading-7">
            We're on a mission to make form creation effortless through AI. Whether you're conducting surveys, gathering feedback, or running quizzes, ReadyForms gives you the tools to go from idea to published form in seconds.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">What Sets Us Apart</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6">
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">AI-First Design</h3>
              <p className="text-muted-foreground">
                Describe your form in plain English and our AI generates a complete, professional form with the right field types instantly.
              </p>
            </div>
            <div className="border rounded-lg p-6">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center mb-3">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Instant Sharing</h3>
              <p className="text-muted-foreground">
                Every form gets a unique shareable link. Send it to respondents or embed it anywhere with one click.
              </p>
            </div>
            <div className="border rounded-lg p-6">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-3">
                <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Built for Teams</h3>
              <p className="text-muted-foreground">
                Collaborate on forms, track responses in real-time, and manage everything from a centralized dashboard.
              </p>
            </div>
            <div className="border rounded-lg p-6">
              <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center mb-3">
                <Shield className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-lg font-medium mb-2">Secure & Reliable</h3>
              <p className="text-muted-foreground">
                Enterprise-grade security with encrypted data storage. Your form data is protected and always available.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
