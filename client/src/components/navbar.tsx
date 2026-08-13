"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BookOpen, Menu, X, LogIn, LayoutDashboard, UserCheck, Settings, Shield, FileText } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const auth = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  if (
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/api-status") ||
    pathname?.startsWith("/profile") ||
    pathname?.startsWith("/settings") ||
    pathname?.startsWith("/templates/") ||
    pathname?.startsWith("/forms/")
  ) {
    return null;
  }

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Templates", href: "/templates" },
    { label: "About", href: "/about" },
    { label: "Pricing", href: "/pricing" },
  ];

  const userMenuItems = auth?.user
    ? [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "My Templates", href: "/dashboard/templates", icon: FileText },
        { label: "Profile", href: "/profile", icon: UserCheck },
        { label: "Settings", href: "/settings", icon: Settings },
      ]
    : [];

  if (!mounted) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="container mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-9 w-9 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
              <BookOpen className="h-5 w-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-black dark:text-white">
              ReadyForms
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              {navItems.map((item) => (
                <NavigationMenuItem key={item.href}>
                  <NavigationMenuLink
                    asChild
                    className={cn(
                      "group inline-flex h-9 w-max items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white focus:outline-none",
                      pathname === item.href &&
                        "bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white font-semibold"
                    )}
                  >
                    <Link href={item.href}>{item.label}</Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}

              {auth?.user && auth.user.isAdmin && (
                <NavigationMenuItem>
                  <NavigationMenuLink
                    asChild
                    className="group inline-flex h-9 w-max items-center justify-center rounded-lg bg-transparent px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-900"
                  >
                    <Link href="/admin" className="flex items-center gap-1.5">
                      <Shield className="h-4 w-4 text-amber-500" />
                      <span>Admin</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              )}
            </NavigationMenuList>
          </NavigationMenu>

          <ThemeToggle />

          <div>
            {auth?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full ring-2 ring-neutral-200 dark:ring-neutral-800"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-black text-white dark:bg-white dark:text-black font-bold">
                        {auth.user.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl">
                  <DropdownMenuLabel className="font-normal p-3">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none">{auth.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{auth.user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userMenuItems.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <DropdownMenuItem key={item.href} asChild className="cursor-pointer py-2 rounded-lg">
                        <Link href={item.href} className="flex items-center gap-2">
                          <ItemIcon className="h-4 w-4 text-neutral-500" />
                          <span>{item.label}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => auth.logout()}
                    className="cursor-pointer py-2 text-red-600 dark:text-red-400 focus:text-red-600"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  size="sm"
                  className="bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-semibold rounded-xl px-4 py-5 shadow-sm transition-all"
                >
                  <Link href="/auth/login" className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" />
                    <span>Log in</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all active:scale-95"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closeMobileMenu}
          />
          <div className="fixed right-0 top-0 h-full w-4/5 max-w-sm bg-white dark:bg-neutral-950 border-l border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Drawer Brand Header */}
              <div className="flex items-center justify-between pb-6 border-b border-neutral-200 dark:border-neutral-800 mb-6">
                <Link href="/" onClick={closeMobileMenu} className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center shadow-sm">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span className="font-extrabold text-lg tracking-tight text-black dark:text-white">
                    ReadyForms
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeMobileMenu}
                  aria-label="Close menu"
                  className="rounded-xl"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Navigation Items */}
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center py-3 px-4 rounded-xl text-base font-medium transition-colors text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900 hover:text-black dark:hover:text-white",
                      pathname === item.href &&
                        "bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white font-bold"
                    )}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* User Account / Navigation */}
              {auth?.user ? (
                <div className="mt-6 pt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-black text-white dark:bg-white dark:text-black font-bold">
                        {auth.user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="truncate">
                      <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 truncate">
                        {auth.user.name}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                        {auth.user.email}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    {userMenuItems.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                          onClick={closeMobileMenu}
                        >
                          <ItemIcon className="h-4 w-4 text-neutral-500" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}

                    {auth?.user?.isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 py-2.5 px-4 rounded-xl text-sm font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                        onClick={closeMobileMenu}
                      >
                        <Shield className="h-4 w-4" />
                        <span>Admin Console</span>
                      </Link>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Mobile Footer Actions */}
            <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
              {!auth?.user && (
                <Button
                  asChild
                  className="w-full bg-black hover:bg-neutral-800 text-white dark:bg-white dark:hover:bg-neutral-200 dark:text-black font-bold py-5 rounded-xl shadow-md"
                >
                  <Link href="/auth/login" onClick={closeMobileMenu} className="flex items-center justify-center gap-2">
                    <LogIn className="h-4 w-4" />
                    <span>Sign In to Account</span>
                  </Link>
                </Button>
              )}

              {auth?.user && (
                <Button
                  variant="destructive"
                  className="w-full py-5 rounded-xl font-bold"
                  onClick={() => {
                    auth.logout();
                    closeMobileMenu();
                  }}
                >
                  Log out
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
