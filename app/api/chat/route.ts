import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { GoogleGenAI } from "@google/genai"

export async function POST(req: NextRequest) {
  // Parse + validate body
  const body = await req.json().catch(() => null)
  if (!body?.habit || !body?.messages) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  // Verify session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { habit, messages, checkinContext } = body

  // Fetch context if SOS (check-in flow already has everything)
  let recentCheckins: { date: string; mood: number; note: string | null }[] = []
  let lastRelapse: { relapsed_at: string; trigger: string | null } | null = null

  if (!checkinContext) {
    const { data: checkins } = await supabase
      .from("checkins")
      .select("date, mood, note")
      .eq("habit_id", habit.id)
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(5)

    const { data: relapse } = await supabase
      .from("relapses")
      .select("relapsed_at, trigger")
      .eq("habit_id", habit.id)
      .eq("user_id", user.id)
      .order("relapsed_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    recentCheckins = checkins ?? []
    lastRelapse = relapse ?? null
  } else {
    recentCheckins = checkinContext.recentCheckins ?? []
    lastRelapse = null
  }

  // 4. Build shared context labels
  const streak = habit.streak_start_date
    ? Math.floor((new Date().getTime() - new Date(habit.streak_start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : null

  const streakLabel = !streak
    ? "They haven't started their streak yet."
    : streak === 1
    ? "Today is Day 1 — they just committed to starting."
    : `Current streak: Day ${streak}.`

  const recentHistory = recentCheckins.length > 0
    ? recentCheckins.map(c =>
        `- ${c.date}: mood ${c.mood}/5${c.note ? `, note: "${c.note}"` : ""}`
      ).join("\n")
    : "No previous check-ins."

  const relapseInfo = lastRelapse
    ? `They had a relapse on ${lastRelapse.relapsed_at.split("T")[0]}${lastRelapse.trigger ? ` (trigger: ${lastRelapse.trigger})` : ""}.`
    : "No relapses logged."

  const conversationHistory = messages
    .map((m: { role: string; content: string }) => `${m.role === "user" ? "User" : "Coach"}: ${m.content}`)
    .join("\n")

  // 5. Build prompt — branching on SOS vs check-in follow-up
  const moodLabels: Record<number, string> = {
    5: "Feeling strong",
    4: "Doing okay",
    3: "Struggling a bit",
    2: "Really hard today",
    1: "About to give in",
  }

  const systemContext = `
You are a concise, direct habit coach helping someone quit ${habit.name}.
Use the data below to respond specifically to their current state. Do not generalize.

Context:
- Reason: ${habit.reason ?? "not specified"}
- Starting motivation: ${habit.motivation ?? "not specified"}/5
- ${streakLabel}
- ${relapseInfo}

Recent check-ins:
${recentHistory}
`.trim()

  const checkinBlock = checkinContext ? `
Today's check-in:
- Mood: ${checkinContext.mood}/5 — "${moodLabels[checkinContext.mood] ?? "unknown"}"
${checkinContext.note ? `- Note: "${checkinContext.note}"` : "- No note."}

Initial coach response: "${checkinContext.aiResponse}"
`.trim() : ""

  const instructions = checkinContext ? `
This is a follow-up conversation after a check-in. The user wants to continue the dialogue.
Respond naturally to what they say. Be concise — 2-3 sentences unless they ask something that needs more.
Stay grounded, specific, and human. No therapy language or generic encouragement.
`.trim() : `
The user has triggered an SOS — they are struggling right now and need immediate support.
Be grounding and direct. Acknowledge the difficulty without dramatizing it.
Respond to exactly what they say. 2-3 sentences max.
No clichés. No "you've got this". Stay calm and human.
`.trim()

  const prompt = `
${systemContext}

${checkinBlock}

${instructions}

Conversation so far:
${conversationHistory}
`.trim()

  // 6. Call Gemini
  let response: string | null = null
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
    const result = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: [{ parts: [{ text: prompt }] }],
    })
    response = result.text?.trim() ?? null
  } catch (err) {
    console.error("Gemini error:", err)
    return NextResponse.json({ error: "AI unavailable" }, { status: 502 })
  }

  // 7. Return the assistant reply
  return NextResponse.json({ response })
}