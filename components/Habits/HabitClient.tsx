"use client"
import { Habit } from "@/types"
import CheckInForm from "@/components/Habits/CheckInForm"

function calcStreak(streakStartDate: string | null): number | null {
  if (!streakStartDate) return null
  const start = new Date(streakStartDate)
  const today = new Date()
  return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

export default function HabitClient({ habit }: { habit: Habit }) {
  const streak = calcStreak(habit.streak_start_date)

  return (
    <div className="min-h-screen bg-grid bg-gray-950 p-4 pb-12">
      <div className="w-full max-w-sm mx-auto pt-12">

        {/* Back */}
        <a
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors mb-8"
        >
          ← Back
        </a>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white tracking-tight">Quitting {habit.name}</h1>
          <p className="text-slate-500 text-sm mt-1">Showing up — matters!</p>
        </div>


        {/* Stats card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-500 text-sm">Current Streak</span>
            <span className={`font-semibold ${streak ? "text-purple-300" : "text-slate-500"}`}>
              {streak ? `🔥 Day ${streak}` : "Not started"}
            </span>
          </div>
          {habit.motivation && (
            <div className="flex justify-between items-center border-t border-slate-800 pt-4">
              <span className="text-slate-500 text-sm">Motivation</span>
              <span className="text-white font-semibold">{habit.motivation}/5</span>
            </div>
          )}
          {habit.reason && (
            <div className="flex flex-col gap-1 border-t border-slate-800 pt-4">
              <span className="text-slate-500 text-sm">Your reason</span>
              <span className="text-white text-sm leading-relaxed">{habit.reason}</span>
            </div>
          )}
        </div>
        <CheckInForm habit={habit} />

      </div>
    </div>
  )
}