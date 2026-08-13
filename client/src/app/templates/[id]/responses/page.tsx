"use client";

import React, { useEffect, useState, use } from 'react';
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { templateService } from "@/lib/api/template-service";
import { formResponseService, FormResponseData } from "@/lib/api/form-response-service";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronLeft, BarChart2, Users, Download, Printer, Search,
  CheckCircle, HelpCircle, Award, FileSpreadsheet, FileJson,
  Hash, Type, AlignLeft, CheckSquare
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/components/ui/use-toast";
import {
  Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShareAndEmbedDialog } from "@/components/forms/share-and-embed-dialog";
import Link from "next/link";

interface ResponsesPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TemplateResponsesPage({ params }: ResponsesPageProps) {
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<any>(null);
  const [responses, setResponses] = useState<FormResponseData[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<FormResponseData[]>([]);
  const [aggregateData, setAggregateData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;
  
  const templateId = use(params).id;

  const handleLogout = async () => {
    if (auth?.logout) {
      await auth.logout();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const templateData = await templateService.getTemplateById(templateId);
        setTemplate(templateData);
  
        if (templateData && templateData.userId !== user?.id && !user?.isAdmin) {
          toast({
            title: "Access denied",
            description: "You don't have permission to view responses for this template.",
            variant: "destructive"
          });
          router.push(`/templates/${templateId}`);
          return;
        }

        if (templateData) {
          const [responsesData, aggregateStats] = await Promise.all([
            formResponseService.getResponsesByTemplateId(templateId).catch(() => []),
            formResponseService.getAggregateData(templateId).catch(() => null)
          ]);

          setResponses(responsesData || []);
          setFilteredResponses(responsesData || []);
          setAggregateData(aggregateStats);
        } else {
          toast({
            title: "Template not found",
            description: "The requested template could not be found.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load responses. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    } else {
      router.push('/auth/login');
    }
  }, [templateId, user, router]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredResponses(responses);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredResponses(
        responses.filter(r =>
          r.user?.name?.toLowerCase().includes(q) ||
          r.user?.email?.toLowerCase().includes(q) ||
          r.id.toLowerCase().includes(q)
        )
      );
    }
  }, [searchQuery, responses]);

  function formatDate(dateString: string | undefined) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function exportToCSV() {
    if (!responses.length) return;
  
    const fields = new Set<string>();
    responses.forEach(response => {
      Object.keys(response).forEach(key => {
        if (!['id', 'templateId', 'userId', 'createdAt', 'updatedAt', 'template', 'user'].includes(key)) {
          fields.add(key);
        }
      });
    });
    
    const headers = ['Response ID', 'Respondent Name', 'Respondent Email', 'Submitted Date', ...Array.from(fields)];

    const rows = responses.map(response => {
      const row: any[] = [
        response.id,
        response.user?.name || 'Anonymous',
        response.user?.email || 'N/A',
        formatDate(response.createdAt),
      ];
      
      Array.from(fields).forEach(field => {
        const value = response[field as keyof FormResponseData];
        row.push(value !== undefined && value !== null ? value : '');
      });
      
      return row;
    });
    
    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${template?.title || 'template'}-responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ title: "Exported CSV", description: "All responses downloaded as CSV spreadsheet." });
  }

