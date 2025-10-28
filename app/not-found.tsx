import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className='flex flex-col items-center justify-center min-h-[80vh] px-6 text-center'>
      <div className='space-y-4 animate-in fade-in duration-300'>
        <h1 className='text-6xl sm:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100'>
          404
        </h1>

        <h2 className='text-xl sm:text-2xl font-semibold'>Page not found</h2>

        <p className='max-w-md mx-auto text-sm sm:text-base text-muted-foreground'>
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          moved. Check the URL, or head back to the homepage.
        </p>

        <div className='pt-4'>
          <Button asChild size='lg'>
            <Link href='/'>Go back home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
