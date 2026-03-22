"use client"
import { Habit, CheckIn } from "@/types"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

const moods = [
  { label: "Feeling strong",    value: 5 },
  { label: "Doing okay",        value: 4 },
  { label: "Struggling a bit",  value: 3 },
  { label: "Really hard today", value: 2 },
  { label: "About to give in",  value: 1 },
]

interface Props {
  habit: Habit
  onSuccess: (checkin: CheckIn) => void
}

export default function CheckInForm({ habit, onSuccess }: Props) {
  const [step, setStep] = useState<1 | 2>(1)
  const [mood, setMood] = useState<number | null>(null)
  const [note, setNote] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const supabase = createClient()
  const router = useRouter()

  async function handleCheckIn() {
    setLoading(true)
    setError("")
    const today = new Date().toISOString().split("T")[0]
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }

    const { data, error } = await supabase
      .from("checkins")
      .insert([{ user_id: user.id, habit_id: habit.id, date: today, mood, note: note || null }])
      .select()
      .single()

    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      setAiResponse(data.ai_response ?? "")
      onSuccess(data as CheckIn)
      setStep(2)
    }
  }

  const moodLabel = moods.find(m => m.value === mood)?.label ?? ""
  const isValid = mood !== null

  if (step === 2) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-green-400 font-semibold text-sm">✓ Checked in today</span>
          <span className="text-slate-500 text-sm">—</span>
          <span className="text-slate-400 text-sm">Feeling: {mood}/5 · {moodLabel}</span>
        </div>

        {note && (
          <p className="text-slate-400 text-sm italic">&ldquo;{note}&rdquo;</p>
        )}

        {aiResponse && (
          <div className="bg-purple-900/30 border border-purple-700/40 rounded-xl p-4">
            <p className="text-slate-300 text-xs uppercase tracking-widest mb-2">Your coach says</p>
            <p className="text-white text-sm leading-relaxed">{aiResponse}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white tracking-tight">Today&apos;s Check-in</h2>
        <h3 className="text-slate-400 text-sm mt-1">How are you feeling today?</h3>
      </div>

      <div className="flex flex-col gap-2">
        {moods.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMood(m.value)}
            className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 text-left ${
              mood === m.value
                ? "bg-purple-600 border border-purple-500 text-white"
                : "bg-slate-800 border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white"
            }`}
          >
            {m.label}
          </button>
        ))}

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Anything on your mind? (optional)"
          className="mt-2 w-full bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 placeholder-slate-600 resize-none text-sm"
        />

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleCheckIn}
          type="button"
          disabled={!isValid || loading}
          className="w-full py-3 mt-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? "Checking in..." : "Check In"}
        </button>
      </div>
    </div>
  )
}
