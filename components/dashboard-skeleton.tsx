import { Skeleton } from './ui/skeleton'

export default function DashboardSkeleton() {
  return (
    <div className='flex h-full bg-background text-foreground rounded-2xl'>
      {/* Profiles sidebar */}
      <div className='flex flex-col h-full p-2 w-full md:w-80 shrink-0 border-r'>
        <div className='flex items-center justify-between p-4'>
          <Skeleton className='h-6 w-32 rounded-md' />
          <Skeleton className='h-8 w-8 rounded-md' />
        </div>

        <div className='px-3 pb-4 border-b'>
          <Skeleton className='h-10 w-full rounded-md' />
        </div>

        {/* Profiles buttons */}
        <div className='p-4 space-y-4 overflow-y-hidden'>
          {[...Array(6)].map((_, i) => (
            <div key={i} className='flex items-center gap-3'>
              <Skeleton className='w-10 h-10 rounded-full' />
              <div className='flex flex-col gap-2 flex-1'>
                <Skeleton className='h-4 w-3/4 rounded-md' />
                <Skeleton className='h-3 w-1/2 rounded-md' />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className='flex flex-col flex-1 h-full'>
        {/* Header */}
        <div className='flex items-center justify-between p-4 border-b'>
          <div className='flex items-center gap-3'>
            <Skeleton className='w-8 h-8 rounded-full' />
            <Skeleton className='h-5 w-32 rounded-md' />
          </div>
          <div className='flex gap-2'>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className='h-8 w-8 rounded-md' />
            ))}
          </div>
        </div>

        {/* Message bubbles */}
        <div className='flex-1 p-4 space-y-4 overflow-y-hidden'>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`flex ${
                i % 2 === 0 ? 'justify-start' : 'justify-end'
              }`}
            >
              <Skeleton
                className={`h-16 w-1/2 rounded-2xl ${
                  i % 2 === 0 ? 'bg-muted' : 'bg-primary/20'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Input area */}
        <div className='p-2 border-t'>
          <div className='flex items-end gap-2'>
            <div className='flex gap-2'>
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className='h-8 w-8 rounded-md' />
              ))}
            </div>
            <Skeleton className='flex-1 h-10 rounded-md' />
            <Skeleton className='h-8 w-8 rounded-md' />
          </div>
        </div>
      </div>
    </div>
  )
}
