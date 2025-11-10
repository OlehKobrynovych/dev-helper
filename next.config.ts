import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "127.0.0.1",
      "localhost",
      "api.vitalisbalance.com",
      "vitalis-media.s3.eu-central-1.amazonaws.com",
    ],
  },
  sassOptions: {
    includePaths: ["./src"],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/_next/image:path*",
        headers: [
          {
            key: "Content-Disposition",
            value: "inline",
          },
        ],
      },
      {
        source: "/:path*.(jpg|jpeg|png|gif|webp|svg)",
        headers: [
          {
            key: "Content-Disposition",
            value: "inline",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
