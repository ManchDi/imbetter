"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type DateOption = "not_ready" | "today" | "already_started"

export default function AddHabitPage() {
  const [habitName, setHabitName] = useState("")
  const [error, setError] = useState("")
  const [step, setStep] = useState(1)
  const [motivation, setMotivation] = useState(0)
  const [habitId, setHabitId] = useState("")
  const [dateOption, setDateOption] = useState<DateOption>("not_ready")
  const [customDate, setCustomDate] = useState("")
  const supabase = createClient()
  const router = useRouter()

  function getQuitDate(): string | null {
    if (dateOption === "today") return new Date().toISOString().split("T")[0]
    if (dateOption === "already_started") return customDate || null
    return null
  }

  async function handleNewHabit(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }

    const quit_date = getQuitDate()

    const { data, error } = await supabase
      .from("habits")
      .insert([{ user_id: user.id, name: habitName, quit_date, streak_start_date: quit_date }])
      .select()

    if (error) {
      setError(error.message)
    } else {
      setHabitId(data[0].id)
      setStep(2)
    }
  }

  async function handleMotivation(e: React.FormEvent) {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push("/login"); return }

    const { error } = await supabase
      .from("habits")
      .update({ motivation })
      .eq("id", habitId)
      .eq("user_id", user.id)

    if (error) {
      setError(error.message)
    } else {
      router.push("/dashboard")
    }
  }

  const isValidHabit =
    habitName.trim().length > 0 &&
    (dateOption !== "already_started" || customDate.length > 0)

  const isValidMotivation = motivation > 0 && motivation < 6

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Add a Habit</h1>
          <p className="text-slate-400 mt-2 text-sm">
            A journey of a million steps starts with the 1st
          </p>
        </div>

        {step === 1 ? (
          <form className="bg-slate-800 rounded-2xl p-8" onSubmit={handleNewHabit}>
            <div className="flex flex-col gap-4">

              <div className="flex flex-col gap-1">
                <label className="text-slate-400 text-sm">Habit</label>
                <input
                  type="text"
                  value={habitName}
                  onChange={(e) => setHabitName(e.target.value)}
                  placeholder="ie. Vaping"
                  className="bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 placeholder-slate-600"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-slate-400 text-sm">When did you start?</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["not_ready", "today", "already_started"] as DateOption[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setDateOption(option)}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold transition-colors duration-200 ${
                        dateOption === option
                          ? "bg-purple-600 text-white"
                          : "bg-slate-900 text-slate-400 hover:bg-slate-700"
                      }`}
                    >
                      {option === "not_ready" && "Not ready yet"}
                      {option === "today" && "Starting today"}
                      {option === "already_started" && "Already started"}
                    </button>
                  ))}
                </div>

                {dateOption === "already_started" && (
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    max={new Date().toISOString().split("T")[0]}
                    className="bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 mt-1"
                  />
                )}
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={!isValidHabit}
                className="w-full py-3 mt-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Add Habit
              </button>

              <p className="text-slate-500 text-sm text-center">
                Changed your mind?{" "}
                <a href="/dashboard" className="text-purple-400 hover:text-purple-300">
                  Back to dashboard
                </a>
              </p>
            </div>
          </form>
        ) : (
          <form className="bg-slate-800 rounded-2xl p-8" onSubmit={handleMotivation}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-white text-lg font-semibold">One more thing</h2>
                <p className="text-slate-400 text-sm">How motivated are you feeling? (1-5)</p>
                <input
                  type="number"
                  value={motivation}
                  onChange={(e) => setMotivation(Number(e.target.value))}
                  min={1}
                  max={5}
                  placeholder="1-5"
                  className="bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 placeholder-slate-600"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                type="submit"
                disabled={!isValidMotivation}
                className="w-full py-3 mt-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Confirm
              </button>

              <p className="text-slate-500 text-sm text-center">
                Want to add it later?{" "}
                <a href="/dashboard" className="text-purple-400 hover:text-purple-300">
                  Back to dashboard
                </a>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}