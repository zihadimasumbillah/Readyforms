"use client";

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService } from "@/lib/api/admin-service";
import { Template, Topic } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { toast } from '@/components/ui/use-toast';
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
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ChevronLeft, 
  Eye, 
  Edit, 
  Trash, 
  RefreshCw,
  Filter,
  PlusCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { templateService } from "@/lib/api/template-service";
import Link from 'next/link';

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [filterVisibility, setFilterVisibility] = useState<string>('all');
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    if (logout) {
      logout();
      router.push('/auth/login');
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const templatesData = await adminService.getAllTemplates();
      const topicsData = await adminService.getAllTopics();
      
      setTemplates(templatesData);
      setTopics(topicsData);
      applyFilters(templatesData, searchQuery, filterTopic, filterVisibility);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to load templates. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Check if user is admin
      if (!user.isAdmin) {
        toast({
          title: "Access denied",
          description: "You don't have permission to access this page",
          variant: "destructive"
        });
        router.push('/dashboard');
        return;
      }
      
      fetchTemplates();
    } else {
      // Redirect to login if no user is found
      router.push('/auth/login');
    }
  }, [user, router]);

  const applyFilters = (templateList: Template[], query: string, topic: string, visibility: string) => {
    let filtered = [...templateList];
    
    // Apply search filter
    if (query.trim() !== '') {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(lowercaseQuery) || 
        (template.description && template.description.toLowerCase().includes(lowercaseQuery))
      );
    }
    
    // Apply topic filter
    if (topic !== 'all') {
      filtered = filtered.filter(template => template.topic?.id === topic);
    }
    
    // Apply visibility filter
    if (visibility === 'public') {
      filtered = filtered.filter(template => template.isPublic);
    } else if (visibility === 'restricted') {
      filtered = filtered.filter(template => !template.isPublic);
    }
    
    setFilteredTemplates(filtered);
  };

  useEffect(() => {
    applyFilters(templates, searchQuery, filterTopic, filterVisibility);
  }, [searchQuery, filterTopic, filterVisibility, templates]);

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    
    try {
      setProcessingId(templateToDelete.id);
      await templateService.deleteTemplate(templateToDelete.id, templateToDelete.version);
      
      // Update templates list
      setTemplates(templates.filter(t => t.id !== templateToDelete.id));
      
      toast({
        title: "Success",
        description: "Template deleted successfully",
        variant: "default"
      });
      
      setTemplateToDelete(null);
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setProcessingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  if (!user) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">Loading templates</h2>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    </div>;
  }

  return (
    <DashboardLayout
      user={{
        name: user.name || 'Admin User',
        email: user.email || 'admin@example.com',
        isAdmin: true
      }}
      onLogout={handleLogout}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Template Management</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchTemplates} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => router.push("/templates/create")} className="gap-2">
            <PlusCircle className="h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>All Templates</CardTitle>
              <CardDescription>Manage templates across the platform</CardDescription>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search templates..."
                  className="pl-8 w-full sm:w-[200px] md:w-[260px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground hidden sm:inline">Filter:</span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Select value={filterTopic} onValueChange={setFilterTopic}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Topic" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Topics</SelectItem>
                      {topics.map(topic => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterVisibility} onValueChange={setFilterVisibility}>
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Visibility" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
          ) : filteredTemplates.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template</TableHead>
                    <TableHead className="hidden md:table-cell">Created by</TableHead>
                    <TableHead className="hidden lg:table-cell">Topic</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Created</TableHead>
                    <TableHead className="hidden lg:table-cell">Responses</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTemplates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{template.title}</span>
                          {template.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {template.description}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {template.user?.name || 'Unknown'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {template.topic?.name || 'Uncategorized'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {template.isPublic ? (
                          <Badge>Public</Badge>
                        ) : (
                          <Badge variant="outline">Restricted</Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {formatDate(template.createdAt)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {template.responsesCount || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={processingId === template.id}
                              className={processingId === template.id ? "opacity-50 cursor-wait" : ""}
                            >
                              {processingId === template.id ? (
                                <span className="flex items-center">
                                  <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                                  Processing
                                </span>
                              ) : (
                                <span>Actions</span>
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Template Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => router.push(`/templates/${template.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Template
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => router.push(`/admin/templates/${template.id}/edit`)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Template
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => router.push(`/admin/templates/${template.id}/responses`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Responses
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem
                              onClick={() => setTemplateToDelete(template)}
                              className="text-red-600"
                            >
                              <Trash className="h-4 w-4 mr-2" />
                              Delete Template
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3 mb-3">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No templates found</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Template Confirmation */}
      <AlertDialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{templateToDelete?.title}&quot;? This action will remove all associated responses, comments, and likes. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteTemplate} 
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
