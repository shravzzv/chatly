'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useChatlyStore } from '@/providers/chatly-store-provider'

const navLinks = [
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
  { name: 'Download', href: '/download' },
  { name: 'Support', href: '/support' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const user = useChatlyStore((state) => state.user)

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav
      className={`bg-background sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'border-b shadow-sm' : 'border-b-0 shadow-none'
      }`}
    >
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          <Link href='/' className='shrink-0'>
            <span
              className='cursor-pointer text-lg font-bold'
              onClick={() => isOpen && toggleMenu()}
            >
              Chatly
            </span>
          </Link>

          <div className='hidden grow justify-center space-x-1 md:flex'>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className='rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className='hidden items-center space-x-2 md:flex lg:space-x-4'>
            {
              <>
                {user ? (
                  <Button
                    asChild
                    className='cursor-pointer rounded-lg px-4 py-2 text-sm font-medium shadow-md'
                  >
                    <Link href='/dashboard'>Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Link
                      href='/signin'
                      className='text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100'
                    >
                      Sign in
                    </Link>

                    <Button
                      asChild
                      className='cursor-pointer rounded-lg px-4 py-2 text-sm font-medium shadow-md'
                    >
                      <Link href='/signup'>Sign up</Link>
                    </Button>
                  </>
                )}
              </>
            }
          </div>

          <div className='flex items-center space-x-4 md:hidden'>
            {user ? (
              <Button
                className='rounded-lg px-3 py-1.5 text-sm font-medium shadow-md'
                asChild
              >
                <Link href='/dashboard'>Dashboard</Link>
              </Button>
            ) : (
              <Button
                asChild
                className='rounded-lg px-3 py-1.5 text-sm font-medium shadow-md'
                onClick={() => isOpen && toggleMenu()}
              >
                <Link href='/signup'>Sign up</Link>
              </Button>
            )}

            <Button
              variant='outline'
              onClick={toggleMenu}
              className='cursor-pointer rounded-lg p-2 text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-200 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:ring-gray-700'
              aria-expanded={isOpen}
              aria-label='Toggle navigation'
            >
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className='fixed inset-0 top-16 z-40 overflow-y-auto bg-white transition-colors md:hidden dark:bg-black'>
          <div className='flex h-full flex-col px-4 pt-2 pb-3'>
            <div className='grow space-y-2 py-4'>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className='flex cursor-pointer items-center justify-between rounded-lg text-lg font-semibold text-gray-800 transition-colors hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-gray-800'
                  onClick={toggleMenu}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className='sticky bottom-0 space-y-3 border-t border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-black'>
              {user ? (
                <Button
                  className='w-full cursor-pointer rounded-lg px-4 py-3 font-semibold shadow-md'
                  onClick={toggleMenu}
                  asChild
                >
                  <Link href='/dashboard'>Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button
                    className='w-full cursor-pointer rounded-lg px-4 py-3 font-semibold shadow-md'
                    onClick={toggleMenu}
                    asChild
                  >
                    <Link href='/signup'>Sign up</Link>
                  </Button>

                  <Button
                    variant='outline'
                    className='w-full cursor-pointer rounded-lg px-4 py-3 font-semibold'
                    onClick={toggleMenu}
                    asChild
                  >
                    <Link href='/signin'>Sign in</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
