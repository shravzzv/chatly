import { Skeleton } from '@/components/ui/skeleton'

export default function ConversationPreviewSkeleton() {
  return (
    <div className='flex w-full items-center gap-3 rounded-xl p-4'>
      {/* Avatar */}
      <Skeleton className='h-10 w-10 shrink-0 rounded-full' />

      <div className='flex min-w-0 flex-1 flex-col gap-2'>
        {/* Display name */}
        <Skeleton className='h-4 w-3/4' />

        {/* Last message preview */}
        <Skeleton className='h-3 w-full' />
      </div>
    </div>
  )
}
