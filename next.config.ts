import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "**.notion.so", pathname: "/**" },
      { protocol: "https", hostname: "prod-files-secure.s3.us-west-2.amazonaws.com", pathname: "/**" },
      { protocol: "https", hostname: "s3.us-west-2.amazonaws.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
