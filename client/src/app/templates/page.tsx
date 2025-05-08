"use client";

import React, { useEffect, useState } from 'react';
import { TemplateGallery } from '@/components/template/template-gallery';
import { Template } from '@/types';
import { templateService } from '@/lib/api/template-service';
import { topicService } from '@/lib/api/topic-service';
import { Topic } from '@/types';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/components/ui/use-toast';
import { Navbar } from '@/components/navbar';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth() || {};

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        const topicsData = await topicService.getAllTopics();

        // Extra debug logging
        console.log("Topics data type:", typeof topicsData);
        console.log("Topics is array:", Array.isArray(topicsData));

        // Ensure topicsData is an array
        const topicsArray = Array.isArray(topicsData) ? topicsData : [];
        setTopics(topicsArray);

        const templatesData = await templateService.getAllTemplates();

        // Extra debug logging
        console.log("Templates data type:", typeof templatesData);
        console.log("Templates is array:", Array.isArray(templatesData));

        // Ensure templatesData is an array
        const templatesArray = Array.isArray(templatesData) ? templatesData : [];
        setTemplates(templatesArray);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load templates. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleCreateTemplate = () => {
    if (user) {
      router.push('/templates/create');
    } else {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to create a template',
        variant: 'default'
      });
      router.push('/auth/login?redirect=/templates/create');
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Form Templates</h1>
            <p className="text-muted-foreground mt-1">
              Browse ready-made templates or create your own
            </p>
          </div>
          <Button onClick={handleCreateTemplate}>
            Create Template
          </Button>
        </div>

        <TemplateGallery 
          templates={templates} 
          topics={topics}
          loading={loading}
        />
      </div>
    </>
  );
}
