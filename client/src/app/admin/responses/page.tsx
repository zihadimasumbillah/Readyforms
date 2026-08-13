"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from "@/components/layouts/admin-layout";
import { adminService } from '@/lib/api/admin-service';
import { FormResponse } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Search, Eye, FileText } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/components/ui/use-toast";

export default function AdminResponsesPage() {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [filteredResponses, setFilteredResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [responseToDelete, setResponseToDelete] = useState<FormResponse | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();
  const auth = useAuth();

  useEffect(() => {
    if (auth?.status === "loading") return;

    if (!auth?.user) {
      router.push("/auth/login");
      return;
    }

    if (!auth?.user?.isAdmin) {
      router.push("/dashboard");
      return;
    }

    const fetchResponses = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAllResponses(1, 100);
        setResponses(data || []);
        setFilteredResponses(data || []);
      } catch (error) {
        console.error("Error fetching responses:", error);
        toast({
          title: "Error",
          description: "Failed to load form responses. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchResponses();
  }, [router, auth?.status, auth?.user]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredResponses(responses);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredResponses(
        responses.filter(r =>
          r.user?.name?.toLowerCase().includes(term) ||
          r.user?.email?.toLowerCase().includes(term) ||
          r.template?.title?.toLowerCase().includes(term)
        )
      );
    }
  }, [searchTerm, responses]);

  const handleDelete = async () => {
    if (!responseToDelete) return;

    try {
      setProcessingId(responseToDelete.id);
      await adminService.deleteFormResponse(responseToDelete.id);

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
      setProcessingId(null);
      setShowDeleteDialog(false);
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Form Submissions</h1>
          <p className="text-muted-foreground">Administrative oversight of all user responses across all templates</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Global Responses Log ({filteredResponses.length})</CardTitle>
            <CardDescription>Total responses recorded in database</CardDescription>
            <div className="pt-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by respondent name, email, or template title..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
            ) : filteredResponses.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-40 mb-3" />
                <p className="text-muted-foreground font-medium">No form responses match search criteria</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Submission Timestamp</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResponses.map((res) => (
                    <TableRow key={res.id}>
                      <TableCell className="font-medium">
                        {res.template?.title || 'Unknown Template'}
                      </TableCell>
                      <TableCell>
                        {res.user ? `${res.user.name} (${res.user.email})` : 'Anonymous'}
                      </TableCell>
                      <TableCell>{formatDate(res.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/responses/${res.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View Details
                            </Link>
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={processingId === res.id}
                            onClick={() => {
                              setResponseToDelete(res);
                              setShowDeleteDialog(true);
                            }}
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

        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Submission Permanently?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. The response data will be permanently removed from system records.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={handleDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
