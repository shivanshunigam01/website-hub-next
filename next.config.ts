/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  compress: true,
  async rewrites() {
    return [{ source: "/llms.txt", destination: "/llms" }];
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "date-fns", "framer-motion"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "api.teacherpoint.org" },
      { protocol: "https", hostname: "api.teacherpoint.in" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "videos.pexels.com" },
      { protocol: "http", hostname: "localhost", pathname: "/**" },
      { protocol: "http", hostname: "127.0.0.1", pathname: "/**" },
    ],
  },
  headers: async () => [
    {
      source: "/llms.txt",
      headers: [{ key: "Content-Type", value: "text/plain; charset=utf-8" }],
    },
    {
      source: "/:path*\\.(mp4|webm|jpg|jpeg|png|webp|avif|gif|svg|ico|woff2)",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    },
    {
      source: "/:path*",
      headers: [
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
      ],
    },
  ],
};

export default nextConfig;
