"use client";

import { useState, type FormEvent } from "react";
import { api } from "@/lib/api";

const SUGGESTIONS = [
  "What happened while I was sleeping?",
  "Which accounts had alerts today?",
  "Show my latest security event",
  "Any unresolved high-risk events?",
];

interface Message {
  from: "me" | "bot";
  text: string;
}

export default function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  async function send(text: string) {
    if (!text.trim()) return;
    setInput("");
    setMessages((m) => [...m, { from: "me", text }]);
    try {
      const { reply } = await api<{ reply: string }>("/chat", { method: "POST", json: { message: text } });
      setMessages((m) => [...m, { from: "bot", text: reply }]);
    } catch (e) {
      setMessages((m) => [...m, { from: "bot", text: (e as Error).message }]);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-40 rounded-full bg-sky-600 px-5 py-3 text-sm font-medium shadow-lg hover:bg-sky-500"
      >
        {open ? "Close" : "Security Assistant"}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-40 flex h-[28rem] w-80 flex-col rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
          <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
            {messages.length === 0 &&
              SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="block w-full rounded-lg border border-slate-700 p-2 text-left hover:bg-slate-800">
                  {s}
                </button>
              ))}
            {messages.map((m, i) => (
              <p key={i} className={`whitespace-pre-line rounded-lg p-2 ${m.from === "me" ? "ml-8 bg-sky-600/30" : "mr-8 bg-slate-800"}`}>
                {m.text}
              </p>
            ))}
          </div>
          <form onSubmit={onSubmit} className="flex gap-2 border-t border-slate-800 p-3">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about your security…" className="input" />
            <button className="btn-primary">Send</button>
          </form>
        </div>
      )}
    </>
  );
}
