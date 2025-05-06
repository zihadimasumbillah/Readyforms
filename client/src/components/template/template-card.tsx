"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface TemplateCardProps {
  id: string;
  title: string;
  description: string;
  topic?: { id: string; name: string };
  author?: { id: string; name: string };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  onLikeToggle: (id: string) => void;
}

export function TemplateCard({
  id,
  title,
  description,
  topic,
  author,
  createdAt,
  likesCount,
  commentsCount,
  isLiked,
  onLikeToggle,
}: TemplateCardProps) {
  const timeAgo = formatDistanceToNow(new Date(createdAt), { addSuffix: true });

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="pb-3">
        <Link href={`/templates/${id}`}>
          <CardTitle className="text-xl hover:underline cursor-pointer line-clamp-2">
            {title}
          </CardTitle>
        </Link>
        {topic && (
          <Badge variant="secondary" className="mt-1">
            {topic.name}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-3">{description}</p>
        <div className="mt-4 text-xs text-muted-foreground">
          {author && (
            <span>
              By: <span className="font-medium">{author.name}</span> • {timeAgo}
            </span>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3 border-t">
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto"
            onClick={() => onLikeToggle(id)}
          >
            <Heart
              className={cn(
                "h-4 w-4 mr-1",
                isLiked ? "fill-red-500 text-red-500" : "text-muted-foreground"
              )}
            />
            <span className="text-sm text-muted-foreground">{likesCount}</span>
          </Button>
          <Link href={`/templates/${id}#comments`}>
            <Button variant="ghost" size="sm" className="p-0 h-auto">
              <MessageSquare className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{commentsCount}</span>
            </Button>
          </Link>
        </div>
        <Link href={`/templates/${id}`}>
          <Button size="sm">View Template</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}