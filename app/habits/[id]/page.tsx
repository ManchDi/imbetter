import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import HabitClient from "@/components/Habits/HabitClient"

export default async function HabitPage({ params }: { params: { id: string } }) {
  const habitId = params.id
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: habit } = await supabase
    .from("habits")
    .select("id, name, quit_date, streak_start_date, motivation, reason")
    .eq("user_id", user.id)
    .eq("id", habitId)
    .single()

  if (!habit) redirect("/dashboard")

  const { data: checkins } = await supabase
    .from("checkins")
    .select("id, habit_id, user_id, date, mood, note, ai_response, created_at")
    .eq("habit_id", habitId)
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(20)

  const today = new Date().toISOString().split("T")[0]
  const checkedInToday = (checkins ?? []).some(c => c.date === today)

  return <HabitClient habit={habit} checkins={checkins ?? []} checkedInToday={checkedInToday} />
}