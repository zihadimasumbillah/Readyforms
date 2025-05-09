"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Share, MessageSquare, AlertTriangle, ArrowLeft, Edit } from 'lucide-react';
import { templateService } from '@/lib/api/template-service';
import { likeService } from '@/lib/api/like-service';
import { commentService } from '@/lib/api/comment-service';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

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
  const [comments, setComments] = useState<any[]>([]);
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const data = await templateService.getTemplateById(id);
        setTemplate(data);
      
        // Get likes count
        const likesCount = await likeService.getLikesCount(id);
        setLikeCount(likesCount.count || 0); // Access the count property from the response
        
        // Check if user has liked this template
        if (user) {
          const likeStatus = await likeService.checkLikeStatus(id);
          setLiked(likeStatus.liked); // Extract the liked boolean property from the response object
        }
        
        // Get comments
        const commentsData = await commentService.getCommentsByTemplate(id);
        setComments(commentsData);
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
      router.push('/auth/login');
      return;
    }

    try {
      // Use either likeTemplate or unlikeTemplate based on the current liked state
      const response = liked 
        ? await likeService.unlikeTemplate(id)
        : await likeService.likeTemplate(id);
        
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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to comment on templates",
        variant: "destructive",
      });
      router.push('/auth/login');
      return;
    }

    if (!commentContent.trim()) {
      return;
    }

    setSubmittingComment(true);
    try {
      // Instead of passing an object, pass the content as a string directly
      const newComment = await commentService.createComment(commentContent, id);

      setComments([...comments, newComment]);
      setCommentContent('');

      toast({
        title: "Comment added",
        description: "Your comment has been added successfully",
      });
    } catch (err) {
      console.error('Error submitting comment:', err);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleFillForm = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to fill out this form",
      });
      router.push(`/auth/login?redirect=/templates/${id}/fill`);
      return;
    }
    
    router.push(`/templates/${id}/fill`);
  };

  const handleViewResponses = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to view responses",
      });
      router.push('/auth/login');
      return;
    }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
                variant={liked ? "default" : "outline"}
                size="sm" 
                onClick={handleLikeToggle}
                className="flex items-center gap-1"
              >
                <Heart className={`h-4 w-4 ${liked ? 'fill-white' : ''}`} />
                <span>{likeCount}</span>
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  toast({
                    title: "Link copied",
                    description: "Template link copied to clipboard"
                  });
                }}
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

        {template.imageUrl && (
          <div className="px-6">
            <img 
              src={template.imageUrl} 
              alt={template.title} 
              className="w-full rounded-md object-cover max-h-64"
            />
          </div>
        )}

        <Tabs defaultValue="preview" className="px-6 py-4">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="comments">Comments ({comments.length})</TabsTrigger>
            {isOwner && <TabsTrigger value="responses">Responses</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="preview" className="mt-4">
            <div className="space-y-6">
              {questionsData.length > 0 ? (
                questionsData.map((questionKey: string, index: number) => {
                  const fieldType = questionKey.replace(/[0-9]/g, '');
                  const fieldIndex = questionKey.replace(/[^0-9]/g, '');

                  return (
                    <div key={index} className="p-5 bg-card border rounded-md">
                      <p className="font-medium">
                        {index + 1}. {getQuestionText(fieldType, parseInt(fieldIndex, 10))}
                      </p>
                      <div className="mt-3">
                        {fieldType === 'customString' && (
                          <Input disabled placeholder="Short text answer" />
                        )}
                        {fieldType === 'customText' && (
                          <Textarea disabled placeholder="Long text answer" />
                        )}
                        {fieldType === 'customInt' && (
                          <Input type="number" disabled placeholder="Number answer" />
                        )}
                        {fieldType === 'customCheckbox' && (
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              disabled
                              className="h-4 w-4 rounded border-gray-300 cursor-not-allowed"
                            />
                            <span className="ml-2 text-sm text-muted-foreground">Yes/No</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-center py-6">No questions defined for this template.</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="comments" className="mt-4">
            <div className="space-y-4">
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <Textarea 
                  placeholder="Add your comment..."
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  disabled={submittingComment}
                />
                <Button 
                  type="submit" 
                  disabled={!commentContent.trim() || submittingComment}
                >
                  {submittingComment ? 'Posting...' : 'Post Comment'}
                </Button>
              </form>
              
              <div className="mt-6 space-y-4">
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <div key={comment.id} className="border p-4 rounded-md">
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {comment.user?.name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{comment.user?.name || 'Anonymous'}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No comments yet. Be the first to comment!</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          {isOwner && (
            <TabsContent value="responses" className="mt-4">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">View Form Responses</h3>
                <p className="text-muted-foreground mb-4">
                  Access all responses submitted to this form
                </p>
                <Button onClick={handleViewResponses}>
                  View Responses
                </Button>
              </div>
            </TabsContent>
          )}
        </Tabs>

        <CardFooter className="flex flex-wrap gap-2 justify-between">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleFillForm}>
              Fill in Form
            </Button>

            <Button variant="outline" onClick={handleViewResponses} className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
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
