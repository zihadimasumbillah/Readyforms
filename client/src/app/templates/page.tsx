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

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await templateService.getAllTemplates();
        
        // Make sure data exists and is an array before filtering
        if (data && Array.isArray(data)) {
          // Filter out test templates
          const filteredTemplates = data.filter(template => {
            // Add null checks before accessing properties
            const title = template?.title?.toLowerCase() || '';
            const desc = template?.description?.toLowerCase() || '';
            
            return !(
              title.includes('test template') || 
              title.includes('updated template') || 
              desc.includes('created by api') || 
              desc.includes('admin-template-test')
            );
          });
          setTemplates(filteredTemplates);
        } else {
          // If data is not as expected, set empty array
          console.warn('Templates data is not an array:', data);
          setTemplates([]);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        toast({
          title: 'Error fetching templates',
          description: 'Failed to load templates. Please try again later.',
          variant: 'destructive'
        });
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchTopics = async () => {
      try {
        const data = await topicService.getAllTopics();
        if (data && Array.isArray(data)) {
          setTopics(data);
        } else {
          setTopics([]);
        }
      } catch (error) {
        console.error('Error fetching topics:', error);
        setTopics([]);
      }
    };

    fetchTemplates();
    fetchTopics();
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
  );
}
