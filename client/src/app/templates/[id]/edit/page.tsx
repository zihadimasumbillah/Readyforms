"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { templateService, TemplateUpdateData } from '@/lib/api/template-service';
import { topicService } from '@/lib/api/topic-service';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Loader } from 'lucide-react';
import { Template } from '@/types';


interface TemplateFormData {
  title: string;
  description: string;
  isPublic: boolean;
  topicId: string;
  tags: string[];
  isQuiz?: boolean;
  showScoreImmediately?: boolean;
  scoringCriteria?: string;
  questionOrder?: string;
  [key: string]: any; 
}

export default function EditTemplatePage() {
  const params = useParams();
  const id = params ? params.id as string : '';
  
  const router = useRouter();
  const { user } = useAuth() || {};
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [version, setVersion] = useState<number>(0);
  const [formData, setFormData] = useState<TemplateFormData>({
    title: '',
    description: '',
    isPublic: true,
    topicId: '',
    tags: [],
  });

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const templateData = await templateService.getTemplateById(id as string);
        setTemplate(templateData);
        
        if (templateData) {
          setVersion(templateData.version || 0);
          setFormData({
            title: templateData.title || '',
            description: templateData.description || '',
            isPublic: templateData.isPublic,
            topicId: templateData.topicId || '',
            tags: templateData.tags ? templateData.tags.map((tag: any) => tag.name) : [],
            isQuiz: templateData.isQuiz,
            showScoreImmediately: templateData.showScoreImmediately,
            scoringCriteria: templateData.scoringCriteria,
            questionOrder: templateData.questionOrder,
          });
        } else {
          toast({
            title: "Error",
            description: "Template not found or you don't have permission to edit it.",
            variant: "destructive",
          });
          router.push('/templates');
          return;
        }
      } catch (error) {
        console.error('Failed to fetch template:', error);
        toast({
          title: "Error",
          description: "Failed to load template. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTemplate();
    } else {
      router.push('/auth/login?redirect=/templates/' + id + '/edit');
    }
  }, [id, router, user]);

  const buildTemplateData = (): TemplateUpdateData => {
    return {
      title: formData.title,
      description: formData.description,
      isPublic: formData.isPublic,
      topicId: formData.topicId,
      tags: formData.tags, 
      isQuiz: formData.isQuiz,
      showScoreImmediately: formData.showScoreImmediately,
      scoringCriteria: formData.scoringCriteria,
      questionOrder: formData.questionOrder,
      version: version, 
      ...Object.entries(formData)
        .filter(([key]) => 
          key.startsWith('custom') && 
          (key.endsWith('State') || key.endsWith('Question'))
        )
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {})
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.title.trim()) {
      toast({
        title: "Error",
        description: "Template title is required",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.topicId) {
      toast({
        title: "Error",
        description: "Please select a topic",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setUpdating(true);
      
      const dataWithVersion = buildTemplateData();
      
      await templateService.updateTemplate(id as string, dataWithVersion);
      
      toast({
        title: "Success",
        description: "Template updated successfully."
      });

      router.push(`/templates/${id}`);
    } catch (error: any) {
      console.error('Failed to update template:', error);

      if (error.response && error.response.status === 409) {
        toast({
          title: "Edit Conflict",
          description: "Someone else has modified this template. Please refresh and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: error.response?.data?.message || "Failed to update template. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev: TemplateFormData) => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading template...</span>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container py-8 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Template Not Found</h1>
          <p className="mb-4">The template you're looking for doesn't exist or you don't have permission to edit it.</p>
          <Button onClick={() => router.push('/templates')}>
            Back to Templates
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Edit Template</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form fields */}
        <div className="grid gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">Title</label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full p-2 border rounded"
              rows={3}
            />
          </div>
        </div>
        
        <div className="flex gap-4 justify-end">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.push(`/templates/${id}`)}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={updating}
          >
            {updating ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Template'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
