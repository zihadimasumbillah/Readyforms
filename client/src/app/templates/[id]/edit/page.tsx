"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { templateService, TemplateUpdateData } from '@/lib/api/template-service';
import { topicService } from '@/lib/api/topic-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import {
  FileText,
  Save,
  ArrowLeft,
  Clock,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  Lock,
  Globe,
  Loader2,
  Sparkles,
  Settings,
  ListOrdered
} from 'lucide-react';
import { Template, Topic } from '@/types';

export default function EditTemplatePage() {
  const params = useParams();
  const id = params ? (params.id as string) : '';
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;

  const [template, setTemplate] = useState<Template | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [topicId, setTopicId] = useState('');
  const [isQuiz, setIsQuiz] = useState(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(0);

  // Question fields states
  const [questions, setQuestions] = useState<
    { key: string; label: string; type: string; enabled: boolean; text: string }[]
  >([]);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [tplData, topicsData] = await Promise.all([
          templateService.getTemplateById(id),
          topicService.getAllTopics().catch(() => []),
        ]);

        if (tplData) {
          setTemplate(tplData);
          setTitle(tplData.title || '');
          setDescription(tplData.description || '');
          setIsPublic(tplData.isPublic ?? true);
          setTopicId(tplData.topicId || (topicsData[0]?.id || ''));
          setIsQuiz(tplData.isQuiz || false);
          setTimeLimitMinutes(tplData.timeLimitMinutes || 0);

          // Extract question fields
          const extracted: { key: string; label: string; type: string; enabled: boolean; text: string }[] = [];
          
          const types = [
            { typePrefix: 'customString', typeLabel: 'Short Text', count: 4 },
            { typePrefix: 'customText', typeLabel: 'Multi-line Paragraph', count: 4 },
            { typePrefix: 'customInt', typeLabel: 'Number / Integer', count: 4 },
            { typePrefix: 'customCheckbox', typeLabel: 'Checkbox / Yes-No', count: 4 },
          ];

          types.forEach(({ typePrefix, typeLabel, count }) => {
            for (let i = 1; i <= count; i++) {
              const key = `${typePrefix}${i}`;
              const stateKey = `${key}State`;
              const questionKey = `${key}Question`;
              extracted.push({
                key,
                label: `${typeLabel} #${i}`,
                type: typeLabel,
                enabled: Boolean(tplData[stateKey]),
                text: tplData[questionKey] || '',
              });
            }
          });

          setQuestions(extracted);
        }
        setTopics(topicsData);
      } catch (err: any) {
        console.error('Failed to load template:', err);
        toast({
          title: 'Error loading template',
          description: 'Failed to fetch form template details.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadData();
    } else {
      router.push(`/auth/login?redirect=/templates/${id}/edit`);
    }
  }, [id, user, router]);

  const handleToggleQuestion = (index: number) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index].enabled = !copy[index].enabled;
      return copy;
    });
  };

  const handleQuestionTextChange = (index: number, text: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[index].text = text;
      return copy;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast({
        title: 'Title required',
        description: 'Please enter a title for your template.',
        variant: 'destructive',
      });
      return;
    }

    const enabledCount = questions.filter((q) => q.enabled).length;
    if (enabledCount === 0) {
      toast({
        title: 'Form Question Required',
        description: 'Please enable at least one question field in your form.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSaving(true);

      const payload: TemplateUpdateData = {
        title,
        description,
        isPublic,
        topicId: topicId || (topics[0]?.id || ''),
        isQuiz,
        timeLimitMinutes: Number(timeLimitMinutes) || 0,
        version: template?.version || 0,
      };

      const questionOrderArray: string[] = [];

      questions.forEach((q) => {
        const stateKey = `${q.key}State`;
        const questionKey = `${q.key}Question`;
        payload[stateKey] = q.enabled;
        payload[questionKey] = q.text;
        if (q.enabled) {
          questionOrderArray.push(q.key);
        }
      });

      payload.questionOrder = JSON.stringify(questionOrderArray);

      await templateService.updateTemplate(id, payload);

      toast({
        title: 'Template Saved!',
        description: 'Your form template has been updated successfully.',
      });

      router.push(`/templates/${id}`);
    } catch (err: any) {
      console.error('Failed to update template:', err);
      toast({
        title: 'Save Failed',
        description: err.response?.data?.message || 'Failed to update template.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const currentUser = user ? {
    name: user.name || 'User',
    email: user.email || '',
    isAdmin: user.isAdmin || false
  } : { name: 'User', email: '', isAdmin: false };

  if (loading) {
    return (
      <DashboardLayout user={currentUser} onLogout={() => auth?.logout?.()} hideHeader>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={currentUser} onLogout={() => auth?.logout?.()} hideHeader>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push(`/templates/${id}`)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Edit Form Template</h1>
              <p className="text-sm text-muted-foreground">Customize form questions, quiz timer settings, and visibility</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => router.push(`/templates/${id}`)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="questions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="questions" className="flex items-center gap-2">
              <ListOrdered className="h-4 w-4 text-cyan-500" />
              Form Questions ({questions.filter((q) => q.enabled).length} Enabled)
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-indigo-500" />
              Form Settings & Quiz Timer
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Questions Editor */}
          <TabsContent value="questions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Form Fields & Question Builder</CardTitle>
                <CardDescription>
                  Toggle and edit question labels. Enabled questions will be rendered for respondents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {questions.map((q, idx) => (
                  <div
                    key={q.key}
                    className={`p-4 rounded-xl border transition-all ${
                      q.enabled
                        ? 'bg-card border-purple-500/30 shadow-sm'
                        : 'bg-muted/30 border-muted opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={q.enabled ? 'default' : 'outline'} className={q.enabled ? 'bg-purple-600' : ''}>
                          {q.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground font-mono">#{q.key}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{q.enabled ? 'Enabled' : 'Disabled'}</span>
                        <Switch checked={q.enabled} onCheckedChange={() => handleToggleQuestion(idx)} />
                      </div>
                    </div>

                    {q.enabled && (
                      <div className="space-y-2 pt-1">
                        <label className="text-xs font-semibold text-muted-foreground uppercase">Question Label / Prompt</label>
                        <Input
                          value={q.text}
                          onChange={(e) => handleQuestionTextChange(idx, e.target.value)}
                          placeholder={`Enter question for ${q.label}`}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Settings & Quiz Timer */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">General Settings</CardTitle>
                <CardDescription>Update form title, description, topic, and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Form Title</label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
                </div>

                <div className="grid md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Topic / Category</label>
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={topicId}
                      onChange={(e) => setTopicId(e.target.value)}
                    >
                      {topics.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Form Visibility</label>
                    <div className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-2">
                        {isPublic ? <Globe className="h-4 w-4 text-emerald-500" /> : <Lock className="h-4 w-4 text-amber-500" />}
                        <span className="text-sm font-medium">{isPublic ? 'Public Form' : 'Private Form'}</span>
                      </div>
                      <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quiz Mode & Countdown Timer */}
            <Card className="border-purple-500/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-cyan-500" />
                  Quiz Mode & Timed Countdown Assessment
                </CardTitle>
                <CardDescription>
                  Turn this form into an interactive quiz with automatic countdown timer & score calculation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-xl bg-purple-500/5">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-sm">Enable Quiz Assessment Mode</div>
                    <p className="text-xs text-muted-foreground">Calculate score and track completion timers</p>
                  </div>
                  <Switch checked={isQuiz} onCheckedChange={setIsQuiz} />
                </div>

                {isQuiz && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-cyan-500" />
                        Countdown Time Limit (Minutes)
                      </label>
                      <Input
                        type="number"
                        min={0}
                        max={180}
                        value={timeLimitMinutes}
                        onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                        placeholder="0 = No time limit (Unlimited)"
                      />
                      <p className="text-xs text-muted-foreground">
                        Set to e.g. 5, 10, or 15 minutes. When timer expires, respondent's answers are automatically auto-submitted!
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
