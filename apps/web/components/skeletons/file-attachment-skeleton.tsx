import { Skeleton } from '@/components/ui/skeleton'

export default function FileAttachmentSkeleton() {
  return (
    <div className='bg-muted flex max-w-2xs items-center gap-2 rounded-2xl px-3 py-2 shadow-sm'>
      {/* File icon placeholder */}
      <Skeleton className='bg-background h-10 w-10 rounded-md' />

      {/* Text content */}
      <div className='min-w-0 flex-1 space-y-1'>
        {/* File name (2 lines max) */}
        <Skeleton className='h-4 w-4/5' />
        <Skeleton className='h-4 w-3/5' />

        {/* Metadata line */}
        <Skeleton className='h-3 w-2/5' />
      </div>

      {/* Download button */}
      <Skeleton className='bg-background h-10 w-10 shrink-0 rounded-md' />
    </div>
  )
}
