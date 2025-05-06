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
import { Users, FileText, MessageSquare, Heart, ChevronRight, ShieldAlert, ActivityIcon } from "lucide-react";
import { toast } from '@/components/ui/use-toast';

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    templates: 0,
    responses: 0,
    likes: 0,
    comments: 0,
    activeUsers: 0,
    topicsCount: 0,
    adminCount: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
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
        setLoading(true);
        
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
        setStats(dashboardStats);

        // Fetch activity data
        const activity = await adminService.getSystemActivity();
        setRecentActivity(Array.isArray(activity) ? activity.slice(0, 3) : []);
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
        toast({
          title: "Error loading admin data",
          description: "Failed to load the admin dashboard data. Please try again.",
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

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hr ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <Users className="h-4 w-4" />;
      case 'template':
        return <FileText className="h-4 w-4" />;
      case 'response':
        return <MessageSquare className="h-4 w-4" />;
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

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Users"
          value={stats.users}
          icon={<Users className="h-4 w-4" />}
          loading={loading}
        />
        <StatCard
          title="Total Templates"
          value={stats.templates}
          icon={<FileText className="h-4 w-4" />}
          loading={loading}
        />
        <StatCard
          title="Total Responses"
          value={stats.responses}
          icon={<MessageSquare className="h-4 w-4" />}
          loading={loading}
        />
        <StatCard
          title="Total Likes"
          value={stats.likes}
          icon={<Heart className="h-4 w-4" />}
          loading={loading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* User Statistics Card */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>Templates created and responses submitted over time</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[250px] w-full rounded" />
            ) : (
              <div className="flex items-center justify-center h-[250px]">
                <div className="text-center">
                  <p className="text-muted-foreground">
                    Activity chart will be available soon
                  </p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link href="/admin/analytics">
                      View Detailed Analytics
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest activity across the platform</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start">
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
                ))}

                <Button variant="ghost" size="sm" className="w-full text-sm" asChild>
                  <Link href="/admin/activity">
                    View All Activity
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <p className="text-muted-foreground">No recent activity found</p>
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
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1-1-1.73l.43-.25a2 2 0 0 1-2 0l.15.08a2 2 0 0 0-2.73-.73l-.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1-1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
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