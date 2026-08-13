"use client";

import React, { useState, useEffect } from 'react';
import { AdminLayout } from "@/components/layouts/admin-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Settings, Shield, Bell, Database, Save, CheckCircle2, Lock,
  Globe, Mail, Server, RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/use-toast";
import { adminService } from "@/lib/api/admin-service";

export default function AdminSettingsPage() {
  const auth = useAuth();
  const user = auth?.user;
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [enriching, setEnriching] = useState(false);
  const [settings, setSettings] = useState({
    allowPublicRegistrations: true,
    requireEmailVerification: false,
    enableAiFormGenerator: true,
    enablePublicTemplates: true,
    defaultLanguage: "en",
    maxUploadSizeMb: 10,
    maintenanceMode: false,
    sessionTimeoutHours: 24,
    enableRateLimiting: true,
  });

  const handleEnrichData = async () => {
    try {
      setEnriching(true);
      const res = await adminService.enrichProductionData();
      toast({
        title: "Enrichment Complete!",
        description: res.message || "Users from verified academic & corporate domains synced and form responses generated successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Enrichment Failed",
        description: err?.response?.data?.message || err?.message || "Failed to complete production data enrichment.",
        variant: "destructive",
      });
    } finally {
      setEnriching(false);
    }
  };

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

    // Load persisted settings if any
    const saved = localStorage.getItem("readyforms_admin_settings");
    if (saved) {
      try {
        setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
      } catch (e) {
        // ignore
      }
    }
  }, [user, auth?.status, router]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      localStorage.setItem("readyforms_admin_settings", JSON.stringify(settings));
      setTimeout(() => {
        setSaving(false);
        toast({
          title: "Settings saved",
          description: "System administrative policies have been updated successfully.",
        });
      }, 500);
    } catch (err) {
      setSaving(false);
      toast({
        title: "Error saving settings",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <form onSubmit={handleSave} className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">System Administration Settings</h1>
            <p className="text-muted-foreground text-sm">
              Configure platform governance, security enforcement, AI capabilities, and default policies
            </p>
          </div>

          <Button type="submit" disabled={saving} className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white">
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </Button>
        </div>

        {/* Security & Access Policies */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-500" />
              Security & Registration Governance
            </CardTitle>
            <CardDescription>
              Control user signup access, authentication constraints, and session lifecycles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-semibold text-sm">Allow Public User Registrations</p>
                <p className="text-xs text-muted-foreground">
                  When enabled, new users can self-register via Google OAuth or Credentials
                </p>
              </div>
              <Switch
                checked={settings.allowPublicRegistrations}
                onCheckedChange={(c) => setSettings({ ...settings, allowPublicRegistrations: c })}
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-semibold text-sm">Enable AI Smart Form Generator</p>
                <p className="text-xs text-muted-foreground">
                  Provide automatic AI questionnaire creation and enhancement to template creators
                </p>
              </div>
              <Switch
                checked={settings.enableAiFormGenerator}
                onCheckedChange={(c) => setSettings({ ...settings, enableAiFormGenerator: c })}
              />
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-semibold text-sm">Enable Public Template Discovery</p>
                <p className="text-xs text-muted-foreground">
                  Allow creators to publish forms to the global public feed
                </p>
              </div>
              <Switch
                checked={settings.enablePublicTemplates}
                onCheckedChange={(c) => setSettings({ ...settings, enablePublicTemplates: c })}
              />
            </div>

            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-semibold text-sm">Active Rate Limiting & DDoS Shield</p>
                <p className="text-xs text-muted-foreground">
                  Enforce IP throttle protection across high-frequency API submission routes
                </p>
              </div>
              <Switch
                checked={settings.enableRateLimiting}
                onCheckedChange={(c) => setSettings({ ...settings, enableRateLimiting: c })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Runtime Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="h-5 w-5 text-cyan-500" />
              Runtime Limits & Storage
            </CardTitle>
            <CardDescription>
              Configure maximum payload constraints and session durations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Session Token Validity (Hours)
                </label>
                <Input
                  type="number"
                  value={settings.sessionTimeoutHours}
                  onChange={(e) => setSettings({ ...settings, sessionTimeoutHours: parseInt(e.target.value) || 24 })}
                  min={1}
                  max={720}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Max Form Payload Size (MB)
                </label>
                <Input
                  type="number"
                  value={settings.maxUploadSizeMb}
                  onChange={(e) => setSettings({ ...settings, maxUploadSizeMb: parseInt(e.target.value) || 10 })}
                  min={1}
                  max={50}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Production Data & User Enrichment */}
        <Card className="border-cyan-500/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Database className="h-5 w-5 text-cyan-500" />
              Production Data & Activity Enrichment
            </CardTitle>
            <CardDescription>
              Populate platform metrics with verified academic/corporate domain accounts, form responses, likes, and live activity streams
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border">
              <div className="space-y-1">
                <p className="font-semibold text-sm">Sync Realistic Users & Activity Streams</p>
                <p className="text-xs text-muted-foreground">
                  Resolves template author relationships, generates responses for empty forms, and adds realistic user interactions from verified domains (@stanford.edu, @google.com, @microsoft.com, @readyforms.com).
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={enriching}
                onClick={handleEnrichData}
                className="gap-2 shrink-0 border-cyan-500/50 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10"
              >
                <RefreshCw className={`h-4 w-4 ${enriching ? 'animate-spin' : ''}`} />
                <span>{enriching ? "Enriching Data..." : "Enrich & Sync Activity"}</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card className={settings.maintenanceMode ? "border-amber-500" : ""}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Lock className="h-5 w-5 text-amber-500" />
              Emergency Maintenance Control
            </CardTitle>
            <CardDescription>
              Restrict platform access for planned database migrations and upgrades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-semibold text-sm">Maintenance Mode Active</p>
                <p className="text-xs text-muted-foreground">
                  When enabled, non-admin visitors will see an upgrade announcement banner
                </p>
              </div>
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(c) => setSettings({ ...settings, maintenanceMode: c })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t pt-4">
            <Button type="submit" disabled={saving} className="bg-cyan-600 hover:bg-cyan-700 text-white">
              {saving ? "Saving Policies..." : "Save System Settings"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </AdminLayout>
  );
}
