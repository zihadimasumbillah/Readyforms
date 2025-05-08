"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Navbar } from "@/components/navbar";
import { TemplateGallery } from "@/components/template/template-gallery";
import { Template } from "@/types";
import apiClient from "@/lib/api/api-client";
import templateService from "@/lib/api/template-service";
import { Search, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function HomePage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [sortMethod, setSortMethod] = useState<'recent' | 'popular' | 'recommended'>('recommended');
  const { isAuthenticated = false } = useAuth() || {};

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        // Use the template service instead of direct API client call
        const templatesData = await templateService.getAllTemplates();
        
        // Ensure templatesData is an array and get a good number of templates
        const safeTempData = Array.isArray(templatesData) ? templatesData : [];
        
        // Filter out test templates
        const filteredData = safeTempData.filter((template: Template) => {
          if (!template) return false;
          
          const title = template.title?.toLowerCase() || '';
          const desc = template.description?.toLowerCase() || '';
          return !(
            title.includes('test template') || 
            title.includes('updated template') || 
            desc.includes('created by api') || 
            desc.includes('admin-template-test')
          );
        });
        
        // Sort templates based on selected method
        const sortedTemplates = sortTemplates(filteredData, sortMethod);
        
        setTemplates(sortedTemplates);
        setFilteredTemplates(sortedTemplates);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setTemplates([]);
        setFilteredTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [sortMethod]);

  // Function to sort templates based on different criteria
  const sortTemplates = (templates: Template[], method: string) => {
    switch (method) {
      case 'recent':
        // Sort by newest first
        return [...templates].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'popular':
        // Sort by likes count if available, otherwise use random sorting
        return [...templates].sort((a, b) => 
          (b.likesCount || 0) - (a.likesCount || 0)
        );
      case 'recommended':
      default:
        // Mix of popular and diverse templates - provide variety
        const popular = [...templates].sort((a, b) => 
          (b.likesCount || 0) - (a.likesCount || 0)
        );
        
        // Get some templates from different topics to ensure diversity
        const uniqueTopics = new Set(templates.map(t => t.topicId));
        const diverse: Template[] = [];
        
        uniqueTopics.forEach(topicId => {
          const template = templates.find(t => t.topicId === topicId);
          if (template) diverse.push(template);
        });
        
        // Combine diverse templates with popular ones, removing duplicates
        const diverseIds = new Set(diverse.map(t => t.id));
        const remaining = popular.filter(t => !diverseIds.has(t.id));
        
        return [...diverse, ...remaining];
    }
  };

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTemplates(templates);
    } else {
      const filtered = templates.filter(template => 
        template.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredTemplates(filtered);
    }
  }, [searchQuery, templates]);

  return (
    <>
      <Navbar />
      <main className="flex flex-col min-h-screen">
        {/* Hero Section with Two Columns */}
        <section className="w-full py-12 md:py-20 bg-gradient-to-b from-background to-muted/30">
          <div className="container px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
              {/* Left Column: Call to Action */}
              <div className="flex flex-col space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Create Forms That Get Results
                </h1>
                <p className="text-muted-foreground md:text-xl max-w-[600px]">
                  Build professional forms in minutes, gather insights, and make data-driven decisions
                  with our powerful and easy-to-use platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button size="lg" asChild>
                    <Link href="/templates">Explore Templates</Link>
                  </Button>
                  {!isAuthenticated && (
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/auth/register">Create Free Account</Link>
                    </Button>
                  )}
                  {isAuthenticated && (
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/dashboard">Go to Dashboard</Link>
                    </Button>
                  )}
                </div>
              </div>
              
              {/* Right Column: Template Preview */}
              <div className="bg-muted/40 rounded-xl p-6 shadow-md border">
                <div className="mb-4">
                  <h2 className="text-xl font-semibold mb-2">Popular Templates</h2>
                  <p className="text-muted-foreground text-sm">
                    Start with professionally designed templates for any purpose
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {loading ? 
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="bg-background animate-pulse rounded-md h-32"></div>
                    ))
                  : 
                    templates && templates.length > 0 ? (
                      templates.slice(0, 4).map((template) => (
                        <Link 
                          href={`/templates/${template.id}`}
                          key={template.id}
                          className="bg-background hover:bg-accent/50 transition-colors p-3 rounded-md border shadow-sm group"
                        >
                          <h3 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">{template.title}</h3>
                          {template.description && (
                            <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                              {template.description}
                            </p>
                          )}
                          <div className="mt-2 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                            View template <ArrowRight className="ml-1 h-3 w-3" />
                          </div>
                        </Link>
                      ))
                    ) : (
                      <div className="col-span-2 py-6 text-center text-muted-foreground">
                        No templates available
                      </div>
                    )
                  }
                </div>
                <Button variant="ghost" size="sm" className="w-full mt-4" asChild>
                  <Link href="/templates">
                    View all templates <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Template Gallery Section */}
        <section className="w-full py-12 bg-muted/20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
                Ready-to-Use Templates
              </h2>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl/relaxed">
                Choose from our professionally designed templates to get started quickly
              </p>
              
              {/* Search Bar */}
              <div className="w-full max-w-md relative mt-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search templates..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Sort Options */}
              <div className="flex gap-4 mt-4">
                <Button
                  variant={sortMethod === 'recent' ? 'default' : 'outline'}
                  onClick={() => setSortMethod('recent')}
                >
                  Recent
                </Button>
                <Button
                  variant={sortMethod === 'popular' ? 'default' : 'outline'}
                  onClick={() => setSortMethod('popular')}
                >
                  Popular
                </Button>
                <Button
                  variant={sortMethod === 'recommended' ? 'default' : 'outline'}
                  onClick={() => setSortMethod('recommended')}
                >
                  Recommended
                </Button>
              </div>
            </div>
            
            <div className="mx-auto py-4">
              <TemplateGallery 
                templates={filteredTemplates} 
                loading={loading}
                requireAuth={true}
                topics={[]} // Added the required topics prop with an empty array
              />
              
              {filteredTemplates.length > 0 && (
                <div className="flex justify-center mt-8">
                  <Button variant="outline" asChild>
                    <Link href="/templates">View All Templates</Link>
                  </Button>
                </div>
              )}
              
              {filteredTemplates.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchQuery ? "No templates match your search" : "No templates available"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-20 bg-primary/5">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold tracking-tight mb-2">Why Choose ReadyForms?</h2>
              <p className="text-muted-foreground md:text-lg">
                Powerful features to help you create and manage forms effectively
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-xl shadow-sm border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Easy Form Creation</h3>
                <p className="text-muted-foreground">
                  Create beautiful, professional forms in minutes with our intuitive form builder.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-xl shadow-sm border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="3" y1="9" x2="21" y2="9"></line>
                    <line x1="9" y1="21" x2="9" y2="9"></line>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Data Collection</h3>
                <p className="text-muted-foreground">
                  Easily collect and manage responses with powerful data analysis tools.
                </p>
              </div>
              
              <div className="flex flex-col items-center text-center p-6 bg-background rounded-xl shadow-sm border">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                    <path d="M12 2v4"></path>
                    <path d="M12 18v4"></path>
                    <path d="m4.93 4.93 2.83 2.83"></path>
                    <path d="m16.24 16.24 2.83 2.83"></path>
                    <path d="M2 12h4"></path>
                    <path d="M18 12h4"></path>
                    <path d="m4.93 19.07 2.83-2.83"></path>
                    <path d="m16.24 7.76 2.83-2.83"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Insights & Analytics</h3>
                <p className="text-muted-foreground">
                  Get actionable insights from your form responses with visualization tools.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}