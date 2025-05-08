"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogIn, BookTemplate } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

export function Header() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();
  const user = auth?.user;
  const isAuthenticated = auth?.isAuthenticated || false;
  const logout = auth?.logout;

  const handleLogout = () => {
    if (logout) {
      logout();
      router.push('/');
    }
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/templates", label: "Templates" },
    { href: "/pricing", label: "Pricing" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 mr-4 md:mr-8">
          <Link href="/" className="flex items-center gap-2">
            <BookTemplate className="h-6 w-6" />
            <span className="text-lg font-semibold">ReadyForms</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {navLinks.map((link) => (
              <NavigationMenuItem key={link.href}>
                <Link href={link.href} legacyBehavior passHref>
                  <NavigationMenuLink
                    className={cn(
                      navigationMenuTriggerStyle(),
                      pathname === link.href && "bg-accent text-accent-foreground"
                    )}
                  >
                    {link.label}
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        {/* Mobile Navigation Trigger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden mr-2">
            <Button variant="outline" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] sm:w-[300px]">
            <div className="flex flex-col gap-4 mt-8">
              {navLinks.map((link) => (
                <Button
                  key={link.href}
                  variant="ghost"
                  className={cn(
                    "justify-start",
                    pathname === link.href && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => {
                    router.push(link.href);
                    setOpen(false);
                  }}
                >
                  {link.label}
                </Button>
              ))}
              <div className="mt-2 border-t pt-4">
                {isAuthenticated ? (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start mb-2"
                      onClick={() => {
                        router.push('/dashboard');
                        setOpen(false);
                      }}
                    >
                      Dashboard
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        handleLogout();
                        setOpen(false);
                      }}
                    >
                      Log out
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      className="w-full justify-start mb-2"
                      onClick={() => {
                        router.push('/auth/login');
                        setOpen(false);
                      }}
                    >
                      Log in
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        router.push('/auth/register');
                        setOpen(false);
                      }}
                    >
                      Sign up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <div className="ml-auto flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            <>
              <Button
                variant="outline"
                className="hidden md:inline-flex"
                onClick={() => router.push("/dashboard")}
              >
                Dashboard
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={user?.name || 'User Avatar'} />
                      <AvatarFallback>
                        {user?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={() => router.push("/auth/login")}
              >
                Log in
              </Button>
              <Button onClick={() => router.push("/auth/register")}>
                Sign up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
