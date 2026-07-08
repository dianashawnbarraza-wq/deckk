import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
    ],
  },
  async redirects() {
    return [
      {
        source: "/@:handle",
        destination: "/:handle",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
