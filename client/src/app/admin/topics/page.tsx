"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from "@/components/layouts/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Plus, Search, Edit2, Trash2, FolderPlus, Tag, Layers, RefreshCw } from "lucide-react";
import { topicService } from "@/lib/api/topic-service";
import { Topic } from "@/types";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";

export default function AdminTopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);

  // Delete dialog state
  const [deleteTopicState, setDeleteTopicState] = useState<Topic | null>(null);
  const [deleting, setDeleting] = useState(false);

  const auth = useAuth();
  const user = auth?.user;
  const router = useRouter();

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

    fetchTopics();
  }, [user, auth?.status, router]);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const data = await topicService.getAllTopics();
      setTopics(data || []);
      setFilteredTopics(data || []);
    } catch (error) {
      console.error("Failed to load topics:", error);
      toast({
        title: "Error",
        description: "Failed to load taxonomy topics.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTopics(topics);
    } else {
      const q = searchQuery.toLowerCase();
      setFilteredTopics(
        topics.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            (t.description && t.description.toLowerCase().includes(q))
        )
      );
    }
  }, [searchQuery, topics]);

  const handleOpenCreate = () => {
    setEditingTopic(null);
    setFormData({ name: "", description: "" });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (topic: Topic) => {
    setEditingTopic(topic);
    setFormData({ name: topic.name, description: topic.description || "" });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    try {
      setSaving(true);
      if (editingTopic) {
        await topicService.updateTopic(editingTopic.id, {
          name: formData.name.trim(),
          description: formData.description.trim(),
          version: editingTopic.version || 0,
        });
        toast({ title: "Topic updated", description: `Updated topic "${formData.name}"` });
      } else {
        await topicService.createTopic({
          name: formData.name.trim(),
          description: formData.description.trim(),
        });
        toast({ title: "Topic created", description: `Created new topic "${formData.name}"` });
      }
      setIsModalOpen(false);
      await fetchTopics();
    } catch (error: any) {
      console.error("Error saving topic:", error);
      toast({
        title: "Save failed",
        description: error?.response?.data?.message || "Failed to save topic.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTopicState) return;

    try {
      setDeleting(true);
      await topicService.deleteTopic(deleteTopicState.id, deleteTopicState.version || 0);
      toast({
        title: "Topic deleted",
        description: `Topic "${deleteTopicState.name}" was removed.`,
      });
      setDeleteTopicState(null);
      await fetchTopics();
    } catch (error: any) {
      console.error("Error deleting topic:", error);
      toast({
        title: "Deletion failed",
        description: error?.response?.data?.message || "Failed to delete topic. Ensure no templates depend on it.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Topic & Taxonomy Management</h1>
            <p className="text-muted-foreground text-sm">
              Organize and categorize templates across standard topics and custom domains
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchTopics} className="gap-1.5">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </Button>
            <Button onClick={handleOpenCreate} size="sm" className="gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white">
              <Plus className="h-4 w-4" />
              <span>Create Topic</span>
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">Total Topics</p>
                <p className="text-2xl font-bold mt-1">{topics.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center">
                <Layers className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">Active Categories</p>
                <p className="text-2xl font-bold mt-1">{topics.filter(t => t.description).length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Tag className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-medium">Filter Results</p>
                <p className="text-2xl font-bold mt-1">{filteredTopics.length}</p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <FolderPlus className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-lg">Form Topic Directory ({filteredTopics.length})</CardTitle>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search topics..."
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
            ) : filteredTopics.length === 0 ? (
              <div className="text-center py-12">
                <Layers className="mx-auto h-12 w-12 text-muted-foreground opacity-40 mb-3" />
                <p className="text-muted-foreground font-medium">No topics found</p>
                <Button onClick={handleOpenCreate} variant="outline" size="sm" className="mt-3">
                  Create First Topic
                </Button>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Topic Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTopics.map((topic) => (
                      <TableRow key={topic.id}>
                        <TableCell className="font-semibold flex items-center gap-2">
                          <Tag className="h-4 w-4 text-cyan-500" />
                          <span>{topic.name}</span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-md truncate">
                          {topic.description || <span className="italic text-xs">No description provided</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit(topic)}
                              className="gap-1"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteTopicState(topic)}
                              className="gap-1"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span>Delete</span>
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

        {/* Create / Edit Dialog */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <form onSubmit={handleSave}>
              <DialogHeader>
                <DialogTitle>{editingTopic ? "Edit Topic" : "Create New Topic"}</DialogTitle>
                <DialogDescription>
                  {editingTopic
                    ? "Modify topic name and classification description."
                    : "Add a new topic for template creators to categorize their forms."}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic Name</label>
                  <Input
                    placeholder="e.g. Healthcare, Feedback, Engineering"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Brief description of this topic domain..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving} className="bg-cyan-600 hover:bg-cyan-700 text-white">
                  {saving ? "Saving..." : editingTopic ? "Update Topic" : "Create Topic"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <AlertDialog open={!!deleteTopicState} onOpenChange={(open) => !open && setDeleteTopicState(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Topic "{deleteTopicState?.name}"?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove this topic category? Templates currently using this topic will be unaffected or reassigned.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? "Deleting..." : "Delete Topic"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
