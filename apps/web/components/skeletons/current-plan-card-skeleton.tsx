import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '../ui/skeleton'

export default function CurrentPlanCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className='h-4 w-40' />
        </CardTitle>
        <CardDescription>
          <Skeleton className='h-6 w-32' />
        </CardDescription>
        <CardAction>
          <Skeleton className='h-9 w-20 rounded-md' />
        </CardAction>
      </CardHeader>

      <CardContent className='space-y-3'>
        <Skeleton className='h-4 w-48' />
        <Skeleton className='h-4 w-40' />
        <Skeleton className='h-4 w-36' />
        <Skeleton className='h-4 w-32' />
      </CardContent>
    </Card>
  )
}
