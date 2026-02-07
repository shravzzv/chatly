import { type PostgrestError } from '@supabase/supabase-js'
import type { ChatlyPlan, UsageKind } from './plan'

export interface UseUsageResult {
  readonly plan: ChatlyPlan
  readonly loading: boolean
  readonly error: PostgrestError | null
  readonly aiUsed: number
  readonly canUseAi: boolean
  readonly aiRemaining: number
  readonly mediaUsed: number
  readonly canUseMedia: boolean
  readonly mediaRemaining: number

  /**
   * non-authoritivate helper to modify usage state
   */
  reflectUsageIncrement: (kind: UsageKind) => void
}
