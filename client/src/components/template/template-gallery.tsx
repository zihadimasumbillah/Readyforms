"use client";

import React from "react";
import { TemplateCard } from "@/components/template/template-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Template } from "@/types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

interface TemplateGalleryProps {
  templates: Template[];
  loading?: boolean;
  onTemplateClick?: (template: Template) => void;
  limit?: number;
  requireAuth?: boolean;
}

export function TemplateGallery({ 
  templates, 
  loading = false, 
  onTemplateClick,
  limit,
  requireAuth = false
}: TemplateGalleryProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  // Limit templates if specified
  const displayTemplates = limit ? templates.slice(0, limit) : templates;
  
  // Filter out test templates
  const filteredTemplates = displayTemplates.filter(template => {
    const title = template.title?.toLowerCase() || '';
    const desc = template.description?.toLowerCase() || '';
    return !(
      title.includes('test template') || 
      title.includes('updated template') || 
      desc.includes('created by api') || 
      desc.includes('admin-template-test')
    );
  });
  
  // Default template click handler
  const handleTemplateClick = (template: Template) => {
    if (onTemplateClick) {
      onTemplateClick(template);
    } else if (requireAuth && !isAuthenticated) {
      router.push(`/auth/login?redirect=/templates/${template.id}`);
    } else {
      router.push(`/templates/${template.id}`);
    }
  };

  // Create an array of placeholders for loading state
  const skeletons = Array(limit || 6).fill(0).map((_, i) => (
    <div key={`skeleton-${i}`} className="flex flex-col gap-2">
      <Skeleton className="h-[180px] w-full rounded-lg" />
      <Skeleton className="h-5 w-2/3 rounded" />
      <Skeleton className="h-4 w-full rounded" />
      <div className="flex justify-between mt-2">
        <Skeleton className="h-8 w-16 rounded" />
        <Skeleton className="h-8 w-16 rounded" />
      </div>
    </div>
  ));

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {skeletons}
      </div>
    );
  }

  if (!filteredTemplates || filteredTemplates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No templates found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredTemplates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onClick={() => handleTemplateClick(template)}
        />
      ))}
    </div>
  );
}