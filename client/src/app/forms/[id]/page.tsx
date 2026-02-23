"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Share2, CheckCircle, Loader2, AlertTriangle, LogIn } from 'lucide-react';
import apiClient from '@/lib/api/api-client';
import { useAuth } from '@/contexts/auth-context';
import { toast } from '@/components/ui/use-toast';

interface FormPageProps {
  params: {
    id: string;
  };
}

interface TemplateData {
  id: string;
  title: string;
  description: string;
  questionOrder: string;
  isQuiz?: boolean;
  [key: string]: any;
}

interface QuestionItem {
  fieldType: string;
  fieldIndex: number;
  questionText: string;
  key: string;
}

export default function PublicFormPage({ params }: FormPageProps) {
  const { id } = params;
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;

  const [template, setTemplate] = useState<TemplateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/templates/${id}`);
        setTemplate(response.data);
      } catch (err) {
        console.error('Error fetching template:', err);
        setError('Failed to load form. It may have been deleted or is not available.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTemplate();
    }
  }, [id]);

  const getQuestions = (): QuestionItem[] => {
    if (!template) return [];

    let questionOrder: string[] = [];
    try {
      if (template.questionOrder && typeof template.questionOrder === 'string') {
        questionOrder = JSON.parse(template.questionOrder);
      }
    } catch {
      questionOrder = [];
    }

    return questionOrder
      .map((questionKey: string) => {
        const fieldType = questionKey.replace(/[0-9]/g, '');
        const fieldIndex = parseInt(questionKey.replace(/[^0-9]/g, ''), 10);
        const stateField = `${fieldType}${fieldIndex}State`;
        const questionField = `${fieldType}${fieldIndex}Question`;

        if (!template[stateField]) return null;

        return {
          fieldType,
          fieldIndex,
          questionText: template[questionField] || `Question ${fieldIndex}`,
          key: questionKey,
        };
      })
      .filter(Boolean) as QuestionItem[];
  };

  const handleAnswerChange = (questionKey: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionKey]: value,
    }));
  };

  const getAnswerFieldName = (fieldType: string, fieldIndex: number): string => {
    return `${fieldType}${fieldIndex}Answer`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to submit this form.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const questions = getQuestions();
      const responseData: Record<string, any> = {
        templateId: id,
      };

      questions.forEach(q => {
        const answerField = getAnswerFieldName(q.fieldType, q.fieldIndex);
        const value = answers[q.key];

        if (q.fieldType === 'customInt') {
          responseData[answerField] = value !== undefined && value !== '' ? Number(value) : 0;
        } else if (q.fieldType === 'customCheckbox') {
          responseData[answerField] = !!value;
        } else {
          responseData[answerField] = value || '';
        }
      });

      await apiClient.post('/responses', responseData);
      setSubmitted(true);
      toast({
        title: "Form submitted",
        description: "Your response has been recorded successfully!",
      });
    } catch (err) {
      console.error('Error submitting form:', err);
      toast({
        title: "Submission failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    toast({
      title: "Link copied",
      description: "Form link has been copied to your clipboard.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading form...</p>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Form Not Found
            </CardTitle>
            <CardDescription>
              {error || 'This form could not be loaded.'}
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

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="max-w-md w-full text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Thank You!</CardTitle>
            <CardDescription>
              Your response has been submitted successfully.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => { setSubmitted(false); setAnswers({}); }}>
              Submit Another Response
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Form
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const questions = getQuestions();

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-2xl">{template.title}</CardTitle>
                {template.description && (
                  <CardDescription className="mt-2 text-base">
                    {template.description}
                  </CardDescription>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
            </div>
            {template.isQuiz && (
              <Badge className="w-fit mt-2">Quiz</Badge>
            )}
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {questions.length > 0 ? (
                questions.map((q, index) => (
                  <div key={q.key} className="space-y-2 p-4 bg-muted/30 rounded-lg border">
                    <Label className="text-base font-medium">
                      {index + 1}. {q.questionText}
                    </Label>

                    {q.fieldType === 'customString' && (
                      <Input
                        placeholder="Your answer"
                        value={answers[q.key] || ''}
                        onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                      />
                    )}

                    {q.fieldType === 'customText' && (
                      <Textarea
                        placeholder="Your answer"
                        value={answers[q.key] || ''}
                        onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                        rows={4}
                      />
                    )}

                    {q.fieldType === 'customInt' && (
                      <Input
                        type="number"
                        placeholder="Enter a number"
                        value={answers[q.key] ?? ''}
                        onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                      />
                    )}

                    {q.fieldType === 'customCheckbox' && (
                      <div className="flex items-center space-x-3 pt-1">
                        <Switch
                          checked={!!answers[q.key]}
                          onCheckedChange={(checked) => handleAnswerChange(q.key, checked)}
                        />
                        <span className="text-sm text-muted-foreground">
                          {answers[q.key] ? 'Yes' : 'No'}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-6">
                  No questions defined for this form.
                </p>
              )}
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              {user ? (
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={submitting || questions.length === 0}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Response'
                  )}
                </Button>
              ) : (
                <div className="w-full space-y-3">
                  <div className="text-center p-4 bg-muted/50 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground mb-3">
                      You need to be logged in to submit this form.
                    </p>
                    <Button
                      type="button"
                      onClick={() => router.push(`/auth/login?redirect=/forms/${id}`)}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Log in to Submit
                    </Button>
                  </div>
                </div>
              )}
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
