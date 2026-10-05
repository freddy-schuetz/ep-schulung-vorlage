"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";

// Muster C: KI-Chat mit Token-Streaming. Ruft POST /api/chat auf.
// Achtung: /api/chat hat keinen Login und ist nur mit CHAT_ENABLED=true aktiv (siehe route.ts).
// In der Schulung bleibt der Chat aus. KI läuft über einen n8n-Workflow.
export default function ChatPage() {
  const { messages, sendMessage, status, error } = useChat();
  const [input, setInput] = useState("");
  const busy = status === "submitted" || status === "streaming";

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || busy) return;
    sendMessage({ text: input });
    setInput("");
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="ep-ueberschrift text-3xl">KI-Chat (Muster C)</h1>
      <p className="text-sm text-ink-muted">
        Streamt Antworten von Claude. Braucht <code>ANTHROPIC_API_KEY</code> und <code>CHAT_ENABLED=true</code>. Ohne
        Login nie mit echtem Key öffentlich veröffentlichen.
      </p>

      <div className="flex flex-col gap-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === "user"
                ? "self-end bg-accent px-3 py-2 text-on-accent"
                : "self-start border border-hairline bg-surface px-3 py-2"
            }
          >
            {message.parts.map((part, i) => (part.type === "text" ? <span key={i}>{part.text}</span> : null))}
          </div>
        ))}
      </div>

      {error && <div className="ep-fehler">{error.message}</div>}

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Frag mich etwas …"
          className="ep-feld flex-1"
        />
        <button type="submit" disabled={busy} className="ep-knopf">
          Senden
        </button>
      </form>
    </div>
  );
}
