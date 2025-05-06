"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TemplateGallery } from '@/components/template/template-gallery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Template } from '@/types';
import { templateService } from '@/lib/api/template-service';
import { Search, PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const data = await templateService.getAllTemplates();
        setTemplates(data);
        setFilteredTemplates(data);
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  useEffect(() => {
    // Filter templates based on search query and active tab
    let filtered = templates;

    if (searchQuery) {
      filtered = filtered.filter(template => 
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (activeTab === 'popular') {
      // Sort by popularity (can be based on likes)
      filtered = [...filtered].sort((a, b) => {
        const aLikes = a.likesCount || 0;
        const bLikes = b.likesCount || 0;
        return bLikes - aLikes;
      });
    } else if (activeTab === 'recent') {
      // Sort by creation date
      filtered = [...filtered].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    setFilteredTemplates(filtered);
  }, [searchQuery, templates, activeTab]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold">Templates</h1>
        
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search templates..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
          {isAuthenticated && (
            <Button onClick={() => router.push('/templates/create')}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={handleTabChange} className="mb-8">
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="popular">Popular</TabsTrigger>
          <TabsTrigger value="recent">Recent</TabsTrigger>
        </TabsList>
      </Tabs>

      <TemplateGallery templates={filteredTemplates} loading={loading} />
      
      {!loading && filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No templates found</h2>
          <p className="text-muted-foreground mb-6">
            {searchQuery 
              ? "No templates match your search criteria." 
              : "There are no templates available at the moment."
            }
          </p>
          {isAuthenticated && !searchQuery && (
            <Button asChild>
              <Link href="/templates/create">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Your First Template
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
