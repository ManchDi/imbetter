import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { GoogleGenAI } from "@google/genai"


export async function POST(req: NextRequest) {

  // 1. Parse body
  const body = await req.json().catch(() => null)
  if (!body?.habit_id || body?.mood == null) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
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

  // 4. Build prompt
const today = new Date().toISOString().split("T")[0]
const checkins = pastCheckins ?? []

const streak = habit.streak_start_date
  ? Math.floor((new Date().getTime() - new Date(habit.streak_start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
  : null

const streakLabel = !streak
  ? "They haven't started their streak yet."
  : streak === 1
  ? "Today is Day 1 — they just committed to starting."
  : `Current streak: Day ${streak}.`

const moodLabels: Record<number, string> = {
  5: "Feeling strong",
  4: "Doing okay",
  3: "Struggling a bit",
  2: "Really hard today",
  1: "About to give in",
}

const recentHistory = checkins.length > 0
  ? checkins.map(c =>
      `- ${c.date}: mood ${c.mood}/5${c.note ? `, note: "${c.note}"` : ""}`
    ).join("\n")
  : "No previous check-ins."

const relapseInfo = lastRelapse
  ? `They had a relapse on ${lastRelapse.relapsed_at.split("T")[0]}${lastRelapse.trigger ? ` (trigger: ${lastRelapse.trigger})` : ""}.`
  : "No relapses logged."

const prompt = `
You are a concise, direct habit coach helping someone quit ${habit.name}.

Use the data below to respond specifically to their current state. Do not generalize.

Context:
- Reason: ${habit.reason ?? "not specified"}
- Starting motivation: ${habit.motivation ?? "not specified"}/5
- ${streakLabel}
- ${relapseInfo}

Recent check-ins:
${recentHistory}

Today (${today}):
- Mood: ${mood}/5 — "${moodLabels[mood] ?? "unknown"}"
${note ? `- Note: "${note}"` : "- No note."}

Instructions:
- Write exactly 2–3 sentences.
- Reference at least one specific detail (streak, relapse, mood, or note).
- If mood ≤ 2 or recent relapse → be grounding and stabilizing.
- If streak ≥ 5 days → acknowledge consistency and effort.
- If Day 1 → acknowledge difficulty of starting.
- Avoid clichés, therapy language, or generic encouragement.
- Do not say: "be proud", "give yourself credit", or similar phrasing.
- Keep tone calm, matter-of-fact, and human.

End with one short, natural question directly related to their situation (not generic).`.trim()

  // 5. Call Gemini
  let aiResponse: string | null = null
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
    const result = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: [{ parts: [{ text: prompt }] }],
    })
    aiResponse = result.text.trim()
  } catch (err) {
    console.error("Gemini error:", err)
    // aiResponse stays null — check-in still gets saved
  }

  // 6. Save check-in
  const { data: checkin, error: insertError } = await supabase
    .from("checkins")
    .insert([{ user_id: user.id, habit_id, date: today, mood, note: note ?? null, ai_response: aiResponse }])
    .select()
    .single()
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  // 7. Return the full check-in object
  return NextResponse.json(checkin)
}