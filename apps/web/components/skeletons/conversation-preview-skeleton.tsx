import { Skeleton } from '@/components/ui/skeleton'

export default function ConversationPreviewSkeleton() {
  return (
    <div className='w-full flex items-center gap-3 p-4 rounded-xl'>
      {/* Avatar */}
      <Skeleton className='h-10 w-10 rounded-full shrink-0' />

      <div className='flex flex-col gap-2 flex-1 min-w-0'>
        {/* Display name */}
        <Skeleton className='h-4 w-3/4' />

        {/* Last message preview */}
        <Skeleton className='h-3 w-full' />
      </div>
    </div>
  )
}
