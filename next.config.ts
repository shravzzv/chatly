import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cnmrbnphntasntzxeeqm.supabase.co',
      },
    ],
  },
}

export default nextConfig
