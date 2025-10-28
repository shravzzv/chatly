'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Spinner } from './ui/spinner'

const navLinks = [
  { name: 'Features', href: '/features' },
  { name: 'Pricing', href: '/pricing' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

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
      className={`sticky top-0 z-50 transition-all duration-300 bg-white dark:bg-black ${
        isScrolled
          ? 'border-b border-gray-200 dark:border-gray-800 shadow-sm '
          : 'border-b-0 shadow-none'
      }`}
    >
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <Link href='/' className='shrink-0'>
            <span
              className='font-bold text-lg text-gray-900 dark:text-gray-100 cursor-pointer'
              onClick={() => isOpen && toggleMenu()}
            >
              Chatly
            </span>
          </Link>

          <div className='hidden md:flex grow justify-center space-x-1'>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className='text-sm font-medium px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className='hidden md:flex items-center space-x-2 lg:space-x-4'>
            {loading ? (
              <Spinner />
            ) : (
              <>
                {user ? (
                  <Button
                    asChild
                    className='text-sm font-medium px-4 py-2 rounded-lg shadow-md cursor-pointer'
                  >
                    <Link href='/dashboard'>Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Link
                      href='/signin'
                      className='text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                    >
                      Sign in
                    </Link>

                    <Button
                      asChild
                      className='text-sm font-medium px-4 py-2 rounded-lg shadow-md cursor-pointer'
                    >
                      <Link href='/signup'>Sign up</Link>
                    </Button>
                  </>
                )}
              </>
            )}
          </div>

          <div className='flex md:hidden items-center space-x-4'>
            {loading ? (
              <Spinner />
            ) : user ? (
              <Button
                className='text-sm font-medium px-3 py-1.5 rounded-lg shadow-md'
                asChild
              >
                <Link href='/dashboard'>Dashboard</Link>
              </Button>
            ) : (
              <Button
                asChild
                className='text-sm font-medium px-3 py-1.5 rounded-lg shadow-md'
                onClick={() => isOpen && toggleMenu()}
              >
                <Link href='/signup'>Sign up</Link>
              </Button>
            )}

            <Button
              variant='outline'
              onClick={toggleMenu}
              className='p-2 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-700 cursor-pointer'
              aria-expanded={isOpen}
              aria-label='Toggle navigation'
            >
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className='fixed inset-0 top-16 bg-white dark:bg-black z-40 overflow-y-auto md:hidden transition-colors'>
          <div className='pt-2 pb-3 px-4 flex flex-col h-full'>
            <div className='grow space-y-2 py-4'>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className='font-semibold text-lg text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex justify-between items-center transition-colors cursor-pointer'
                  onClick={toggleMenu}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {loading ? (
              <div className='p-4 flex justify-center border-t border-gray-200 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-gray-900'>
                <Spinner />
              </div>
            ) : (
              <div className='p-4 space-y-3 border-t border-gray-200 dark:border-gray-800 sticky bottom-0 bg-white dark:bg-black'>
                {user ? (
                  <Button
                    className='w-full font-semibold px-4 py-3 rounded-lg shadow-md cursor-pointer'
                    onClick={toggleMenu}
                    asChild
                  >
                    <Link href='/dashboard'>Dashboard</Link>
                  </Button>
                ) : (
                  <>
                    <Button
                      className='w-full font-semibold px-4 py-3 rounded-lg shadow-md cursor-pointer'
                      onClick={toggleMenu}
                      asChild
                    >
                      <Link href='/signup'>Sign up</Link>
                    </Button>

                    <Button
                      variant='outline'
                      className='w-full font-semibold px-4 py-3 rounded-lg cursor-pointer'
                      onClick={toggleMenu}
                      asChild
                    >
                      <Link href='/signin'>Sign in</Link>
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
