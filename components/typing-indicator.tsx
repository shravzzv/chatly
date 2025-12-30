export default function TypingIndicator() {
  return (
    <div className='flex justify-start'>
      <div className='bg-muted rounded-2xl px-4 py-3 flex items-center gap-2'>
        <div className='flex gap-1'>
          <div className='w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]' />
          <div className='w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]' />
          <div className='w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce' />
        </div>
        <span className='text-xs text-muted-foreground'>typing...</span>
      </div>
    </div>
  )
}

// todo: improve this?
