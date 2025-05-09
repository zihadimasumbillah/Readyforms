"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { templateService } from '@/lib/api/template-service';
import { topicService } from '@/lib/api/topic-service';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/components/ui/use-toast';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { TemplateForm } from '@/components/template/template-form';
import { Loader2 } from 'lucide-react';
import { Topic } from '@/types';

export default function CreateTemplatePage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        const topicsData = await topicService.getAllTopics();
        setTopics(topicsData);
      } catch (error) {
        console.error('Error fetching topics:', error);
        toast({
          title: 'Error',
          description: 'Failed to load topics. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTopics();
    } else {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleCreateTemplate = async (formData: any) => {
    try {
      setSaving(true);
      const template = await templateService.createTemplate(formData);
      toast({
        title: "Success",
        description: "Template created successfully."
      });
      router.push(`/templates/${template.id}`);
    } catch (error: any) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard/templates');
  };

  const handleLogout = () => {
    if (auth?.logout) {
      auth.logout();
      router.push('/auth/login');
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      user={{
        name: user.name || '',
        email: user.email || '',
        isAdmin: user.isAdmin || false
      }}
      onLogout={handleLogout}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Template</h1>
        <p className="text-muted-foreground">Design your form template</p>
      </div>
      
      <div className="space-y-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Loading topics...</p>
            </div>
          </div>
        ) : (
          <TemplateForm 
            topics={topics}
            handleSave={handleCreateTemplate}
            handleCancel={handleCancel}
            isSubmitting={saving}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
