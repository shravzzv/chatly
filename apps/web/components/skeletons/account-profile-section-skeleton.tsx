import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export default function AccountProfileSectionSkeleton() {
  return (
    <section className='space-y-4'>
      {/* Section title */}
      <Skeleton className='h-5 w-24' />

      {/* Avatar */}
      <div className='flex items-center gap-4'>
        <Skeleton className='h-24 w-24 rounded-full shrink-0' />
        <div className='flex flex-col gap-1'>
          <Skeleton className='h-4 w-40' />
          <Skeleton className='h-4 w-40' />
        </div>
      </div>

      <Separator />

      {/* Name + Username */}
      <div className='space-y-4 md:flex md:gap-2 md:space-y-0'>
        <div className='flex-1 space-y-2'>
          <Skeleton className='h-4 w-16' />
          <Skeleton className='h-10 w-full rounded-md' />
        </div>

        <div className='flex-1 space-y-2'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-10 w-full rounded-md' />
        </div>
      </div>

      {/* Bio */}
      <div className='space-y-2'>
        <Skeleton className='h-4 w-12' />
        <Skeleton className='h-24 w-full rounded-md' />
      </div>

      {/* Save button */}
      <Skeleton className='h-9 w-20 rounded-md' />
    </section>
  )
}
