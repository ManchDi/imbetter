import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import DashboardClient from "@/components/Dashboard/DashboardClient"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: habits } = await supabase
    .from("habits")
    .select("*")
    .eq("user_id", user.id)

  return <DashboardClient habits={habits || []} />
}