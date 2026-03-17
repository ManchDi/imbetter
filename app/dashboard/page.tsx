
"use client" 
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"


export default function DashboardPage() {
    const router = useRouter()
    const supabase = createClient()

    async function handleLogOut(){
        const { error } = await supabase.auth.signOut()
        router.push("/login")
    }
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                 <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white">ImBetter</h1>
                    <p className="text-slate-400 mt-2 text-sm">Welcome back</p>
                    <button
                        onClick={handleLogOut}
                        className="w-full py-3 mt-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    > Log Out
                    </button>
                </div>

            </div>
        </div>

    )
}