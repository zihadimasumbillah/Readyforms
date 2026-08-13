"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from "@/components/layouts/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity, Users, FileText, MessageSquare, Heart, Search, Filter,
  Download, RefreshCw, Clock, ArrowUpRight
} from "lucide-react";
import { adminService, SystemActivity } from "@/lib/api/admin-service";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import Link from "next/link";

export default function AdminActivityPage() {
  const [activities, setActivities] = useState<SystemActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<SystemActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

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

    fetchActivity();
  }, [user, auth?.status, router]);

  const fetchActivity = async () => {
    try {
      setLoading(true);
      const data = await adminService.getSystemActivity(50);
      setActivities(data || []);
      setFilteredActivities(data || []);
    } catch (error) {
      console.error("Failed to load activities:", error);
      toast({
        title: "Error",
        description: "Failed to load audit activity feed.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...activities];

    if (typeFilter !== "all") {
      filtered = filtered.filter((a) => a.type === typeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          (a.description || a.action || '').toLowerCase().includes(q) ||
          (a.user?.name?.toLowerCase() || '').includes(q) ||
          (a.user?.email?.toLowerCase() || '').includes(q)
      );
    }

    setFilteredActivities(filtered);
  }, [searchQuery, typeFilter, activities]);

  const handleExportCSV = () => {
    if (!filteredActivities.length) return;
    const rows = [
      ["Event ID", "Type", "Description", "Actor Name", "Actor Email", "Timestamp"],
      ...filteredActivities.map((a, idx) => [
        a.id || `evt-${idx}`,
        a.type.toUpperCase(),
        a.description || a.action || 'Activity Event',
        a.user?.name || "System/Anonymous",
        a.user?.email || "N/A",
        a.timestamp,
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      rows.map((e) => e.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const a = document.createElement("a");
    a.href = encodedUri;
    a.download = `system_activity_log_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    toast({ title: "Exported Activity Log", description: `Saved ${filteredActivities.length} audit events to CSV.` });
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return "just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user":
        return <Users className="h-4 w-4 text-blue-500" />;
      case "template":
        return <FileText className="h-4 w-4 text-purple-500" />;
      case "response":
        return <MessageSquare className="h-4 w-4 text-emerald-500" />;
      case "comment":
        return <MessageSquare className="h-4 w-4 text-amber-500" />;
      case "like":
        return <Heart className="h-4 w-4 text-rose-500" />;
      default:
        return <Activity className="h-4 w-4 text-cyan-500" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Platform Activity & Audit Stream</h1>
            <p className="text-muted-foreground text-sm">
              Real-time audit log of all system submissions, creations, user lifecycle, and engagement events
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-1.5">
              <Download className="h-4 w-4" />
              <span>Export Log (CSV)</span>
            </Button>
            <Button onClick={fetchActivity} size="sm" className="gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh Feed</span>
            </Button>
          </div>
        </div>

        {/* Filter Controls */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events, users, or descriptions..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Button
                  variant={typeFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter("all")}
                >
                  All Events
                </Button>
                <Button
                  variant={typeFilter === "user" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter("user")}
                >
                  Users
                </Button>
                <Button
                  variant={typeFilter === "template" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter("template")}
                >
                  Templates
                </Button>
                <Button
                  variant={typeFilter === "response" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter("response")}
                >
                  Submissions
                </Button>
                <Button
                  variant={typeFilter === "like" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter("like")}
                >
                  Likes
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground opacity-40 mb-3" />
                <p className="text-muted-foreground font-medium">No activity records match filters</p>
              </div>
            ) : (
              <div className="divide-y border rounded-xl overflow-hidden bg-card">
                {filteredActivities.map((act, idx) => (
                  <div
                    key={act.id || idx}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-muted/60 shrink-0 mt-0.5">
                        {getActivityIcon(act.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{act.description || act.action || 'Activity Event'}</span>
                          <Badge variant="outline" className="text-[10px] uppercase">
                            {act.type}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          {act.user ? (
                            <span>By {act.user.name || act.user.email}</span>
                          ) : (
                            <span>System Anonymous</span>
                          )}
                          <span>•</span>
                          <span title={new Date(act.timestamp).toLocaleString()}>{getTimeAgo(act.timestamp)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {act.meta?.templateId && (
                        <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
                          <Link href={`/templates/${act.meta.templateId}`}>
                            View Form <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      )}
                      {act.meta?.responseId && (
                        <Button variant="ghost" size="sm" asChild className="text-xs gap-1">
                          <Link href={`/admin/responses/${act.meta.responseId}`}>
                            Audit Submission <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
