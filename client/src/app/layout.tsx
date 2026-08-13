import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/components/query-provider";
import { AuthProvider } from "@/contexts/auth-context";
import { Toaster } from "@/components/ui/toaster";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AuthClientInitializer } from "@/components/auth-client-initializer";
import Analytics from "@/components/analytics";
import localFont from "next/font/local";
import type { Metadata } from "next";

import "./globals.css";

const europa = localFont({
  src: [
    { path: "../../public/fonts/europa-light-webfont.ttf", weight: "300", style: "normal" },
    { path: "../../public/fonts/europa-regular-webfont.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/europa-bold-webfont.ttf", weight: "700", style: "normal" },
  ],
  display: "swap",
  variable: "--font-europa",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://readyforms.vercel.app"),
  title: {
    default: "ReadyForms — AI-Powered Form Builder & Analytics Platform",
    template: "%s | ReadyForms",
  },
  description:
    "Build, customize, and analyze intelligent online forms, surveys, and quizzes in seconds with AI. Real-time responses, enterprise security, and custom analytics.",
  keywords: [
    "form builder",
    "AI form generator",
    "online surveys",
    "quiz maker",
    "form analytics",
    "ReadyForms",
    "custom forms",
    "interactive forms",
  ],
  authors: [{ name: "ReadyForms Team", url: "https://readyforms.vercel.app" }],
  creator: "ReadyForms",
  publisher: "ReadyForms",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  alternates: {
    canonical: "https://readyforms.vercel.app",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://readyforms.vercel.app",
    siteName: "ReadyForms",
    title: "ReadyForms — AI-Powered Form Builder & Analytics Platform",
    description:
      "Create, customize, and analyze intelligent online forms, surveys, and quizzes in seconds with AI.",
    images: [
      {
        url: "https://readyforms.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "ReadyForms — AI-Powered Form Builder",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReadyForms — AI-Powered Form Builder & Analytics Platform",
    description:
      "Create, customize, and analyze intelligent online forms, surveys, and quizzes in seconds with AI.",
    images: ["https://readyforms.vercel.app/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "ReadyForms",
    "url": "https://readyforms.vercel.app",
    "description": "AI-Powered Form Builder & Analytics Platform for creating custom forms, surveys, and quizzes.",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="32x32" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
