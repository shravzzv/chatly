import Link from 'next/link'
import { ModeToggle } from './mode-toggle'
import { DISCORD_SERVER_INVITE_URL, SUBREDDIT_URL } from '@/data/constants'

export default function Footer() {
  return (
    <footer className='mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12'>
      <div className='grid grid-cols-1 gap-10 lg:grid-cols-2'>
        <div className='space-y-6'>
          <Link href='/'>
            <h2 className='mb-4 text-2xl font-bold transition-opacity hover:opacity-80'>
              Chatly
            </h2>
          </Link>

          <p className='text-muted-foreground max-w-sm text-sm'>
            Realtime chat, media sharing, ai enhacements, and more — built for
            seamless communication anywhere.
          </p>

          <ModeToggle />
        </div>

        <div className='grid grid-cols-2 gap-8 md:grid-cols-3'>
          <div>
            <h3 className='mb-3 font-semibold'>Product</h3>

            <ul className='space-y-2 text-sm'>
              {['features', 'pricing', 'download', 'support'].map((link) => (
                <li key={link}>
                  <Link
                    href={`/${link}`}
                    className='capitalize underline-offset-4 hover:underline'
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className='mb-3 font-semibold'>Socials</h3>

            <ul className='space-y-2 text-sm'>
              <li>
                <Link
                  href={DISCORD_SERVER_INVITE_URL}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:underline'
                >
                  Discord
                </Link>
              </li>
              <li>
                <Link
                  href={SUBREDDIT_URL}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:underline'
                >
                  Reddit
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className='mb-3 font-semibold'>Legal</h3>

            <ul className='space-y-2 text-sm'>
              <li>
                <Link href='/privacy' className='hover:underline'>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href='/terms' className='hover:underline'>
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className='text-muted-foreground mt-8 border-t pt-6 text-center text-sm'>
        &copy; {new Date().getFullYear()} Chatly. All rights reserved.
      </div>
    </footer>
  )
}
