import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
<<<<<<< HEAD
  output: "standalone",
  devIndicators: false,
  agentRules: false,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001",
=======
  devIndicators: false,
  agentRules: false,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000",
>>>>>>> 29066618049be865e9daa585fed068c149bc780f
  },
};

export default nextConfig;
