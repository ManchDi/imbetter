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
    router.push("/login")
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
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">ImBetter</h1>
          <p className="text-slate-400 mt-2 text-sm">Welcome back</p>
        </div>

        {habits.length > 0 ? (
          <div className="flex flex-col gap-4">
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
            {habits.map((habit) => {
              const streak = calcStreak(habit.streak_start_date)
              return (
                <div key={habit.id} className="bg-slate-800 rounded-2xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <a href={`/habits/${habit.id}`}>
                        <h2 className="text-white text-xl font-semibold">{habit.name}</h2>
                      </a>
                      <p className="text-slate-400 text-sm">
                        {streak ? `Day ${streak}` : "Not started yet"}
                      </p>
                      {habit.motivation && (
                        <p className="text-slate-500 text-sm">Motivation: {habit.motivation}/5</p>
                      )}
                      {habit.reason && (
                        <p className="text-slate-500 text-sm">Reason: {habit.reason}</p>
                      )}
                    </div>
                    <div>
                      {habit.streak_start_date
                        ? <a
                            href={`/habits/${habit.id}`}
                            className="py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors duration-200"
                          >Check In</a>
                        : <button
                            onClick={() => startDayOne(habit.id)}
                            className="py-2 px-4 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors duration-200"
                          >Start Day 1</button>
                      }
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center mt-6">
            <p className="text-slate-400 mb-4">No habits yet</p>
            <a
              href="/habits/new"
              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200"
            >
              Add your first habit
            </a>
          </div>
        )}
        <button
          onClick={handleLogOut}
          className="w-full py-3 mt-6 bg-slate-800 hover:bg-slate-700 text-slate-400 font-semibold rounded-xl transition-colors duration-200"
        >
          Log Out
        </button>
      </div>
    </div>
  )
}