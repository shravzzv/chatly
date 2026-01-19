import Link from 'next/link'
import { ModeToggle } from './mode-toggle'
import { DISCORD_SERVER_INVITE_URL, SUBREDDIT_URL } from '@/data/constants'

export default function Footer() {
  return (
    <footer className='py-12 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
        <div className='space-y-6'>
          <Link href='/'>
            <h2 className='text-2xl font-bold mb-4 hover:opacity-80 transition-opacity'>
              Chatly
            </h2>
          </Link>

          <p className='text-sm max-w-sm text-muted-foreground'>
            Realtime chat, media sharing, ai enhacements, and more — built for
            seamless communication anywhere.
          </p>

          <ModeToggle />
        </div>

        <div className='grid grid-cols-2 md:grid-cols-3 gap-8'>
          <div>
            <h3 className='font-semibold mb-3'>Product</h3>

            <ul className='space-y-2 text-sm'>
              {['features', 'pricing', 'download', 'support'].map((link) => (
                <li key={link}>
                  <Link
                    href={`/${link}`}
                    className='hover:underline underline-offset-4 capitalize'
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className='font-semibold mb-3'>Socials</h3>

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
            <h3 className='font-semibold mb-3'>Legal</h3>

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

      <div className='mt-8 border-t pt-6 text-center text-sm text-muted-foreground'>
        &copy; {new Date().getFullYear()} Chatly. All rights reserved.
      </div>
    </footer>
  )
}
