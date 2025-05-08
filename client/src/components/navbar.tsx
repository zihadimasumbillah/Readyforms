"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button, buttonVariants } from "@/components/ui/button";
import { 
  BookTemplate,
  Menu,
  X,
  User,
  LogIn
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useHasMounted } from "@/hooks/use-mounted";

export function Navbar() {
  const auth = useAuth();
  const user = auth?.user;
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const hasMounted = useHasMounted();

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { title: "Home", href: "/" },
    { title: "Templates", href: "/templates" },
    { title: "Features", href: "/features" },
    { title: "Pricing", href: "/pricing" },
  ];

  // Don't render links until client-side hydration is complete
  if (!hasMounted) {
    return (
      <header className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200",
        "bg-background/95 backdrop-blur-sm border-b shadow-sm"
      )}>
        <div className="container flex h-16 items-center justify-between p-4">
          <div className="flex gap-6 items-center">
            <div className="flex items-center gap-2">
              <BookTemplate className="h-6 w-6" />
              <span className="text-lg font-semibold">ReadyForms</span>
            </div>
          </div>
          <div></div>
        </div>
      </header>
    );
  }

  return (
    <header className={cn(
      "sticky top-0 z-40 w-full transition-all duration-200",
      isScrolled 
        ? "bg-background/95 backdrop-blur-sm border-b shadow-sm" 
        : "bg-transparent"
    )}>
      <div className="container flex h-16 items-center justify-between p-4">
        <div className="flex gap-6 items-center">
          <Link href="/" className="flex items-center gap-2">
            <BookTemplate className="h-6 w-6" />
            <span className="text-lg font-semibold">ReadyForms</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex">
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <Link href={item.href} legacyBehavior passHref>
                      <NavigationMenuLink
                        className={cn(
                          navigationMenuTriggerStyle(),
                          isActive(item.href) && "font-medium bg-accent"
                        )}
                      >
                        {item.title}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Desktop - Right side menu */}
        <div className="hidden md:flex items-center gap-4">
          <ThemeToggle />
          
          {user ? (
            <Link href="/dashboard" className={cn(buttonVariants({ size: "sm" }), "gap-2")}>
              <User className="h-4 w-4" />
              Dashboard
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-1")}>
                <LogIn className="h-4 w-4" />
                Log In
              </Link>
              <Link href="/auth/register" className={cn(buttonVariants({ size: "sm" }))}>
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile - Sheet navigation */}
        <div className="md:hidden flex items-center gap-4">
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col h-full">
                <div className="border-b py-4">
                  <Link href="/" className="flex items-center gap-2">
                    <BookTemplate className="h-6 w-6" />
                    <span className="font-semibold">ReadyForms</span>
                  </Link>
                </div>
                <nav className="flex-1 py-4">
                  <ul className="space-y-2">
                    {navItems.map((item) => (
                      <li key={item.href}>
                        <Link 
                          href={item.href} 
                          className={cn(
                            "flex items-center py-2 px-3 rounded-md text-sm font-medium",
                            isActive(item.href) 
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent hover:text-accent-foreground"
                          )}
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                <div className="border-t py-4 flex flex-col gap-2">
                  {user ? (
                    <Link href="/dashboard" className={cn(buttonVariants(), "w-full gap-2")}>
                      <User className="h-4 w-4" />
                      Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link href="/auth/login" className={cn(buttonVariants({ variant: "outline" }), "w-full")}>
                        Log In
                      </Link>
                      <Link href="/auth/register" className={cn(buttonVariants(), "w-full")}>
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
