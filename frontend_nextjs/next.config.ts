import type { NextConfig } from "next";

// Inside Docker the API is reachable at the compose service name; running
// Next directly on the host it's localhost. One config covers both.
const backendUrl = process.env.BACKEND_URL ?? "http://localhost:3000";

const nextConfig: NextConfig = {
  // Replaces the Vite dev proxy: /api/auth/login -> backend /auth/login
  async rewrites() {
    return {
      afterFiles: [{ source: "/api/:path*", destination: `${backendUrl}/:path*` }],
      fallback: [],
    };
  },
};

export default nextConfig;
