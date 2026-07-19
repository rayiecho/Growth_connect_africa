"use client";

import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; content: string };

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm the LaunchPadX assistant. Ask me about the application process, deadlines, or how each stage works." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    const newMessages: Message[] = [...messages, { role: "user", content: text }];
    setMessages(newMessages);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/public/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          sessionId,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        setMessages((prev) => [...prev, { role: "assistant", content: `Server error (status ${res.status}). Please try again.` }]);
        setSending(false);
        return;
      }

      if (!res.ok) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.error || "Something went wrong. Please try again." }]);
        setSending(false);
        return;
      }

      setSessionId(data.sessionId);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Network error. Please try again." }]);
    }
    setSending(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-brand-green hover:bg-brand-green-dark text-white shadow-lg flex items-center justify-center transition-colors"
        aria-label="Chat with us"
      >
        {open ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.03 2 11c0 2.62 1.28 4.97 3.31 6.62L4.5 22l4.5-1.5c.94.32 1.95.5 3 .5 5.52 0 10-4.03 10-9S17.52 2 12 2z" />
          </svg>
        )}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-40 w-80 sm:w-96 h-[28rem] bg-white rounded-2xl shadow-2xl border border-brand-line flex flex-col overflow-hidden">
          <div className="bg-brand-green text-white px-4 py-3">
            <p className="font-semibold text-sm">LaunchPadX Assistant</p>
            <p className="text-xs text-white/80">Ask me anything about the program</p>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                    m.role === "user" ? "bg-brand-green text-white" : "bg-gray-100 text-brand-charcoal"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-brand-slate rounded-xl px-3 py-2 text-sm">Typing...</div>
              </div>
            )}
          </div>

          <form onSubmit={handleSend} className="border-t border-brand-line p-3 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-lg border border-brand-line px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-brand-green hover:bg-brand-green-dark text-white rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-50 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
