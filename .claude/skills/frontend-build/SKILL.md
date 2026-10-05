---
name: frontend-build
description: Standard-Stack, Anbindung an n8n-Webhooks und Veröffentlichen über den Hub der Schulung (hub.friedemannschuetz.de, Push auf main, dann /deploy und /status) für Next.js-Frontends. Verwenden beim Bauen oder Debuggen einer kleinen Oberfläche, bei Tailwind, bei der Anbindung an einen n8n-Webhook, beim optionalen KI-Chat und beim Veröffentlichen. Lauffähiges Beispiel in frontend-starter/.
---

# Frontend bauen und veröffentlichen

Verbindliche Konventionen für die kleine Oberfläche, die eine Person in der Schulung veröffentlichen kann. Für **neue** Apps siehe Skill `frontend-scaffold`. Lauffähiges Beispiel: **`frontend-starter/`**. Veröffentlicht wird erst, wenn der Workflow läuft.

## Standard-Stack (nicht abweichen ohne Grund)

| Bereich | Festlegung |
|---------|-----------|
| Framework | **Next.js 16** (App Router), `next@16.x` |
| UI | **React 19**, `react`/`react-dom@^19` |
| Sprache | **TypeScript 5.9** (neuestes 5.x, **kein** TS 6), `strict: true` |
| Styling | **Tailwind CSS 4** (CSS-first: `@import "tailwindcss"` in der globalen CSS, **kein** `tailwind.config.ts`; PostCSS-Plugin `@tailwindcss/postcss`) |
| Paketmanager | **npm** (kein pnpm, yarn oder bun) |
| Pfad-Alias | `@/*` → `./*` |

`tsconfig` Eckwerte: `noEmit`, `jsx: react-jsx` (setzt Next.js 16 selbst), `moduleResolution: bundler`, `module: esnext`, `skipLibCheck`, `paths: {"@/*": ["./*"]}`.

Ordnerkonvention: `app/` (Routes) · `components/` (UI) · `lib/` (`n8n.ts`, `types.ts`).

## E&P-Layout (Pflicht für jede Oberfläche)

Jede Oberfläche der Schulung sieht aus wie ep-reisen.de und das EP-Budget-Tool. Alles dafür liegt in `frontend-starter/`:

| Datei | Inhalt |
|---|---|
| `app/layout.tsx` | legt Kopf (`components/EpKopf.tsx`, E&P-Logo) und Fuß (`components/EpFuss.tsx`) um jede Seite. Seiten liefern nur ihren Inhalt, kein eigenes `<main>`. |
| `app/globals.css` | Farben, eckige Formen und die Bausteine `ep-…` |
| `app/fonts/` | Schrift Lato, im Projekt abgelegt, damit der Build ohne Internet klappt |
| `public/ep-logo.svg` | das E&P-Logo, nur auf hellem Grund |
| `lib/app.ts` | Name der Oberfläche im Kopf und im Browser-Tab, zum Beispiel `"Hotel-Steckbriefe"` |

**Bausteine:** `ep-ueberschrift` (Seitentitel mit Zierstrich), `ep-karte` (weiße Fläche für Formular oder Ergebnis), `ep-label`, `ep-feld` (Eingabe, Auswahl, Textfeld), `ep-knopf` (Knopf in Tiefblau), `ep-cta` (zusätzlich, nur für die eine Hauptaktion: Magenta-Verlauf), `ep-hinweis` (hellblauer Ergebniskasten), `ep-fehler`, `ep-tabelle`, `arrow-list`.
**Farben als Tailwind-Klassen:** `bg-ground` (Seitengrund), `bg-surface` (Weiß), `text-ink`, `text-ink-muted`, `text-accent` und `bg-accent` (Tiefblau), `border-hairline`, `text-fehler`.

```tsx
<h1 className="ep-ueberschrift text-3xl">Hotel-Steckbriefe</h1>
<form className="ep-karte mt-6 flex flex-col gap-3">
  <label htmlFor="hotel" className="ep-label">Hotel</label>
  <input id="hotel" className="ep-feld" />
  <button type="submit" className="ep-knopf ep-cta self-start">Angaben holen</button>
</form>
<div className="ep-hinweis mt-6">Ergebnis …</div>
```

