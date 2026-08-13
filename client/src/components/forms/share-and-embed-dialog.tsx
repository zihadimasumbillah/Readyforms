"use client";

import React, { useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Share2, QrCode, Code2, Copy, Check, ExternalLink, Download,
  Send, MessageCircle, Twitter, Linkedin, Mail
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ShareAndEmbedDialogProps {
  templateId: string;
  title: string;
  trigger?: React.ReactNode;
}

export function ShareAndEmbedDialog({ templateId, title, trigger }: ShareAndEmbedDialogProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);
  const [embedHeight, setEmbedHeight] = useState("700");

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://readyforms.vercel.app';
  const formUrl = `${baseUrl}/forms/${templateId}`;
  const embedCode = `<iframe\n  src="${formUrl}?embed=true"\n  width="100%"\n  height="${embedHeight}"\n  frameborder="0"\n  style="border: none; max-width: 100%; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.08);"\n  allow="camera; microphone; autoplay; encrypted-media;"\n></iframe>`;

  // Dynamic QR Code SVG generator using Google Chart API or raw SVG
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(formUrl)}&margin=10`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(formUrl);
    setCopiedLink(true);
    toast({ title: "Link Copied", description: "Form URL copied to clipboard!" });
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyEmbed = () => {
    navigator.clipboard.writeText(embedCode);
    setCopiedEmbed(true);
    toast({ title: "Embed Code Copied", description: "Paste iframe HTML into Notion, Webflow, WordPress, etc." });
    setTimeout(() => setCopiedEmbed(false), 2500);
  };

  const shareWhatsApp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Fill out "${title}" on ReadyForms:\n${formUrl}`)}`, '_blank');
  };

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this form "${title}" on ReadyForms!`)}&url=${encodeURIComponent(formUrl)}`, '_blank');
  };

  const shareLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(formUrl)}`, '_blank');
  };

  const shareEmail = () => {
    window.open(`mailto:?subject=${encodeURIComponent(`ReadyForms: ${title}`)}&body=${encodeURIComponent(`Please fill out this form:\n\n${formUrl}`)}`, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <Share2 className="h-4 w-4" />
            <span>Share & Embed</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Share2 className="h-5 w-5 text-cyan-500" />
            Share & Embed Form
          </DialogTitle>
          <DialogDescription>
            Share "{title}" with respondents via link, QR code, social platforms, or embed into your website.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="link" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="link" className="gap-1.5 text-xs sm:text-sm">
              <Share2 className="h-3.5 w-3.5" />
              <span>Link & Social</span>
            </TabsTrigger>
            <TabsTrigger value="qr" className="gap-1.5 text-xs sm:text-sm">
              <QrCode className="h-3.5 w-3.5" />
              <span>QR Code</span>
            </TabsTrigger>
            <TabsTrigger value="embed" className="gap-1.5 text-xs sm:text-sm">
              <Code2 className="h-3.5 w-3.5" />
              <span>Embed Widget</span>
            </TabsTrigger>
          </TabsList>

          {/* Link & Social Tab */}
          <TabsContent value="link" className="space-y-4 pt-3">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Direct Form Link</label>
              <div className="flex gap-2">
                <Input value={formUrl} readOnly className="font-mono text-xs" />
                <Button size="sm" onClick={handleCopyLink} className="shrink-0 gap-1 bg-cyan-600 hover:bg-cyan-700 text-white">
                  {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedLink ? "Copied" : "Copy"}</span>
                </Button>
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Instant Social Distribution</label>
              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" size="sm" onClick={shareWhatsApp} className="flex-col h-auto py-2.5 gap-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 hover:border-emerald-500">
                  <MessageCircle className="h-4 w-4 text-emerald-500" />
                  <span className="text-[10px]">WhatsApp</span>
                </Button>
                <Button variant="outline" size="sm" onClick={shareTwitter} className="flex-col h-auto py-2.5 gap-1 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:border-blue-400">
                  <Twitter className="h-4 w-4 text-sky-500" />
                  <span className="text-[10px]">X / Twitter</span>
                </Button>
                <Button variant="outline" size="sm" onClick={shareLinkedIn} className="flex-col h-auto py-2.5 gap-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 hover:border-indigo-500">
                  <Linkedin className="h-4 w-4 text-indigo-500" />
                  <span className="text-[10px]">LinkedIn</span>
                </Button>
                <Button variant="outline" size="sm" onClick={shareEmail} className="flex-col h-auto py-2.5 gap-1 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-500">
                  <Mail className="h-4 w-4 text-amber-500" />
                  <span className="text-[10px]">Email</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* QR Code Tab */}
          <TabsContent value="qr" className="space-y-4 pt-3 text-center">
            <div className="p-4 bg-white dark:bg-neutral-900 border rounded-2xl inline-block mx-auto shadow-sm">
              <img
                src={qrCodeUrl}
                alt={`QR code for ${title}`}
                className="w-48 h-48 mx-auto rounded-lg"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Scan with any mobile camera to instantly fill out this form on iOS & Android.
            </p>
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  window.open(qrCodeUrl, '_blank');
                }}
              >
                <Download className="h-4 w-4" />
                <span>Open High-Res QR</span>
              </Button>
            </div>
          </TabsContent>

          {/* Embed Widget Tab */}
          <TabsContent value="embed" className="space-y-4 pt-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Embed IFrame HTML</label>
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-muted-foreground">Height:</span>
                  <input
                    type="number"
                    value={embedHeight}
                    onChange={(e) => setEmbedHeight(e.target.value)}
                    className="w-14 px-1.5 py-0.5 border rounded text-xs text-center"
                  />
                  <span>px</span>
                </div>
              </div>
              <textarea
                readOnly
                value={embedCode}
                rows={5}
                className="w-full font-mono text-xs p-3 rounded-lg border bg-muted/40 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button size="sm" onClick={handleCopyEmbed} className="gap-1.5 bg-cyan-600 hover:bg-cyan-700 text-white">
                {copiedEmbed ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedEmbed ? "Copied Embed HTML" : "Copy Embed Code"}</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
