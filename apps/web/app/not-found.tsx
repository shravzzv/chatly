import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <main className='flex min-h-[80vh] flex-col items-center justify-center px-6 text-center'>
      <div className='animate-in fade-in space-y-4 duration-300'>
        <h1 className='text-6xl font-extrabold tracking-tight text-gray-900 sm:text-7xl dark:text-gray-100'>
          404
        </h1>

        <h2 className='text-xl font-semibold sm:text-2xl'>Page not found</h2>

        <p className='text-muted-foreground mx-auto max-w-md text-sm sm:text-base'>
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
