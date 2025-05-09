"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { templateService } from '@/lib/api/template-service';
import { topicService } from '@/lib/api/topic-service';
import { tagService } from '@/lib/api/tag-service';
import { Template, Topic } from '@/types';
import { DashboardPreview } from '@/components/home/dashboard-preview';
import { TemplateGallery } from '@/components/template/template-gallery';
import { ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const [recentTemplates, setRecentTemplates] = useState<Template[]>([]);
  const [popularTemplates, setPopularTemplates] = useState<Template[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [recentData, popularData, topicsData] = await Promise.all([
          templateService.getAllTemplates(1, 6),
          templateService.getAllTemplates(1, 5),
          topicService.getAllTopics()
        ]);
        
        setRecentTemplates(recentData);
        setPopularTemplates(popularData);
        setTopics(topicsData);
      } catch (error) {
        console.error('Error fetching homepage data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero section */}
      <section className="bg-gradient-to-b from-background to-muted/50 py-20 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                Create forms and surveys in minutes, not hours
              </h1>
              <p className="mt-6 text-xl text-muted-foreground">
                ReadyForms makes it easy to create, share, and analyze forms for any purpose
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/templates/create">
                    Create Your Form
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/templates">
                    Browse Templates
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <DashboardPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Recent templates section */}
      <section className="py-16 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Recent Templates</h2>
            <Button variant="ghost" asChild>
              <Link href="/templates" className="flex items-center">
                View all <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="p-6 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="p-6 border-t">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <TemplateGallery templates={recentTemplates} topics={topics} />
          )}
        </div>
      </section>

      {/* Popular templates section */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Popular Templates</h2>
            <Button variant="ghost" asChild>
              <Link href="/templates?sort=popular" className="flex items-center">
                View all <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="rounded-lg border bg-card text-card-foreground shadow-sm">
                  <div className="p-6 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                  <div className="p-6 border-t">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-8 w-16" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <TemplateGallery templates={popularTemplates} topics={topics} />
          )}
        </div>
      </section>
    </div>
  );
}