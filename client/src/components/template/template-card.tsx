"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Template } from "@/types";
import { cn } from "@/lib/utils";
import { Eye, Edit, Heart, MessageSquare } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

interface TemplateCardProps {
  template: Template;
  onClick?: () => void;
  className?: string;
  showStats?: boolean;
}

export function TemplateCard({ template, onClick, className, showStats = true }: TemplateCardProps) {
  const { user } = useAuth();
  const isOwner = user && template.userId === user.id;
  
  // Filter out test templates
  const isTestTemplate = 
    (template.title?.toLowerCase() || '').includes('test') || 
    (template.description?.toLowerCase() || '').includes('test');
  
  // Format the creation date
  const formattedDate = template.createdAt ? 
    new Date(template.createdAt).toLocaleDateString() : 'Unknown date';

  // Get just the date without time for cleaner display
  const creationDate = template.createdAt ? 
    new Date(template.createdAt).toLocaleDateString() : 'Unknown date';

  return (
    <Card 
      className={cn("overflow-hidden transition-all hover:shadow-md", className)} 
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg line-clamp-1">
            {template.title}
          </CardTitle>
          {template.topic && (
            <Badge variant="outline" className="shrink-0">
              {template.topic.name}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="h-20">
          {template.description && (
            <p className="text-muted-foreground text-sm line-clamp-3 mb-2">
              {template.description}
            </p>
          )}
        </div>
        <div className="flex items-center mt-2 text-xs text-muted-foreground">
          <span>
            Created {creationDate} {template.user && `by ${template.user.name}`}
          </span>
        </div>
        
        {showStats && (
          <div className="flex items-center justify-between mt-3 text-sm">
            <div className="flex items-center gap-4">
              <div className="flex items-center text-muted-foreground">
                <Heart className="h-3.5 w-3.5 mr-1" />
                <span>{template.likesCount || 0}</span>
              </div>
              <div className="flex items-center text-muted-foreground">
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                <span>{template.commentsCount || 0}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 gap-2">
        <Button 
          variant="secondary" 
          className="w-full" 
          size="sm"
          onClick={onClick}
          asChild={!onClick}
        >
          {onClick ? (
            <>
              <Eye className="h-3.5 w-3.5 mr-1" />
              View
            </>
          ) : (
            <Link href={`/templates/${template.id}`}>
              <Eye className="h-3.5 w-3.5 mr-1" />
              View
            </Link>
          )}
        </Button>
        
        {isOwner && (
          <Button 
            variant="outline" 
            size="sm"
            asChild
          >
            <Link href={`/templates/${template.id}/edit`}>
              <Edit className="h-3.5 w-3.5 mr-1" />
              Edit
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}