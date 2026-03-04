import { Skeleton } from '@/components/ui/skeleton'

export default function MessageListSkeleton() {
  return (
    <div className='flex-1 space-y-4 overflow-y-hidden p-4'>
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className={`flex ${i % 3 === 0 ? 'justify-end' : 'justify-start'}`}
        >
          <div className='space-y-2'>
            <Skeleton className='h-16 w-62.5 rounded-2xl' />
          </div>
        </div>
      ))}
    </div>
  )
}
