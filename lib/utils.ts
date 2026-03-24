export function calcStreak(streakStartDate: string | null): number | null {
  if (!streakStartDate) return null
  const start = new Date(streakStartDate)
  const today = new Date()
  return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}