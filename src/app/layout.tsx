import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SERVER_URL || "https://mind-controlled.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Mind-Controlled",
    template: "%s | Mind-Controlled",
  },
  description:
    "Exploring the mechanics of propaganda, conditioning, and persuasion in modern society.",
  keywords: ["propaganda", "media criticism", "conditioning", "Ellul", "philosophy"],
  authors: [{ name: "Mind-Controlled" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Mind-Controlled",
    title: "Mind-Controlled",
    description:
      "Exploring the mechanics of propaganda, conditioning, and persuasion in modern society.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mind-Controlled",
    description:
      "Exploring the mechanics of propaganda, conditioning, and persuasion in modern society.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
