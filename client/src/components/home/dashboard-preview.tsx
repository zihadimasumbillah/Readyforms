"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, FileText, Heart, MessageSquare } from 'lucide-react';

export function DashboardPreview() {
  return (
    <div className="w-full max-w-4xl mx-auto overflow-hidden rounded-lg border bg-background shadow">
      <div className="flex border-b">
        <div className="hidden md:block w-64 border-r p-6">
          {/* Sidebar Navigation */}
          <div className="space-y-1">
            {['Dashboard', 'My Templates', 'Responses', 'Settings'].map((item, i) => (
              <div 
                key={i}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  i === 0 ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                }`}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex-1 p-4 md:p-6 overflow-auto h-[380px]">
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Recent Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  title: "Customer Feedback",
                  responses: 24,
                  likes: 8,
                  comments: 3
                },
                {
                  title: "Event Registration",
                  responses: 56,
                  likes: 12,
                  comments: 5
                }
              ].map((template, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{template.title}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {template.responses} responses
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <div className="flex items-center mr-3">
                        <Heart className="h-3 w-3 mr-1" />
                        <span>{template.likes}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        <span>{template.comments}</span>
                      </div>
                      <div className="ml-auto flex items-center">
                        <span>View</span>
                        <ChevronRight className="h-3 w-3 ml-1" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { title: "Templates", value: "12", icon: <FileText className="h-4 w-4" /> },
                { title: "Responses", value: "148", icon: <MessageSquare className="h-4 w-4" /> },
                { title: "Likes", value: "38", icon: <Heart className="h-4 w-4" /> }
              ].map((stat, i) => (
                <div key={i} className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    <div className="mr-2 rounded-full bg-primary/10 p-1.5 text-primary">
                      {stat.icon}
                    </div>
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                  </div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
