const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**"
      }
    ],
    formats: ["image/avif", "image/webp"]
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"]
  }
};

export default nextConfig;