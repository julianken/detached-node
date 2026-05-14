import type { Metadata } from "next";
import { Link, ViewTransitions } from "next-view-transitions";
import { Crimson_Pro, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MobileNav } from "@/components/MobileNav";
import { ScrollPillNav } from "@/components/ScrollPillNav";
import { NavLink } from "@/components/NavLink";
import { GitHubLink } from "@/components/GitHubLink";
import { StatusBar } from "@/components/StatusBar";
import { ScrollToTop } from "@/components/ScrollToTop";
import { TextureOverlay } from "@/components/TextureOverlay";
import { WebVitalsReporter } from "@/components/WebVitalsReporter";
import {
  siteUrl,
  siteName,
  siteDescription,
  siteKeywords,
  ogDefaultImage,
} from "@/lib/site-config";
import "../globals.css";


const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  variable: "--font-crimson",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: siteKeywords,
  authors: [{ name: siteName }],
  // RSS autodiscovery is rendered as a direct <link> tag in <head> below,
  // not via alternates.types, because page-level alternates.canonical
  // would clobber it (Next.js metadata merging replaces alternates entirely).
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: ogDefaultImage,
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${crimsonPro.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <head>
        <link rel="alternate" type="application/rss+xml" title="detached-node" href={`${siteUrl}/feed.xml`} />
      </head>
      <body className="min-h-screen antialiased bg-background text-text-primary">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-surface focus:text-text-primary focus-ring"
        >
          Skip to main content
        </a>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ViewTransitions>
          <WebVitalsReporter />
          <ScrollToTop />
          <TextureOverlay />
          <ScrollPillNav />
          <div className="site-frame relative z-40 mx-auto my-4 flex min-h-[calc(100vh-2rem)] max-w-frame flex-col rounded-sm border border-border sm:my-6 sm:min-h-[calc(100vh-3rem)]">
            <header className="relative z-40 flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
              <Link href="/" className="font-mono text-brand font-semibold tracking-tight text-accent lowercase focus-ring">
                d-n
              </Link>
              <div className="flex items-center gap-4">
                <nav className="hidden items-center gap-6 text-nav font-mono tracking-[0.04em] text-text-secondary sm:flex" aria-label="Main navigation">
                  <NavLink className="py-2" href="/">Home</NavLink>
                  <NavLink className="py-2" href="/posts">Posts</NavLink>
                  <NavLink className="py-2" href="/agentic-design-patterns">Patterns</NavLink>
                  <NavLink className="py-2" href="/about">About</NavLink>
                </nav>
                <div className="flex items-center gap-1">
                  <GitHubLink />
                  <ThemeToggle />
                  <MobileNav />
                </div>
              </div>
            </header>
            <main id="main-content" className="flex-1 px-4 py-8 sm:px-6 lg:px-8">{children}</main>
            <StatusBar />
          </div>

          {/* SVG filter for glitch page transitions */}
          <svg className="hidden" aria-hidden="true">
            <defs>
              <filter id="rgb-split">
                <feOffset in="SourceGraphic" dx="2" dy="0" result="red-shift" />
                <feColorMatrix
                  in="red-shift"
                  type="matrix"
                  values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
                  result="red"
                />
                <feOffset in="SourceGraphic" dx="-2" dy="0" result="cyan-shift" />
                <feColorMatrix
                  in="cyan-shift"
                  type="matrix"
                  values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
                  result="cyan"
                />
                <feBlend in="red" in2="cyan" mode="screen" />
              </filter>
            </defs>
          </svg>

          </ViewTransitions>
        </ThemeProvider>
      </body>
    </html>
  );
}
