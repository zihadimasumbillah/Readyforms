"use client";

import React, { useState, useEffect } from 'react';
import { Template, Topic } from '@/types';
import { TemplateCard } from '@/components/template/template-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

interface TemplateGalleryProps {
  templates: Template[];
  topics: Topic[];
  loading?: boolean;
}

export function TemplateGallery({ templates = [], topics = [], loading = false }: TemplateGalleryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>(templates);

  // Apply filters whenever dependencies change
  useEffect(() => {
    if (!templates || templates.length === 0) {
      setFilteredTemplates([]);
      return;
    }

    let result = [...templates];

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(template => 
        (template.title?.toLowerCase() || '').includes(term) || 
        (template.description?.toLowerCase() || '').includes(term)
      );
    }

    // Filter by topic
    if (selectedTopic && selectedTopic !== 'all') {
      result = result.filter(template => template.topicId === selectedTopic);
    }

    setFilteredTemplates(result);
  }, [templates, searchTerm, selectedTopic]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleTopicChange = (value: string) => {
    setSelectedTopic(value);
  };

  const renderSkeletons = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <div key={`skeleton-${index}`} className="flex flex-col space-y-3">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
        <div className="flex justify-between pt-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    ));
  };

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold mb-2">No templates found</h2>
      <p className="text-muted-foreground max-w-sm mb-4">
        {searchTerm || selectedTopic !== 'all'
          ? "No templates match your current filters. Try adjusting your search."
          : "There are no templates available right now. Check back later."}
      </p>
      {(searchTerm || selectedTopic !== 'all') && (
        <Button onClick={() => { setSearchTerm(''); setSelectedTopic('all'); }} variant="outline">
          Clear filters
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedTopic} onValueChange={handleTopicChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {topics && topics.map(topic => (
                <SelectItem key={topic.id} value={topic.id}>
                  {topic.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Active filters */}
      {(searchTerm || selectedTopic !== 'all') && (
        <div className="flex flex-wrap gap-2 mb-4">
          {searchTerm && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Search: {searchTerm}
              <button 
                className="ml-1 rounded-full hover:bg-muted-foreground/20"
                onClick={() => setSearchTerm('')}
              >
                <span className="sr-only">Remove</span>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                  <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor"></path>
                </svg>
              </button>
            </Badge>
          )}
          
          {selectedTopic !== 'all' && (
            <Badge variant="secondary" className="flex items-center gap-1">
              Topic: {topics?.find(t => t.id === selectedTopic)?.name || 'Unknown'}
              <button 
                className="ml-1 rounded-full hover:bg-muted-foreground/20"
                onClick={() => setSelectedTopic('all')}
              >
                <span className="sr-only">Remove</span>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-3 w-3">
                  <path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor"></path>
                </svg>
              </button>
            </Badge>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          renderSkeletons()
        ) : filteredTemplates && filteredTemplates.length > 0 ? (
          filteredTemplates.map(template => (
            <TemplateCard key={template.id} template={template} />
          ))
        ) : (
          renderEmptyState()
        )}
      </div>
    </div>
  );
}