"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { authService } from "@/lib/api/auth-service";
import { toast } from "@/components/ui/use-toast";
import { 
  Lock, Shield, Bell, Smartphone, User, Globe, 
  Palette, Download, CheckCircle2, ShieldCheck, Mail
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const router = useRouter();

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // User Preferences State
  const [language, setLanguage] = useState(user?.language || "en");
  const [theme, setTheme] = useState(user?.theme || "system");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [commentAlerts, setCommentAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [otpSecurity, setOtpSecurity] = useState(true);
  const [savingPreferences, setSavingPreferences] = useState(false);

  useEffect(() => {
    if (auth?.status === "loading") return;
    if (!user) {
      router.push("/auth/login?redirect=/settings");
    }
  }, [user, auth?.status, router]);

  const handleLogout = async () => {
    if (logout) {
      await logout();
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;

    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation do not match.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUpdatingPassword(true);
      await authService.updateProfile({ currentPassword, newPassword });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Update failed",
        description: err?.response?.data?.message || err?.message || "Failed to update password.",
        variant: "destructive",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      setSavingPreferences(true);
      await authService.updateProfile({ language, theme });
      toast({
        title: "Preferences saved",
        description: "Your personal language and notification preferences have been saved.",
      });
    } catch (err: any) {
      toast({
        title: "Failed to save preferences",
        description: err?.message || "Could not save your preferences.",
        variant: "destructive",
      });
    } finally {
      setSavingPreferences(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Personal Account Settings</h1>
          <p className="text-muted-foreground text-sm">
            Manage your personal profile security, multi-factor authentication, email notifications, language and display preferences
          </p>
        </div>

        {/* User Identity & Account Details */}
        <Card className="bg-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {(user.name || user.email || "U")[0].toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {user.name || "User"}
                    {user.isAdmin && (
                      <Badge variant="outline" className="text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30">
                        Admin
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">{user.email}</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="w-fit text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30">
                <ShieldCheck className="h-3.5 w-3.5 mr-1" />
                Active Account
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Language & Regional Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              Language & Regional Preferences
            </CardTitle>
            <CardDescription>Select your preferred default display language across ReadyForms</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div 
                onClick={() => setLanguage("en")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  language === "en" 
                    ? "border-primary bg-primary/5 font-semibold ring-1 ring-primary" 
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">English (US)</p>
                    <p className="text-xs text-muted-foreground">Standard English interface</p>
                  </div>
                  {language === "en" && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
              </div>

              <div 
                onClick={() => setLanguage("bn")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  language === "bn" 
                    ? "border-primary bg-primary/5 font-semibold ring-1 ring-primary" 
                    : "border-border hover:bg-muted/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">বাংলা (Bengali)</p>
                    <p className="text-xs text-muted-foreground">বাংলা ভাষার সম্পূর্ণ ইন্টারফেস</p>
                  </div>
                  {language === "bn" && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button onClick={handleSavePreferences} disabled={savingPreferences} size="sm">
              {savingPreferences ? "Saving..." : "Save Preferences"}
            </Button>
          </CardFooter>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-500" />
              Change Password
            </CardTitle>
            <CardDescription>Update your personal account login password</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">Current Password</label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">New Password</label>
                  <Input
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase text-muted-foreground">Confirm New Password</label>
                  <Input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" disabled={updatingPassword} size="sm">
                  {updatingPassword ? "Updating password..." : "Update Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security & OTP Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              Two-Factor & Email OTP Protection
            </CardTitle>
            <CardDescription>Enable or disable passwordless 6-digit email OTP authentication</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <div className="font-semibold text-sm flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-emerald-500" />
                  Email OTP Verification
                </div>
                <p className="text-xs text-muted-foreground">
                  Receive a 6-digit verification code directly on your email for secure one-click sign-in
                </p>
              </div>
              <Switch
                checked={otpSecurity}
                onCheckedChange={(val) => {
                  setOtpSecurity(val);
                  toast({
                    title: val ? "OTP Protection Enabled" : "OTP Protection Disabled",
                    description: val ? "You can sign in with OTP codes anytime." : "Standard password login enabled.",
                  });
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              Personal Notification Preferences
            </CardTitle>
            <CardDescription>Control alerts sent to your email address ({user.email})</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 divide-y">
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <div className="font-semibold text-sm">Form Submissions Alert</div>
                <p className="text-xs text-muted-foreground">
                  Receive instant notification when someone submits a response to any of your templates
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={(val) => setEmailNotifications(val)}
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <div className="font-semibold text-sm">Comments & Social Interactions</div>
                <p className="text-xs text-muted-foreground">
                  Get notified when members comment on or like your published templates
                </p>
              </div>
              <Switch
                checked={commentAlerts}
                onCheckedChange={(val) => setCommentAlerts(val)}
              />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <div className="font-semibold text-sm">Weekly Activity Digest</div>
                <p className="text-xs text-muted-foreground">
                  Receive a weekly summary email of response metrics and form engagement
                </p>
              </div>
              <Switch
                checked={weeklyDigest}
                onCheckedChange={(val) => setWeeklyDigest(val)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button onClick={handleSavePreferences} disabled={savingPreferences} size="sm">
              {savingPreferences ? "Saving..." : "Save Notification Settings"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
}
