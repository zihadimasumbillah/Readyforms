"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TemplateForm } from "@/components/template/template-form";
import { Navbar } from "@/components/navbar";
import templateService from "@/lib/api/template-service";
import { topicService } from "@/lib/api/topic-service";
import { Topic, Template } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

// Mark this page as dynamic to prevent static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function EditTemplatePage({ params }: { params: { id: string } }) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch the template by ID
        const templateData = await templateService.getById(params.id);
        setTemplate(templateData);
        
        // Fetch available topics for the dropdown
        const topicsData = await topicService.getAllTopics();
        setTopics(topicsData);
        
        // If user is not the owner or admin, redirect to view page
        if (user && templateData && templateData.userId !== user.id && !user.isAdmin) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to edit this template.",
            variant: "destructive"
          });
          router.push(`/templates/${params.id}`);
        }
      } catch (error) {
        console.error("Error fetching template data:", error);
        toast({
          title: "Error",
          description: "Failed to load template. Please try again.",
          variant: "destructive"
        });
        router.push("/templates");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [params.id, router, user]);
  
  const handleSubmit = async (formData: any) => {
    try {
      // Make sure we have template and version for optimistic locking
      if (!template || template.version === undefined) {
        toast({
          title: "Error",
          description: "Template information is missing. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Add the version to the form data for optimistic locking
      const dataWithVersion = {
        ...formData,
        version: template.version
      };
      
      await templateService.updateTemplate(params.id, dataWithVersion);
      toast({
        title: "Success",
        description: "Template updated successfully."
      });
      router.push(`/templates/${params.id}`);
    } catch (error: any) {
      console.error("Error updating template:", error);
      
      // Handle optimistic locking error specifically
      if (error.response?.status === 409) {
        toast({
          title: "Update Conflict",
          description: "This template has been modified by someone else. Please refresh and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update template. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="mb-4">Please log in to edit templates.</p>
          <Button onClick={() => router.push('/auth/login')}>Log In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <Navbar />
      <div className="container py-6 max-w-5xl">
        <div className="mb-6">
          <Link 
            href={`/templates/${params.id}`} 
            className="flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Template
          </Link>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Template</CardTitle>
            <CardDescription>
              Update your form template below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
            ) : (
              template && (
                <TemplateForm
                  initialData={template}
                  topics={topics}
                  onSubmit={handleSubmit}
                  submitButtonLabel="Update Template"
                />
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
