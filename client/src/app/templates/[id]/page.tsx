"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Share, MessageSquare, AlertTriangle, ArrowLeft, Edit } from 'lucide-react';
import { templateService } from '@/lib/api/template-service';
import { likeService } from '@/lib/api/like-service';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/components/ui/use-toast';
import Link from 'next/link';

interface TemplateDetailsProps {
  params: {
    id: string;
  };
}

export default function TemplateDetailsPage({ params }: TemplateDetailsProps) {
  const { id } = params;
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const data = await templateService.getTemplateById(id);
        setTemplate(data);

        // Get like count
        const likesData = await likeService.getLikeCount(id);
        setLikeCount(likesData || 0);

        // Check if user has liked this template
        if (user) {
          const likeStatus = await likeService.checkLikeStatus(id);
          setLiked(likeStatus);
        }
      } catch (err) {
        console.error('Error fetching template:', err);
        setError('Failed to load template. It may have been deleted or you don\'t have permission to view it.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTemplate();
    }
  }, [id, user]);

  const handleLikeToggle = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to like this template",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await likeService.toggleLike(id);
      setLiked(response.liked);
      setLikeCount(prev => response.liked ? prev + 1 : prev - 1);

      toast({
        title: response.liked ? "Template liked" : "Template unliked",
        description: response.liked ? "This template has been added to your likes" : "This template has been removed from your likes",
      });
    } catch (err) {
      console.error('Error toggling like:', err);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFillForm = () => {
    router.push(`/templates/${id}/fill`);
  };

  const handleViewResponses = () => {
    router.push(`/templates/${id}/responses`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Loading template...</h1>
        </div>

        <div className="space-y-4">
          <div className="h-8 w-1/3 bg-muted animate-pulse rounded-md"></div>
          <div className="h-4 w-1/2 bg-muted animate-pulse rounded-md"></div>
          <div className="h-64 bg-muted animate-pulse rounded-md"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>

        <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Error Loading Template
            </CardTitle>
            <CardDescription>
              {error}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" onClick={() => router.push('/templates')}>
              Browse Templates
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!template) {
    return null;
  }

  const isOwner = user && template.userId === user.id;
  const questionsData = (template.questionOrder && typeof template.questionOrder === 'string') 
    ? JSON.parse(template.questionOrder) 
    : [];

  const getQuestionText = (fieldType: string, index: number) => {
    const field = `${fieldType}${index}Question`;
    return template[field] || `${fieldType} Question ${index}`;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
      </div>

      <Card className="border-t-4 border-t-primary">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{template.title}</CardTitle>
              <CardDescription className="mt-1">
                {template.description || 'No description provided'}
              </CardDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLikeToggle}
                className="flex items-center gap-1"
              >
                <Heart className={`h-4 w-4 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{likeCount}</span>
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                className="flex items-center gap-1"
              >
                <Share className="h-4 w-4" />
                Share
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {template.topic && (
              <Badge variant="outline" className="bg-muted/50">
                {template.topic.name}
              </Badge>
            )}
            {template.tags && template.tags.map((tag: any) => (
              <Badge key={tag.id} variant="secondary" className="bg-primary/10">
                {tag.name}
              </Badge>
            ))}
            {template.isQuiz && (
              <Badge>Quiz</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted/30 rounded-md p-4">
            <h3 className="text-lg font-semibold mb-2">Questions</h3>
            <div className="space-y-2">
              {questionsData.length > 0 ? (
                questionsData.map((questionKey: string, index: number) => {
                  const fieldType = questionKey.replace(/[0-9]/g, '');
                  const fieldIndex = questionKey.replace(/[^0-9]/g, '');

                  return (
                    <div key={index} className="p-3 bg-card border rounded-md">
                      <p className="font-medium">
                        {index + 1}. {getQuestionText(fieldType, parseInt(fieldIndex, 10))}
                      </p>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {fieldType === 'customString' && <span>Short text answer</span>}
                        {fieldType === 'customText' && <span>Long text answer</span>}
                        {fieldType === 'customInt' && <span>Number answer</span>}
                        {fieldType === 'customCheckbox' && <span>Yes/No answer</span>}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground">No questions defined for this template.</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              Created by <span className="font-medium">{template.user?.name || 'Unknown user'}</span>
            </div>
            <div>
              Created {new Date(template.createdAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2 justify-between">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleFillForm}>
              Fill in Form
            </Button>

            <Button variant="outline" onClick={handleViewResponses}>
              <MessageSquare className="h-4 w-4 mr-2" />
              View Responses
            </Button>
          </div>

          {isOwner && (
            <div>
              <Button variant="outline" asChild>
                <Link href={`/templates/${template.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Template
                </Link>
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
