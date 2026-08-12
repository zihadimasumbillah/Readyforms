"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { authService } from "@/lib/api/auth-service";
import { toast } from "@/components/ui/use-toast";
import { User, Mail, Shield, Calendar, Save, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const router = useRouter();

  const [name, setName] = useState(user?.name || "");
  const [theme, setTheme] = useState(user?.theme || "system");
  const [language, setLanguage] = useState(user?.language || "en");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setTheme(user.theme || "system");
      setLanguage(user.language || "en");
    } else {
      router.push('/auth/login');
    }
  }, [user, router]);

  const handleLogout = () => {
    if (logout) {
      logout();
      router.push('/auth/login');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const res = await authService.updateProfile({ name, theme, language });
      if (res.user && auth.updateSession) {
        await auth.updateSession();
      }
      toast({
        title: "Profile updated",
        description: "Your profile information has been saved successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const getInitials = (n: string) => {
    return n
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Profile</h1>
          <p className="text-muted-foreground">Manage your personal account details and preferences</p>
        </div>

        {/* Profile Card Header */}
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary/10 shadow-inner">
                <AvatarFallback className="bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold text-2xl">
                  {getInitials(user.name || "User")}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-2 text-center md:text-left flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                  <h2 className="text-2xl font-bold">{user.name}</h2>
                  <Badge variant={user.isAdmin ? "destructive" : "secondary"} className="w-fit mx-auto md:mx-0">
                    {user.isAdmin ? "SuperAdmin" : "Standard Account"}
                  </Badge>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground pt-1">
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-primary" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    <span>Verified User</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle>Edit Account Information</CardTitle>
            <CardDescription>Update your display name and basic account settings</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Display Name
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Full Name"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  Email Address
                </label>
                <Input
                  value={user.email}
                  disabled
                  className="bg-muted/50 cursor-not-allowed"
                />
                <p className="text-xs text-muted-foreground">Email address cannot be modified directly.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Preferred Interface Theme</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  >
                    <option value="light">Light Mode</option>
                    <option value="dark">Dark Mode</option>
                    <option value="system">System Default</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Preferred Language</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={saving}>
                  {saving ? (
                    "Saving changes..."
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
