import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About ReadyForms | Easy form creation and management',
  description: 'Learn about ReadyForms - the simple and powerful platform for creating, managing, and analyzing forms and surveys.',
};

export default function AboutPage() {
  return (
    <div className="container max-w-5xl mx-auto py-10 px-4 md:py-16">
      <div className="space-y-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">About ReadyForms</h1>
          <p className="mt-4 text-xl text-muted-foreground">
            A modern platform designed to simplify form creation and data collection
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Our Story</h2>
          <p className="leading-7">
            ReadyForms was created to address the common challenges faced by organizations when collecting and managing data through forms. 
            We believe that creating and deploying forms should be simple, while providing powerful tools for analysis and integration.
          </p>
          <p className="leading-7">
            Founded in 2023, our team brings together expertise in web development, user experience, and data analysis
            to build a platform that serves the needs of businesses, educational institutions, and individuals alike.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Our Mission</h2>
          <p className="leading-7">
            Our mission is to empower users with intuitive tools that make form creation and data collection effortless.
            We're committed to developing features that help you gather insights, make decisions, and improve experiences.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">What Sets Us Apart</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">User-friendly Design</h3>
              <p className="text-muted-foreground">
                Our intuitive interface makes it easy to create forms without requiring technical expertise.
              </p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">Versatile Templates</h3>
              <p className="text-muted-foreground">
                Start with pre-built templates or create your own custom forms for any purpose.
              </p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground">
                Gain insights from responses with built-in analytics and visualization tools.
              </p>
            </div>
            <div className="border rounded-lg p-6">
              <h3 className="text-lg font-medium mb-2">Secure & Reliable</h3>
              <p className="text-muted-foreground">
                We prioritize data security and ensure your information is protected.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-semibold">Contact Us</h2>
          <p className="leading-7">
            Have questions or feedback? We'd love to hear from you. Reach out to our team at <a href="mailto:support@readyforms.example.com" className="text-primary hover:underline">support@readyforms.example.com</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
