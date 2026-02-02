import { Skeleton } from '@/components/ui/skeleton'

export default function FileAttachmentSkeleton() {
  return (
    <div className='flex items-center gap-2 max-w-2xs rounded-2xl shadow-sm bg-muted px-3 py-2'>
      {/* File icon placeholder */}
      <Skeleton className='h-10 w-10 rounded-md bg-background' />

      {/* Text content */}
      <div className='flex-1 min-w-0 space-y-1'>
        {/* File name (2 lines max) */}
        <Skeleton className='h-4 w-4/5' />
        <Skeleton className='h-4 w-3/5' />

        {/* Metadata line */}
        <Skeleton className='h-3 w-2/5' />
      </div>

      {/* Download button */}
      <Skeleton className='h-10 w-10 rounded-md bg-background shrink-0' />
    </div>
  )
}
