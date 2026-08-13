"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { adminService } from "@/lib/api/admin-service";
import { FormResponse } from "@/types";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { useAuth } from "@/contexts/auth-context";
import {
  ChevronLeft, Download, Edit3, Save, X, Trash2,
  FileSpreadsheet, FileJson, Calendar,
  HelpCircle, CheckSquare, Hash, AlignLeft, Type, Shield
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';

export default function ResponseDetailPage() {
  const params = useParams();
  const id = params ? params.id as string : '';
  
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;
  
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState<FormResponse | null>(null);
  const [template, setTemplate] = useState<any>(null);
  const [questionOrder, setQuestionOrder] = useState<string[]>([]);
  
  // Editor state
  const [isEditing, setIsEditing] = useState(false);
  const [editAnswers, setEditAnswers] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
        const data = await adminService.getFormResponseById(id);
        setResponse(data);
        initializeEditState(data);
        
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

  const initializeEditState = (data: FormResponse) => {
    const answers: Record<string, any> = {};
    for (let i = 1; i <= 4; i++) {
      answers[`customString${i}Answer`] = data[`customString${i}Answer` as keyof FormResponse] ?? '';
      answers[`customText${i}Answer`] = data[`customText${i}Answer` as keyof FormResponse] ?? '';
      answers[`customInt${i}Answer`] = data[`customInt${i}Answer` as keyof FormResponse] ?? '';
      answers[`customCheckbox${i}Answer`] = Boolean(data[`customCheckbox${i}Answer` as keyof FormResponse]);
    }
    if (data.score !== undefined) {
      answers.score = data.score;
    }
    setEditAnswers(answers);
  };

  const handleSave = async () => {
    if (!response) return;
    try {
      setSaving(true);
      const updatePayload: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(editAnswers)) {
        if (key.includes('Int') && value !== '') {
          updatePayload[key] = isNaN(Number(value)) ? null : Number(value);
        } else if (key === 'score' && value !== '') {
          updatePayload[key] = Number(value);
        } else {
          updatePayload[key] = value;
        }
      }

      const updated = await adminService.updateFormResponse(id, updatePayload);
      setResponse(updated);
      setIsEditing(false);
      toast({
        title: "Response updated",
        description: "Form response data has been saved successfully.",
      });
    } catch (error) {
      console.error('Error updating response:', error);
      toast({
        title: "Update failed",
        description: "Failed to save response edits. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!response) return;
    try {
      setDeleting(true);
      await adminService.deleteFormResponse(response.id);
      toast({
        title: "Response deleted",
        description: "The response was permanently removed.",
      });
      router.push('/admin/responses');
    } catch (error) {
      console.error('Error deleting response:', error);
      toast({
        title: "Deletion failed",
        description: "Failed to delete response. Please try again.",
        variant: "destructive"
      });
      setDeleting(false);
    }
  };

  const handleExportJSON = () => {
    if (!response) return;
    const exportData = {
      id: response.id,
      template: {
        id: template?.id,
        title: template?.title,
      },
      user: {
        id: response.user?.id,
        name: response.user?.name,
        email: response.user?.email,
      },
      submittedAt: response.createdAt,
      updatedAt: response.updatedAt,
      score: response.score,
      answers: editAnswers
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response_${response.id.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported JSON", description: "Response file downloaded successfully." });
  };

  const handleExportCSV = () => {
    if (!response) return;
    const rows = [
      ["Field", "Question", "Answer"],
      ["Submission ID", "UUID", response.id],
      ["Template", "Title", template?.title || "Unknown"],
      ["Respondent", "Name", response.user?.name || "Anonymous"],
      ["Respondent Email", "Email", response.user?.email || "N/A"],
      ["Submitted At", "Timestamp", response.createdAt],
    ];

    ['String', 'Text', 'Int', 'Checkbox'].forEach(fieldType => {
      for (let i = 1; i <= 4; i++) {
        const questionKey = `custom${fieldType}${i}Question`;
        const answerKey = `custom${fieldType}${i}Answer`;
        const question = template?.[questionKey];
        if (question) {
          const answer = response[answerKey as keyof FormResponse];
          rows.push([`${fieldType} ${i}`, question, answer !== undefined && answer !== null ? String(answer) : '']);
        }
      }
    });

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = encodedUri;
    a.download = `response_${response.id.slice(0, 8)}.csv`;
    a.click();
    toast({ title: "Exported CSV", description: "Response exported to spreadsheet CSV." });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderFieldIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'String': return <Type className="h-4 w-4 text-cyan-500" />;
      case 'Text': return <AlignLeft className="h-4 w-4 text-indigo-500" />;
      case 'Int': return <Hash className="h-4 w-4 text-amber-500" />;
      case 'Checkbox': return <CheckSquare className="h-4 w-4 text-emerald-500" />;
      default: return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const renderAnswerContent = (fieldType: string, questionNumber: number) => {
    const answerKey = `custom${fieldType}${questionNumber}Answer`;
    
    if (isEditing) {
      if (fieldType === 'Checkbox') {
        return (
          <div className="flex items-center space-x-3 pt-1">
            <Switch
              checked={Boolean(editAnswers[answerKey])}
              onCheckedChange={(checked) => setEditAnswers(prev => ({ ...prev, [answerKey]: checked }))}
            />
            <span className="text-sm font-medium">
              {editAnswers[answerKey] ? 'Checked / Yes' : 'Unchecked / No'}
            </span>
          </div>
        );
      }

      if (fieldType === 'Text') {
        return (
          <Textarea
            rows={3}
            value={editAnswers[answerKey] ?? ''}
            onChange={(e) => setEditAnswers(prev => ({ ...prev, [answerKey]: e.target.value }))}
            placeholder="Enter answer text..."
            className="w-full mt-1"
          />
        );
      }

      if (fieldType === 'Int') {
        return (
          <Input
            type="number"
            value={editAnswers[answerKey] ?? ''}
            onChange={(e) => setEditAnswers(prev => ({ ...prev, [answerKey]: e.target.value }))}
            placeholder="Enter numeric value..."
            className="w-full mt-1"
          />
        );
      }

      return (
        <Input
          type="text"
          value={editAnswers[answerKey] ?? ''}
          onChange={(e) => setEditAnswers(prev => ({ ...prev, [answerKey]: e.target.value }))}
          placeholder="Enter answer..."
          className="w-full mt-1"
        />
      );
    }

    // View Mode
    const answer = response?.[answerKey as keyof FormResponse];
    if (answer === undefined || answer === null || answer === '') {
      return <span className="text-xs text-muted-foreground italic">No response submitted for this field</span>;
    }
    
    if (typeof answer === 'boolean') {
      return (
        <Badge variant={answer ? "default" : "outline"} className={answer ? "bg-emerald-600 hover:bg-emerald-700" : ""}>
          {answer ? 'True / Yes' : 'False / No'}
        </Badge>
      );
    }
    
    return <p className="text-sm leading-relaxed whitespace-pre-wrap">{String(answer)}</p>;
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6 max-w-5xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push('/admin/responses')}
            className="w-fit -ml-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to All Responses
          </Button>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="gap-1.5"
                >
                  <Edit3 className="h-4 w-4 text-cyan-500" />
                  <span>Edit Response</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <Download className="h-4 w-4" />
                      <span>Export</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Export Format</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleExportCSV}>
                      <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-500" />
                      <span>CSV Spreadsheet</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportJSON}>
                      <FileJson className="mr-2 h-4 w-4 text-indigo-500" />
                      <span>JSON Data</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (response) initializeEditState(response);
                    setIsEditing(false);
                  }}
                  disabled={saving}
                  className="gap-1.5"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </Button>
                <Button 
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                  className="gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white font-medium"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : response ? (
          <>
            {/* Title & Status Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-950 text-white shadow-sm border">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-300 border-none font-mono text-xs">
                    Submission #{response.id.slice(0, 8)}
                  </Badge>
                  {isEditing && (
                    <Badge className="bg-amber-500 text-black font-semibold animate-pulse">
                      Edit Mode Active
                    </Badge>
                  )}
                </div>
                <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                  {template?.title || 'Form Submission'}
                </h1>
                <p className="text-sm text-neutral-400 mt-0.5">
                  Submitted by {response.user?.name || 'Anonymous'} ({response.user?.email || 'No email'})
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-xs">
                <div className="flex items-center gap-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                  <Calendar className="h-4 w-4 text-cyan-400" />
                  <div>
                    <span className="text-neutral-400 block">Submitted</span>
                    <span className="font-medium text-white">{formatDate(response.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="rounded-xl">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Target Template</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="font-semibold text-sm truncate">{template?.title || 'Unknown'}</p>
                  {template?.id && (
                    <Link 
                      href={`/templates/${template.id}`} 
                      className="text-xs text-cyan-500 hover:underline inline-flex items-center gap-1 mt-1"
                    >
                      View Live Template →
                    </Link>
                  )}
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Respondent Profile</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="font-semibold text-sm truncate">{response.user?.name || 'Anonymous User'}</p>
                  <p className="text-xs text-muted-foreground truncate">{response.user?.email || 'N/A'}</p>
                </CardContent>
              </Card>

              <Card className="rounded-xl">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">Audit & Governance</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs font-medium">Admin Verified</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 font-mono truncate">{response.id}</p>
                </CardContent>
              </Card>
            </div>

            {/* Response Content Editor & Viewer */}
            <Card className="rounded-2xl shadow-sm border">
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Form Submission Answers</CardTitle>
                    <CardDescription>
                      {isEditing ? 'Directly edit submitted form values and update record' : 'Review submitted form fields and responses'}
                    </CardDescription>
                  </div>
                  {template?.isQuiz && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-medium">Quiz Score:</span>
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editAnswers.score ?? ''}
                          onChange={(e) => setEditAnswers(prev => ({ ...prev, score: e.target.value }))}
                          className="w-24 h-8 text-sm"
                          placeholder="Score"
                        />
                      ) : (
                        <Badge variant="outline" className="text-sm font-bold bg-amber-500/10 text-amber-600 border-amber-500/30">
                          {response.score ?? 'N/A'} Points
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Order based on questionOrder if available */}
                  {questionOrder.length > 0 ? (
                    questionOrder.map((fieldKey) => {
                      const match = fieldKey.match(/custom(String|Text|Int|Checkbox)(\d+)/);
                      if (!match) return null;
                      
                      const [_, fieldType, fieldNumber] = match;
                      const questionKey = `custom${fieldType}${fieldNumber}Question`;
                      const question = template?.[questionKey];
                      
                      if (!question) return null;
                      
                      return (
                        <div key={fieldKey} className="p-4 rounded-xl border bg-card hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                          <div className="flex items-center gap-2 mb-2">
                            {renderFieldIcon(fieldType)}
                            <span className="font-semibold text-sm">{question}</span>
                            <Badge variant="outline" className="text-[10px] ml-auto">
                              {fieldType}
                            </Badge>
                          </div>
                          <div className="pt-1">
                            {renderAnswerContent(fieldType, parseInt(fieldNumber))}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* Fallback all question slots */
                    ['String', 'Text', 'Int', 'Checkbox'].map(fieldType => {
                      return [...Array(4)].map((_, i) => {
                        const questionNumber = i + 1;
                        const questionKey = `custom${fieldType}${questionNumber}Question`;
                        const question = template?.[questionKey];
                        const stateKey = `custom${fieldType}${questionNumber}State`;
                        
                        if (!template?.[stateKey] || !question) return null;
                        
                        return (
                          <div key={`${fieldType}${questionNumber}`} className="p-4 rounded-xl border bg-card hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                              {renderFieldIcon(fieldType)}
                              <span className="font-semibold text-sm">{question}</span>
                              <Badge variant="outline" className="text-[10px] ml-auto">
                                {fieldType}
                              </Badge>
                            </div>
                            <div className="pt-1">
                              {renderAnswerContent(fieldType, questionNumber)}
                            </div>
                          </div>
                        );
                      });
                    })
                  )}
                </div>
              </CardContent>
              {isEditing && (
                <CardFooter className="flex justify-end gap-3 border-t p-4 bg-muted/20">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      if (response) initializeEditState(response);
                      setIsEditing(false);
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white font-medium gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? 'Saving...' : 'Save Response'}</span>
                  </Button>
                </CardFooter>
              )}
            </Card>
          </>
        ) : (
          <div className="p-12 text-center border rounded-2xl bg-card">
            <h3 className="text-lg font-bold">Response Not Found</h3>
            <p className="text-muted-foreground mt-1 text-sm">The requested form submission does not exist or was deleted.</p>
            <Button 
              variant="default" 
              className="mt-4" 
              onClick={() => router.push('/admin/responses')}
            >
              Back to Responses
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Permanently Delete Response?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This response record and all its submitted answers will be permanently deleted from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {deleting ? 'Deleting...' : 'Delete Response'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