- Keine anderen Farben, Schriften, Logos oder Verläufe, keine runden Ecken. Kopf, Fuß, `globals.css` und `app/fonts/` bleiben, wie sie sind.
- Eine neue Oberfläche entsteht als Kopie von `frontend-starter` (Skill `frontend-scaffold`), nie von Grund auf.
- Will die Person eine andere Optik, sagst du: „In der Schulung haben alle Oberflächen das E&P-Layout.“

## Anbindung: n8n ist das Backend

1. **Muster A: n8n-Webhook** (immer zuerst): Die Oberfläche ruft einen Webhook des eigenen Workflows auf. Auch KI läuft dort, in den KI-Nodes mit dem Credential aus `CLAUDE.md`.
2. **Muster C: KI-Streaming im Frontend**, nur wenn eine Chat-Oberfläche Token-Streaming braucht. In der Schulung nicht vorgesehen, weil es einen eigenen Schlüssel bräuchte.
3. Ein eigenes Backend (Muster B) gibt es in dieser Schulung nicht.

### Muster A: n8n-Webhook (Standard)
- Env: `NEXT_PUBLIC_N8N_BASE`, im Starter mit dem Standard `https://n8n.ep-reisen.app`.
- URL-Builder in `lib/n8n.ts`: `${NEXT_PUBLIC_N8N_BASE}/webhook/<pfad>`. Der Pfad trägt das Kürzel, zum Beispiel `anna-hello`.
- ⚠️ **Webhook-Daten liegen n8n-seitig unter `.body`** (siehe `CLAUDE.md`). Das berücksichtigt der Workflow, nicht das Frontend.
- ⚠️ Ein öffentlicher Webhook ist für alle erreichbar. Im Workflow Eingaben prüfen und schreibende Aktionen absichern (Skill `n8n-security-audit`).
- Die Oberfläche ruft nur Webhooks des **eigenen** Workflows auf, nie fremde Pfade der E&P-n8n.

### Muster C: KI-Streaming (nur zur Info)
- Pakete `ai@^6`, `@ai-sdk/anthropic@^3`, `@ai-sdk/react@^3`, Env `ANTHROPIC_API_KEY` (nie als `NEXT_PUBLIC_*`). Code im Starter unter `app/api/chat/route.ts`.
- ⚠️ **Offener KI-Proxy:** Der Route Handler hat **keinen Login**. Mit echtem Schlüssel könnte jede Person, die die Adresse kennt, auf dessen Kosten chatten. Deshalb ist der Chat aus (`CHAT_ENABLED`) und bleibt in der Schulung aus.

- ⚠️ **Keine Daten im Dateisystem der App.** Es ist flüchtig, eine lokale Datei ist nach dem nächsten Veröffentlichen weg. Daten gehören in n8n (Data Tables).

## Veröffentlichen über den Hub

Ergebnis ist eine öffentliche Adresse wie `https://app-xxxxxxxx.friedemannschuetz.de`. Der genaue Ablauf steht in `CLAUDE.md`, in Kürze:

1. `npm install` und `npm run build` im App-Ordner, der Build muss grün sein.
2. Committen, dann `git fetch origin main`, `git rebase origin/main`, `git push origin HEAD:main`. Nie Force. Gebaut wird immer `main`.
3. `curl -s -X POST https://hub.friedemannschuetz.de/deploy -d "token=<TOKEN>" -d "base_dir=/frontend-starter"` und beim **ersten** Aufruf `--data-urlencode "env@deploy.env"`, mit einer Datei `deploy.env` im Repo (je Zeile `KEY=VALUE`, nur `NEXT_PUBLIC_*`). Kein `$'…'` und kein `\n` im Befehl, sonst gibt die Sitzung ihn nicht frei. Den Token nimmst du aus der `url` in `.mcp.json` (Teil `/g/<token>/mcp`).
4. Ausgang: `curl -s -X POST https://hub.friedemannschuetz.de/status -d "token=<TOKEN>"`.
5. Antwort 409 (Deploy-Key fehlt) oder ein anderer Fehler: Die Person sagt Friedemann Bescheid.

