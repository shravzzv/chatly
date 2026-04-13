type Status = 'online' | 'offline' | 'idle'
export type Theme = 'light' | 'dark' | 'system'

export interface Profile {
  id: string
  user_id: string
  name: string | null
  username: string | null
  avatar_url: string | null
  bio: string | null
  status: Status
  theme: Theme
  last_seen_at: string | null
  created_at: string
  updated_at: string
}
