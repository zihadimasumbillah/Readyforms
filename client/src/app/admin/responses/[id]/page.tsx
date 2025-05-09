"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, FileText, User, Calendar, CheckCircle, XCircle } from "lucide-react";
import { adminService } from "@/lib/api/admin-service";
import { useAuth } from "@/contexts/auth-context";
import { toast } from '@/components/ui/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { formatDate } from '@/lib/utils';

export default function ResponseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!user?.isAdmin) {
      toast({
        title: "Access denied",
        description: "You don't have permission to access this page",
        variant: "destructive"
      });
      router.push('/dashboard');
      return;
    }

    const fetchResponse = async () => {
      try {
        setLoading(true);
        const responseId = Array.isArray(id) ? id[0] : id;
        const data = await adminService.getFormResponseById(responseId);
        setResponse(data);

        if (data.templateId) {
          const templateData = await adminService.getTemplateById(data.templateId);
          setTemplate(templateData);
        }
      } catch (error) {
        console.error("Error fetching response:", error);
        toast({
          title: "Error",
          description: "Failed to load response data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchResponse();
    }
  }, [user, id, router]);

  const renderFieldValue = (key: string, value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground italic">Not answered</span>;
    }
    
    if (typeof value === 'boolean') {
      return value ? 
        <span className="flex items-center text-green-600"><CheckCircle className="h-4 w-4 mr-1" /> Yes</span> : 
        <span className="flex items-center text-red-600"><XCircle className="h-4 w-4 mr-1" /> No</span>;
    }
    
    if (key.includes('Int') && typeof value === 'number') {
      return <span className="font-medium">{value}</span>;
    }
    
    return <span>{String(value)}</span>;
  };

  const getQuestion = (fieldName: string) => {
    if (!template) return '';
    
    const match = fieldName.match(/custom(String|Text|Int|Checkbox)(\d)Answer/);
    if (!match) return '';
    
    const fieldType = match[1].toLowerCase();
    const fieldNumber = match[2];
    const questionField = `custom${fieldType}${fieldNumber}Question`;
    return template[questionField] || '';
  };

  const handleDeleteResponse = async () => {
    try {
      const responseId = Array.isArray(id) ? id[0] : id;
      await adminService.deleteFormResponse(responseId);
      toast({
        title: "Success",
        description: "Response deleted successfully"
      });
      router.push('/admin/responses');
    } catch (error) {
      console.error("Error deleting response:", error);
      toast({
        title: "Error",
        description: "Failed to delete response",
        variant: "destructive"
      });
    }
    setDeleteDialogOpen(false);
  };

  const handleLogout = () => {
    if (logout) {
      logout();
      router.push('/auth/login');
    }
  };

  if (!user) {
    return <div>Authenticating...</div>;
  }

  return (
    <DashboardLayout
      user={{
        name: user.name || 'Admin',
        email: user.email || 'admin@example.com',
        isAdmin: user.isAdmin
      }}
      onLogout={handleLogout}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <h1 className="text-2xl font-bold">Response Details</h1>
        </div>
        
        <Button 
          variant="destructive"
          size="sm" 
          onClick={() => setDeleteDialogOpen(true)}
        >
          Delete Response
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : response ? (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">Response Summary</CardTitle>
              <CardDescription>
                Submitted on {response ? formatDate(response.createdAt) : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Template</div>
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-medium">{template?.title || "Unknown Template"}</span>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Submitted By</div>
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-medium">{response.user?.name || "Unknown User"}</span>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Submission Date</div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    <span className="font-medium">{formatDate(response.createdAt)}</span>
                  </div>
                </div>
              </div>
              
              {template?.isQuiz && (
                <div className="p-4 border rounded-lg bg-muted/50 mt-4">
                  <div className="text-sm text-muted-foreground mb-1">Quiz Score</div>
                  <div className="flex items-center">
                    <span className="font-medium text-lg">
                      {response.score || 0} / {response.totalPossiblePoints || 0} 
                      <span className="text-sm ml-2 text-muted-foreground">
                        ({response.totalPossiblePoints > 0 
                          ? Math.round((response.score / response.totalPossiblePoints) * 100) 
                          : 0}%)
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Response Details</CardTitle>
              <CardDescription>
                All answers provided by the user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.keys(response).filter(key => key.includes('Answer')).map((key) => {
                  const question = getQuestion(key);
                  if (!question) return null; // Skip if no question found
                  
                  return (
                    <div key={key} className="p-4 border rounded-lg">
                      <div className="text-sm font-medium mb-1">{question}</div>
                      <div className="mt-2">{renderFieldValue(key, response[key])}</div>
                    </div>
                  );
                })}
                
                {Object.keys(response).filter(key => key.includes('Answer') && getQuestion(key)).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No answer data found for this response
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-3xl font-bold mb-2">Response not found</div>
          <p className="text-muted-foreground mb-6">
            The response you are looking for might have been deleted or does not exist.
          </p>
          <Button onClick={() => router.push('/admin/responses')}>
            View All Responses
          </Button>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this response from the system.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteResponse} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
