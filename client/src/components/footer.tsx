"use client";

import Link from "next/link";
import { BookOpen } from "lucide-react";
import { usePathname } from "next/navigation";

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-black transition-colors">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-7 w-7 rounded-lg bg-black text-white dark:bg-white dark:text-black flex items-center justify-center">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="font-bold text-black dark:text-white">ReadyForms</span>
            </Link>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              AI-powered form builder for modern teams. Create, share, and analyze forms in seconds.
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-xs uppercase tracking-wider text-black dark:text-white">Product</h4>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li><Link href="/templates/create" className="hover:text-black dark:hover:text-white transition-colors">AI Form Builder</Link></li>
              <li><Link href="/templates" className="hover:text-black dark:hover:text-white transition-colors">Templates</Link></li>
              <li><Link href="/pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-xs uppercase tracking-wider text-black dark:text-white">Company</h4>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li><Link href="/about" className="hover:text-black dark:hover:text-white transition-colors">About</Link></li>
              <li><Link href="/templates" className="hover:text-black dark:hover:text-white transition-colors">Gallery</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-3 text-xs uppercase tracking-wider text-black dark:text-white">Get Started</h4>
            <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-400">
              <li><Link href="/auth/register" className="hover:text-black dark:hover:text-white transition-colors">Sign Up Free</Link></li>
              <li><Link href="/auth/login" className="hover:text-black dark:hover:text-white transition-colors">Log In</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <p>&copy; {new Date().getFullYear()} ReadyForms. All rights reserved.</p>
          <p>Built with enterprise AI technology</p>
        </div>
      </div>
    </footer>
  );
}
