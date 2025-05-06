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
import templateService from "@/lib/api/template-service";
import commentService from "@/lib/api/comment-service";
import likeService from "@/lib/api/like-service";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/components/ui/use-toast";

interface Comment {
  id: string;
  content: string;
  userId: string;
  templateId: string;
  createdAt: string;
  updatedAt: string;
  version: number;
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
        const response = await templateService.getTemplateById(params.id);
        setTemplate(response);
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
        const comments = await commentService.getCommentsByTemplate(params.id);
        setComments(comments);
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
        const isLiked = await likeService.checkLike(params.id);
        setLiked(isLiked);
        
        // Get the total like count
        const count = await likeService.getLikeCount(params.id);
        setLikesCount(count);
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
      await templateService.submitFormResponse(params.id, formResponses);
      
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
      const newLikedStatus = await likeService.toggleLike(params.id, liked);
      setLiked(newLikedStatus);
      setLikesCount(prev => newLikedStatus ? prev + 1 : Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error toggling like:", error);
      toast({
        title: "Error",
        description: "Failed to update like status. Please try again.",
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
      const comment = await commentService.createComment(params.id, newComment);
      
      // Add the new comment to the list with the user info
      setComments([...comments, {
        ...comment,
        user: {
          id: user?.id || '',
          name: user?.name || 'Anonymous'
        }
      }]);
      
      setNewComment('');
      
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast({
        title: "Error",
        description: "Failed to submit your comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmittingComment(false);
    }
  };
  
  const renderInputField = (type: string, field: string, label: string = '') => {
    switch (type) {
      case 'String':
        return (
          <Input
            id={field}
            value={formResponses[field] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        );
      case 'Text':
        return (
          <Textarea
            id={field}
            value={formResponses[field] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={`Enter ${label.toLowerCase()}`}
            rows={4}
          />
        );
      case 'Int':
        return (
          <Input
            id={field}
            type="number"
            value={formResponses[field] || ''}
            onChange={(e) => handleInputChange(field, parseInt(e.target.value) || '')}
            placeholder={`Enter number for ${label.toLowerCase()}`}
          />
        );
      case 'Checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={field}
              checked={!!formResponses[field]}
              onCheckedChange={(checked) => handleInputChange(field, !!checked)}
            />
            <label
              htmlFor={field}
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Yes
            </label>
          </div>
        );
      default:
        return null;
    }
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

  // Determine the order of form fields from the template
  const renderFormFields = () => {
    if (!template) return null;
    
    const fields = [];
    let orderedFields: string[] = [];
    
    // Parse the questionOrder if available
    try {
      if (template.questionOrder) {
        orderedFields = JSON.parse(template.questionOrder);
      }
    } catch (e) {
      console.error("Error parsing question order:", e);
      
      // Fallback: gather all enabled fields
      orderedFields = [];
      for (let i = 1; i <= 4; i++) {
        if (template[`customString${i}State`]) orderedFields.push(`customString${i}`);
        if (template[`customText${i}State`]) orderedFields.push(`customText${i}`);
        if (template[`customInt${i}State`]) orderedFields.push(`customInt${i}`);
        if (template[`customCheckbox${i}State`]) orderedFields.push(`customCheckbox${i}`);
      }
    }
    
    // Render fields in order
    for (const field of orderedFields) {
      const matchResult = field.match(/^custom(String|Text|Int|Checkbox)([1-4])$/);
      if (!matchResult) continue;
      
      const [, type, num] = matchResult;
      const stateKey = `${field}State`;
      const questionKey = `${field}Question`;
      const answerKey = `${field}Answer`;
      
      if (!template[stateKey]) continue; // Skip disabled fields
      
      fields.push(
        <div key={field} className="mb-6">
          <label className="block mb-2 text-sm font-medium">
            {template[questionKey]}
            {/* Add required asterisk if needed */}
          </label>
          {renderInputField(type, answerKey, template[questionKey])}
        </div>
      );
    }
    
    return fields;
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
