import { Icon } from '@/components/ui/icon'
import { cn } from '@/lib/utils'
import { LoaderCircle, type LucideProps } from 'lucide-react-native'

type SpinnerProps = LucideProps & {
  className?: string
}

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <Icon
      as={LoaderCircle}
      className={cn('origin-center animate-spin', className)}
      size={16}
      {...props}
    />
  )
}
