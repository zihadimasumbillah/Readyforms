"use client";

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Template } from "@/types";
import { dashboardService } from "@/lib/api/dashboard-service";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { FileText, MessageSquare, Heart, PlusCircle, ArrowRight, Calendar, Clock, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from '@/components/ui/use-toast';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    templates: 0,
    responses: 0,
    likes: 0,
    comments: 0,
  });
  const [recentTemplates, setRecentTemplates] = useState<Template[]>([]);
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const router = useRouter();

  const handleLogout = () => {
    if (logout) {
      logout();
      router.push('/auth/login');
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch user stats
        const userStats = await dashboardService.getUserStats();
        setStats(userStats);

        // Fetch user templates (limited to recent ones)
        const templates = await dashboardService.getUserTemplates();
        
        // Filter out test templates - adding null checks
        const filteredTemplates = templates.filter(template => {
          const title = template?.title?.toLowerCase() || '';
          const desc = template?.description?.toLowerCase() || '';
          return !(
            title.includes('test template') || 
            title.includes('updated template') || 
            desc.includes('created by api') || 
            desc.includes('admin-template-test')
          );
        });
        
        setRecentTemplates(filteredTemplates.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error loading dashboard",
          description: "Failed to load your dashboard data. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if user is authenticated
    if (user) {
      fetchDashboardData();
    } else {
      // Redirect to login if no user is found
      router.push('/auth/login');
    }
  }, [user, router]);

  // If user is not available, display a loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Loading your dashboard</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  // Format date for better display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric'
    }).format(date);
  };

  return (
    <DashboardLayout
      user={{
        name: user.name || 'User',
        email: user.email || 'user@example.com',
        isAdmin: user.isAdmin || false
      }}
      onLogout={handleLogout}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user.name}!</h1>
          <p className="text-muted-foreground mt-1">
            Manage your forms and view responses all in one place.
          </p>
        </div>
        <Button onClick={() => router.push("/templates/create")}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Templates"
          value={stats.templates}
          icon={<FileText className="h-4 w-4" />}
          loading={loading}
        />
        <StatCard
          title="Form Responses"
          value={stats.responses}
          icon={<MessageSquare className="h-4 w-4" />}
          loading={loading}
        />
        <StatCard
          title="Likes Received"
          value={stats.likes}
          icon={<Heart className="h-4 w-4" />}
          loading={loading}
        />
        <StatCard
          title="Comments"
          value={stats.comments}
          icon={<MessageSquare className="h-4 w-4" />}
          loading={loading}
        />
      </div>

      {/* Recent Templates */}
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl">Recent Templates</CardTitle>
            <CardDescription>
              Your recently created form templates
            </CardDescription>
          </div>
          {recentTemplates.length > 0 && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/templates">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : recentTemplates.length > 0 ? (
            <div className="divide-y">
              {recentTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="space-y-1">
                    <h3 className="font-medium hover:text-primary">
                      <Link href={`/templates/${template.id}`} className="hover:underline">
                        {template.title}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        {formatDate(template.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                        {template.responsesCount || 0} responses
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      asChild
                    >
                      <Link href={`/templates/${template.id}`}>
                        View
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                    >
                      <Link href={`/templates/${template.id}/edit`}>
                        Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No templates yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first form template to get started
              </p>
              <Button asChild>
                <Link href="/templates/create">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Template
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity and Quick Actions in 2 columns */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Recent Activity</CardTitle>
            <CardDescription>Latest responses and interactions</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-md border">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Activity feed coming soon</p>
                    <p className="text-sm text-muted-foreground">
                      We're working on showing your recent activity here
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/dashboard/activity">
                    View All Activity
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Quick Actions</CardTitle>
            <CardDescription>Common tasks and actions</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button className="justify-start" variant="outline" asChild>
              <Link href="/templates/create">
                <PlusCircle className="h-4 w-4 mr-2" />
                <span>Create New Template</span>
              </Link>
            </Button>
            <Button className="justify-start" variant="outline" asChild>
              <Link href="/dashboard/responses">
                <MessageSquare className="h-4 w-4 mr-2" />
                <span>View Form Responses</span>
              </Link>
            </Button>
            <Button className="justify-start" variant="outline" asChild>
              <Link href="/templates">
                <FileText className="h-4 w-4 mr-2" />
                <span>Browse Template Library</span>
              </Link>
            </Button>
            {user.isAdmin && (
              <Button className="justify-start" variant="outline" asChild>
                <Link href="/admin">
                  <ShieldAlert className="h-4 w-4 mr-2" />
                  <span>Admin Dashboard</span>
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}