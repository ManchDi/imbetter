"use client"
import { Habit } from "@/types"

function calcStreak(streakStartDate: string | null): number | null {
  if (!streakStartDate) return null
  const start = new Date(streakStartDate)
  const today = new Date()
  return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

export default function HabitClient({ habit }: { habit: Habit }) {
  const streak = calcStreak(habit.streak_start_date)

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative">
      <a
        href="/dashboard"
        className="absolute top-6 left-6 text-slate-500 hover:text-white transition-colors duration-200 text-2xl"
      >
        ←
      </a>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Quitting {habit.name} Progress</h1>
          <p className="text-slate-400 mt-2 text-sm">Showing up — matters!</p>
        </div>
        <div className="bg-slate-800 rounded-2xl p-8 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 text-sm">Current Streak</span>
            <span className="text-white font-semibold">
              {streak ? `Day ${streak}` : "No streak yet!"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 text-sm">Your Motivation</span>
            <span className="text-white font-semibold">
              {habit.motivation ? `${habit.motivation}/5` : "No motivation level specified"}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-slate-400 text-sm">Quitting Reason</span>
            <span className="text-white font-semibold">
              {habit.reason ?? "No reason specified"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}