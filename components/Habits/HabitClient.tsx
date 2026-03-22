"use client"
import { useState } from "react"
import { Habit, CheckIn } from "@/types"
import CheckInForm from "@/components/Habits/CheckInForm"

const moods: Record<number, { label: string; color: string }> = {
  5: { label: "Feeling strong",    color: "text-green-400"  },
  4: { label: "Doing okay",        color: "text-blue-400"   },
  3: { label: "Struggling a bit",  color: "text-yellow-400" },
  2: { label: "Really hard today", color: "text-orange-400" },
  1: { label: "About to give in",  color: "text-red-400"    },
}

function calcStreak(streakStartDate: string | null): number | null {
  if (!streakStartDate) return null
  const start = new Date(streakStartDate)
  const today = new Date()
  return Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric"
  })
}

function formatStartDate(dateStr: string | null): string {
  if (!dateStr) return ""
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric"
  })
}

interface Props {
  habit: Habit
  checkins: CheckIn[]
  checkedInToday: boolean
}

export default function HabitClient({ habit, checkins: initialCheckins, checkedInToday: initialCheckedInToday }: Props) {
  const [checkins, setCheckins] = useState<CheckIn[]>(initialCheckins)
  const [checkedInToday, setCheckedInToday] = useState(initialCheckedInToday)

  const streak = calcStreak(habit.streak_start_date)
  const totalDays = habit.quit_date
    ? Math.floor((new Date().getTime() - new Date(habit.quit_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : null

  function handleCheckInSuccess(newCheckin: CheckIn) {
    setCheckins(prev => [newCheckin, ...prev])
    setCheckedInToday(true)
  }

  return (
    <div className="min-h-screen bg-grid bg-gray-950 p-4 pb-16">
      <div className="w-full max-w-lg mx-auto pt-10">

        <a
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors mb-8"
        >
          ← Back
        </a>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white tracking-tight">Quitting {habit.name}</h1>
          {habit.streak_start_date && (
            <p className="text-slate-500 text-sm mt-1">
              Started {formatStartDate(habit.quit_date)} · Day {totalDays} of your journey
            </p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-1">
            <span className="text-slate-500 text-xs uppercase tracking-wider">Streak</span>
            <span className={`text-xl font-bold ${streak ? "text-purple-300" : "text-slate-600"}`}>
              {streak ? `${streak}d` : "—"}
            </span>
            {streak && <span className="text-slate-600 text-xs">🔥 active</span>}
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-1">
            <span className="text-slate-500 text-xs uppercase tracking-wider">Check-ins</span>
            <span className="text-xl font-bold text-white">{checkins.length}</span>
            <span className="text-slate-600 text-xs">total logged</span>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col gap-1">
            <span className="text-slate-500 text-xs uppercase tracking-wider">Motivation</span>
            <span className="text-xl font-bold text-white">
              {habit.motivation ? `${habit.motivation}/5` : "—"}
            </span>
            <span className="text-slate-600 text-xs">at start</span>
          </div>
        </div>

        {habit.reason && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 mb-4">
            <p className="text-slate-500 text-xs uppercase tracking-wider mb-2">Your reason</p>
            <p className="text-white text-sm leading-relaxed">&ldquo;{habit.reason}&rdquo;</p>
          </div>
        )}

        {!habit.streak_start_date ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center mb-4">
            <p className="text-slate-500 text-sm">Start your streak from the dashboard first.</p>
          </div>
        ) : checkedInToday ? (
          <div className="bg-slate-900 border border-green-900/40 rounded-2xl p-5 mb-4 flex items-center gap-3">
            <span className="text-green-400 text-lg">✓</span>
            <div>
              <p className="text-green-400 font-semibold text-sm">Checked in today</p>
              {checkins[0] && (
                <p className="text-slate-500 text-xs mt-0.5">
                  {moods[checkins[0].mood]?.label} · {checkins[0].mood}/5
                </p>
              )}
            </div>
          </div>
        ) : (
          <CheckInForm habit={habit} onSuccess={handleCheckInSuccess} />
        )}

        {checkins.length > 0 && (
          <div className="flex flex-col gap-2">
            <h2 className="text-slate-500 text-xs uppercase tracking-wider px-1 mb-1">Check-in History</h2>
            {checkins.map((c) => (
              <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-500 text-xs font-medium">{formatDate(c.date)}</span>
                  <span className={`text-xs font-semibold ${moods[c.mood]?.color ?? "text-slate-400"}`}>
                    {moods[c.mood]?.label ?? `Mood ${c.mood}`} · {c.mood}/5
                  </span>
                </div>
                {c.note && (
                  <p className="text-slate-400 text-sm mb-2 italic">&ldquo;{c.note}&rdquo;</p>
                )}
                {c.ai_response && (
                  <div className="border-t border-slate-800 pt-2 mt-1">
                    <p className="text-slate-600 text-xs uppercase tracking-wider mb-1">Coach</p>
                    <p className="text-purple-300 text-xs leading-relaxed">{c.ai_response}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {checkins.length === 0 && habit.streak_start_date && (
          <div className="text-center py-8">
            <p className="text-slate-600 text-sm">No check-ins yet — your history will appear here.</p>
          </div>
        )}

      </div>
    </div>
  )
}
