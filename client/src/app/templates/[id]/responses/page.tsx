"use client";

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { templateService } from "@/lib/api/template-service";
import { formResponseService, FormResponseData } from "@/lib/api/form-response-service";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, BarChart2, Users, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

interface ResponsesPageProps {
  params: {
    id: string;
  };
}

export default function TemplateResponsesPage({ params }: ResponsesPageProps) {
  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<any>(null);
  const [responses, setResponses] = useState<FormResponseData[]>([]);
  const [aggregateData, setAggregateData] = useState<any>(null);
  
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;
  
  const templateId = params.id;

  const handleLogout = () => {
    auth?.logout();
    router.push('/auth/login');
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
          const responsesData = await formResponseService.getResponsesByTemplateId(templateId);
          setResponses(responsesData);
    
          const aggregateStats = await formResponseService.getAggregateData(templateId);
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
    
    const headers = ['ID', 'Submitted By', 'Submission Date', ...Array.from(fields)];

    const rows = responses.map(response => {
      const row: any[] = [
        response.id,
        response.user?.name || 'Anonymous',
        formatDate(response.createdAt),
      ];
      
      // Add values for each field
      Array.from(fields).forEach(field => {
        const value = response[field as keyof FormResponseData];
        row.push(value !== undefined ? value : '');
      });
      
      return row;
    });
    
    // Combine header and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${template?.title || 'template'}-responses.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout 
      user={{
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }}
      onLogout={handleLogout}
    >
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/templates/${templateId}`)}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Template
          </Button>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => router.push(`/templates/${templateId}/statistics`)}
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              Statistics
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportToCSV}
              disabled={!responses.length}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {loading ? (
          <Skeleton className="h-8 w-2/3" />
        ) : (
          <h1 className="text-2xl font-bold">
            Responses: {template?.title}
          </h1>
        )}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Response Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-muted/50 p-4 rounded-md">
                <div className="text-sm text-muted-foreground">Total Responses</div>
                <div className="text-2xl font-bold">{responses.length}</div>
              </div>
              
              {template?.isQuiz && (
                <div className="bg-muted/50 p-4 rounded-md">
                  <div className="text-sm text-muted-foreground">Average Score</div>
                  <div className="text-2xl font-bold">
                    {aggregateData?.avg_score ? 
                      `${Math.round(aggregateData.avg_score * 10) / 10}/${Math.round(aggregateData.avg_total_points)}` : 
                      'N/A'}
                  </div>
                </div>
              )}
              
              <div className="bg-muted/50 p-4 rounded-md">
                <div className="text-sm text-muted-foreground">Latest Response</div>
                <div className="text-lg font-medium">
                  {responses.length > 0 ? 
                    formatDate(responses[0].createdAt) :
                    'No responses yet'}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            All Responses
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : responses.length > 0 ? (
            <Table>
              <TableCaption>A list of all responses for this template.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Respondent</TableHead>
                  <TableHead>Date Submitted</TableHead>
                  {template?.isQuiz && <TableHead>Score</TableHead>}
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell className="font-medium">
                      {response.user?.name || 'Anonymous'}
                    </TableCell>
                    <TableCell>{formatDate(response.createdAt)}</TableCell>
                    {template?.isQuiz && (
                      <TableCell>
                        {response.score !== undefined && response.totalPossiblePoints !== undefined ? (
                          <div>
                            <span className="font-medium">{response.score}/{response.totalPossiblePoints}</span>
                            <span className="ml-2 text-sm text-muted-foreground">
                              ({Math.round((response.score / response.totalPossiblePoints) * 100)}%)
                            </span>
                          </div>
                        ) : 'N/A'}
                      </TableCell>
                    )}
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/templates/${templateId}/responses/${response.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No responses yet</h3>
              <p className="text-sm text-muted-foreground mt-1">
                There are no responses to this template yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
