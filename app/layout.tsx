import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { createClient } from '@/utils/supabase/server'
import { ChatlyStoreProvider } from '@/providers/chatly-store-provider'
import { type Profile } from '@/types/profile'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  metadataBase: new URL('https://chatly-brown.vercel.app'),
  title: 'Chatly — Real-time Chat Platform',
  applicationName: 'Chatly',
  description:
    'Chatly is a modern real-time chat SaaS built with Next.js and Supabase. Features include messaging, profiles, paywall, AI integration, dark mode, push notifications, and voice/video calls.',
  keywords: [
    'Chatly',
    'Next.js',
    'Supabase',
    'Realtime Chat',
    'AI Chat',
    'SaaS',
    'WebRTC',
    'Chat App',
  ],
  authors: [{ name: 'Sai Shravan Vadla', url: 'https://github.com/shravzzv' }],
  creator: 'Sai Shravan Vadla',
  publisher: 'Chatly',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  manifest: '/manifest.webmanifest',
  verification: {
    google: 'Rpa-EHLE7jJCx3KyAo9bRdCW76ppRqG92gxYZwGlSa8',
  },
  openGraph: {
    title: 'Chatly — Real-time Chat Platform',
    description:
      'Modern chat SaaS built with Next.js and Supabase. Messaging, AI, and video calls built-in.',
    url: 'https://chatly-brown.vercel.app',
    siteName: 'Chatly',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Chatly — Real-time Chat Platform',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Chatly — Real-time Chat Platform',
    description:
      'Modern chat SaaS built with Next.js and Supabase. Messaging, AI, and video calls built-in.',
    creator: '@shravzzv',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/icons/icon-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png' }],
    shortcut: ['/favicon.ico'],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Chatly',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: {
    canonical: 'https://chatly-brown.vercel.app',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  let profile: Profile | null = null

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    profile = data
  }

  return (
    <html lang='en' suppressHydrationWarning className={inter.variable}>
      <body className='antialiased'>
        <ChatlyStoreProvider hydrationData={{ user, profile }}>
          <ThemeProvider
            attribute='class'
            defaultTheme={profile?.theme || 'system'}
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster richColors />
          </ThemeProvider>
        </ChatlyStoreProvider>
        <Analytics />
      </body>
    </html>
  )
}
