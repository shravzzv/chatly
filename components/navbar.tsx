'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const navLinks = [
  // these appear in the middle section in larger displays, and inside the hamburger menu in smaller ones
  { name: 'Pricing', href: '/pricing' },
  { name: 'Features', href: '/features' },
  { name: 'About', href: '/about' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav className='sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <Link href='/' className='shrink-0'>
            {isOpen ? (
              <span className='font-bold text-lg' onClick={toggleMenu}>
                Chatly
              </span>
            ) : (
              <span className='font-bold text-lg'>Chatly</span>
            )}
          </Link>

          <div className='hidden md:flex grow justify-center space-x-1'>
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className='text-sm font-medium px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center group'
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className='hidden md:flex items-center space-x-2 lg:space-x-4'>
            <Link
              href='/signin'
              className='text-sm font-medium text-gray-700 hover:text-gray-900'
            >
              Sign in
            </Link>

            <Button
              asChild
              className='text-sm font-medium px-4 py-2 rounded-lg shadow-md cursor-pointer'
            >
              <Link href='/signup'>Sign up</Link>
            </Button>
          </div>

          {/* Mobile Menu Button & Primary CTA (Right) */}
          <div className='flex md:hidden items-center space-x-4'>
            <Button
              asChild
              className='text-sm font-medium px-3 py-1.5 rounded-lg shadow-md'
            >
              <Link href='/signup'>Sign up</Link>
            </Button>

            {/* Hamburger/Close Icon */}
            <Button
              variant={'outline'}
              onClick={toggleMenu}
              className='p-2 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer'
              aria-expanded={isOpen}
              aria-label='Toggle navigation'
            >
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className='fixed inset-0 top-16 bg-white z-40 overflow-y-auto md:hidden'>
          <div className='pt-2 pb-3 px-4 flex flex-col h-full'>
            <div className='grow space-y-2 py-4'>
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className='font-semibold text-lg text-gray-800 hover:bg-gray-50 rounded-lg flex justify-between items-center transition-colors cursor-pointer'
                  onClick={toggleMenu}
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className='p-4 space-y-3 border-t border-gray-100 sticky bottom-0 bg-white'>
              <Button
                className='w-full font-semibold px-4 py-3 rounded-lg shadow-md cursor-pointer'
                onClick={toggleMenu}
                asChild
              >
                <Link href='/signup'>Sign up</Link>
              </Button>

              <Button
                variant={'outline'}
                className='w-full font-semibold px-4 py-3 rounded-lg cursor-pointer'
                onClick={toggleMenu}
                asChild
              >
                <Link href='/signin'>Sign in</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
