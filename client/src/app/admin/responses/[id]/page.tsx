"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formResponseService, FormResponseData } from "@/lib/api/form-response-service";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { useAuth } from "@/contexts/auth-context";
import { ChevronLeft, Download } from "lucide-react";
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ResponseDetailPage() {
  const params = useParams();
  const id = params ? params.id as string : '';
  
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<FormResponseData | null>(null);
  const [template, setTemplate] = useState<any>(null);
  const [questionOrder, setQuestionOrder] = useState<string[]>([]);

  const handleLogout = () => {
    if (auth?.logout) {
      auth.logout();
      router.push('/auth/login');
    }
  };

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (!user.isAdmin) {
      router.push('/dashboard');
      return;
    }

    if (!id) return;

    const fetchResponse = async () => {
      try {
        setLoading(true);
        const data = await formResponseService.getResponseById(id);
        setResponse(data);
        
        if (data.template) {
          setTemplate(data.template);
          
          if (data.template.questionOrder) {
            try {
              const questionOrderString = data.template.questionOrder;
              setQuestionOrder(typeof questionOrderString === 'string' 
                ? JSON.parse(questionOrderString) 
                : questionOrderString);
            } catch (e) {
              console.error('Failed to parse questionOrder:', e);
              setQuestionOrder([]);
            }
          }
        } else {
          console.warn('Template data not included in the response');
          setQuestionOrder([]);
        }
      } catch (error) {
        console.error('Error fetching response:', error);
        toast({
          title: "Error",
          description: "Failed to load response details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResponse();
  }, [id, router, user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderAnswer = (fieldType: string, questionNumber: number) => {
    const answerKey = `${fieldType}${questionNumber}Answer`;
    const answer = response?.[answerKey as keyof FormResponseData];
    
    if (answer === undefined || answer === null) return <span className="text-muted-foreground">No answer provided</span>;
    
    if (typeof answer === 'boolean') {
      return answer ? 'Yes' : 'No';
    }
    
    return answer.toString();
  };

  return (
    <AdminLayout 
      user={user ? {
        name: user.name || 'Admin',
        email: user.email || '',
        isAdmin: true
      } : undefined}
      onLogout={handleLogout}
    >
      <div className="flex flex-col gap-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.back()}
          className="w-fit"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to responses
        </Button>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : response ? (
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">{template?.title || 'Response Details'}</h1>
                <p className="text-muted-foreground mt-1">
                  Submitted {formatDate(response.createdAt)}
                </p>
              </div>
              
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Response
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Response Details</CardTitle>
                <CardDescription>
                  Submitted by {response.user?.name || 'Anonymous'}
                  {response.user?.email && ` (${response.user.email})`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm">
                    <div className="font-medium">Template:</div>
                    <div className="col-span-2">{template?.title || 'Unknown'}</div>
                    
                    <div className="font-medium">Submission ID:</div>
                    <div className="col-span-2 font-mono">{response.id}</div>
                    
                    <div className="font-medium">Submission Date:</div>
                    <div className="col-span-2">{formatDate(response.createdAt)}</div>
                    
                    {template?.isQuiz && (
                      <>
                        <div className="font-medium">Score:</div>
                        <div className="col-span-2">
                          {response.score !== undefined && response.totalPossiblePoints !== undefined ? (
                            <span>
                              {response.score} / {response.totalPossiblePoints} 
                              ({((response.score / response.totalPossiblePoints) * 100).toFixed(1)}%)
                            </span>
                          ) : (
                            'Not scored'
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  
                  <div className="h-px bg-border my-6"></div>
                  
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium">Responses</h3>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {questionOrder.map((fieldKey) => {
                        const match = fieldKey.match(/custom(String|Text|Int|Checkbox)(\d+)/);
                        if (!match) return null;
                        
                        const [_, fieldType, fieldNumber] = match;
                        const questionKey = `custom${fieldType}${fieldNumber}Question`;
                        const question = template?.[questionKey];
                        
                        if (!question) return null;
                        
                        return (
                          <div key={fieldKey} className="border rounded-md p-4">
                            <div className="font-medium mb-2">{question}</div>
                            <div className="text-foreground">
                              {renderAnswer(fieldType, parseInt(fieldNumber))}
                            </div>
                          </div>
                        );
                      })}
                      
                      {questionOrder.length === 0 && (
                        <>
                          {['String', 'Text', 'Int', 'Checkbox'].map(fieldType => {
                            return [...Array(4)].map((_, i) => {
                              const questionNumber = i + 1;
                              const questionKey = `custom${fieldType}${questionNumber}Question`;
                              const question = template?.[questionKey];
                              const stateKey = `custom${fieldType}${questionNumber}State`;
                              
                              if (!template?.[stateKey] || !question) return null;
                              
                              return (
                                <div key={`${fieldType}${questionNumber}`} className="border rounded-md p-4">
                                  <div className="font-medium mb-2">{question}</div>
                                  <div className="text-foreground">
                                    {renderAnswer(fieldType, questionNumber)}
                                  </div>
                                </div>
                              );
                            });
                          })}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="p-6 text-center">
            <p className="text-lg text-muted-foreground">Response not found or you don't have permission to view it.</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => router.push('/admin/responses')}
            >
              Back to all responses
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
