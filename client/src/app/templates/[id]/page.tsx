"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { Template } from '@/types';
import templateService from '@/lib/api/template-service';
import { likeService } from '@/lib/api/like-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart, MessageSquare, ArrowLeft, Edit } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Force dynamic rendering to prevent static generation errors
export const dynamic = 'force-dynamic';

export default function TemplatePage({ params }: { params: { id: string } }) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth() || {};

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setIsLoading(true);
        const data = await templateService.getTemplateById(params.id);
        setTemplate(data);
        
        // Get likes count
        const likes = await likeService.countLikes(params.id);
        setLikesCount(likes.count);
        
        // Check if user has liked this template
        if (isAuthenticated) {
          const likeStatus = await likeService.checkLike(params.id);
          setIsLiked(likeStatus.liked);
        }
        
      } catch (error) {
        console.error("Error fetching template:", error);
        setError("Failed to load template. It may not exist or you don't have permission to view it.");
        toast({
          title: "Error",
          description: "Failed to load the template",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplate();
  }, [params.id, isAuthenticated]);

  const handleLikeTemplate = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to like templates",
        variant: "default",
      });
      router.push('/auth/login');
      return;
    }

    try {
      const result = await likeService.toggleLike(params.id);
      setIsLiked(result.liked);
      
      // Update likes count
      const likes = await likeService.countLikes(params.id);
      setLikesCount(likes.count);
      
    } catch (error) {
      console.error("Error liking template:", error);
      toast({
        title: "Error",
        description: "Failed to update like status",
        variant: "destructive",
      });
    }
  };

  const handleFillForm = () => {
    router.push(`/forms/${params.id}/respond`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="grid gap-6">
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center text-center py-12">
            <h2 className="text-xl font-bold mb-2">Template Not Found</h2>
            <p className="text-muted-foreground mb-4">
              {error || "The template you're looking for doesn't exist or has been removed."}
            </p>
            <Button asChild>
              <Link href="/templates">Browse Templates</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = user && template.userId === user.id;

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CardTitle className="text-2xl mb-2">{template.title}</CardTitle>
                <CardDescription>{template.description}</CardDescription>
                <div className="mt-2 flex flex-wrap gap-2">
                  {template.topic && (
                    <Badge variant="outline">{template.topic.name}</Badge>
                  )}
                  {template.isQuiz && (
                    <Badge variant="secondary">Quiz</Badge>
                  )}
                  {!template.isPublic && (
                    <Badge variant="destructive">Private</Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <Button
                  variant={isLiked ? "default" : "outline"}
                  size="icon"
                  onClick={handleLikeTemplate}
                >
                  <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
                  <span className="sr-only">Like</span>
                </Button>
                <span className="text-sm text-muted-foreground">{likesCount}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div>
              <h3 className="text-lg font-semibold mb-2">Form Fields</h3>
              <div className="grid gap-4">
                {template.questionOrder && JSON.parse(template.questionOrder).map(fieldId => {
                  const fieldStateKey = `${fieldId}State` as keyof Template;
                  const fieldQuestionKey = `${fieldId}Question` as keyof Template;

                  if (template[fieldStateKey]) {
                    return (
                      <Card key={fieldId} className="overflow-hidden">
                        <CardHeader className="px-4 py-2 bg-muted/50">
                          <CardTitle className="text-sm">{String(template[fieldQuestionKey] || '')}</CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 py-2 text-sm text-muted-foreground">
                          <div className="h-8 flex items-center">
                            {fieldId.includes('customString') && (
                              <span>Text input field (short)</span>
                            )}
                            {fieldId.includes('customText') && (
                              <span>Text input field (long)</span>
                            )}
                            {fieldId.includes('customInt') && (
                              <span>Number input field</span>
                            )}
                            {fieldId.includes('customCheckbox') && (
                              <span>Checkbox field (Yes/No)</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-5">
            <div className="text-sm text-muted-foreground">
              Created by: <span className="font-medium">{template.user?.name}</span>
            </div>
            <div className="flex gap-2">
              {isOwner && (
                <Button variant="outline" asChild>
                  <Link href={`/templates/${template.id}/edit`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Template
                  </Link>
                </Button>
              )}
              <Button variant="outline" asChild>
                <Link href={`/templates/${template.id}/responses`}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  View Responses
                </Link>
              </Button>
              <Button onClick={handleFillForm}>Fill Form</Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
