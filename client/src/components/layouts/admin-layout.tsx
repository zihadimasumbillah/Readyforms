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
          "flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
          isActive
            ? "bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-500/20"
            : "text-muted-foreground hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400"
        )}
      >
        <div className="flex items-center gap-3">
          {icon}
          <span>{label}</span>
        </div>
        {badge && (
          <Badge variant="secondary" className="text-xs bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
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
    if (auth?.isAuthenticated && !user?.isAdmin) {
      router.push("/dashboard");
    }
  }, [user, auth, router]);

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
      icon: <ShieldAlert className="h-4 w-4 text-indigo-600" />,
      label: "Admin Overview",
    },
    {
      href: "/admin/users",
      icon: <Users className="h-4 w-4 text-blue-600" />,
      label: "User Accounts",
    },
    {
      href: "/admin/templates",
      icon: <BookTemplate className="h-4 w-4 text-indigo-600" />,
      label: "Global Templates",
    },
    {
      href: "/admin/responses",
      icon: <FileText className="h-4 w-4 text-emerald-600" />,
      label: "Form Submissions",
    },
    {
      href: "/api-status",
      icon: <Activity className="h-4 w-4 text-amber-600" />,
      label: "System Health",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-md flex items-center h-16 px-4 md:px-6">
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
            <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-500/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg tracking-tight hidden sm:inline-block">
              ReadyForms <span className="text-indigo-600 font-extrabold">ADMIN</span>
            </span>
          </Link>
          <Badge variant="destructive" className="ml-2 font-mono text-xs uppercase tracking-wider">
            SuperAdmin Mode
          </Badge>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Button variant="outline" size="sm" asChild className="hidden sm:flex border-indigo-500/30 hover:bg-indigo-500/10">
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4 mr-1.5 text-indigo-500" />
              User Dashboard
            </Link>
          </Button>

          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-indigo-500/30 p-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-indigo-600 text-white font-semibold">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : "AD"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <User className="mr-2 h-4 w-4 text-indigo-500" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <Settings className="mr-2 h-4 w-4 text-indigo-500" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
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
            <div className="fixed inset-y-0 left-0 w-64 bg-card p-4 shadow-2xl flex flex-col">
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <span className="font-bold text-lg">Admin Control</span>
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
              <div className="pt-4 border-t">
                <Button variant="outline" className="w-full justify-start" asChild>
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
        <aside className="hidden lg:flex lg:w-64 lg:flex-col border-r bg-card/40 p-4">
          <div className="flex-1 space-y-1 pt-2">
            <div className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
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

          <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 space-y-2 mt-auto">
            <div className="flex items-center gap-2 font-semibold text-xs text-indigo-600 dark:text-indigo-400">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Admin Mode Active</span>
            </div>
            <p className="text-xs text-muted-foreground">
              You have full global access to delete, block, and manage user resources.
            </p>
          </div>
        </aside>

        {/* Main Content View */}
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
