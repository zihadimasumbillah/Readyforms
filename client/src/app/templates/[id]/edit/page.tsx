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

export default function EditTemplatePage({ params }: { params: { id: string } }) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch template and topics in parallel
        const [templateData, topicsData] = await Promise.all([
          templateService.getTemplateById(params.id),
          topicService.getAllTopics(),
        ]);
        
        setTemplate(templateData);
        setTopics(topicsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load template data. Please try again.",
          variant: "destructive"
        });
        router.push('/dashboard/templates');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const handleUpdateTemplate = async (formData: any) => {
    try {
      if (!template) return;
      
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

      const result = await templateService.updateTemplate(template.id, formData, template.version);
      
      // Update the local template with the new version
      setTemplate({
        ...template,
        ...result,
      });
      
      toast({
        title: "Success",
        description: "Template updated successfully",
      });
      
      router.push(`/templates/${template.id}`);
    } catch (error) {
      console.error("Error updating template:", error);
      toast({
        title: "Error",
        description: "Failed to update template. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Ensure user is logged in and is the template owner
  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    
    if (template && template.userId !== user.id && !user.isAdmin) {
      toast({
        title: "Access denied",
        description: "You don't have permission to edit this template",
        variant: "destructive"
      });
      router.push('/dashboard/templates');
    }
  }, [user, template, router]);

  if (!user) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="container py-6">
        <div className="flex items-center mb-6">
          <Button variant="outline" size="icon" className="mr-4" asChild>
            <Link href={`/templates/${params.id}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {loading ? <Skeleton className="h-8 w-48" /> : `Edit Template: ${template?.title}`}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Template</CardTitle>
            <CardDescription>
              Modify your existing template
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : template ? (
              <TemplateForm 
                topics={topics}
                initialValues={template}
                onSubmit={handleUpdateTemplate}
                isEditMode={true}
              />
            ) : (
              <div className="text-center py-8">
                <p className="text-lg text-muted-foreground">Template not found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
