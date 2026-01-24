import { Skeleton } from '@/components/ui/skeleton'

export default function MessageListSkeleton() {
  return (
    <div className='space-y-4 flex-1 overflow-y-auto p-4'>
      {[...Array(6)].map((_, i) => (
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
