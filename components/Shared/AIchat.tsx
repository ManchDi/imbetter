"use client"
import { useState, useRef, useEffect } from "react"
import { Habit, CheckIn, Message } from "@/types"

interface Props {
  habit: Habit
  checkinContext?: {
    mood: number
    note: string | null
    aiResponse: string
    recentCheckins: CheckIn[]
  }
}

export default function AIchat({ habit, checkinContext }: Props) {
  const [messageContent, setMessageContent] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const todayKey = `chat-${habit.id}-${new Date().toISOString().split("T")[0]}`

  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    const saved = localStorage.getItem(todayKey)
    if (saved) setMessages(JSON.parse(saved))
  }, [todayKey])

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(todayKey, JSON.stringify(messages))
    }
  }, [messages, todayKey])

  // scroll on change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSendMessage() {
    if (!messageContent.trim() || loading) return

    setError("")
    setLoading(true)

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: messageContent },
    ]
    setMessages(updatedMessages)
    setMessageContent("")

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habit,
          messages: updatedMessages,
          checkinContext,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? "Something went wrong")
        return
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.response }])
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-3 border-t border-slate-800 pt-4 mt-2">
      <p className="text-slate-500 text-xs uppercase tracking-wider">Continue the conversation</p>

      <div className="flex flex-col gap-2 max-h-72 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {messages.map((message, i) => (
          <div
            key={i}
            className={`max-w-[80%] px-4 py-2 rounded-xl text-sm text-white ${
              message.role === "user"
                ? "self-end bg-purple-600"
                : "self-start bg-slate-700"
            }`}
          >
            {message.content}
          </div>
        ))}
        {loading && (
          <div className="self-start bg-slate-700 px-4 py-2 rounded-xl text-sm text-slate-400 italic">
            Thinking...
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="text-red-400 text-xs">{error}</p>}

      <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
        <input
          type="text"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type a message..."
          className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm"
        />
        <button
          onClick={handleSendMessage}
          disabled={!messageContent.trim() || loading}
          className="px-3 py-1 bg-purple-600 text-white rounded-lg hover:bg-purple-500 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  )
}