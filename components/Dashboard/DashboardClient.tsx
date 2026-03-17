"use client"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface Habit {
  id: string
  name: string
  quit_date: string | null
  motivation: number | null
}

export default function DashboardClient({ habits }: { habits: Habit[] }) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogOut() {
    await supabase.auth.signOut()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">ImBetter</h1>
          <p className="text-slate-400 mt-2 text-sm">Welcome back</p>
          <button
            onClick={handleLogOut}
            className="w-full py-3 mt-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors duration-200"
          >
            Log Out
          </button>
        </div>

        {habits.length > 0 ? (
          <div className="flex flex-col gap-4">
            {habits.map((habit) => (
              <div key={habit.id} className="bg-slate-800 rounded-2xl p-6">
                <h2 className="text-white text-xl font-semibold">{habit.name}</h2>
                <p className="text-slate-400 text-sm mt-1">
                  {habit.quit_date
                    ? `Day ${Math.floor((new Date().getTime() - new Date(habit.quit_date).getTime()) / (1000 * 60 * 60 * 24))}`
                    : "Not started yet"}
                </p>
                {habit.motivation && (
                  <p className="text-slate-500 text-sm mt-1">Motivation: {habit.motivation}/5</p>
                )}
              </div>
            ))}
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
      </div>
    </div>
  )
}