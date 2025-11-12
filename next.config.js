/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
    unoptimized: true, // Required for static export
  },
  // Cloudflare Pages configuration
  // Note: Commented out for development. Enable for static deployment
  // output: 'export',
  trailingSlash: false,
}

module.exports = nextConfig
