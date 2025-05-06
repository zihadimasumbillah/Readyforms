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
import { Heart, MessageSquare, Share2, Eye, Send, FileText, BarChart2, Settings, Users } from "lucide-react";
import Link from "next/link";
import templateService from "@/lib/api/template-service";
import commentService from "@/lib/api/comment-service";
import likeService from "@/lib/api/like-service";
import formResponseService from "@/lib/api/form-response-service";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface FormResponseItem {
  id: string;
  templateId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  customString1Answer?: string;
  customString2Answer?: string;
  customString3Answer?: string;
  customString4Answer?: string;
  customText1Answer?: string;
  customText2Answer?: string;
  customText3Answer?: string;
  customText4Answer?: string;
  customInt1Answer?: number;
  customInt2Answer?: number;
  customInt3Answer?: number;
  customInt4Answer?: number;
  customCheckbox1Answer?: boolean;
  customCheckbox2Answer?: boolean;
  customCheckbox3Answer?: boolean;
  customCheckbox4Answer?: boolean;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

interface AggregateData {
  total_responses: number;
  avg_custom_int1: number | null;
  avg_custom_int2: number | null;
  avg_custom_int3: number | null;
  avg_custom_int4: number | null;
  string1_count: number;
  string2_count: number;
  string3_count: number;
  string4_count: number;
  text1_count: number;
  text2_count: number;
  text3_count: number;
  text4_count: number;
  checkbox1_yes_count: number;
  checkbox2_yes_count: number;
  checkbox3_yes_count: number;
  checkbox4_yes_count: number;
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
  const [responses, setResponses] = useState<FormResponseItem[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(true);
  const [aggregateData, setAggregateData] = useState<AggregateData | null>(null);
  const [aggregateLoading, setAggregateLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("questions");
  
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
  
  // Fetch form responses and aggregated data when active tab changes
  useEffect(() => {
    if (activeTab === "results" && isAuthenticated) {
      const fetchResponses = async () => {
        try {
          setResponsesLoading(true);
          const data = await formResponseService.getResponsesByTemplate(params.id);
          setResponses(data);
        } catch (error) {
          console.error("Error fetching form responses:", error);
          toast({
            title: "Error",
            description: "Failed to load form responses.",
            variant: "destructive"
          });
        } finally {
          setResponsesLoading(false);
        }
      };
      fetchResponses();
    }
    
    if (activeTab === "aggregate" && isAuthenticated) {
      const fetchAggregateData = async () => {
        try {
          setAggregateLoading(true);
          const data = await formResponseService.getAggregateData(params.id);
          setAggregateData(data);
        } catch (error) {
          console.error("Error fetching aggregate data:", error);
          toast({
            title: "Error",
            description: "Failed to load aggregated data.",
            variant: "destructive"
          });
        } finally {
          setAggregateLoading(false);
        }
      };
      fetchAggregateData();
    }
  }, [params.id, activeTab, isAuthenticated]);
  
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
      
      if (!template[stateKey]) continue; 
      
      fields.push(
        <div key={field} className="mb-6">
          <label className="block mb-2 text-sm font-medium">
            {template[questionKey]}
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
                
                <Tabs defaultValue="questions" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <CardContent className="pt-0 pb-4">
                    <TabsList className="grid grid-cols-4 mb-6">
                      <TabsTrigger value="settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        <span className="hidden sm:inline">General</span>
                      </TabsTrigger>
                      <TabsTrigger value="questions" className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">Questions</span>
                      </TabsTrigger>
                      <TabsTrigger value="results" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span className="hidden sm:inline">Results</span>
                      </TabsTrigger>
                      <TabsTrigger value="aggregate" className="flex items-center gap-2">
                        <BarChart2 className="h-4 w-4" />
                        <span className="hidden sm:inline">Analytics</span>
                      </TabsTrigger>
                    </TabsList>
                    
                    {/* General Settings Tab */}
                    <TabsContent value="settings" className="space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-2">Template Details</h3>
                        <div className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Title</h4>
                            <p className="text-base">{template.title}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Description</h4>
                            <p className="text-base">{template.description || "No description"}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Topic</h4>
                            <Badge>{template.topic?.name || "Uncategorized"}</Badge>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Access Level</h4>
                            <Badge variant={template.isPublic ? "default" : "outline"}>
                              {template.isPublic ? "Public" : "Private"}
                            </Badge>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Created By</h4>
                            <p className="text-base">{template.user?.name || "Unknown"}</p>
                          </div>
                          
                          <div>
                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Creation Date</h4>
                            <p className="text-base">{formatDate(template.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                      
                      {(user?.id === template.userId || user?.isAdmin) && (
                        <div className="pt-6 border-t">
                          <Button variant="outline" asChild>
                            <Link href={`/templates/${params.id}/edit`}>
                              Edit Template Settings
                            </Link>
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    
                    {/* Questions Tab */}
                    <TabsContent value="questions" className="space-y-6">
                      {renderFormFields()}
                      
                      {isAuthenticated ? (
                        <div className="flex justify-end pt-6 border-t">
                          <Button onClick={handleSubmitResponse}>
                            Submit Response
                          </Button>
                        </div>
                      ) : (
                        <div className="pt-6 border-t text-center">
                          <p className="text-muted-foreground mb-2">
                            Please sign in to submit your response
                          </p>
                          <Button asChild>
                            <Link href={`/auth/login?redirect=${pathname}`}>
                              Sign In
                            </Link>
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    
                    {/* Results Tab */}
                    <TabsContent value="results" className="space-y-6">
                      {isAuthenticated ? (
                        responsesLoading ? (
                          <div className="space-y-4">
                            {Array(3).fill(0).map((_, i) => (
                              <Skeleton key={i} className="h-16 w-full" />
                            ))}
                          </div>
                        ) : responses.length > 0 ? (
                          <div className="space-y-4">
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-medium">
                                Submitted Responses ({responses.length})
                              </h3>
                              {responses.length > 0 && (
                                <Button variant="outline" size="sm" onClick={() => {
                                  // Link download CSV function
                                  formResponseService.exportResponsesAsCsv(params.id)
                                    .then(blob => {
                                      const url = window.URL.createObjectURL(blob);
                                      const a = document.createElement('a');
                                      a.style.display = 'none';
                                      a.href = url;
                                      a.download = `template-${template.title.replace(/\s+/g, '-')}-responses.csv`;
                                      document.body.appendChild(a);
                                      a.click();
                                      window.URL.revokeObjectURL(url);
                                    })
                                    .catch(error => {
                                      console.error("Error exporting responses:", error);
                                      toast({
                                        title: "Export Failed",
                                        description: "Could not export responses to CSV",
                                        variant: "destructive"
                                      });
                                    });
                                }}>
                                  Export as CSV
                                </Button>
                              )}
                            </div>
                            
                            {responses.map((response) => (
                              <div key={response.id} className="border rounded-md p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">
                                      {response.user?.name?.charAt(0).toUpperCase() || 'A'}
                                    </div>
                                    <div>
                                      <p className="font-medium">{response.user?.name || 'Anonymous'}</p>
                                      <p className="text-xs text-muted-foreground">{formatDate(response.createdAt)}</p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="grid gap-4 md:grid-cols-2">
                                  {/* Render each answer */}
                                  {template.questionOrder && Object.entries(response)
                                    .filter(([key]) => key.endsWith('Answer') && response[key] !== null && response[key] !== '')
                                    .map(([key, value]) => {
                                      // Extract field type and number (e.g., customString1Answer -> customString1)
                                      const match = key.match(/^(custom\w+\d+)Answer$/);
                                      if (!match) return null;
                                      
                                      const fieldBase = match[1];
                                      const questionKey = `${fieldBase}Question`;
                                      const questionText = template[questionKey] || key;
                                      
                                      // Format boolean values
                                      const displayValue = typeof value === 'boolean'
                                        ? value ? 'Yes' : 'No'
                                        : String(value);
                                        
                                      return (
                                        <div key={key} className="space-y-1">
                                          <h4 className="text-sm font-medium text-muted-foreground">{questionText}</h4>
                                          <p className="text-sm whitespace-pre-wrap">{displayValue}</p>
                                        </div>
                                      );
                                    })}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                            <h3 className="text-lg font-medium mb-1">No responses yet</h3>
                            <p className="text-muted-foreground mb-4">
                              Be the first to submit a response to this template!
                            </p>
                            <Button onClick={() => setActiveTab('questions')}>
                              Submit a Response
                            </Button>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <h3 className="text-lg font-medium mb-1">Sign in to view responses</h3>
                          <p className="text-muted-foreground mb-4">
                            You need to be signed in to see responses for this template
                          </p>
                          <Button asChild>
                            <Link href={`/auth/login?redirect=${pathname}`}>
                              Sign In
                            </Link>
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    
                    {/* Aggregate Tab */}
                    <TabsContent value="aggregate" className="space-y-6">
                      {isAuthenticated ? (
                        aggregateLoading ? (
                          <div className="space-y-4">
                            <Skeleton className="h-8 w-full" />
                            <Skeleton className="h-64 w-full" />
                          </div>
                        ) : aggregateData ? (
                          <div className="space-y-6">
                            <div className="flex justify-between items-center">
                              <h3 className="text-lg font-medium">
                                Response Analytics
                              </h3>
                              <Badge variant="outline">
                                {aggregateData.total_responses} Responses
                              </Badge>
                            </div>
                            
                            {aggregateData.total_responses === 0 ? (
                              <div className="text-center py-8">
                                <BarChart2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                                <h3 className="text-lg font-medium mb-1">No data to analyze</h3>
                                <p className="text-muted-foreground mb-4">
                                  Once responses are submitted, analytics will be available here
                                </p>
                                <Button onClick={() => setActiveTab('questions')}>
                                  Submit a Response
                                </Button>
                              </div>
                            ) : (
                              <>
                                {/* Numeric Fields Analytics */}
                                {(aggregateData.avg_custom_int1 !== null || 
                                  aggregateData.avg_custom_int2 !== null || 
                                  aggregateData.avg_custom_int3 !== null || 
                                  aggregateData.avg_custom_int4 !== null) && (
                                  <div className="border rounded-md p-4">
                                    <h4 className="font-medium mb-3">Numeric Field Averages</h4>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                      {template.customInt1State && aggregateData.avg_custom_int1 !== null && (
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{template.customInt1Question}</span>
                                            <span className="font-medium">{aggregateData.avg_custom_int1.toFixed(2)}</span>
                                          </div>
                                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${Math.min(100, (aggregateData.avg_custom_int1 / 100) * 100)}%` }}></div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {template.customInt2State && aggregateData.avg_custom_int2 !== null && (
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{template.customInt2Question}</span>
                                            <span className="font-medium">{aggregateData.avg_custom_int2.toFixed(2)}</span>
                                          </div>
                                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${Math.min(100, (aggregateData.avg_custom_int2 / 100) * 100)}%` }}></div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {template.customInt3State && aggregateData.avg_custom_int3 !== null && (
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{template.customInt3Question}</span>
                                            <span className="font-medium">{aggregateData.avg_custom_int3.toFixed(2)}</span>
                                          </div>
                                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${Math.min(100, (aggregateData.avg_custom_int3 / 100) * 100)}%` }}></div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {template.customInt4State && aggregateData.avg_custom_int4 !== null && (
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{template.customInt4Question}</span>
                                            <span className="font-medium">{aggregateData.avg_custom_int4.toFixed(2)}</span>
                                          </div>
                                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full bg-primary" style={{ width: `${Math.min(100, (aggregateData.avg_custom_int4 / 100) * 100)}%` }}></div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Checkbox Analytics */}
                                {(template.customCheckbox1State || 
                                  template.customCheckbox2State || 
                                  template.customCheckbox3State || 
                                  template.customCheckbox4State) && (
                                  <div className="border rounded-md p-4">
                                    <h4 className="font-medium mb-3">Yes/No Response Distribution</h4>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                      {template.customCheckbox1State && (
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{template.customCheckbox1Question}</span>
                                            <span className="font-medium">
                                              {aggregateData.checkbox1_yes_count} / {aggregateData.total_responses} ({Math.round(aggregateData.checkbox1_yes_count / aggregateData.total_responses * 100)}%)
                                            </span>
                                          </div>
                                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full bg-green-500" style={{ width: `${(aggregateData.checkbox1_yes_count / aggregateData.total_responses) * 100}%` }}></div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {template.customCheckbox2State && (
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{template.customCheckbox2Question}</span>
                                            <span className="font-medium">
                                              {aggregateData.checkbox2_yes_count} / {aggregateData.total_responses} ({Math.round(aggregateData.checkbox2_yes_count / aggregateData.total_responses * 100)}%)
                                            </span>
                                          </div>
                                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full bg-green-500" style={{ width: `${(aggregateData.checkbox2_yes_count / aggregateData.total_responses) * 100}%` }}></div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {template.customCheckbox3State && (
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{template.customCheckbox3Question}</span>
                                            <span className="font-medium">
                                              {aggregateData.checkbox3_yes_count} / {aggregateData.total_responses} ({Math.round(aggregateData.checkbox3_yes_count / aggregateData.total_responses * 100)}%)
                                            </span>
                                          </div>
                                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full bg-green-500" style={{ width: `${(aggregateData.checkbox3_yes_count / aggregateData.total_responses) * 100}%` }}></div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {template.customCheckbox4State && (
                                        <div className="space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">{template.customCheckbox4Question}</span>
                                            <span className="font-medium">
                                              {aggregateData.checkbox4_yes_count} / {aggregateData.total_responses} ({Math.round(aggregateData.checkbox4_yes_count / aggregateData.total_responses * 100)}%)
                                            </span>
                                          </div>
                                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                                            <div className="h-full bg-green-500" style={{ width: `${(aggregateData.checkbox4_yes_count / aggregateData.total_responses) * 100}%` }}></div>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Text Response Stats */}
                                <div className="border rounded-md p-4">
                                  <h4 className="font-medium mb-3">Text Response Completion Rates</h4>
                                  <div className="grid gap-4 sm:grid-cols-2">
                                    {template.customString1State && (
                                      <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                          <span className="text-muted-foreground">{template.customString1Question}</span>
                                          <span className="font-medium">
                                            {aggregateData.string1_count} / {aggregateData.total_responses} ({Math.round(aggregateData.string1_count / aggregateData.total_responses * 100)}%)
                                          </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                          <div className="h-full bg-blue-500" style={{ width: `${(aggregateData.string1_count / aggregateData.total_responses) * 100}%` }}></div>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {template.customText1State && (
                                      <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                          <span className="text-muted-foreground">{template.customText1Question}</span>
                                          <span className="font-medium">
                                            {aggregateData.text1_count} / {aggregateData.total_responses} ({Math.round(aggregateData.text1_count / aggregateData.total_responses * 100)}%)
                                          </span>
                                        </div>
                                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                                          <div className="h-full bg-blue-500" style={{ width: `${(aggregateData.text1_count / aggregateData.total_responses) * 100}%` }}></div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <BarChart2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                            <h3 className="text-lg font-medium mb-1">No analytics available</h3>
                            <p className="text-muted-foreground">
                              There was an error loading analytics data
                            </p>
                          </div>
                        )
                      ) : (
                        <div className="text-center py-8">
                          <BarChart2 className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <h3 className="text-lg font-medium mb-1">Sign in to view analytics</h3>
                          <p className="text-muted-foreground mb-4">
                            You need to be signed in to see analytics for this template
                          </p>
                          <Button asChild>
                            <Link href={`/auth/login?redirect=${pathname}`}>
                              Sign In
                            </Link>
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </CardContent>
                </Tabs>
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
