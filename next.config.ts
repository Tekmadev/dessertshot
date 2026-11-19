import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  // Performance
  experimental: {
    optimizePackageImports: ["gsap", "motion", "lucide-react"],
  },

  // No host redirect here. Production serves www.dessertshot.ca, and Vercel's
  // domain settings redirect the apex to it before requests reach the app.
  // An app-level rule would loop against that (see DECISIONS.md).
};

export default nextConfig;
