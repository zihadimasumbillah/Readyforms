"use client";

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FormResponse } from "@/types";
import { dashboardService } from "@/lib/api/dashboard-service";
import { formResponseService } from "@/lib/api/form-response-service";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Search, Eye, Trash2, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/components/ui/use-toast";

export default function UserResponsesPage() {
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<FormResponse[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [responseToDelete, setResponseToDelete] = useState<FormResponse | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;

  const handleLogout = () => {
    if (logout) {
      logout();
      router.push('/auth/login');
    }
  };

  useEffect(() => {
    if (auth?.status === "loading") return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    const fetchResponses = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getUserResponses();
        setResponses(data || []);
        setFilteredResponses(data || []);
      } catch (error) {
        console.error("Error fetching user responses:", error);
        setResponses([]);
        setFilteredResponses([]);
        toast({
          title: "Error",
          description: "Failed to fetch your form responses. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [user, auth?.status, router]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredResponses(responses);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = responses.filter(res => 
        (res.template?.title?.toLowerCase() || '').includes(query) ||
        (res.template?.description?.toLowerCase() || '').includes(query)
      );
      setFilteredResponses(filtered);
    }
  }, [searchQuery, responses]);

  const handleDeleteResponse = async () => {
    if (!responseToDelete) return;

    try {
      setDeletingId(responseToDelete.id);
      await formResponseService.deleteResponse(responseToDelete.id);

      setResponses(responses.filter(r => r.id !== responseToDelete.id));
      setFilteredResponses(filteredResponses.filter(r => r.id !== responseToDelete.id));

      toast({
        title: "Success",
        description: "Form response deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting response:", error);
      toast({
        title: "Error",
        description: "Failed to delete response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
      setResponseToDelete(null);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) return null;

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Form Responses</h1>
            <p className="text-muted-foreground">View and manage all form submissions you have submitted</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/templates">
              Browse Form Templates
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Submitted Responses ({filteredResponses.length})</CardTitle>
            <CardDescription>All form responses submitted by your account</CardDescription>
            <div className="pt-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search responses by template title..."
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
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredResponses.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium">No form responses found</p>
                <p className="text-sm text-muted-foreground">
                  You haven't submitted any forms yet. Explore available templates to get started!
                </p>
                <Button asChild className="mt-2">
                  <Link href="/templates">Explore Templates</Link>
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Title</TableHead>
                    <TableHead>Submitted Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResponses.map((res) => (
                    <TableRow key={res.id}>
                      <TableCell className="font-medium">
                        {res.template?.title || 'Form Submission'}
                      </TableCell>
                      <TableCell>{formatDate(res.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {res.template?.id && (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/forms/${res.template.id}?responseId=${res.id}`}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={deletingId === res.id}
                            onClick={() => setResponseToDelete(res)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={!!responseToDelete} onOpenChange={(open) => !open && setResponseToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this form response. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDeleteResponse}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
