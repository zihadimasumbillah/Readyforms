"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Template } from "@/types";
import { templateService } from "@/lib/api/template-service";

export function FeaturedTemplatesSection() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedTemplates = async () => {
      try {
        setLoading(true);
        const featuredTemplates = await templateService.getFeaturedTemplates(6);
        setTemplates(featuredTemplates);
      } catch (err) {
        console.error("Error fetching featured templates:", err);
        setError("Failed to load templates");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedTemplates();
  }, []);

  return (
    <section className="py-20 bg-muted">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold">Featured Templates</h2>
          <Button asChild variant="outline">
            <Link href="/templates">View all templates</Link>
          </Button>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-6 bg-muted-foreground/20 rounded mb-2"></div>
                  <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
                    <div className="h-8 bg-muted-foreground/20 rounded w-16"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="bg-background rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold mb-2">Unable to load templates</h3>
            <p className="text-muted-foreground mb-6">
              {error}. Please try again later.
            </p>
            <Button asChild>
              <Link href="/templates">Browse Templates</Link>
            </Button>
          </div>
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg line-clamp-2">{template.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {template.description || "No description available"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      {template.topic?.name || "General"}
                    </div>
                    <Button asChild size="sm">
                      <Link href={`/templates/${template.id}`}>View</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-background rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-6">
              Check back soon for featured templates, or create your own!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/templates/create">Create a Template</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/templates">Browse All Templates</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedTemplatesSection;
