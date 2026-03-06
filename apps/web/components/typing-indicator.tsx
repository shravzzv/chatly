export default function TypingIndicator() {
  return (
    <div className='flex justify-start'>
      <div className='bg-muted flex items-center gap-2 rounded-2xl px-4 py-3'>
        <div className='flex gap-1'>
          <div className='bg-muted-foreground/60 h-2 w-2 animate-bounce rounded-full [animation-delay:-0.3s]' />
          <div className='bg-muted-foreground/60 h-2 w-2 animate-bounce rounded-full [animation-delay:-0.15s]' />
          <div className='bg-muted-foreground/60 h-2 w-2 animate-bounce rounded-full' />
        </div>
        <span className='text-muted-foreground text-xs'>typing...</span>
      </div>
    </div>
  )
}
