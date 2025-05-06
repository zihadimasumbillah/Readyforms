"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BookTemplate, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated } = useAuth();

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Templates", href: "/templates" },
    { name: "Pricing", href: "/pricing" },
    { name: "About", href: "/about" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      <nav className="container flex items-center justify-between px-4 py-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <BookTemplate className="h-6 w-6" />
          <span className="text-lg font-bold">ReadyForms</span>
        </Link>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                item.href === pathname 
                  ? "bg-primary text-primary-foreground" 
                  : "text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
        
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden flex items-center gap-4">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </Button>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/20" onClick={() => setMobileMenuOpen(false)} />
            
            <div className="fixed right-0 top-0 h-full w-3/4 max-w-sm bg-background p-6 shadow-lg">
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                  <BookTemplate className="h-6 w-6" />
                  <span className="text-lg font-bold">ReadyForms</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              
              <div className="flex flex-col space-y-4">
                {navigation.map((item) => (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-md text-base font-medium transition-colors",
                      item.href === pathname 
                        ? "bg-primary text-primary-foreground" 
                        : "text-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="pt-4 border-t">
                  {isAuthenticated ? (
                    <Button className="w-full" asChild>
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        Dashboard
                      </Link>
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" className="w-full mb-2" asChild>
                        <Link href="/auth/login" onClick={() => setMobileMenuOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link href="/auth/register" onClick={() => setMobileMenuOpen(false)}>
                          Sign Up
                        </Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
