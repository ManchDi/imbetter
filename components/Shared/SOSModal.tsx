"use client"
import { useState } from "react"
import { Habit } from "@/types"
import AIchat from "@/components/Shared/AIchat"

interface Props {
  habits: Habit[]
  initialHabit?: Habit
  onClose: () => void
}

export default function SOSModal({ habits, initialHabit, onClose }: Props) {
  const [selectedHabit, setSelectedHabit] = useState<Habit | null>(initialHabit ?? null)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 flex flex-col gap-4 max-h-[85vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">SOS</h2>
            <p className="text-slate-500 text-xs mt-0.5">Talk it through &mdash; you&apos;ve got this far</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Habit picker — only shown if no initialHabit */}
        {!selectedHabit ? (
          <div className="flex flex-col gap-2">
            <p className="text-slate-400 text-sm">Which habit are you struggling with?</p>
            {habits.map(habit => (
              <button
                key={habit.id}
                onClick={() => setSelectedHabit(habit)}
                className="w-full text-left px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-purple-500 text-white text-sm font-medium rounded-xl transition-all duration-200"
              >
                {habit.name}
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Show selected habit name if came from dashboard picker */}
            {!initialHabit && (
              <div className="flex items-center gap-2">
                <span className="text-slate-500 text-xs">Talking about:</span>
                <span className="text-white text-xs font-medium">{selectedHabit.name}</span>
                <button
                  onClick={() => setSelectedHabit(null)}
                  className="text-slate-600 hover:text-slate-400 text-xs transition-colors ml-auto"
                >
                  change
                </button>
              </div>
            )}
            <AIchat habit={selectedHabit} />
          </>
        )}
      </div>
    </div>
  )
}