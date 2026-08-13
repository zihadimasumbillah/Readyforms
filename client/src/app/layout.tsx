import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AuthClientInitializer } from "@/components/auth-client-initializer";
import Analytics from "@/components/analytics";
import localFont from 'next/font/local';
import type { Metadata } from 'next';

import "./globals.css";

// Use local Europa font files from public directory
const europa = localFont({
  src: [
    { path: '../../public/fonts/europa-light-webfont.ttf',   weight: '300', style: 'normal' },
    { path: '../../public/fonts/europa-regular-webfont.ttf', weight: '400', style: 'normal' },
    { path: '../../public/fonts/europa-bold-webfont.ttf',    weight: '700', style: 'normal' },
  ],
  display: 'swap',
  variable: '--font-europa',
});

export const metadata: Metadata = {
  title: {
    default: 'ReadyForms — AI-Powered Form Builder',
    template: '%s | ReadyForms',
  },
  description:
    'Build professional forms in seconds with AI. Describe what you need in plain English and let AI create forms instantly. Free to get started.',
  keywords: ['form builder', 'AI forms', 'survey builder', 'online forms', 'ReadyForms'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://readyforms.vercel.app',
    siteName: 'ReadyForms',
    title: 'ReadyForms — AI-Powered Form Builder',
    description: 'Build professional forms in seconds with AI.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReadyForms — AI-Powered Form Builder',
    description: 'Build professional forms in seconds with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-sans antialiased", europa.variable)} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <AuthProvider>
              <AuthClientInitializer />
              <Navbar />
              <main className="min-h-[calc(100vh-4rem)]">{children}</main>
              <Footer />
              <Toaster />
              <Analytics />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

