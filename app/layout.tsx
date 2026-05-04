import type { Metadata, Viewport } from "next";
import { Fraunces, Inter_Tight } from "next/font/google";
import { LenisProvider } from "@/components/layout/LenisProvider";
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

const SITE_URL = "https://dessertshot.ca";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Dessert Shot. Layered cups, made by hand in Hamilton.",
    template: "%s . Dessert Shot",
  },
  description:
    "Hand layered dessert cups baked in Hamilton, Ontario. Real fruit, real cream, ridiculous detail. Order packages of 6, 12, or 24 across the GTA.",
  applicationName: "Dessert Shot",
  authors: [{ name: "Dessert Shot" }],
  keywords: [
    "dessert cups Hamilton",
    "dessert cups GTA",
    "dessert shot",
    "layered dessert cups",
    "Kinder Bueno dessert",
    "Ferrero dessert",
    "Dubai chocolate dessert",
    "Biscoff dessert cups",
    "mango cheesecake cup",
    "custom dessert orders Hamilton",
    "Toronto dessert delivery",
    "wedding dessert cups",
  ],
  openGraph: {
    title: "Dessert Shot. Layered cups, made by hand.",
    description:
      "Hand layered dessert cups baked in Hamilton, Ontario. Real fruit, real cream, ridiculous detail.",
    url: SITE_URL,
    siteName: "Dessert Shot",
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dessert Shot. Layered cups, made by hand.",
    description: "Hand layered dessert cups baked in Hamilton, Ontario.",
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
