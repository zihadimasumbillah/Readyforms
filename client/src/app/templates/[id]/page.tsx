"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Template } from "@/types";
import { Heart, MessageSquare, Share2, Eye, Send } from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/api/api-client";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/components/ui/use-toast";

interface Comment {
  id: string;
  content: string;
  userId: string;
  templateId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export default function TemplatePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();
  
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Form response fields
  const [formResponses, setFormResponses] = useState<Record<string, any>>({});
  
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/templates/${params.id}`);
        setTemplate(response.data);
      } catch (error) {
        console.error("Error fetching template:", error);
        toast({
          title: "Error",
          description: "Failed to load template. It may not exist or you don't have permission to view it.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    const fetchComments = async () => {
      try {
        setCommentsLoading(true);
        const response = await apiClient.get(`/comments/template/${params.id}`);
        setComments(response.data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setCommentsLoading(false);
      }
    };
    
    const fetchLikeStatus = async () => {
      if (!isAuthenticated) return;
      
      try {
        // Check if user has liked this template
        const likeStatusResponse = await apiClient.get(`/likes/check/${params.id}`);
        setLiked(likeStatusResponse.data.liked);
        
        // Get the total like count
        const likesCountResponse = await apiClient.get(`/likes/count/${params.id}`);
        setLikesCount(likesCountResponse.data.count);
      } catch (error) {
        console.error("Error fetching like status:", error);
      }
    };
    
    fetchTemplate();
    fetchComments();
    fetchLikeStatus();
  }, [params.id, isAuthenticated]);
  
  const handleInputChange = (field: string, value: any) => {
    setFormResponses(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmitResponse = async () => {
    if (!isAuthenticated) {
      // Save current location for redirect after login
      localStorage.setItem('redirectAfterLogin', pathname);
      router.push(`/auth/login?redirect=${pathname}`);
      return;
    }
    
    try {
      await apiClient.post('/forms', {
        templateId: params.id,
        answers: formResponses
      });
      
      toast({
        title: "Success",
        description: "Your response has been submitted successfully.",
      });
      
      // Clear form
      setFormResponses({});
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "Failed to submit your response. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', pathname);
      router.push(`/auth/login?redirect=${pathname}`);
      return;
    }
    
    try {
      if (liked) {
        await apiClient.delete(`/likes/template/${params.id}`);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        await apiClient.post(`/likes/template/${params.id}`);
        setLikesCount(prev => prev + 1);
      }
      setLiked(!liked);
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like status.",
        variant: "destructive"
      });
    }
  };
  
  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return;
    
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', pathname);
      router.push(`/auth/login?redirect=${pathname}`);
      return;
    }
    
    try {
      setSubmittingComment(true);
      const response = await apiClient.post('/comments', {
        templateId: params.id,
        content: newComment
      });
      
      setComments(prev => [...prev, response.data]);
      setNewComment('');
      toast({
        title: "Success",
        description: "Your comment has been added.",
      });
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Failed to post your comment.",
        variant: "destructive"
      });
    } finally {
      setSubmittingComment(false);
    }
  };
  
  // Helper function to render the form fields
  const renderFormFields = () => {
    if (!template) return null;
    
    const fields = [];
    const questionOrder = JSON.parse(template.questionOrder || '[]');
    
    // Sort fields based on questionOrder, or default to sequential rendering
    const orderedFields = questionOrder.length > 0 ? 
      questionOrder : 
      ['customString1', 'customString2', 'customString3', 'customString4',
       'customText1', 'customText2', 'customText3', 'customText4',
       'customInt1', 'customInt2', 'customInt3', 'customInt4',
       'customCheckbox1', 'customCheckbox2', 'customCheckbox3', 'customCheckbox4'];
    
    // Iterate through ordered fields and render enabled ones
    for (const field of orderedFields) {
      const stateKey = `${field}State`;
      const questionKey = `${field}Question`;
      const answerKey = `${field}Answer`;
      
      if (!template[stateKey]) continue;
      
      if (field.startsWith('customString')) {
        fields.push(
          <div key={field} className="space-y-2">
            <label className="text-sm font-medium">
              {template[questionKey]}
            </label>
            <Input 
              placeholder="Your answer"
              value={formResponses[answerKey] || ''}
              onChange={e => handleInputChange(answerKey, e.target.value)}
            />
          </div>
        );
      } else if (field.startsWith('customText')) {
        fields.push(
          <div key={field} className="space-y-2">
            <label className="text-sm font-medium">
              {template[questionKey]}
            </label>
            <Textarea 
              placeholder="Your answer"
              value={formResponses[answerKey] || ''}
              onChange={e => handleInputChange(answerKey, e.target.value)}
            />
          </div>
        );
      } else if (field.startsWith('customInt')) {
        fields.push(
          <div key={field} className="space-y-2">
            <label className="text-sm font-medium">
              {template[questionKey]}
            </label>
            <Input 
              type="number" 
              placeholder="Enter a number"
              value={formResponses[answerKey] || ''}
              onChange={e => handleInputChange(answerKey, parseInt(e.target.value) || 0)}
            />
          </div>
        );
      } else if (field.startsWith('customCheckbox')) {
        fields.push(
          <div key={field} className="flex items-start space-x-2 py-2">
            <Checkbox 
              id={field}
              checked={!!formResponses[answerKey]}
              onCheckedChange={checked => handleInputChange(answerKey, !!checked)}
            />
            <label htmlFor={field} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {template[questionKey]}
            </label>
          </div>
        );
      }
    }
    
    return fields.length > 0 ? fields : <p className="text-muted-foreground">This form has no fields.</p>;
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <Navbar />
      <div className="container py-8">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-80 w-full mt-6" />
          </div>
        ) : template ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <CardTitle className="text-2xl">{template.title}</CardTitle>
                      {template.topic && (
                        <Badge variant="outline" className="mt-2">
                          {template.topic.name}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Button variant="outline" size="sm" onClick={handleLikeToggle}>
                        <Heart className={`h-4 w-4 mr-1.5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>{likesCount}</span>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="#comments">
                          <MessageSquare className="h-4 w-4 mr-1.5" />
                          <span>{comments.length}</span>
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Share2 className="h-4 w-4 mr-1.5" />
                        Share
                      </Button>
                    </div>
                  </div>
                  {template.description && (
                    <CardDescription className="text-base mt-4">
                      {template.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {renderFormFields()}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  <Button onClick={handleSubmitResponse}>
                    Submit Response
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="mt-6">
                <CardHeader id="comments">
                  <CardTitle>Comments ({comments.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {commentsLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="border rounded-md p-4 space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-12 w-full" />
                      </div>
                    ))
                  ) : comments.length > 0 ? (
                    comments.map(comment => (
                      <div key={comment.id} className="border rounded-md p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-medium mb-1">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                              {comment.user.name.charAt(0).toUpperCase()}
                            </div>
                            {comment.user.name}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="mt-2 text-sm">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No comments yet. Be the first to comment!</p>
                    </div>
                  )}
                  
                  <Separator className="my-4" />
                  
                  <div className="flex gap-3">
                    <Textarea 
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <Button 
                      onClick={handleCommentSubmit}
                      disabled={submittingComment || !newComment.trim()}
                      className="shrink-0"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Post
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>About this Template</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Created by</h4>
                    <p className="font-medium">{template.user?.name || 'Unknown'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Creation Date</h4>
                    <p>{new Date(template.createdAt).toLocaleDateString()}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Topic</h4>
                    <Badge variant="secondary">{template.topic?.name || 'Uncategorized'}</Badge>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  {user?.id === template.userId && (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/templates/${params.id}/edit`}>
                        Edit Template
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/templates">
                      View more templates
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-2">Template not found</h2>
            <p className="text-muted-foreground mb-6">
              The template you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <Button asChild>
              <Link href="/templates">Browse Templates</Link>
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
