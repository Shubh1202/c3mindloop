import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.29.70'],
  experimental: {
    // Tells Next.js to apply granular tree-shaking on these large libraries.
    // This reduces the number of JS chunks they generate and their total size.
    optimizePackageImports: ['lucide-react', 'motion'],
  },
  async redirects() {
    return [
      // /products duplicates /tools (same ProductsPage component, separate canonical).
      // Consolidate to /tools with a permanent redirect to avoid duplicate-content
      // indexing and split link equity.
      {
        source: '/products',
        destination: '/tools',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