  function exportToJSON() {
    if (!responses.length) return;
    const exportData = {
      templateId,
      templateTitle: template?.title,
      exportedAt: new Date().toISOString(),
      totalResponses: responses.length,
      responses
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template?.title || 'template'}-responses.json`;
    link.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exported JSON", description: "All responses downloaded as JSON." });
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  // Calculate question summary breakdowns
  const getQuestionBreakdown = () => {
    if (!template || !responses.length) return [];
    const questions: any[] = [];

    ['String', 'Text', 'Int', 'Checkbox'].forEach(type => {
      for (let i = 1; i <= 4; i++) {
        const qKey = `custom${type}${i}Question`;
        const stateKey = `custom${type}${i}State`;
        const ansKey = `custom${type}${i}Answer` as keyof FormResponseData;
        
        if (template[stateKey] && template[qKey]) {
          const answers = responses.map(r => r[ansKey]).filter(v => v !== undefined && v !== null && v !== '');
          
          if (type === 'Checkbox') {
            const trueCount = answers.filter(Boolean).length;
            const percentage = Math.round((trueCount / responses.length) * 100);
            questions.push({
              title: template[qKey],
              type,
              responseCount: answers.length,
              trueCount,
              percentage,
            });
          } else if (type === 'Int') {
            const numAnswers = answers.map(Number).filter(n => !isNaN(n));
            const avg = numAnswers.length ? (numAnswers.reduce((a, b) => a + b, 0) / numAnswers.length).toFixed(1) : 'N/A';
            const min = numAnswers.length ? Math.min(...numAnswers) : 'N/A';
            const max = numAnswers.length ? Math.max(...numAnswers) : 'N/A';
            questions.push({
              title: template[qKey],
              type,
              responseCount: answers.length,
              avg,
              min,
              max,
            });
          } else {
            questions.push({
              title: template[qKey],
              type,
              responseCount: answers.length,
              recentSample: answers.slice(0, 3).map(String),
            });
          }
        }
      }
    });

    return questions;
  };

  const questionBreakdowns = getQuestionBreakdown();

  return (
    <DashboardLayout 
      user={{
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }}
      onLogout={handleLogout}
    >
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/templates/${templateId}`)} className="-ml-2">
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Template
          </Button>
          
          <div className="flex flex-wrap items-center gap-2">
            {template && (
              <ShareAndEmbedDialog
                templateId={templateId}
                title={template.title}
              />
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="gap-1.5"
            >
              <Printer className="h-4 w-4" />
              <span>Print Report</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="default" size="sm" disabled={!responses.length} className="gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white">
                  <Download className="h-4 w-4" />
                  <span>Export ({responses.length})</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToCSV}>
                  <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-500" />
                  <span>Export as CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToJSON}>
                  <FileJson className="mr-2 h-4 w-4 text-indigo-500" />
                  <span>Export as JSON</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-950 text-white border shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-cyan-500/20 text-cyan-300 border-none text-xs">
                  Analytics & Ingestion Hub
                </Badge>
                {template?.isQuiz && (
                  <Badge className="bg-amber-500/20 text-amber-300 border-none text-xs">
                    Graded Quiz
                  </Badge>
                )}
              </div>
              <h1 className="text-xl md:text-2xl font-bold">
                {template?.title || 'Form Responses'}
              </h1>
              <p className="text-sm text-neutral-400 mt-1">
                Real-time submission analytics, question distribution, and respondent log
              </p>
            </div>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="text-right">
                <span className="text-xs text-neutral-400 block">Total Submissions</span>
                <span className="text-2xl font-bold text-cyan-400">{responses.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Total Submissions</span>
              <p className="text-2xl font-bold mt-1">{responses.length}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Recorded responses</p>
            </CardContent>
          </Card>

          {template?.isQuiz && (
            <Card>
              <CardContent className="p-5">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Average Score</span>
                <p className="text-2xl font-bold text-amber-600 mt-1">
                  {aggregateData?.avg_score !== undefined && aggregateData?.avg_score !== null
                    ? `${Math.round(aggregateData.avg_score * 10) / 10}`
                    : 'N/A'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Out of total points</p>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Unique Respondents</span>
              <p className="text-2xl font-bold text-emerald-600 mt-1">
                {new Set(responses.map(r => r.userId || r.user?.email || r.id)).size}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Distinct user profiles</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <span className="text-xs font-semibold text-muted-foreground uppercase">Latest Ingestion</span>
              <p className="text-sm font-bold mt-2 truncate">
                {responses.length > 0 ? formatDate(responses[0].createdAt) : 'No submissions yet'}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Real-time sync</p>
            </CardContent>
          </Card>
        </div>

        {/* Question Analytics Breakdown */}
        {questionBreakdowns.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-cyan-500" />
                Question Response Breakdown & Analytics
              </CardTitle>
              <CardDescription>
                Aggregated distribution and response rates across all question fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {questionBreakdowns.map((qb, idx) => (
                  <div key={idx} className="p-4 rounded-xl border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-medium text-sm">
                        {qb.type === 'Checkbox' && <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0" />}
                        {qb.type === 'Int' && <Hash className="h-4 w-4 text-amber-500 shrink-0" />}
                        {qb.type === 'String' && <Type className="h-4 w-4 text-cyan-500 shrink-0" />}
                        {qb.type === 'Text' && <AlignLeft className="h-4 w-4 text-indigo-500 shrink-0" />}
                        <span className="truncate">{qb.title}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0">
                        {qb.responseCount} answers
                      </Badge>
                    </div>

                    {qb.type === 'Checkbox' && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Affirmative (Yes / True)</span>
                          <span className="font-semibold text-foreground">{qb.percentage}% ({qb.trueCount})</span>
                        </div>
                        <Progress value={qb.percentage} className="h-2" />
                      </div>
                    )}

                    {qb.type === 'Int' && (
                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div className="p-2 rounded bg-background border">
                          <span className="text-[10px] text-muted-foreground block">Average</span>
                          <span className="font-bold text-sm text-cyan-600">{qb.avg}</span>
                        </div>
                        <div className="p-2 rounded bg-background border">
                          <span className="text-[10px] text-muted-foreground block">Minimum</span>
                          <span className="font-semibold text-sm">{qb.min}</span>
                        </div>
                        <div className="p-2 rounded bg-background border">
                          <span className="text-[10px] text-muted-foreground block">Maximum</span>
                          <span className="font-semibold text-sm">{qb.max}</span>
                        </div>
                      </div>
                    )}

                    {(qb.type === 'String' || qb.type === 'Text') && qb.recentSample && (
                      <div className="pt-1 space-y-1">
                        <span className="text-[11px] text-muted-foreground">Recent Submissions:</span>
                        <div className="flex flex-wrap gap-1">
                          {qb.recentSample.map((sample: string, sIdx: number) => (
                            <Badge key={sIdx} variant="secondary" className="text-xs truncate max-w-[200px]">
                              "{sample}"
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Responses Log Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-500" />
                  Respondent Submissions Log ({filteredResponses.length})
                </CardTitle>
                <CardDescription>Detailed individual response entries</CardDescription>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search respondent name or email..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredResponses.length > 0 ? (
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Respondent</TableHead>
                      <TableHead>Date Submitted</TableHead>
                      {template?.isQuiz && <TableHead>Quiz Score</TableHead>}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredResponses.map((response) => (
                      <TableRow key={response.id}>
                        <TableCell>
                          <div className="font-semibold text-sm">
                            {response.user?.name || 'Anonymous User'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {response.user?.email || 'No email registered'}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(response.createdAt)}
                        </TableCell>
                        {template?.isQuiz && (
                          <TableCell>
                            {response.score !== undefined && response.totalPossiblePoints !== undefined ? (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30 font-bold">
                                {response.score} / {response.totalPossiblePoints} pts
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Unscored</span>
                            )}
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <Button asChild variant="outline" size="sm" className="text-xs">
                            <Link href={`/admin/responses/${response.id}`}>
                              View / Edit Response
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground opacity-40 mb-3" />
                <h3 className="text-base font-semibold">No submissions recorded</h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Share this form link or QR code with respondents to start collecting responses.
                </p>
                {template && (
                  <div className="mt-4">
                    <ShareAndEmbedDialog
                      templateId={templateId}
                      title={template.title}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
