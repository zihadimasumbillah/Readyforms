import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";
import localFont from 'next/font/local';
// Import Analytics component properly
import { type FC } from "react";

// Define a type for the Analytics component
type AnalyticsComponent = FC<{}>;

// Initialize with a no-op component
let Analytics: AnalyticsComponent = () => null;

try {
  // Dynamic import of the Analytics component
  const VercelAnalytics = require('@vercel/analytics/react');
  if (VercelAnalytics && VercelAnalytics.Analytics) {
    Analytics = VercelAnalytics.Analytics;
  }
} catch (error) {
  // Keep using the no-op component if the module is not available
  console.warn("@vercel/analytics/react not available - analytics disabled");
}

import "./globals.css";

// Use local Europa font files from public directory instead of Google Fonts
const europa = localFont({
  src: [
    {
      path: '../../public/fonts/europa-light-webfont.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/fonts/europa-regular-webfont.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/europa-bold-webfont.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-europa',
});

export const metadata = {
  title: 'ReadyForms',
  description: 'Create and share custom forms easily',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-sans antialiased", europa.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <AuthProvider>
              <Navbar />
              <main>{children}</main>
              <Toaster />
              <Analytics />
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
