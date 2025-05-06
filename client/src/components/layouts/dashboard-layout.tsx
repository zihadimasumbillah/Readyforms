"use client";

import { useState, ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  User,
  Settings,
  Menu,
  X,
  LogOut,
  BookTemplate,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import ApiHealthIndicator from "@/components/api-health-indicator";

interface DashboardLayoutProps {
  children: ReactNode;
  user: {
    name: string;
    email: string;
    isAdmin?: boolean;
  };
  onLogout: () => void;
}

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavItem = ({ href, icon, label, isActive, onClick }: NavItemProps) => {
  return (
    <Link href={href} onClick={onClick}>
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {icon}
        {label}
      </div>
    </Link>
  );
};

export function DashboardLayout({
  children,
  user,
  onLogout,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      label: "Dashboard",
    },
    {
      href: "/dashboard/templates",
      icon: <BookTemplate className="h-4 w-4" />,
      label: "My Templates",
    },
    {
      href: "/dashboard/responses",
      icon: <FileText className="h-4 w-4" />,
      label: "Responses",
    },
  ];

  // Add admin route if user is admin
  const adminItems = user?.isAdmin
    ? [
        {
          href: "/admin",
          icon: <ShieldAlert className="h-4 w-4" />,
          label: "Admin",
        },
      ]
    : [];

  const allNavItems = [...navItems, ...adminItems];

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="h-full min-h-screen flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 h-16 border-b bg-background flex items-center px-4 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2">
            <BookTemplate className="h-6 w-6" />
            <span className="text-lg font-semibold">ReadyForms</span>
          </Link>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Add the API health indicator */}
          {user.isAdmin && <ApiHealthIndicator />}
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user.name} />
                  <AvatarFallback>
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="fixed inset-0 bg-black/50"
              onClick={closeSidebar}
            ></div>
            <div className="fixed inset-y-0 left-0 w-64 bg-background p-4 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Navigation</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeSidebar}
                  className="lg:hidden"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close menu</span>
                </Button>
              </div>
              <nav className="grid gap-1">
                {allNavItems.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isActive={pathname === item.href}
                    onClick={closeSidebar}
                  />
                ))}
              </nav>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:inset-y-0 border-r">
          <div className="flex-1 flex flex-col min-h-0 pt-6 px-4">
            <nav className="flex-1 space-y-1">
              {allNavItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  isActive={pathname === item.href}
                />
              ))}
            </nav>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 bg-muted/20">
          {children}
        </main>
      </div>
    </div>
  );
}