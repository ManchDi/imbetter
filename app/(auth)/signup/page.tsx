"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm_password, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.auth.signUp({ email, password })
    
    if (error) {
      setError(error.message)
    } else {
      router.push("/dashboard")
    }
  }
  const isValidEmail = email.trim().length > 0;
  const isValidPass = (password.trim() == confirm_password.trim()) && password.trim().length>0;
  return (
    <div className="min-h-screen bg-grid bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-purple-600 mb-4 glow-purple">
            <span className="text-xl">↑</span>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">ImBetter</h1>
          <p className="text-slate-400 mt-2 text-sm">Become a better you</p>
        </div>

        <form className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 placeholder-slate-600 transition-all duration-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 placeholder-slate-600 transition-all duration-200"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-400 text-xs font-medium uppercase tracking-wider">Confirm Password</label>
              <input
                type="password"
                value={confirm_password}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-slate-800 text-white px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 placeholder-slate-600 transition-all duration-200"
              />
            </div>

            {password && confirm_password && password !== confirm_password && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">Passwords don&apos;t match</p>
              </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!isValidEmail || !isValidPass}
              className="w-full py-3 mt-1 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed glow-purple"
            >
              Create account
            </button>

            <p className="text-slate-500 text-sm text-center">
              Already have an account?{" "}
              <a href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Sign in</a>
            </p>
          </div>
        </form>

      </div>
    </div>
  )
}