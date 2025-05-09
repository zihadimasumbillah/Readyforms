"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { BookTemplate, Menu, X, LogIn, User } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const auth = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't show navbar on dashboard pages - they have their own layout
  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
    return null;
  }

  // Close mobile menu when clicking outside
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Navigation items based on authentication status
  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Templates', href: '/templates' },
    { label: 'About', href: '/about' },
    { label: 'Pricing', href: '/pricing' },
  ];

  // User is authenticated
  const userMenuItems = auth?.user ? [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'My Templates', href: '/dashboard/templates' },
    { label: 'Profile', href: '/profile' },
    { label: 'Settings', href: '/settings' },
  ] : [];

  if (!mounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <BookTemplate className="h-6 w-6" />
            <span className="font-bold text-lg">ReadyForms</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList>
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <NavigationMenuLink className={cn(
                      "group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                      pathname === item.href && "bg-accent text-accent-foreground"
                    )}>
                      {item.label}
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              ))}

              {auth?.user && auth.user.isAdmin && (
                <NavigationMenuItem>
                  <Link href="/admin" legacyBehavior passHref>
                    <NavigationMenuLink className="group inline-flex h-9 w-max items-center justify-center rounded-md bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                      Admin
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          <Link href="/api-test" className="text-sm font-medium transition-colors hover:text-primary">
            API Status
          </Link>

          <ThemeToggle />

          <div>
            {auth?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {auth.user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{auth.user.name}</span>
                      <span className="text-xs text-muted-foreground">{auth.user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userMenuItems.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link href={item.href}>{item.label}</Link>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => auth.logout()}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Log in
                  </Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="fixed inset-0 z-50" onClick={closeMobileMenu}>
            <div className="absolute inset-0 bg-black/50" />
            <div className="fixed right-0 top-0 h-full w-3/4 max-w-sm bg-background p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-end mb-8">
                <Button variant="ghost" size="icon" onClick={closeMobileMenu}>
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <div className="space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex py-2 text-lg",
                      pathname === item.href && "font-bold text-primary"
                    )}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                ))}

                <Link href="/api-test" className="text-sm font-medium transition-colors hover:text-primary">
                  API Status
                </Link>

                {auth?.user ? (
                  <>
                    <div className="pt-4 border-t">
                      <div className="flex items-center mb-4">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                          {auth.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium">{auth.user.name}</div>
                          <div className="text-sm text-muted-foreground">{auth.user.email}</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex py-1"
                            onClick={closeMobileMenu}
                          >
                            {item.label}
                          </Link>
                        ))}

                        {auth?.user?.isAdmin && (
                          <Link
                            href="/admin"
                            className="flex py-1"
                            onClick={closeMobileMenu}
                          >
                            Admin
                          </Link>
                        )}

                        <Button 
                          variant="destructive"
                          className="w-full mt-2"
                          onClick={() => {
                            auth.logout();
                            closeMobileMenu();
                          }}
                        >
                          Log out
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="pt-4 border-t">
                    <div className="flex flex-col space-y-3">
                      <Button asChild>
                        <Link href="/auth/login" onClick={closeMobileMenu}>
                          Log in
                        </Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/auth/register" onClick={closeMobileMenu}>
                          Sign up
                        </Link>
                      </Button>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <div>Theme</div>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
