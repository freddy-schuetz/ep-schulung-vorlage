import { streamText, convertToModelMessages, type UIMessage } from "ai";
import { getModel } from "@/lib/ai/model";

// Streaming-Chat-Endpoint (Muster C). Wird von useChat (Default /api/chat) aufgerufen.
//
// ACHTUNG: Dieser Endpoint hat KEINEN Login. Wer die Adresse der App kennt, kann hier
// auf Kosten des hinterlegten ANTHROPIC_API_KEY chatten (offener KI-Proxy).
// Deshalb ist er standardmäßig AUS und läuft nur mit CHAT_ENABLED=true.
// Nie mit echtem Key öffentlich veröffentlichen, solange die App keinen Schutz hat
// (Login, Zugangscode). Die Grenzen unten dämpfen Missbrauch nur, sie verhindern ihn nicht.

const MAX_MESSAGES = 40;
const MAX_REQUEST_CHARS = 60000;
const MAX_OUTPUT_TOKENS = 1024;

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  if (process.env.CHAT_ENABLED !== "true") {
    return new Response(
      "KI-Chat ist deaktiviert. Zum Einschalten CHAT_ENABLED=true setzen (nur mit Schutz öffentlich betreiben).",
      { status: 403 },
    );
  }

  const raw = await req.text();
  if (raw.length > MAX_REQUEST_CHARS) {
    return new Response("Anfrage zu groß.", { status: 413 });
  }

  const body = parseJson(raw) as { messages?: unknown } | null;
  const messages = body?.messages;
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response("Ungültige Anfrage.", { status: 400 });
  }
  if (messages.length > MAX_MESSAGES) {
    return new Response("Der Chat ist zu lang. Bitte die Seite neu laden.", { status: 413 });
  }

  const result = streamText({
    model: getModel(),
    messages: await convertToModelMessages(messages as UIMessage[]),
    maxOutputTokens: MAX_OUTPUT_TOKENS,
  });
  return result.toUIMessageStreamResponse();
}
