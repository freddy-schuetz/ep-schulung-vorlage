# Frontend-Starter (Next.js 16 + React 19 + Tailwind 4)

Kleine, lauffähige Oberfläche für die Schulung. Sie ruft einen Webhook deines eigenen n8n-Workflows auf.

## Auf einen Blick

- **Was sie tut:** Ein Formular schickt einen Namen an deinen Webhook und zeigt die Antwort.
- **Wohin:** `https://n8n.ep-reisen.app/webhook/<dein-pfad>`, zum Beispiel `anna-hello`.
- **Aussehen:** E&P-Layout wie auf ep-reisen.de. Kopf mit Logo und Fuß kommen aus `app/layout.tsx`, Schrift, Farben und Bausteine (`ep-karte`, `ep-feld`, `ep-knopf` …) aus `app/globals.css`. Den Namen der Oberfläche setzt `lib/app.ts`.
- **Veröffentlichen:** Sag Claude „Veröffentliche meine Oberfläche“. Claude baut sie, pusht auf `main` und ruft den Hub auf. Du bekommst eine Adresse wie `https://app-xxxxxxxx.friedemannschuetz.de`.
- **Erster Aufbau:** etwa drei Minuten. Bis dahin zeigt die Seite einen Fehler wie „no available server“. Das ist normal.

## So hängt es zusammen

1. In n8n baut Claude den Workflow aus `../examples/workflows/hello-webhook.json`, mit deinem Kürzel im Pfad, zum Beispiel `anna-hello`.
2. Beim ersten Veröffentlichen gibt Claude `NEXT_PUBLIC_HELLO_PATH=anna-hello` als Variable mit. Ohne diesen Pfad ruft die Seite nichts auf.
3. `NEXT_PUBLIC_N8N_BASE` ist schon auf `https://n8n.ep-reisen.app` eingestellt.

Variablen gelten nur beim **ersten** Veröffentlichen. Später ändert sie nur Friedemann.

## Der KI-Chat bleibt aus

`/chat` und `app/api/chat/route.ts` zeigen, wie ein KI-Chat mit Streaming aussieht. Der Endpoint hat **keinen Login**. Mit einem echten Schlüssel könnte jede Person, die die Adresse kennt, auf dessen Kosten chatten. Deshalb ist er aus (`CHAT_ENABLED`) und bleibt in der Schulung aus. KI läuft in n8n.

## Struktur

```
app/page.tsx          Formular, ruft den Webhook auf
app/chat/page.tsx     KI-Chat (aus)
app/api/chat/route.ts Streaming-Endpoint (ohne Login, standardmäßig aus)
lib/n8n.ts            Webhook-Helfer mit Standardadresse der n8n
lib/ai/model.ts       Modell für den Chat
.env.local.example    Liste der Variablen (nur Platzhalter)
```

## Vor dem Veröffentlichen

`npm install` und `npm run build` müssen grün sein. Danach committen, auf `main` pushen und über den Hub veröffentlichen (`/deploy` mit `base_dir=/frontend-starter`). Den Ablauf kennt Claude aus `CLAUDE.md`.
