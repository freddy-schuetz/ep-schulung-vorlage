// Muster A: n8n-Webhook aus dem Frontend aufrufen.
// Die Basis-Adresse wird beim Bauen eingesetzt (NEXT_PUBLIC_*). Ohne Angabe gilt die E&P-n8n.

const BASE = (process.env.NEXT_PUBLIC_N8N_BASE || "https://n8n.ep-reisen.app").replace(/\/+$/, "");

export function webhookUrl(path: string): string {
  const clean = path.replace(/^\/+/, "");
  return `${BASE}/webhook/${clean}`;
}

export async function postWebhook<T = unknown>(
  path: string,
  body: unknown,
): Promise<T> {
  const res = await fetch(webhookUrl(path), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Webhook-Fehler ${res.status}: ${await res.text()}`);
  }
  // n8n kann JSON oder Text zurückgeben:
  const text = await res.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as T;
  }
}
