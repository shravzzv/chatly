import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Chatly',
    short_name: 'Chatly',
    description:
      'Chatly is a modern real-time chat SaaS built with Next.js and Supabase. Features include messaging, profiles, paywall, AI integration, dark mode, push notifications, and voice/video calls.',
    start_url: '/dashboard',
    display: 'standalone',
    theme_color: '#84cc16',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
