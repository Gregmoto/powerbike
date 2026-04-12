import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "powerbike.nu",
        pathname: "/wp-content/uploads/**",
      },
    ],
  },
};

export default nextConfig;
