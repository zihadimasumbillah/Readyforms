"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { responseService, FormResponseDetail } from "@/lib/api/response-service";
import { ArrowLeft, Trash2, Calendar, User, Mail } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useAuth } from "@/contexts/auth-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

export const dynamic = 'force-dynamic';
export const dynamicParams = true;

type FormField = {
  question: string;
  answer: string | number | boolean;
  type: 'string' | 'text' | 'number' | 'checkbox';
}

export default function ResponseDetailPage({ params }: { params: { id: string } }) {
  const [response, setResponse] = useState<FormResponseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;

  const handleLogout = () => {
    if (logout) {
      logout();
      router.push('/auth/login');
    }
  };

  useEffect(() => {
    const fetchResponse = async () => {
      try {
        setLoading(true);
        const data = await responseService.getResponseById(params.id);
        setResponse(data);
      } catch (error) {
        console.error("Error fetching response:", error);
        toast({
          title: "Error",
          description: "Failed to load form response. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResponse();
  }, [params.id]);

  const handleDelete = async () => {
    try {
      await responseService.deleteResponse(params.id);
      toast({
        title: "Success",
        description: "Form response deleted successfully",
      });
      router.push("/admin/responses");
    } catch (error) {
      console.error("Error deleting response:", error);
      toast({
        title: "Error",
        description: "Failed to delete form response. Please try again.",
        variant: "destructive",
      });
    }
  };
  const getFormFields = (): FormField[] => {
    if (!response || !response.template) return [];

    const fields: FormField[] = [];
    for (let i = 1; i <= 4; i++) {
      const questionKey = `customString${i}Question`;
      const answerKey = `customString${i}Answer`;
      
      if (
        questionKey in response.template && 
        response.template[questionKey] && 
        answerKey in response && 
        response[answerKey] !== undefined
      ) {
        fields.push({
          question: response.template[questionKey] as string,
          answer: response[answerKey] as string,
          type: 'string'
        });
      }
    }
    for (let i = 1; i <= 4; i++) {
      const questionKey = `customText${i}Question`;
      const answerKey = `customText${i}Answer`;
      
      if (
        questionKey in response.template && 
        response.template[questionKey] && 
        answerKey in response && 
        response[answerKey] !== undefined
      ) {
        fields.push({
          question: response.template[questionKey] as string,
          answer: response[answerKey] as string,
          type: 'text'
        });
      }
    }
    for (let i = 1; i <= 4; i++) {
      const questionKey = `customInt${i}Question`;
      const answerKey = `customInt${i}Answer`;
      
      if (
        questionKey in response.template && 
        response.template[questionKey] && 
        answerKey in response && 
        response[answerKey] !== undefined
      ) {
        fields.push({
          question: response.template[questionKey] as string,
          answer: response[answerKey] as number,
          type: 'number'
        });
      }
    }
    for (let i = 1; i <= 4; i++) {
      const questionKey = `customCheckbox${i}Question`;
      const answerKey = `customCheckbox${i}Answer`;
      
      if (
        questionKey in response.template && 
        response.template[questionKey] && 
        answerKey in response && 
        response[answerKey] !== undefined
      ) {
        fields.push({
          question: response.template[questionKey] as string,
          answer: (response[answerKey] as boolean) ? 'Yes' : 'No',
          type: 'checkbox'
        });
      }
    }

    return fields;
  };

  return (
    <DashboardLayout
      user={{
        name: user?.name || 'Admin',
        email: user?.email || 'admin@example.com',
        isAdmin: true
      }}
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold">Form Response Details</h1>
          </div>
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Response
          </Button>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : response ? (
          <>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Response Information</CardTitle>
                    <CardDescription>Details about this form submission</CardDescription>
                  </div>
                  <Badge variant="secondary">
                    ID: {response.id.substring(0, 8)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <div className="mr-3 rounded-md bg-primary/10 p-2 text-primary">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Submitted on
                        </p>
                        <p className="text-base">
                          {response.createdAt && format(new Date(response.createdAt), "PPpp")}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="mr-3 rounded-md bg-primary/10 p-2 text-primary">
                        <User className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Submitted by
                        </p>
                        <p className="text-base">
                          {response.user?.name || 'Unknown user'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="mr-3 rounded-md bg-primary/10 p-2 text-primary">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Email
                        </p>
                        <p className="text-base">
                          {response.user?.email || 'No email available'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="mr-3 rounded-md bg-primary/10 p-2 text-primary">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          Form Template
                        </p>
                        <Link 
                          href={`/admin/templates/${response.templateId}`}
                          className="text-base text-primary hover:underline"
                        >
                          {response.template?.title || 'Unknown template'}
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Form Responses</CardTitle>
                <CardDescription>
                  Answers submitted by the user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getFormFields().map((field, i) => (
                    <div key={i} className="border-b pb-4 last:border-b-0 last:pb-0">
                      <p className="font-medium">{field.question}</p>
                      {field.type === 'text' ? (
                        <div className="mt-1 rounded-md bg-muted p-3">
                          <p className="whitespace-pre-wrap">{field.answer || 'No response'}</p>
                        </div>
                      ) : field.type === 'checkbox' ? (
                        <Badge className="mt-1" variant={field.answer === 'Yes' ? 'default' : 'outline'}>
                          {field.answer}
                        </Badge>
                      ) : (
                        <p className="mt-1 text-muted-foreground">{field.answer || 'No response'}</p>
                      )}
                    </div>
                  ))}
                  {getFormFields().length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No form responses found
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="justify-between border-t pt-4">
                <Button variant="outline" onClick={() => router.back()}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Responses
                </Button>
                <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Response
                </Button>
              </CardFooter>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium">Response not found</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                The form response you're looking for doesn't exist or has been deleted.
              </p>
              <Button onClick={() => router.push('/admin/responses')}>
                Go to Responses
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the form response
              from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
