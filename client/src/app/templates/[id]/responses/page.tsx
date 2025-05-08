"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { Template, FormResponse } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import templateService from '@/lib/api/template-service';
import { formResponseService } from '@/lib/api/form-response-service';

export default function TemplateResponsesPage({ params }: { params: { id: string } }) {
  const [template, setTemplate] = useState<Template | null>(null);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user, isAuthenticated } = useAuth() || {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get template data
        const templateData = await templateService.getTemplateById(params.id);
        setTemplate(templateData);
        
        // Get responses for the template
        const responsesData = await formResponseService.getResponsesByTemplate(params.id);
        setResponses(responsesData);
        
      } catch (error) {
        console.error("Error fetching template or responses:", error);
        setError("Failed to load data. Please try again later.");
        toast({
          title: "Error",
          description: "Failed to load template responses",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchData();
    } else {
      router.push('/auth/login');
    }
  }, [params.id, isAuthenticated, router]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-bold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">
              {error || "The template you're looking for doesn't exist or has been removed."}
            </p>
            <Button asChild>
              <Link href="/templates">Browse Templates</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user can view responses
  const isOwner = user?.id === template.userId;
  const isAdmin = user?.isAdmin;
  const canViewResponses = isOwner || isAdmin;

  if (!canViewResponses) {
    return (
      <div className="container mx-auto py-6 px-4 md:px-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-4">
              You don't have permission to view responses for this template.
            </p>
            <Button asChild>
              <Link href="/templates">Browse Templates</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Responses for: {template.title}</CardTitle>
          <CardDescription>
            {responses.length} {responses.length === 1 ? 'response' : 'responses'} submitted
          </CardDescription>
        </CardHeader>
        <CardContent>
          {responses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Respondent</TableHead>
                  <TableHead>Submission Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell>
                      {response.user?.name || 'Anonymous'}
                    </TableCell>
                    <TableCell>
                      {formatDate(response.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/responses/${response.id}`}>
                          View Details
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No responses have been submitted yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
