"use client";

import { useState, ReactNode, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ShieldAlert,
  Users,
  BookTemplate,
  FileText,
  Activity,
  LogOut,
  Menu,
  X,
  User,
  Settings,
  LayoutDashboard,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";

interface AdminLayoutProps {
  children: ReactNode;
}

interface NavItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  badge?: string;
}

const NavItem = ({ href, icon, label, isActive, onClick, badge }: NavItemProps) => {
  return (
    <Link href={href} onClick={onClick}>
      <div
        className={cn(
          "flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
          isActive
            ? "bg-black text-white dark:bg-white dark:text-black font-bold shadow-sm"
            : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-black dark:hover:text-white"
        )}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </div>
        {badge && (
          <Badge variant="outline" className="text-xs border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white">
            {badge}
          </Badge>
        )}
      </div>
    </Link>
  );
};

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const auth = useAuth();
  const user = auth?.user;
  const logout = auth?.logout;

  useEffect(() => {
    if (auth?.status !== "loading" && (!auth?.isAuthenticated || !user?.isAdmin)) {
      router.push("/dashboard");
    }
  }, [user, auth, router]);

  if (auth?.status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-black">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-black dark:border-white border-t-transparent"></div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">Loading administration panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  const handleLogout = async () => {
    if (logout) {
      await logout();
      router.push("/auth/login");
    }
  };

  const navItems = [
    {
      href: "/admin",
      icon: <ShieldAlert className="h-4 w-4 text-black dark:text-white" />,
      label: "Admin Overview",
    },
    {
      href: "/admin/users",
      icon: <Users className="h-4 w-4 text-black dark:text-white" />,
      label: "User Accounts",
    },
    {
      href: "/admin/templates",
      icon: <BookTemplate className="h-4 w-4 text-black dark:text-white" />,
      label: "Global Templates",
    },
    {
      href: "/admin/responses",
      icon: <FileText className="h-4 w-4 text-black dark:text-white" />,
      label: "Form Submissions",
    },
    {
      href: "/api-status",
      icon: <Activity className="h-4 w-4 text-black dark:text-white" />,
      label: "System Health",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black transition-colors">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-black/80 backdrop-blur-md flex items-center h-16 px-4 md:px-6">
        <Button
          variant="ghost"
          size="icon"
          className="mr-2 lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-black text-white dark:bg-white dark:text-black flex items-center justify-center font-bold shadow-sm">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:inline-block text-black dark:text-white">
              ReadyForms <span className="font-mono text-xs uppercase px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">ADMIN</span>
            </span>
          </Link>
          <Badge variant="outline" className="ml-2 font-mono text-xs uppercase tracking-wider border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white">
            SuperAdmin Mode
          </Badge>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="hidden sm:flex border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4 mr-1.5 text-black dark:text-white" />
              User Dashboard
            </Link>
          </Button>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-neutral-300 dark:border-neutral-700 p-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-black text-white dark:bg-white dark:text-black font-semibold text-xs">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold text-black dark:text-white">{user.name}</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
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
              <DropdownMenuSeparator className="bg-neutral-200 dark:bg-neutral-800" />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400 focus:text-red-600">
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
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
            <div className="fixed inset-y-0 left-0 w-64 bg-white dark:bg-neutral-950 p-4 shadow-2xl flex flex-col border-r border-neutral-200 dark:border-neutral-800">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800">
                <span className="font-bold text-lg text-black dark:text-white">Admin Control</span>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="space-y-1 flex-1">
                {navItems.map((item) => (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    isActive={pathname === item.href}
                    onClick={() => setSidebarOpen(false)}
                  />
                ))}
              </nav>
              <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <Button variant="outline" className="w-full justify-start border-neutral-300 dark:border-neutral-700" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    User Dashboard
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black p-4">
          <div className="flex-1 space-y-1 pt-2">
            <div className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
              Administration Center
            </div>
            {navItems.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                isActive={pathname === item.href}
              />
            ))}
          </div>

          <div className="p-3 bg-neutral-100 dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-2 mt-auto">
            <div className="flex items-center gap-2 font-bold text-xs text-black dark:text-white">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Admin Mode Active</span>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              You have full global access to manage user resources and templates.
            </p>
          </div>
        </aside>

        {/* Main Content View */}
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-neutral-50/50 dark:bg-neutral-950/50">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
