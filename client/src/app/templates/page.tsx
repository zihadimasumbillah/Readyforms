"use client";

import React, { useState, useEffect } from 'react';
import { templateService } from '@/lib/api/template-service';
import { topicService } from '@/lib/api/topic-service';
import { Template } from '@/types';
import { 
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TemplateCard } from '@/components/template/template-card';
import { useToast } from '@/components/ui/use-toast';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [topics, setTopics] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const topicsArray = await topicService.getAllTopics();
        setTopics(topicsArray);

        const templatesData = await templateService.getTemplates();
        setTemplates(templatesData);
        setFilteredTemplates(templatesData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch templates. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  useEffect(() => {
    let filtered = templates;

    if (searchTerm.trim() !== '') {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(template => {
        const title = template.title?.toLowerCase() || '';
        const description = template.description?.toLowerCase() || '';
        return title.includes(searchLower) || description.includes(searchLower);
      });
    }

    if (selectedTopic) {
      filtered = filtered.filter(template => template.topicId === selectedTopic);
    }

    setFilteredTemplates(filtered);
  }, [searchTerm, selectedTopic, templates]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTopic(null);
  };

  const hasActiveFilters = searchTerm.trim() !== '' || selectedTopic !== null;

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Templates</h1>
          <p className="text-muted-foreground mt-1">Browse and use community-created form templates</p>
        </div>
        
        <Button asChild className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
          <Link href="/templates/create">
            <Sparkles className="h-4 w-4 mr-2" />
            Create with AI
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 mb-8">
        <div className="flex w-full gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-9"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <Button
            variant={showFilters ? "default" : "outline"}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            aria-label="Toggle filters"
          >
            <Filter className="h-4 w-4" />
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {showFilters && topics.length > 0 && (
          <div className="flex flex-wrap gap-2 p-4 border rounded-lg bg-muted/30">
            <span className="text-sm font-medium text-muted-foreground mr-2 self-center">Topics:</span>
            {topics.map((topic) => (
              <Badge
                key={topic.id}
                variant={selectedTopic === topic.id ? "default" : "outline"}
                className="cursor-pointer transition-colors"
                onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
              >
                {topic.name}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="h-64 animate-pulse">
              <CardHeader className="bg-muted/40"></CardHeader>
              <CardContent className="space-y-2">
                <div className="h-4 w-2/3 bg-muted rounded"></div>
                <div className="h-4 w-full bg-muted rounded"></div>
                <div className="h-4 w-1/2 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TemplateCard key={template.id} template={template} />
          ))}
        </div>
      ) : (
        <Card className="w-full py-12">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No templates found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm">
              {hasActiveFilters
                ? "No templates match your filters. Try adjusting your search or clearing filters."
                : "There are no templates available yet. Be the first to create one!"}
            </p>
            <div className="flex gap-3">
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
              <Button asChild>
                <Link href="/templates/create">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create with AI
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
