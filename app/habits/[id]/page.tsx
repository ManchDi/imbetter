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
    .select("id, name, quit_date, motivation, reason")
    .eq("user_id", user.id).eq("id", habitId).single()
  if (!habit) redirect("/dashboard")

  return <HabitClient habit={habit || null} />
}