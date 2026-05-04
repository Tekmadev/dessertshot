import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  DM_Serif_Display,
  Plus_Jakarta_Sans,
  Dancing_Script,
} from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dmSerif = DM_Serif_Display({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const dancing = Dancing_Script({
  variable: "--font-accent",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dessert Shot | Handcrafted Dessert Cups · Hamilton & GTA",
  description:
    "Artisan layered dessert cups crafted with love in Hamilton, Ontario. Mango, Strawberry, Ferrero, Kinder Bueno, Biscoff, Dubai Chocolate & more. Order packages of 6, 12, or 24.",
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
  ],
  authors: [{ name: "Dessert Shot" }],
  openGraph: {
    title: "Dessert Shot | Handcrafted Dessert Cups",
    description: "Beautiful layered dessert cups for every occasion.",
    url: "https://dessertshot.ca",
    siteName: "Dessert Shot",
    locale: "en_CA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dessert Shot | Handcrafted Dessert Cups",
    description: "Beautiful layered dessert cups for every occasion.",
  },
  metadataBase: new URL("https://dessertshot.ca"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`
        ${cormorant.variable}
        ${dmSerif.variable}
        ${plusJakarta.variable}
        ${dancing.variable}
        h-full antialiased
      `}
    >
      <body className="min-h-full flex flex-col bg-ivory overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
