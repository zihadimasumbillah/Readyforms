"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";
import { TemplateGallery } from "@/components/template/template-gallery";
import { Template } from "@/types";
import apiClient from "@/lib/api/api-client";
import { Search, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [topics, setTopics] = useState<{id: string, name: string}[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/templates?public=true');
        setTemplates(response.data);
        setFilteredTemplates(response.data);
        
        // Extract unique topics from templates
        const uniqueTopics = Array.from(
          new Map(
            response.data
              .filter(t => t.topic)
              .map(t => [t.topic.id, { id: t.topic.id, name: t.topic.name }])
          ).values()
        );
        setTopics(uniqueTopics);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  useEffect(() => {
    let filtered = templates;
    
    // Apply topic filter
    if (selectedTopic !== 'all') {
      filtered = filtered.filter(template => 
        template.topic && template.topic.id === selectedTopic
      );
    }
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(query) ||
        (template.description && template.description.toLowerCase().includes(query))
      );
    }
    
    setFilteredTemplates(filtered);
  }, [searchQuery, selectedTopic, templates]);

  const handleTopicChange = (value: string) => {
    setSelectedTopic(value);
  };

  return (
    <>
      <Navbar />
      <main className="flex flex-col min-h-screen">
        {/* Header */}
        <section className="w-full py-12 md:py-16 lg:py-20 bg-muted/30">
          <div className="container px-4 md:px-6 text-center">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Template Gallery
            </h1>
            <p className="mt-4 text-muted-foreground md:text-xl max-w-[700px] mx-auto">
              Browse our collection of professionally designed templates for any purpose.
              Find the perfect starting point for your form.
            </p>
          </div>
        </section>

        {/* Filters and Search */}
        <section className="w-full py-8 border-b">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="w-full sm:max-w-sm relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search templates..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-auto flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="text-sm font-medium">Filter by:</span>
                </div>
                <Select value={selectedTopic} onValueChange={handleTopicChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Topics</SelectItem>
                    {topics.map((topic) => (
                      <SelectItem key={topic.id} value={topic.id}>
                        {topic.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Template Gallery */}
        <section className="w-full py-12">
          <div className="container px-4 md:px-6">
            <TemplateGallery 
              templates={filteredTemplates} 
              loading={loading}
            />
            
            {filteredTemplates.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-xl font-medium mb-2">No templates found</p>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || selectedTopic !== 'all' ? 
                    "Try adjusting your filters or search criteria" : 
                    "No templates are currently available"
                  }
                </p>
                {(searchQuery || selectedTopic !== 'all') && (
                  <Button variant="outline" onClick={() => {
                    setSearchQuery("");
                    setSelectedTopic("all");
                  }}>
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-12 bg-muted">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
              Ready to create your own form?
            </h2>
            <p className="mt-4 text-muted-foreground max-w-[600px] mx-auto">
              Sign up for a free account to create, customize, and publish your forms.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild>
                <Link href="/auth/register">Create Free Account</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
