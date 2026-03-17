"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"


export default function AuthCodeErrorPage() {
  const [email, setEmail] = useState("")
  const [step, setStep] = useState(1)
  const supabase = createClient()
  const [error, setError] = useState("")

  async function handleResubmit(e: React.FormEvent) {
    e.preventDefault()
    const {error} = await supabase.auth.resend({
                    type: 'signup',
                    email: email
                  })
    if(error) {
      setError(error.message)
    } else {
      setStep(2)
    }
  }

  const isValidEmail = email.trim().length > 0;
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center">
      {step === 1 ? (
           <form className="bg-slate-800 rounded-2xl p-8" onSubmit={handleResubmit}>
                 <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                      <h1 className="text-2xl font-bold text-white mb-2">Confirmation link expired</h1>
                      <p className="text-slate-400 mb-6">This link has already been used or has expired. </p>
                          <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="your email"
                            className="bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 focus:outline-none focus:border-purple-500 placeholder-slate-600"
                          />
                    </div>

                    {error && <p className="text-red-400 text-sm">{error}</p>}

                    <button
                      type="submit"
                      disabled={!isValidEmail}
                      className="w-full py-3 mt-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Resend Verification
                    </button>
                  </div>
            </form>
                    
        ) : (
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Email sent!</h1>
              <p className="text-slate-400">Check your inbox for a new confirmation link.</p>
            </div>
        )}
       
        <a href="/login" className="text-purple-400 hover:text-purple-300 mt-4">
          Back to login
        </a>
      </div>
    </div>
  )
}