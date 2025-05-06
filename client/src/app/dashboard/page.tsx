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
import { FileText, MessageSquare, Heart, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    templates: 0,
    responses: 0,
    likes: 0,
    comments: 0,
  });
  const [recentTemplates, setRecentTemplates] = useState<Template[]>([]);
  const { user, logout } = useAuth();
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
        setRecentTemplates(templates.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  // If user is not available, display a loading state or redirect
  if (!user) {
    return <div>Loading user data...</div>; // Or redirect to login
  }

  return (
    <DashboardLayout
      user={{
        name: user.name || 'User',
        email: user.email || 'user@example.com',
        isAdmin: user.isAdmin
      }}
      onLogout={handleLogout}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
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
        <CardHeader>
          <CardTitle className="text-xl">Recent Templates</CardTitle>
          <CardDescription>
            Your recently created form templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : recentTemplates.length > 0 ? (
            <div className="space-y-2">
              {recentTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <h3 className="font-medium">{template.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
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
          
          {recentTemplates.length > 0 && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" className="w-full max-w-xs" asChild>
                <Link href="/dashboard/templates">
                  View All Templates
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
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Button className="h-auto flex-col py-6" variant="outline" asChild>
            <Link href="/templates/create">
              <PlusCircle className="h-8 w-8 mb-2" />
              <span className="font-medium">Create New Template</span>
            </Link>
          </Button>
          <Button className="h-auto flex-col py-6" variant="outline" asChild>
            <Link href="/dashboard/responses">
              <MessageSquare className="h-8 w-8 mb-2" />
              <span className="font-medium">View Responses</span>
            </Link>
          </Button>
          <Button className="h-auto flex-col py-6" variant="outline" asChild>
            <Link href="/templates">
              <FileText className="h-8 w-8 mb-2" />
              <span className="font-medium">Explore Templates</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}