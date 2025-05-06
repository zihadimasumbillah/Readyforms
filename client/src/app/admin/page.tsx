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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from "next-themes";
import { Users, FileText, MessageSquare, Heart, ChevronRight } from "lucide-react";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    templates: 0,
    responses: 0,
    likes: 0,
    comments: 0,
    users: 0,
    activeUsers: 0,
    topicsCount: 0,
    adminCount: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const { theme } = useTheme();
  const router = useRouter();
  
  // User mock data - in a real application, this would come from authentication context
  const mockUser = {
    name: "Admin User",
    email: "admin@readyforms.com",
    isAdmin: true
  };
  
  const handleLogout = () => {
    console.log("Logout clicked");
    router.push('/auth/login');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch admin dashboard stats
        const dashboardStats = await adminService.getDashboardStats();
        setStats(dashboardStats);

        // This would normally come from your API
        // Mock data for demonstration purposes
        setChartData([
          { name: 'Jan', templates: 4, responses: 24 },
          { name: 'Feb', templates: 7, responses: 35 },
          { name: 'Mar', templates: 5, responses: 28 },
          { name: 'Apr', templates: 10, responses: 42 },
          { name: 'May', templates: 12, responses: 58 },
          { name: 'Jun', templates: 8, responses: 50 }
        ]);

        setRecentActivity([
          { 
            id: 1, 
            type: 'template', 
            action: 'created',
            title: 'Employee Feedback Form',
            user: 'Jane Smith',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
          },
          { 
            id: 2, 
            type: 'response', 
            action: 'submitted',
            title: 'Customer Survey',
            user: 'Mike Johnson',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
          },
          { 
            id: 3, 
            type: 'user', 
            action: 'registered',
            title: '',
            user: 'Sarah Connor',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString()
          },
        ]);
      } catch (error) {
        console.error("Error fetching admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

  return (
    <DashboardLayout 
      user={mockUser}
      onLogout={handleLogout}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
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
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e5e7eb'} />
                  <XAxis dataKey="name" stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                  <YAxis stroke={theme === 'dark' ? '#9ca3af' : '#6b7280'} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                      border: theme === 'dark' ? '1px solid #374151' : '1px solid #e5e7eb',
                      borderRadius: '0.375rem',
                      color: theme === 'dark' ? '#f3f4f6' : '#1f2937'
                    }}
                  />
                  <Bar dataKey="templates" fill="#3b82f6" name="Templates" barSize={30} />
                  <Bar dataKey="responses" fill="#10b981" name="Responses" barSize={30} />
                </BarChart>
              </ResponsiveContainer>
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
            ) : (
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
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
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