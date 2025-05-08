"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { ArrowLeft, Eye, Download, FileText } from "lucide-react";
import { adminService } from "@/lib/api/admin-service";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/components/ui/use-toast";
import { formatDate } from '@/lib/utils';

export default function TemplateResponsesPage() {
  const { id } = useParams();
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const [template, setTemplate] = useState<any>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResponses: 0,
    averageScore: 0,
    completionRate: 0
  });

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

    const fetchTemplateAndResponses = async () => {
      try {
        setLoading(true);
        const templateId = Array.isArray(id) ? id[0] : id;
        
        // Fetch template data
        const templateData = await adminService.getTemplateById(templateId);
        setTemplate(templateData);
        
        // Fetch responses for this template
        const responsesData = await adminService.getFormResponsesByTemplate(templateId);
        setResponses(responsesData);
        
        // Calculate statistics
        if (responsesData && responsesData.length > 0) {
          // For quiz templates, calculate average score
          if (templateData.isQuiz) {
            const totalScore = responsesData.reduce((sum, response) => sum + (response.score || 0), 0);
            const avgScore = totalScore / responsesData.length;
            setStats({
              totalResponses: responsesData.length,
              averageScore: Math.round(avgScore * 10) / 10, // Round to 1 decimal
              completionRate: 100 // Placeholder for now
            });
          } else {
            setStats({
              totalResponses: responsesData.length,
              averageScore: 0,
              completionRate: 100 // Placeholder for now
            });
          }
        }
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

    if (user && id) {
      fetchTemplateAndResponses();
    }
  }, [user, id, router]);

  const handleLogout = () => {
    if (logout) {
      logout();
      router.push('/auth/login');
    }
  };

  const exportToCSV = () => {
    if (!responses || responses.length === 0 || !template) {
      toast({
        title: "Export failed",
        description: "No data available to export",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Determine all possible fields from the template
      const fields: string[] = [];
      
      // Add all possible question fields based on template configuration
      ['String', 'Text', 'Int', 'Checkbox'].forEach(type => {
        for (let i = 1; i <= 4; i++) {
          const stateField = `custom${type}${i}State`;
          const questionField = `custom${type}${i}Question`;
          
          if (template[stateField]) {
            fields.push(`custom${type}${i}Answer`);
          }
        }
      });
      
      // Create CSV header row
      let csv = 'User,Submission Date';
      if (template.isQuiz) {
        csv += ',Score,Total Possible Points';
      }
      
      // Add question headers
      fields.forEach(field => {
        const questionType = field.match(/custom(String|Text|Int|Checkbox)(\d)Answer/);
        if (questionType) {
          const questionField = `custom${questionType[1]}${questionType[2]}Question`;
          const question = template[questionField] || field;
          // Escape quotes in the question text
          csv += `,"${question.replace(/"/g, '""')}"`;
        }
      });
      
      csv += '\n';
      
      // Add data rows
      responses.forEach(response => {
        const userName = response.user ? response.user.name : 'Anonymous';
        const submissionDate = formatDate(response.createdAt);
        
        let row = `"${userName}","${submissionDate}"`;
        
        if (template.isQuiz) {
          row += `,${response.score || 0},${response.totalPossiblePoints || 0}`;
        }
        
        // Add answer data
        fields.forEach(field => {
          let value = response[field];
          
          // Format the value based on its type
          if (value === null || value === undefined) {
            value = '';
          } else if (typeof value === 'boolean') {
            value = value ? 'Yes' : 'No';
          } else if (typeof value === 'string') {
            // Escape quotes in the text
            value = `"${value.replace(/"/g, '""')}"`;
          }
          
          row += `,${value}`;
        });
        
        csv += row + '\n';
      });
      
      // Create and trigger download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${template.title.replace(/\s+/g, '_')}_responses.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: "Responses have been exported to CSV"
      });
    } catch (error) {
      console.error("Error exporting to CSV:", error);
      toast({
        title: "Export failed",
        description: "Failed to export responses to CSV",
        variant: "destructive"
      });
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
          <h1 className="text-2xl font-bold">Template Responses</h1>
        </div>
        
        <Button 
          variant="outline"
          size="sm"
          onClick={exportToCSV}
          disabled={responses.length === 0}
        >
          <Download className="h-4 w-4 mr-1" /> Export to CSV
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : template ? (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">{template.title}</CardTitle>
              <CardDescription>
                {template.description || "No description provided"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Total Responses</div>
                  <div className="text-2xl font-bold">{stats.totalResponses}</div>
                </div>
                
                {template.isQuiz && (
                  <div className="p-4 border rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Average Score</div>
                    <div className="text-2xl font-bold">
                      {stats.averageScore}
                      <span className="text-sm ml-2 text-muted-foreground">points</span>
                    </div>
                  </div>
                )}
                
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Created By</div>
                  <div className="font-medium">{template.user?.name || "Unknown"}</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(template.createdAt)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Response List</CardTitle>
              <CardDescription>
                All submitted responses for this template
              </CardDescription>
            </CardHeader>
            <CardContent>
              {responses.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Submission Date</TableHead>
                      {template.isQuiz && <TableHead>Score</TableHead>}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {responses.map((response) => (
                      <TableRow key={response.id}>
                        <TableCell className="font-medium">
                          {response.user?.name || "Unknown User"}
                        </TableCell>
                        <TableCell>
                          {formatDate(response.createdAt)}
                        </TableCell>
                        {template.isQuiz && (
                          <TableCell>
                            {response.score || 0} / {response.totalPossiblePoints || 0}
                            <span className="text-xs ml-1 text-muted-foreground">
                              ({response.totalPossiblePoints > 0 
                                ? Math.round((response.score / response.totalPossiblePoints) * 100) 
                                : 0}%)
                            </span>
                          </TableCell>
                        )}
                        <TableCell className="text-right">
                          <Button 
                            variant="outline" 
                            size="sm"
                            asChild
                          >
                            <Link href={`/admin/responses/${response.id}`}>
                              <Eye className="h-4 w-4 mr-1" /> View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No responses yet</h3>
                  <p className="text-muted-foreground">
                    This template hasn't received any responses yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="text-3xl font-bold mb-2">Template not found</div>
          <p className="text-muted-foreground mb-6">
            The template you are looking for might have been deleted or does not exist.
          </p>
          <Button onClick={() => router.push('/admin/templates')}>
            View All Templates
          </Button>
        </div>
      )}
    </DashboardLayout>
  );
}
