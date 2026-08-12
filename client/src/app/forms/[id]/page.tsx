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
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Share2,
  CheckCircle2,
  Loader2,
  Clock,
  Sparkles,
  QrCode,
  Copy,
  Check,
  AlertCircle
} from 'lucide-react';
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
  timeLimitMinutes?: number;
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
  const [copiedLink, setCopiedLink] = useState(false);

  // Timer State for Timed Quizzes
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/templates/${id}`);
        const data = response.data;
        setTemplate(data);

        // Set up Countdown Timer if timed quiz
        if (data.isQuiz && data.timeLimitMinutes && data.timeLimitMinutes > 0) {
          setTimeLeftSeconds(data.timeLimitMinutes * 60);
        }
      } catch (err: any) {
        console.error('Error fetching template:', err);
        setError(err.response?.data?.message || 'Failed to load form. It may be private or unavailable.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTemplate();
    }
  }, [id]);

  // Countdown Timer Interval
  useEffect(() => {
    if (timeLeftSeconds === null || submitted || submitting) return;

    if (timeLeftSeconds <= 0) {
      toast({
        title: "⏱️ Time is Up!",
        description: "Your timer has expired. Auto-submitting your answers now...",
        variant: "destructive",
      });
      autoSubmitForm();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeftSeconds, submitted, submitting]);

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
    setAnswers((prev) => ({
      ...prev,
      [questionKey]: value,
    }));
  };

  const autoSubmitForm = async () => {
    if (submitting || submitted) return;
    await submitFormPayload();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Login required",
        description: "Please sign in to submit your response.",
        variant: "destructive",
      });
      router.push(`/auth/login?redirect=/forms/${id}`);
      return;
    }
    await submitFormPayload();
  };

  const submitFormPayload = async () => {
    setSubmitting(true);
    try {
      const questions = getQuestions();
      const responseData: Record<string, any> = {
        templateId: id,
      };

      questions.forEach((q) => {
        const answerField = `${q.fieldType}${q.fieldIndex}Answer`;
        const value = answers[q.key];

        if (q.fieldType === 'customInt') {
          responseData[answerField] = value !== undefined && value !== '' ? Number(value) : 0;
        } else if (q.fieldType === 'customCheckbox') {
          responseData[answerField] = Boolean(value);
        } else {
          responseData[answerField] = value || '';
        }
      });

      await apiClient.post('/responses', responseData);
      setSubmitted(true);
      toast({
        title: "Response Recorded!",
        description: "Your submission was saved successfully.",
      });
    } catch (err: any) {
      console.error('Error submitting form:', err);
      toast({
        title: "Submission failed",
        description: err.response?.data?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const questions = getQuestions();
  const answeredCount = questions.filter(q => {
    const val = answers[q.key];
    return val !== undefined && val !== '' && val !== false;
  }).length;
  const progressPercent = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(currentUrl)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    toast({ title: "Link Copied!", description: "Shareable link copied to clipboard." });
    setTimeout(() => setCopiedLink(false), 3000);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600 mb-2" />
        <p className="text-sm text-muted-foreground">Loading form...</p>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Card className="max-w-md w-full text-center p-6 space-y-4">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="text-xl font-bold">Unable to Open Form</h2>
          <p className="text-sm text-muted-foreground">{error || 'Template not found'}</p>
          <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
        </Card>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/20">
        <Card className="max-w-md w-full text-center p-8 space-y-6 shadow-xl border-emerald-500/30">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Response Recorded!</h2>
            <p className="text-sm text-muted-foreground">
              Thank you for completing <span className="font-semibold text-foreground">{template.title}</span>.
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => { setSubmitted(false); setAnswers({}); }}>
              Submit Another Response
            </Button>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background py-8 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Top Floating Timer for Timed Quizzes */}
        {timeLeftSeconds !== null && (
          <div className={`sticky top-4 z-50 p-4 rounded-xl shadow-lg border backdrop-blur-md flex items-center justify-between transition-all ${
            timeLeftSeconds < 60 ? 'bg-red-600 text-white border-red-500 animate-pulse' : 'bg-card/95 border-purple-500/40 text-foreground'
          }`}>
            <div className="flex items-center gap-2 font-medium">
              <Clock className="h-5 w-5" />
              <span>Quiz Countdown Timer</span>
            </div>
            <div className="font-mono text-xl font-bold tracking-widest">
              {formatTime(timeLeftSeconds)}
            </div>
          </div>
        )}

        {/* Form Card Header */}
        <Card className="shadow-lg border-t-4 border-t-purple-600">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight">{template.title}</CardTitle>
                <CardDescription className="text-base mt-2">{template.description || 'No description provided.'}</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-1.5" />
                    Share
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md text-center">
                  <DialogHeader>
                    <DialogTitle className="text-xl">Share Form & QR Code</DialogTitle>
                    <DialogDescription>Scan QR code or copy share link to send this form</DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col items-center justify-center p-4 space-y-4">
                    <img src={qrCodeUrl} alt="Form QR Code" className="h-48 w-48 border p-2 rounded-xl shadow-sm" />
                    <div className="flex gap-2 w-full">
                      <Input value={currentUrl} readOnly className="font-mono text-xs" />
                      <Button onClick={handleCopyLink} className="shrink-0">
                        {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {/* Completion Progress Bar */}
            <div className="pt-4 space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>Progress: {answeredCount} of {questions.length} answered</span>
                <span>{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          </CardHeader>
        </Card>

        {/* Form Questions List */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {questions.map((q, idx) => (
            <Card key={q.key} className="shadow-sm">
              <CardContent className="pt-6 space-y-3">
                <Label className="text-base font-semibold flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-purple-500/10 text-purple-600 font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  {q.questionText}
                </Label>

                {q.fieldType === 'customString' && (
                  <Input
                    placeholder="Your answer..."
                    value={answers[q.key] || ''}
                    onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                  />
                )}

                {q.fieldType === 'customText' && (
                  <Textarea
                    placeholder="Your detailed answer..."
                    rows={4}
                    value={answers[q.key] || ''}
                    onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                  />
                )}

                {q.fieldType === 'customInt' && (
                  <Input
                    type="number"
                    placeholder="Enter a number..."
                    value={answers[q.key] ?? ''}
                    onChange={(e) => handleAnswerChange(q.key, e.target.value)}
                  />
                )}

                {q.fieldType === 'customCheckbox' && (
                  <div className="flex items-center space-x-3 pt-2">
                    <Switch
                      checked={!!answers[q.key]}
                      onCheckedChange={(val) => handleAnswerChange(q.key, val)}
                    />
                    <span className="text-sm font-medium">
                      {answers[q.key] ? 'Yes / Checked' : 'No / Unchecked'}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              disabled={submitting}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-purple-500/20"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Form Response'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
