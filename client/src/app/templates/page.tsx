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
import { Search, Filter } from 'lucide-react';
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
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const topicsArray = await topicService.getAllTopics();
        setTopics(topicsArray);

        const templatesData = await templateService.getTemplates();
        console.log("Templates data type:", typeof templatesData);
        console.log("Templates is array:", Array.isArray(templatesData));
        console.log("Number of templates:", templatesData.length);
        
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
    if (searchTerm.trim() === '') {
      setFilteredTemplates(templates);
    } else {
      const filtered = templates.filter(template => {
        const title = template.title?.toLowerCase() || '';
        const description = template.description?.toLowerCase() || '';
        const searchLower = searchTerm.toLowerCase();
        return title.includes(searchLower) || description.includes(searchLower);
      });
      setFilteredTemplates(filtered);
    }
  }, [searchTerm, templates]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold">Templates</h1>
        
        <div className="flex w-full sm:w-auto gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              className="pl-9"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
        </div>
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
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold">No templates found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? "No templates match your search criteria." : "There are no templates available at the moment."}
            </p>
            <Button asChild>
              <Link href="/templates/create">Create Template</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
