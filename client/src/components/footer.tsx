"use client";

import Link from "next/link";
import { BookTemplate } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <BookTemplate className="h-5 w-5" />
              <span className="font-bold">ReadyForms</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered form builder for teams and individuals. Create, share, and analyze forms in seconds.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/templates/create" className="hover:text-foreground transition-colors">AI Form Builder</Link></li>
              <li><Link href="/templates" className="hover:text-foreground transition-colors">Templates</Link></li>
              <li><Link href="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/about" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link href="/templates" className="hover:text-foreground transition-colors">Gallery</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-sm">Get Started</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/auth/register" className="hover:text-foreground transition-colors">Sign Up Free</Link></li>
              <li><Link href="/auth/login" className="hover:text-foreground transition-colors">Log In</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} ReadyForms. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with AI-powered technology
          </p>
        </div>
      </div>
    </footer>
  );
}
