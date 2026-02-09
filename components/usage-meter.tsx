import { Field, FieldLabel } from '@/components/ui/field'
import { Progress } from '@/components/ui/progress'

interface UsageMeterProps {
  label: string
  used: number
  limit: number
}

export function UsageMeter({ label, used, limit }: UsageMeterProps) {
  const percentage = limit > 0 ? Math.min(100, (used / limit) * 100) : 0

  return (
    <Field>
      <FieldLabel
        htmlFor={label}
        className='text-sm text-muted-foreground font-medium'
      >
        <span>{label}</span>

        <span className='ml-auto'>
          {used} / {limit}
        </span>
      </FieldLabel>

      <Progress value={percentage} id={label} />
    </Field>
  )
}
