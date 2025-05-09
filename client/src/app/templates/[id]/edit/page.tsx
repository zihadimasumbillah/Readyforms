"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { templateService } from '@/lib/api/template-service';
import { topicService } from '@/lib/api/topic-service';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/components/ui/use-toast';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { TemplateForm } from '@/components/template/template-form';
import LoadingState from '@/components/loadings/loading-state';

interface EditTemplatePageProps {
  params: {
    id: string;
  };
}

export default function EditTemplatePage({ params }: EditTemplatePageProps) {
  const [template, setTemplate] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [version, setVersion] = useState<number | null>(null);
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const templateData = await templateService.getById(params.id);
        setTemplate(templateData);
        setVersion(templateData.version);

        const topicsData = await topicService.getAllTopics();
        setTopics(topicsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load template data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      router.push('/auth/login');
    }
  }, [params.id, user, router]);

  const handleSave = async (data: any) => {
    if (!version) {
      toast({
        title: 'Error',
        description: 'Could not determine template version. Please reload the page.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setSaving(true);
      
      // Include version in the data for optimistic locking
      const dataWithVersion = {
        ...data,
        version: version
      };
      
      await templateService.updateTemplate(params.id, dataWithVersion, version);
      toast({
        title: "Success",
        description: "Template updated successfully."
      });
      
      router.push(`/templates/${params.id}`);
    } catch (error: any) {
      console.error('Error updating template:', error);
      
      // Special handling for version conflicts
      if (error?.message?.includes('Version conflict')) {
        toast({
          title: "Update conflict",
          description: "This template was modified by someone else. Please refresh and try again.",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to update template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/templates/${params.id}`);
  };

  const handleLogout = () => {
    if (auth?.logout) {
      auth.logout();
      router.push('/auth/login');
    }
  };

  if (!user) {
    return <LoadingState message="Please wait..." />;
  }

  return (
    <DashboardLayout
      user={{
        name: user.name || '',
        email: user.email || '',
        isAdmin: user.isAdmin || false,
      }}
      onLogout={handleLogout}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Template</h1>
        <p className="text-muted-foreground">Update your form template</p>
      </div>

      {loading ? (
        <LoadingState message="Loading template data..." />
      ) : (
        <TemplateForm
          topics={topics}
          initialData={template}
          handleSave={handleSave}
          handleCancel={handleCancel}
          isSubmitting={saving}
        />
      )}
    </DashboardLayout>
  );
}
