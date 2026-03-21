"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Habit } from "@/types"

function calcStreak(streakStartDate: string | null): number | null {
  if (!streakStartDate) return null
  const start = new Date(streakStartDate)
  const today = new Date()
  return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

export default function DashboardClient({ habits }: { habits: Habit[] }) {
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

async function handleLogOut() {
  await supabase.auth.signOut()
  window.location.href = "/login"
}

  async function startDayOne(habitId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }

    const today = new Date().toISOString().split("T")[0]

    const { error } = await supabase
      .from("habits")
      .update({ quit_date: today, streak_start_date: today })
      .eq("id", habitId)
      .eq("user_id", user.id)

    if (error) {
      setError(error.message)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen bg-grid bg-gray-950 p-4 pb-12">
      <div className="w-full max-w-2xl mx-auto pt-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">ImBetter</h1>
            <p className="text-slate-500 text-sm mt-0.5">Your habits</p>
          </div>
          <button
            onClick={handleLogOut}
            className="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors"
          >
            Sign out
          </button>
        </div>

        {habits.length > 0 ? (
          <div className="flex flex-col gap-3">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}
            {habits.map((habit) => {
              const streak = calcStreak(habit.streak_start_date)
              return (
                <div
                  key={habit.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1 min-w-0">
                      <a href={`/habits/${habit.id}`} className="group flex items-center gap-2">
                        <h2 className="text-white text-lg font-semibold group-hover:text-purple-300 transition-colors truncate">
                          {habit.name}
                        </h2>
                      </a>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          streak
                            ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                            : "bg-slate-800 text-slate-500 border border-slate-700"
                        }`}>
                          {streak ? `🔥 Day ${streak}` : "Not started"}
                        </span>
                        {habit.motivation && (
                          <span className="text-xs text-slate-600">
                            Motivation {habit.motivation}/5
                          </span>
                        )}
                      </div>
                      {habit.reason && (
                        <p className="text-slate-600 text-xs mt-1 truncate">{habit.reason}</p>
                      )}
                    </div>
                    <div className="shrink-0">
                      {habit.streak_start_date
                        ? <a
                            href={`/habits/${habit.id}`}
                            className="py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold rounded-xl transition-all duration-200"
                          >Check In</a>
                        : <button
                            onClick={() => startDayOne(habit.id)}
                            className="py-2 px-4 bg-slate-800 hover:bg-purple-600 border border-slate-700 hover:border-purple-500 text-slate-300 hover:text-white text-sm font-semibold rounded-xl transition-all duration-200"
                          >Start Day 1</button>
                      }
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Add another habit */}
            <a
              href="/habits/new"
              className="flex items-center justify-center gap-2 py-4 rounded-2xl border border-dashed border-slate-800 hover:border-purple-500/50 text-slate-600 hover:text-purple-400 text-sm font-medium transition-all duration-200 mt-1"
            >
              <span>+</span> Add another habit
            </a>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 mb-6">
              <span className="text-3xl">🎯</span>
            </div>
            <h2 className="text-white font-semibold text-lg mb-2">Nothing to break yet</h2>
            <p className="text-slate-500 text-sm mb-8">Add a habit you want to quit and start your journey</p>
            <a
              href="/habits/new"
              className="inline-flex bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 glow-purple"
            >
              Add your first habit
            </a>
          </div>
        )}
      </div>
    </div>
  )
}