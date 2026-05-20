import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight } from "next/font/google";
import { LenisProvider } from "@/components/layout/LenisProvider";
import { BUSINESS } from "@/lib/business";
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
  title: {
    default: `${BUSINESS.name}. ${BUSINESS.tagline}`,
    template: `%s . ${BUSINESS.name}`,
  },
  description: BUSINESS.description,
  applicationName: BUSINESS.name,
  authors: [{ name: BUSINESS.name }],
  keywords: [...BUSINESS.seoKeywords],
  openGraph: {
    title: `${BUSINESS.name}. Layered cups, made by hand.`,
    description: BUSINESS.description,
    url: BUSINESS.url,
    siteName: BUSINESS.name,
    locale: BUSINESS.location.locale,
    type: "website",
    images: [
      {
        url: "/dessertshotshowcase.jpg",
        width: 896,
        height: 917,
        alt: `${BUSINESS.name} — hand layered dessert cups`,
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS.name}. Layered cups, made by hand.`,
    description: BUSINESS.shortDescription,
    images: [
      {
        url: "/dessertshotshowcase.jpg",
        alt: `${BUSINESS.name} — hand layered dessert cups`,
      },
    ],
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
  alternates: { canonical: "/" },
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
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full bg-bone text-ink antialiased">
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
