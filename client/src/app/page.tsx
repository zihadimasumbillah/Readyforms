import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/navbar";
import { Template } from "@/types";
import { templateService } from "@/lib/api/template-service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Home() {
  // Fetch featured templates for the homepage
  let templates: Template[] = [];
  try {
    templates = await templateService.getFeaturedTemplates(6);
  } catch (error) {
    console.error("Error fetching featured templates:", error);
    // If API fails, use empty array (already initialized)
  }

  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-background to-muted pt-20 pb-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-bold text-4xl sm:text-5xl lg:text-6xl mb-6">
            Create forms in minutes, <br className="hidden sm:block" />
            not hours
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            ReadyForms helps you create, share, and analyze forms with
            no technical skills required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="px-8">
              <Link href="/templates">Get Started</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/templates/gallery">Browse Templates</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why choose ReadyForms?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M12 22V8" />
                  <path d="m5 12-2-2 2-2" />
                  <path d="M5 10h14" />
                  <path d="m19 12 2-2-2-2" />
                  <rect width="20" height="6" x="2" y="2" rx="2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Easy to Use</h3>
              <p className="text-muted-foreground">
                Intuitive drag-and-drop interface makes form creation simple and
                fast.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Collaboration</h3>
              <p className="text-muted-foreground">
                Share forms with your team and collect responses in one place.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6 text-primary"
                >
                  <path d="M3 3v18h18" />
                  <path d="m19 9-5 5-4-4-3 3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Real-time Analytics</h3>
              <p className="text-muted-foreground">
                Get instant insights with powerful analytics and response tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Templates Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Featured Templates</h2>
            <Button asChild variant="outline">
              <Link href="/templates">View all templates</Link>
            </Button>
          </div>
          
          {templates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.description || "No description available"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {template.topic?.name || "General"}
                      </div>
                      <Button asChild size="sm" className="mt-2">
                        <Link href={`/templates/${template.id}`}>View</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-background rounded-lg p-8 text-center">
              <h3 className="text-xl font-bold mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't load the featured templates. Please try again later.
              </p>
              <Button asChild>
                <Link href="/templates/create">Create a Template</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who are already using ReadyForms to create
            beautiful forms and collect important data.
          </p>
          <Button asChild size="lg" className="px-8">
            <Link href="/auth/register">Sign up for free</Link>
          </Button>
        </div>
      </section>
    </>
  );
}