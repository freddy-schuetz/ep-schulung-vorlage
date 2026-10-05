"use client";

import { useState } from "react";
import { postWebhook } from "@/lib/n8n";

type HelloResponse = { message?: string };

// Pfad des eigenen Webhooks mit Kürzel, zum Beispiel "anna-hello" (ohne /webhook/).
// In der E&P-n8n gehört jeder Pfad genau einem Workflow. Ohne Angabe ruft die Seite nichts auf.
const HELLO_PATH = (process.env.NEXT_PUBLIC_HELLO_PATH || "").trim();

// Beispielseite im E&P-Layout. Kopf und Fuß kommen aus app/layout.tsx,
// Farben und Bausteine (ep-karte, ep-feld, ep-knopf, ep-cta, ep-hinweis, ep-fehler) aus app/globals.css.
export default function Home() {
  const [name, setName] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAnswer(null);
    if (!HELLO_PATH) {
      setError(
        "NEXT_PUBLIC_HELLO_PATH fehlt. Beim ersten Veröffentlichen den eigenen Pfad mitgeben, zum Beispiel anna-hello.",
      );
      return;
    }
    setLoading(true);
    try {
      const res = await postWebhook<HelloResponse>(HELLO_PATH, { name });
      setAnswer(res.message ?? JSON.stringify(res));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="ep-ueberschrift text-3xl">Hallo aus n8n</h1>
        <p className="mt-4 text-ink-muted">
          Das Formular ruft einen n8n-Webhook deines eigenen Workflows auf (Vorlage <code>hello-webhook.json</code>,
          Pfad <code>/webhook/{HELLO_PATH || "anna-hello"}</code>).
        </p>
      </div>

      <form onSubmit={onSubmit} className="ep-karte flex flex-col gap-3">
        <label htmlFor="name" className="ep-label">
          Dein Name
        </label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Max"
          className="ep-feld"
          required
        />
        <button type="submit" disabled={loading} className="ep-knopf ep-cta self-start">
          {loading ? "Sende …" : "An n8n senden"}
        </button>
      </form>

      {answer && <div className="ep-hinweis">{answer}</div>}
      {error && (
        <div role="alert" className="ep-fehler">
          {error}
        </div>
      )}
    </div>
  );
}