- `base_dir` ist der Ordner mit der `package.json` der App. Die Wurzel des Repos geht nicht, die App liegt immer in einem Unterordner.
- ⚠️ **`env` gilt nur beim ersten Aufruf.** Danach ignoriert der Hub es. Also gleich beim ersten Mal alle Variablen mitgeben, die der Code nutzt.
- Spätere Änderungen: committen, auf `main` pushen, denselben `/deploy`-Aufruf wiederholen. Die Adresse bleibt gleich.
- Secrets nie ins Repo. Alles mit `NEXT_PUBLIC_` ist im Browser sichtbar.

## Drei Stolpersteine beim ersten Veröffentlichen

**1. Gebaut wird `main`.** Was nur auf dem Arbeits-Branch der Sitzung liegt, ist nicht dabei. Der Hub meldet trotzdem eine Adresse. Deshalb vor jedem `/deploy` auf `main` pushen.

**2. `NEXT_PUBLIC_*` wird zur Bauzeit eingesetzt.** Später nachtragen wirkt nicht. Symptom: Die Seite lädt, aber jeder Webhook-Aufruf scheitert. Im Starter fällt `NEXT_PUBLIC_N8N_BASE` deshalb auf `https://n8n.ep-reisen.app` zurück.

**3. Der erste Build dauert rund drei Minuten.** Vorher kommt keine Seite, sondern ein Fehler wie „no available server“. Nicht zu früh neu veröffentlichen. Bleibt es stumm, zeigt `/status` Ausgang und Fehlerzeilen.

## Webhook-Aufruf aus dem Browser

n8n sendet bei Webhooks CORS-Header und spiegelt den Origin. Der direkte `fetch` aus dem Frontend funktioniert also ohne Proxy.

⚠️ **Es wird jeder Origin gespiegelt.** Ein Webhook ohne Authentifizierung ist damit von jeder Website aus aufrufbar. Mit Testdaten in der Schulung ist das in Ordnung. Hängen echte Daten daran, gehört eine Header-Auth an den Webhook.

## Env-Var-Checkliste

- n8n-Webhook: `NEXT_PUBLIC_N8N_BASE` (Standard `https://n8n.ep-reisen.app`), im Starter dazu `NEXT_PUBLIC_HELLO_PATH` mit Kürzel, zum Beispiel `anna-hello`.
- KI-Chat (Muster C): `ANTHROPIC_API_KEY` und `CHAT_ENABLED`, in der Schulung aus.
- P2 Supabase: kein direkter Zugriff aus dem Frontend. Die Oberfläche ruft den eigenen n8n-Webhook auf.

## a11y-Mini-Checkliste

- Semantische Elemente (`<button>`, `<nav>`, `<main>`, `<label for>`) statt klickbarer `<div>`.
- Jedes Bedienelement per Tastatur erreichbar, sichtbarer `:focus`-Zustand.
- Bilder mit `alt`, Buttons nur mit Icon bekommen `aria-label`.
- Farbkontrast mindestens 4.5:1 für Text, Status nie nur über Farbe zeigen.
- Formularfehler als Text plus `aria-invalid` und `aria-describedby`.

## QA vor dem Veröffentlichen

- `npm run build` grün.
- E&P-Layout: Logo im Kopf, Name in `lib/app.ts`, nur Bausteine und Farben aus `globals.css`, keine runden Ecken.
- Nach dem Veröffentlichen: Normalfall und ein Fehlerfall im Browser durchklicken.
- Netzwerk-Tab: keine 4xx oder 5xx auf den Webhook-Aufrufen.
- Mobile Ansicht (375 px) prüfen: Das Layout bricht nicht.
- Keine `console.log`-Reste committen.
