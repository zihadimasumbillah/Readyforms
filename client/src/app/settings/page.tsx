"use client";

import React, { useState } from 'react';
import { DashboardLayout } from "@/components/layouts/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/auth-context";
import { authService } from "@/lib/api/auth-service";
import { toast } from "@/components/ui/use-toast";
import { Lock, Shield, Bell, Smartphone, Key, Save } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [otpSecurity, setOtpSecurity] = useState(true);

  const handleLogout = () => {
    if (logout) {
      logout();
      router.push('/auth/login');
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
        description: err.message || "Failed to update password.",
        variant: "destructive",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout user={user} onLogout={handleLogout}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-muted-foreground">Manage your security options, authentication preferences, and notifications</p>
        </div>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-500" />
              Change Password
            </CardTitle>
            <CardDescription>Update your password to maintain account security</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Password</label>
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
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
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
                <Button type="submit" disabled={updatingPassword}>
                  {updatingPassword ? "Updating password..." : "Update Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security & OTP Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              Two-Factor & OTP Authentication
            </CardTitle>
            <CardDescription>Enhance your sign-in security with Email 6-digit OTP verification</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-semibold text-sm flex items-center gap-2">
                  <Smartphone className="h-4 w-4 text-primary" />
                  Email OTP Verification
                </div>
                <p className="text-xs text-muted-foreground">
                  Receive a 6-digit one-time code on your email for quick, passwordless login.
                </p>
              </div>
              <Switch
                checked={otpSecurity}
                onCheckedChange={(val) => {
                  setOtpSecurity(val);
                  toast({
                    title: val ? "OTP Protection Enabled" : "OTP Protection Disabled",
                    description: val ? "You can now use OTP code to log in anytime." : "Standard password login active.",
                  });
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Control email notifications for form responses and social activity</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-semibold text-sm">Form Submissions Alert</div>
                <p className="text-xs text-muted-foreground">
                  Receive email alerts when a user submits a response to your templates.
                </p>
              </div>
              <Switch
                checked={emailNotifications}
                onCheckedChange={(val) => {
                  setEmailNotifications(val);
                  toast({
                    title: "Preferences Saved",
                    description: `Form submission alerts ${val ? "enabled" : "disabled"}.`,
                  });
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
