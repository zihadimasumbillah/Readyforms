"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TemplateForm } from "@/components/template/template-form";
import { Navbar } from "@/components/navbar";
import templateService from "@/lib/api/template-service";
import { Topic } from "@/types";
import { topicService } from "@/lib/api/topic-service";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useMounted } from "@/hooks/use-mounted";

// Mark this page as dynamic to prevent static generation
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function CreateTemplatePage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();
  const isMounted = useMounted();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const topicsData = await topicService.getAllTopics();
        setTopics(topicsData);
      } catch (error) {
        console.error("Error fetching topics:", error);
        toast({
          title: "Error",
          description: "Failed to load topics. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (isMounted) {
      fetchTopics();
    }
  }, [isMounted]);

  const handleCreateTemplate = async (formData: any) => {
    try {
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to create a template",
          variant: "destructive"
        });
        router.push('/auth/login');
        return;
      }
      
      // Check if at least one field is enabled
      const hasEnabledField = Object.keys(formData).some(key => 
        key.endsWith('State') && formData[key] === true
      );
      
      if (!hasEnabledField) {
        toast({
          title: "Validation Error",
          description: "Please add at least one question to your template",
          variant: "destructive"
        });
        return;
      }

      const result = await templateService.createTemplate(formData);
      
      toast({
        title: "Success",
        description: "Template created successfully",
      });
      
      router.push(`/templates/${result.id}`);
    } catch (error) {
      console.error("Error creating template:", error);
      toast({
        title: "Error",
        description: "Failed to create template. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Only redirect once the component is mounted in the browser
  useEffect(() => {
    if (isMounted && !user) {
      router.push('/auth/login');
    }
  }, [isMounted, user, router]);

  // If not mounted yet, render a loading state instead of null
  if (!isMounted) {
    return (
      <>
        <Navbar />
        <main className="container py-6">
          <div className="flex items-center justify-center h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
      </>
    );
  }

  // If mounted but no user, show nothing (redirection will happen via useEffect)
  if (!user) {
    return (
      <>
        <Navbar />
        <main className="container py-6">
          <div className="flex flex-col items-center justify-center h-[60vh]">
            <p className="text-center mb-4">Authentication required. Redirecting to login page...</p>
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container py-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="icon" className="mr-4" asChild>
            <Link href="/dashboard/templates">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Create Template</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Template</CardTitle>
            <CardDescription>
              Create a new form template with custom questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <TemplateForm 
                topics={topics}
                onSubmit={handleCreateTemplate}
                isEditMode={false}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
