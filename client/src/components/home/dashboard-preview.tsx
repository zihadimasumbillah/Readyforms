"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function DashboardPreview({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border border-muted bg-card shadow-md", className)}>
      <div className="flex h-10 items-center border-b bg-muted/50 px-4">
        <div className="flex items-center space-x-2">
          <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-yellow-500"></div>
          <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
        </div>
        <div className="mx-auto text-xs text-muted-foreground">Preview of ReadyForms Dashboard</div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <Card className="shadow-sm">
            <CardHeader className="p-3">
              <CardTitle className="text-sm">Total Templates</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="p-3">
              <CardTitle className="text-sm">Form Responses</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-2xl font-bold">142</p>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="p-3">
              <CardTitle className="text-sm">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-2xl font-bold">87%</p>
              <p className="text-xs text-muted-foreground">+3% from last month</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="shadow-sm mb-4">
          <CardHeader className="p-3">
            <CardTitle className="text-sm">Recent Templates</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="space-y-2">
              {[
                "Customer Satisfaction Survey",
                "Employee Feedback Form",
                "Product Evaluation Quiz"
              ].map((item, i) => (
                <div key={i} className="flex justify-between border-b pb-1 last:border-0">
                  <p className="text-xs">{item}</p>
                  <p className="text-xs text-muted-foreground">{i + 1} day{i !== 0 ? 's' : ''} ago</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-sm">
            <CardHeader className="p-3">
              <CardTitle className="text-sm">Activity Overview</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 h-20 flex items-center justify-center">
              <div className="w-full h-8 bg-muted rounded-sm flex items-end">
                {[30, 45, 20, 60, 75, 45, 35].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 mx-0.5"
                    style={{ height: `${h}%`, backgroundColor: 'var(--primary)' }}
                  ></div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="p-3">
              <CardTitle className="text-sm">Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <div className="space-y-2">
                {[
                  "Review responses",
                  "Update feedback form"
                ].map((task, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="h-2.5 w-2.5 rounded-full bg-primary"></div>
                    {task}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
