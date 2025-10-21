import Link from 'next/link'

export default function Footer() {
  return (
    <footer className='bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-200 py-12'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-10'>
          <div>
            <Link href='/'>
              <h2 className='text-2xl font-bold mb-4 hover:opacity-80 transition-opacity'>
                Chatly
              </h2>
            </Link>
            <p className='text-sm max-w-sm'>
              Realtime chat, audio & video calls, and more — built for seamless
              communication anywhere.
            </p>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-3 gap-8'>
            <div>
              <h3 className='font-semibold mb-3'>Product</h3>
              <ul className='space-y-2 text-sm'>
                <li>
                  <Link href='/features' className='hover:underline'>
                    Features
                  </Link>
                </li>
                <li>
                  <Link href='/pricing' className='hover:underline'>
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href='/about' className='hover:underline'>
                    About
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className='font-semibold mb-3'>Socials</h3>
              <ul className='space-y-2 text-sm'>
                <li>
                  <a
                    href='https://discord.gg/VdWBPWeVnm'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:underline'
                  >
                    Discord
                  </a>
                </li>
                <li>
                  <a
                    href='https://www.reddit.com/r/chatly_app'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='hover:underline'
                  >
                    Reddit
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className='font-semibold mb-3'>Legal</h3>
              <ul className='space-y-2 text-sm'>
                <li>
                  <Link href='#' className='hover:underline'>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:underline'>
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:underline'>
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className='mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 text-center text-sm'>
          &copy; {new Date().getFullYear()} Chatly. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
