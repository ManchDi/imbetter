"use client"
import { useState } from "react"

export default function AIchat(){

  const { habit_id, mood, note } = body

  // 2. Verify session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // 3. Fetch context
  const { data: habit } = await supabase
    .from("habits")
    .select("name, motivation, reason, streak_start_date")
    .eq("user_id", user.id)
    .eq("id", habit_id)
    .single()
  if (!habit) return NextResponse.json({ error: "Habit not found" }, { status: 404 })

  const { data: pastCheckins } = await supabase
    .from("checkins")
    .select("date, mood, note")
    .eq("habit_id", habit_id)
    .eq("user_id", user.id)
    .order("date", { ascending: false })
    .limit(5)

  const { data: lastRelapse } = await supabase
    .from("relapses")
    .select("relapsed_at, trigger")
    .eq("habit_id", habit_id)
    .eq("user_id", user.id)
    .order("relapsed_at", { ascending: false })
    .limit(1)
    .maybeSingle()
}