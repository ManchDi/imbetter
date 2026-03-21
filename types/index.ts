export interface Habit {
  id: string
  user_id: string
  name: string
  quit_date: string | null
  streak_start_date: string | null
  reason: string | null
  motivation: number | null
  created_at: string
}

export interface CheckIn {
  id: string
  user_id: string
  habit_id: string
  date: string
  mood: int
  note: string | null
  ai_response: string | null
  created_at: string
}

export interface Relapse {
  id: string
  user_id: string
  habit_id: string
  relapsed_at: string
  trigger: string | null
  note: string | null
}
