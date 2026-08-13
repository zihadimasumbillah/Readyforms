"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/admin-layout';
import { templateService } from '@/lib/api/template-service';
import { adminService } from '@/lib/api/admin-service';
import { Template } from '@/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Eye, Edit, Trash2, Search, Filter, Plus, MoreHorizontal, Users, FileText } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
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
    
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const allTemplates = await adminService.getAllTemplates(1, 100);
        setTemplates(allTemplates || []);
        setFilteredTemplates(allTemplates || []);
      } catch (error) {
        console.error("Error fetching templates:", error);
        toast({
          title: "Error",
          description: "Failed to load templates. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, [router, auth?.status, auth?.user]);
  
  const [typeFilter, setTypeFilter] = useState<'all' | 'public' | 'private' | 'quiz'>('all');

  useEffect(() => {
    let filtered = [...templates];
    
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        template =>
          template.title.toLowerCase().includes(term) ||
          (template.description?.toLowerCase() || "").includes(term) ||
          (template.user?.name?.toLowerCase() || "").includes(term)
      );
    }

    if (typeFilter === 'public') {
      filtered = filtered.filter(t => t.isPublic);
    } else if (typeFilter === 'private') {
      filtered = filtered.filter(t => !t.isPublic);
    } else if (typeFilter === 'quiz') {
      filtered = filtered.filter(t => t.isQuiz);
    }

    setFilteredTemplates(filtered);
  }, [searchTerm, typeFilter, templates]);

  const handleExportTemplatesCSV = () => {
    if (!filteredTemplates.length) return;
    const rows = [
      ["Template ID", "Title", "Description", "Creator", "Type", "Quiz", "Created At"],
      ...filteredTemplates.map(t => [
        t.id,
        t.title,
        t.description || '',
        t.user?.name || 'Unknown',
        t.isPublic ? 'Public' : 'Private',
        t.isQuiz ? 'Yes' : 'No',
        t.createdAt || ''
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = encodedUri;
    a.download = `templates_catalog_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast({ title: "Exported Templates", description: `Exported ${filteredTemplates.length} templates to CSV.` });
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };
  
  const confirmDelete = (template: Template) => {
    setTemplateToDelete(template);
    setShowDeleteDialog(true);
  };
  
  const handleDelete = async () => {
    if (!templateToDelete) return;
    
    try {
      setProcessingId(templateToDelete.id);
      await adminService.deleteTemplate(templateToDelete.id);
      
      setTemplates(templates.filter(t => t.id !== templateToDelete.id));
      setFilteredTemplates(filteredTemplates.filter(t => t.id !== templateToDelete.id));
      
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
      setShowDeleteDialog(false);
      setTemplateToDelete(null);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Templates Management</h1>
          <p className="text-muted-foreground text-sm">Review, govern, and audit all form templates across the platform</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportTemplatesCSV}>
            Export Catalog (CSV)
          </Button>
          <Button onClick={() => router.push('/templates/create')} size="sm" className="bg-black dark:bg-white text-white dark:text-black">
            <Plus className="h-4 w-4 mr-2" /> Create Template
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="text-lg">All Templates ({filteredTemplates.length})</CardTitle>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search title, description, author..."
                  className="pl-8 w-full"
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              <div className="flex items-center gap-1.5 w-full sm:w-auto">
                <Button 
                  variant={typeFilter === 'all' ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setTypeFilter('all')}
                >
                  All
                </Button>
                <Button 
                  variant={typeFilter === 'public' ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setTypeFilter('public')}
                >
                  Public
                </Button>
                <Button 
                  variant={typeFilter === 'private' ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setTypeFilter('private')}
                >
                  Private
                </Button>
                <Button 
                  variant={typeFilter === 'quiz' ? "default" : "outline"} 
                  size="sm" 
                  onClick={() => setTypeFilter('quiz')}
                >
                  Quizzes
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array(5).fill(null).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead className="hidden md:table-cell">Creator</TableHead>
                    <TableHead className="hidden md:table-cell">Created</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Responses</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.length > 0 ? (
                    filteredTemplates.map((template) => (
                      <TableRow key={template.id}>
                        <TableCell className="font-medium">
                          <div className="max-w-[200px] truncate" title={template.title}>
                            {template.title}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {template.user?.name || 'Unknown'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {formatDate(template.createdAt)}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <Badge variant={template.isPublic ? "default" : "outline"}>
                            {template.isPublic ? "Public" : "Private"}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {template.responsesCount || 0}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/templates/${template.id}`} className="flex items-center w-full">
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>View Template</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/forms/${template.id}`} className="flex items-center w-full">
                                  <FileText className="mr-2 h-4 w-4" />
                                  <span>Fill Form</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/templates/${template.id}/edit`} className="flex items-center w-full">
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit Configuration</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/templates/${template.id}/responses`} className="flex items-center w-full">
                                  <Users className="mr-2 h-4 w-4" />
                                  <span>View Responses</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600 focus:text-red-600"
                                onClick={() => confirmDelete(template)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Delete</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No templates found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the template
              {templateToDelete && <strong> "{templateToDelete.title}"</strong>} and all associated
              responses. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700"
              disabled={!!processingId}
            >
              {processingId === templateToDelete?.id ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </AdminLayout>
  );
}
