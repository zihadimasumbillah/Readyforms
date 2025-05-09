"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Template } from "@/types";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare, ArrowRight } from "lucide-react";
import Link from "next/link";
import { likeService } from '@/lib/api/like-service';
import { commentService } from '@/lib/api/comment-service';
import { useAuth } from '@/contexts/auth-context';

interface TemplateCardProps {
  template: Template;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const [likesCount, setLikesCount] = useState<number>(template.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState<number>(0);
  const [liked, setLiked] = useState<boolean>(false);
  const auth = useAuth();
  const user = auth?.user;

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        if (template.likesCount === undefined) {
          const likeCountResponse = await likeService.getLikesCount(template.id);
          setLikesCount(likeCountResponse.count || 0); 
        } else {
          setLikesCount(template.likesCount);
        }
        
        if (user) {
          const likeStatus = await likeService.checkLikeStatus(template.id);
          setLiked(likeStatus.liked); 
        }
        
        const comments = await commentService.getCommentsByTemplate(template.id);
        setCommentsCount(comments.length);
      } catch (error) {
        console.error('Error fetching template interactions:', error);
      }
    };

    fetchInteractions();
  }, [template.id, template.likesCount, user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg hover:text-primary transition-colors">
              <Link href={`/templates/${template.id}`} className="hover:underline">
                {template.title}
              </Link>
            </CardTitle>
            <CardDescription className="line-clamp-2 mt-1">
              {template.description || 'No description provided'}
            </CardDescription>
          </div>
          {template.isQuiz && (
            <Badge>Quiz</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        {template.imageUrl && (
          <div className="mb-3 rounded-md overflow-hidden">
            <img 
              src={template.imageUrl} 
              alt={template.title} 
              className="w-full h-32 object-cover"
            />
          </div>
        )}

        <div className="flex flex-wrap gap-2 my-2">
          {template.topic && (
            <Badge variant="outline" className="bg-muted/50">
              {template.topic.name}
            </Badge>
          )}
          {template.tags && template.tags.map((tag: any) => (
            <Badge key={tag.id || tag.name} variant="secondary" className="bg-primary/10">
              {tag.name}
            </Badge>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="pt-4 flex items-center justify-between border-t">
        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
            {likesCount}
          </div>
          <div className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-1" />
            {commentsCount}
          </div>
          <div>
            {formatDate(template.createdAt)}
          </div>
        </div>
        
        <Button size="sm" variant="ghost" asChild>
          <Link href={`/templates/${template.id}`}>
            View <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}