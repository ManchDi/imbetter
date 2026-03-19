"use client"

interface Habit {
  id: string
  name: string
  quit_date: string | null
  motivation: number | null
  reason: string | null
}

export default function HabitClient({ habit }: { habit: Habit }) {
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
                    <p className="text-slate-400 mt-2 text-sm">Showing up - matters!</p>
                </div>
                <div className="bg-slate-800 rounded-2xl p-8 pl-4"> 
                    <div className="flex flex-col gap-1 mb-4">
                        Current Streak: {habit.quit_date 
                        ? `Day ${Math.floor((new Date().getTime() - new Date(habit.quit_date).getTime()) / (1000 * 60 * 60 * 24)) + 1}`
                        : "No streak yet!"}
                    </div>
                    <div className="flex flex-col mb-4">
                        Your Motivation: {habit.motivation 
                        ? habit.motivation
                        : "No motivation level specified"}
                    </div>
                    <div className="flex flex-col">
                        Quitting Reason: {habit.reason 
                        ? habit.reason
                        : "No reason specified"}
                    </div>
                </div>
            </div>
        </div>
    )
}