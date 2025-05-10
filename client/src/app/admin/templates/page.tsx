"use client";

import React, { useState, useEffect } from 'react';
import { templateService } from '@/lib/api/template-service';
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
import { Eye, Edit, Trash2, Search, Filter, Plus, MoreHorizontal, Users } from "lucide-react";
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
    if (!auth?.user?.isAdmin) {
      router.push("/auth/login");
      return;
    }
    
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        // Fetch all templates for admin view
        const allTemplates = await templateService.getTemplates({ limit: 100 });
        setTemplates(allTemplates);
        setFilteredTemplates(allTemplates);
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
  }, [router, auth]);
  
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredTemplates(templates);
    } else {
      const filtered = templates.filter(
        template =>
          template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (template.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
          (template.user?.name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
      );
      setFilteredTemplates(filtered);
    }
  }, [searchTerm, templates]);
  
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
      await templateService.deleteTemplate(templateToDelete.id, templateToDelete.version);
      
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
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Templates Management</h1>
        
        <Button onClick={() => router.push('/templates/create')}>
          <Plus className="h-4 w-4 mr-2" /> Create Template
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>All Templates</CardTitle>
            <div className="relative w-full md:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by title or creator..."
                className="pl-8 w-full"
                value={searchTerm}
                onChange={handleSearchChange}
              />
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
                              <DropdownMenuItem>
                                <Link href={`/templates/${template.id}`} className="flex items-center w-full">
                                  <Eye className="mr-2 h-4 w-4" />
                                  <span>View</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link href={`/admin/templates/${template.id}/edit`} className="flex items-center w-full">
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Edit</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Link href={`/admin/templates/${template.id}/responses`} className="flex items-center w-full">
                                  <Users className="mr-2 h-4 w-4" />
                                  <span>Responses</span>
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
  );
}
