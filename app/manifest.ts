import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/dashboard',
    name: 'Chatly',
    short_name: 'Chatly',
    description:
      'Chatly is a modern real-time chat SaaS built with Next.js and Supabase. Features include messaging, profiles, paywall, AI integration, dark mode, push notifications, and voice/video calls.',
    start_url: '/dashboard',
    scope: '/',
    display: 'standalone',
    orientation: 'natural',
    theme_color: '#84cc16',
    background_color: '#0f172a',
    categories: ['social', 'communication', 'productivity'],
    icons: [
      { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    screenshots: [
      {
        src: '/screenshots/wide-home.png',
        form_factor: 'wide',
        label: 'Desktop view showing the home page',
        sizes: '1905x907',
      },
      {
        src: '/screenshots/wide-dashboard.png',
        form_factor: 'wide',
        label: 'Desktop view showing the dashboard page',
        sizes: '1919x910',
      },
      {
        src: '/screenshots/narrow-home.jpg',
        form_factor: 'narrow',
        label: 'Mobile view showing the home page',
        sizes: '1079x2208',
      },
      {
        src: '/screenshots/narrow-dashboard.jpg',
        form_factor: 'narrow',
        label: 'Mobile view showing the dashboard page',
        sizes: '1079x2243',
      },
    ],
    shortcuts: [
      {
        name: 'Profile',
        url: '/dashboard/profile',
        icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }],
      },
      {
        name: 'Settings',
        url: '/dashboard/settings',
        icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }],
      },
    ],
  }
}
