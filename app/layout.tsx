import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { LenisProvider } from "@/components/layout/LenisProvider";
import { MotionPreferences } from "@/components/layout/MotionPreferences";
import JsonLd from "@/components/seo/JsonLd";
import { BUSINESS } from "@/lib/business";
import { DEFAULT_OG_IMAGE, TITLE_SEPARATOR } from "@/lib/seo";
import { siteGraph } from "@/lib/structured-data";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
  style: ["normal", "italic"],
});

const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS.url),
  // Fallbacks only. Every page sets its own title, description, canonical and
  // Open Graph via `pageMetadata()` in lib/seo.ts. No canonical here: a
  // layout-level canonical is inherited by every page that forgets its own.
  title: {
    default: `${BUSINESS.name}${TITLE_SEPARATOR}${BUSINESS.tagline}`,
    template: `%s${TITLE_SEPARATOR}${BUSINESS.shortName}`,
  },
  description: BUSINESS.description,
  applicationName: BUSINESS.shortName,
  authors: [{ name: BUSINESS.name }],
  openGraph: {
    title: `${BUSINESS.name}${TITLE_SEPARATOR}${BUSINESS.tagline}`,
    description: BUSINESS.description,
    siteName: BUSINESS.name,
    locale: BUSINESS.location.locale,
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS.name}${TITLE_SEPARATOR}${BUSINESS.tagline}`,
    description: BUSINESS.shortDescription,
    images: [{ url: DEFAULT_OG_IMAGE.url, alt: DEFAULT_OG_IMAGE.alt }],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/favicondessert/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicondessert/favicon.ico", sizes: "any" },
      {
        url: "/favicondessert/favicon-16x16.png",
        type: "image/png",
        sizes: "16x16",
      },
      {
        url: "/favicondessert/favicon-32x32.png",
        type: "image/png",
        sizes: "32x32",
      },
      {
        url: "/favicondessert/android-chrome-192x192.png",
        type: "image/png",
        sizes: "192x192",
      },
      {
        url: "/favicondessert/android-chrome-512x512.png",
        type: "image/png",
        sizes: "512x512",
      },
    ],
    apple: "/favicondessert/apple-touch-icon.png",
    shortcut: "/favicondessert/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#fce4e7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-CA"
      className={`${fraunces.variable} ${interTight.variable} h-full`}
      // The inline script below adds "js" before React hydrates.
      suppressHydrationWarning
    >
      <head>
        {/* Marks a running script before first paint, for the pin/unpinned
            variants and the no-script fallback in app/globals.css. */}
        <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.add("js")' }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full bg-bone text-ink antialiased">
        <MotionPreferences>
          <LenisProvider>{children}</LenisProvider>
        </MotionPreferences>
        <Analytics />
        {/* WebSite + the business, on every page; pages add their own nodes. */}
        <JsonLd data={siteGraph()} />
      </body>
    </html>
  );
}
