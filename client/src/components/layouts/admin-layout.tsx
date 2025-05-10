"use client";

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  BookTemplate, 
  Menu, 
  LayoutDashboard,
  FileText,
  ShieldAlert,
  Users,
  Settings
} from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { ApiHealthIndicator } from '@/components/api-health-indicator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface AdminLayoutProps {
  children: ReactNode;
  user?: {
    name: string;
    email: string;
    isAdmin?: boolean;
  };
  onLogout?: () => void;
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

export function AdminLayout({
  children,
  user,
  onLogout,
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    {
      href: "/admin",
      icon: <LayoutDashboard className="h-4 w-4" />,
      label: "Dashboard",
    },
    {
      href: "/admin/users",
      icon: <Users className="h-4 w-4" />,
      label: "Users",
    },
    {
      href: "/admin/templates",
      icon: <BookTemplate className="h-4 w-4" />,
      label: "Templates",
    },
    {
      href: "/admin/responses",
      icon: <FileText className="h-4 w-4" />,
      label: "Responses",
    },
    {
      href: "/admin/settings",
      icon: <Settings className="h-4 w-4" />,
      label: "Settings",
    },
  ];

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
          <span className="ml-2 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
            Admin
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {/* Add the API health indicator */}
          {user?.isAdmin && <ApiHealthIndicator showText={true} />}
          <ThemeToggle />
          
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {onLogout && (
                  <DropdownMenuItem onClick={onLogout}>
                    Log out
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
              <div className="flex h-full flex-col">
                <div className="space-y-1 py-4">
                  {navItems.map((item) => (
                    <NavItem
                      key={item.href}
                      href={item.href}
                      icon={item.icon}
                      label={item.label}
                      isActive={pathname === item.href}
                      onClick={closeSidebar}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col md:inset-y-0 border-r">
          <div className="flex-1 flex flex-col min-h-0 pt-6 px-4">
            <nav className="flex-1 space-y-1">
              {navItems.map((item) => (
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

// Add a named export so this component can be imported as a module
export { AdminLayout as default };
