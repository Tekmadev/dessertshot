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
};

export default nextConfig;
