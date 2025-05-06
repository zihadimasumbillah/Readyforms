"use client";

import React, { useEffect, useState } from 'react';
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminService } from "@/lib/api/admin-service";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Users, FileText, MessageSquare, Heart, ChevronRight, ShieldAlert, ActivityIcon, ChevronsLeft, ChevronsRight } from "lucide-react";
import { toast } from '@/components/ui/use-toast';

// This allows us to display aggregated data for the dashboard
interface ActivitySummary {
  count: number;
  change: number; // percent change from last period
}

interface AdminDashboardState {
  stats: {
    users: number;
    templates: number;
    responses: number;
    likes: number;
    comments: number;
    activeUsers: number;
    topicsCount: number;
    adminCount: number;
  };
  activitySummaries: {
    users: ActivitySummary;
    templates: ActivitySummary;
    responses: ActivitySummary;
  };
  recentActivity: any[];
  loading: boolean;
  error: string | null;
}

export default function AdminDashboardPage() {
  // State to manage admin dashboard data
  const [state, setState] = useState<AdminDashboardState>({
    stats: {
      users: 0,
      templates: 0,
      responses: 0,
      likes: 0,
      comments: 0,
      activeUsers: 0,
      topicsCount: 0,
      adminCount: 0
    },
    activitySummaries: {
      users: { count: 0, change: 0 },
      templates: { count: 0, change: 0 },
      responses: { count: 0, change: 0 }
    },
    recentActivity: [],
    loading: true,
    error: null
  });

  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    if (logout) {
      logout();
      router.push('/auth/login');
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setState(prev => ({ ...prev, loading: true, error: null }));
        
        // Check if user is admin
        if (!user?.isAdmin) {
          toast({
            title: "Access denied",
            description: "You don't have permission to access the admin dashboard",
            variant: "destructive"
          });
          router.push('/dashboard');
          return;
        }
        
        // Fetch admin dashboard stats
        const dashboardStats = await adminService.getDashboardStats();
        
        // Fetch activity data
        const activity = await adminService.getSystemActivity(5); // Get latest 5 activities
        
        // Calculate activity summaries (this would ideally come from the backend)
        // For now, we'll simulate some data
        const activitySummaries = {
          users: { 
            count: dashboardStats.activeUsers, 
            change: Math.floor(Math.random() * 20) - 5 // Random number between -5 and 15
          },
          templates: { 
            count: dashboardStats.templates, 
            change: Math.floor(Math.random() * 20) - 5
          },
          responses: { 
            count: dashboardStats.responses, 
            change: Math.floor(Math.random() * 30)
          }
        };

        setState({
          stats: dashboardStats,
          activitySummaries,
          recentActivity: activity,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        toast({
          title: "Error loading admin data",
          description: "Failed to load the admin dashboard data. Please try again.",
          variant: "destructive"
        });
        setState(prev => ({ 
          ...prev, 
          loading: false,
          error: "Failed to load dashboard data. Please try again."
        }));
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

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return `${diffInDays} day ago`;
    return `${diffInDays} days ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'template':
        return <FileText className="h-4 w-4" />;
      case 'response':
        return <MessageSquare className="h-4 w-4" />;
      case 'like':
        return <Heart className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // If user is not available or not admin, display a loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Loading admin dashboard</h2>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
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
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="space-x-2">
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/api-status">
              <ActivityIcon className="h-4 w-4" />
              API Status
            </Link>
          </Button>
          <Button variant="outline" className="gap-2" asChild>
            <Link href="/admin/system">
              <ShieldAlert className="h-4 w-4" />
              System Status
            </Link>
          </Button>
        </div>
      </div>

      {state.error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 text-red-800 dark:text-red-200 rounded-md">
          <p>{state.error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Users"
          value={state.stats.users}
          icon={<Users className="h-4 w-4" />}
          loading={state.loading}
          trend={state.activitySummaries.users.change !== 0 ? {
            value: state.activitySummaries.users.change,
            isPositive: state.activitySummaries.users.change > 0
          } : undefined}
          description="Active users this month"
        />
        <StatCard
          title="Total Templates"
          value={state.stats.templates}
          icon={<FileText className="h-4 w-4" />}
          loading={state.loading}
          trend={state.activitySummaries.templates.change !== 0 ? {
            value: state.activitySummaries.templates.change,
            isPositive: state.activitySummaries.templates.change > 0
          } : undefined}
          description="Created this month"
        />
        <StatCard
          title="Form Responses"
          value={state.stats.responses}
          icon={<MessageSquare className="h-4 w-4" />}
          loading={state.loading}
          trend={state.activitySummaries.responses.change !== 0 ? {
            value: state.activitySummaries.responses.change,
            isPositive: state.activitySummaries.responses.change > 0
          } : undefined}
          description="Submitted this month"
        />
        <StatCard
          title="Social Engagement"
          value={state.stats.likes + state.stats.comments}
          icon={<Heart className="h-4 w-4" />}
          loading={state.loading}
          description={`${state.stats.likes} likes, ${state.stats.comments} comments`}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* User Statistics Card */}
        <Card className="col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Activity Overview</CardTitle>
              <CardDescription>Latest activity across the platform</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon">
                <ChevronsLeft className="h-4 w-4" />
                <span className="sr-only">Previous period</span>
              </Button>
              <Button variant="outline" size="icon">
                <ChevronsRight className="h-4 w-4" />
                <span className="sr-only">Next period</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {state.loading ? (
              <Skeleton className="h-[250px] w-full rounded" />
            ) : (
              <div className="space-y-8">
                {/* User activity summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <div className="text-sm font-medium text-muted-foreground mb-1">New Users</div>
                    <div className="text-2xl font-bold">{state.activitySummaries.users.count}</div>
                    <div className="flex items-center text-xs mt-0.5">
                      {state.activitySummaries.users.change > 0 ? (
                        <span className="text-green-500 flex items-center">
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          +{state.activitySummaries.users.change}%
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center">
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          {state.activitySummaries.users.change}%
                        </span>
                      )}
                      <span className="text-muted-foreground ml-1">vs last month</span>
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <div className="text-sm font-medium text-muted-foreground mb-1">New Templates</div>
                    <div className="text-2xl font-bold">{state.activitySummaries.templates.count}</div>
                    <div className="flex items-center text-xs mt-0.5">
                      {state.activitySummaries.templates.change > 0 ? (
                        <span className="text-green-500 flex items-center">
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          +{state.activitySummaries.templates.change}%
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center">
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          {state.activitySummaries.templates.change}%
                        </span>
                      )}
                      <span className="text-muted-foreground ml-1">vs last month</span>
                    </div>
                  </div>
                  
                  <div className="col-span-1">
                    <div className="text-sm font-medium text-muted-foreground mb-1">Form Responses</div>
                    <div className="text-2xl font-bold">{state.activitySummaries.responses.count}</div>
                    <div className="flex items-center text-xs mt-0.5">
                      {state.activitySummaries.responses.change > 0 ? (
                        <span className="text-green-500 flex items-center">
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                          </svg>
                          +{state.activitySummaries.responses.change}%
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center">
                          <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                          {state.activitySummaries.responses.change}%
                        </span>
                      )}
                      <span className="text-muted-foreground ml-1">vs last month</span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="relative mt-4">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-muted-foreground/20" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Recent Activity
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4 mt-6">
                    {state.recentActivity.length > 0 ? (
                      state.recentActivity.map((activity, idx) => (
                        <div key={idx} className="flex items-start">
                          <div className={`rounded-full p-2 mr-3 ${
                            activity.type === 'user' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' :
                            activity.type === 'template' ? 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' : 
                            'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                          }`}>
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {activity.user} {activity.action} a {activity.type}
                              {activity.title && <span className="font-normal"> - {activity.title}</span>}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {getTimeAgo(activity.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No recent activity to display
                      </div>
                    )}
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full text-sm" asChild>
                  <Link href="/admin/activity">
                    View All Activity
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Overview</CardTitle>
            <CardDescription>System metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            {state.loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Active Topics</div>
                    <div className="text-sm font-bold">{state.stats.topicsCount}</div>
                  </div>
                  <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${Math.min(100, state.stats.topicsCount * 5)}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Admins</div>
                    <div className="text-sm font-bold">{state.stats.adminCount}</div>
                  </div>
                  <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                    <div 
                      className="h-full bg-amber-500 rounded-full" 
                      style={{ width: `${Math.min(100, state.stats.adminCount * 20)}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">Active Users</div>
                    <div className="text-sm font-bold">
                      {state.stats.activeUsers} / {state.stats.users}
                    </div>
                  </div>
                  <div className="h-2 w-full bg-muted overflow-hidden rounded-full">
                    <div 
                      className="h-full bg-green-500 rounded-full" 
                      style={{ 
                        width: `${state.stats.users ? Math.min(100, (state.stats.activeUsers / state.stats.users) * 100) : 0}%` 
                      }}
                    />
                  </div>
                </div>

                <div className="pt-4 flex flex-col space-y-3">
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/admin/users">
                      Manage Users
                    </Link>
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/admin/topics">
                      Manage Topics
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Admin management tools</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Button className="h-auto flex-col p-6" variant="outline" asChild>
            <Link href="/admin/users">
              <Users className="h-8 w-8 mb-2" />
              <span className="font-medium">User Management</span>
            </Link>
          </Button>
          <Button className="h-auto flex-col p-6" variant="outline" asChild>
            <Link href="/admin/templates">
              <FileText className="h-8 w-8 mb-2" />
              <span className="font-medium">All Templates</span>
            </Link>
          </Button>
          <Button className="h-auto flex-col p-6" variant="outline" asChild>
            <Link href="/admin/responses">
              <MessageSquare className="h-8 w-8 mb-2" />
              <span className="font-medium">All Responses</span>
            </Link>
          </Button>
          <Button className="h-auto flex-col p-6" variant="outline" asChild>
            <Link href="/admin/settings">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="h-8 w-8 mb-2"
              >
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="font-medium">System Settings</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}