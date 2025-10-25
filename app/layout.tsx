import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Analytics } from '@vercel/analytics/next'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Chatly — Real-time Chat Platform',
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en' suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <ThemeProvider
          attribute='class'
          defaultTheme='system'
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
