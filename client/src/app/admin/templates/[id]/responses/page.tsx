"use client";

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { AdminLayout } from "@/components/layouts/admin-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Link from "next/link";
import { ArrowLeft, Eye, Download, FileText, Trash2, Edit2, CheckCircle2, Award, Users } from "lucide-react";
import { adminService } from "@/lib/api/admin-service";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/components/ui/use-toast";
import { formatDate } from '@/lib/utils';
import { FormResponse } from '@/types';

interface TemplateResponsesPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AdminTemplateResponsesPage({ params }: TemplateResponsesPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;

  const [template, setTemplate] = useState<any>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteResponseId, setDeleteResponseId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (auth?.status === "loading") return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!user.isAdmin) {
      router.push("/dashboard");
      return;
    }

    fetchTemplateAndResponses();
  }, [user, id, auth?.status, router]);

  const fetchTemplateAndResponses = async () => {
    try {
      setLoading(true);
      const [templateData, responsesData] = await Promise.all([
        adminService.getTemplateById(id).catch(() => null),
        adminService.getFormResponsesByTemplate(id).catch(() => []),
      ]);

      setTemplate(templateData);
      setResponses(Array.isArray(responsesData) ? responsesData : []);
    } catch (error) {
      console.error("Error fetching template and responses:", error);
      toast({
        title: "Error",
        description: "Failed to load template responses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteResponse = async () => {
    if (!deleteResponseId) return;
    try {
      setDeleting(true);
      await adminService.deleteFormResponse(deleteResponseId);
      setResponses(prev => prev.filter(r => r.id !== deleteResponseId));
      toast({ title: "Response Deleted", description: "Form submission has been removed." });
      setDeleteResponseId(null);
    } catch (error) {
      console.error("Failed to delete response:", error);
      toast({ title: "Delete Failed", description: "Failed to delete submission.", variant: "destructive" });
    } finally {
      setDeleting(false);
    }
  };

  const exportToCSV = () => {
    if (!responses.length || !template) {
      toast({ title: "No data", description: "No responses available to export", variant: "destructive" });
      return;
    }

    const headers = ["Submission ID", "Respondent Name", "Respondent Email", "Submitted Date"];
    if (template.isQuiz) {
      headers.push("Score", "Total Points", "Percentage");
    }

    const rows = responses.map(r => {
      const row = [
        r.id,
        r.user?.name || "Anonymous",
        r.user?.email || "N/A",
        formatDate(r.createdAt),
      ];
      if (template.isQuiz) {
        row.push(
          String(r.score ?? 0),
          String(r.totalPossiblePoints ?? 0),
          `${r.totalPossiblePoints ? Math.round(((r.score || 0) / r.totalPossiblePoints) * 100) : 0}%`
        );
      }
      return row;
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement("a");
    a.href = encodedUri;
    a.download = `${template.title.replace(/\s+/g, '_')}_responses.csv`;
    a.click();
    toast({ title: "Exported CSV", description: "Responses exported to CSV." });
  };

  const avgScore = responses.length && template?.isQuiz
    ? (responses.reduce((sum, r) => sum + (r.score || 0), 0) / responses.length).toFixed(1)
    : null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/admin/templates")} className="-ml-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Templates
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                {template?.title || "Template Submissions"}
              </h1>
              <p className="text-muted-foreground text-xs mt-0.5">
                Admin response inspection and auditing console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={exportToCSV}
              disabled={!responses.length}
              className="gap-1.5"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV ({responses.length})</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              asChild
              className="gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              <Link href={`/templates/${id}/edit`}>
                <Edit2 className="h-4 w-4" />
                <span>Edit Template</span>
              </Link>
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">Total Responses</p>
                <p className="text-2xl font-bold mt-1">{responses.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          {template?.isQuiz ? (
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Average Quiz Score</p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">{avgScore} pts</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Award className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-medium">Form Type</p>
                  <p className="text-base font-bold mt-1">Standard Questionnaire</p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                  <FileText className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">Status</p>
                <p className="text-sm font-bold text-emerald-600 mt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  Live & Accepting Submissions
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Responses Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Submissions Log ({responses.length})</CardTitle>
            <CardDescription>
              All recorded responses for this template
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : responses.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-40 mb-3" />
                <p className="text-muted-foreground font-medium">No responses recorded yet</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Respondent</TableHead>
                      <TableHead>Submitted At</TableHead>
                      {template?.isQuiz && <TableHead>Score</TableHead>}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {responses.map((response) => (
                      <TableRow key={response.id}>
                        <TableCell>
                          <div className="font-semibold text-sm">
                            {response.user?.name || "Anonymous Respondent"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {response.user?.email || "No email"}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatDate(response.createdAt)}
                        </TableCell>
                        {template?.isQuiz && (
                          <TableCell>
                            {response.score !== undefined ? (
                              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/30">
                                {response.score} / {response.totalPossiblePoints || 0} pts
                              </Badge>
                            ) : (
                              <span className="text-xs text-muted-foreground">Unscored</span>
                            )}
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button asChild variant="outline" size="sm" className="gap-1 text-xs">
                              <Link href={`/admin/responses/${response.id}`}>
                                <Eye className="h-3.5 w-3.5" />
                                <span>Inspect / Edit</span>
                              </Link>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteResponseId(response.id)}
                              className="gap-1 text-xs"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Dialog */}
        <AlertDialog open={!!deleteResponseId} onOpenChange={(open) => !open && setDeleteResponseId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Submission?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently delete this form response? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteResponse}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? "Deleting..." : "Delete Submission"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
