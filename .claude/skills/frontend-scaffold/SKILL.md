---
name: frontend-scaffold
description: Rezept zum Anlegen einer NEUEN kleinen Oberfläche in der Schulung (Next.js 16 + React 19 + TS + Tailwind 4), meist als Kopie von frontend-starter/. Verwenden wenn eine neue Web-Oberfläche angelegt werden soll oder zu entscheiden ist, ob n8n-Webhook, KI-Streaming oder eine rein statische Seite passt.
---

# Neues Frontend anlegen

Damit neue Frontends nicht vom etablierten Stack abweichen. Laufende Konventionen und Veröffentlichen: Skill `frontend-build`.

## Zuerst: vom Beispiel ausgehen statt from-scratch

In der Schulung entsteht jede neue Oberfläche als Kopie von **`frontend-starter/`**. Nur so hat sie das E&P-Layout (Logo, Lato, Farben, Bausteine `ep-…`, siehe Skill `frontend-build`). `npx create-next-app` nimmst du nicht.

Nach dem Kopieren: `node_modules/` und `.next/` entfernen, `name` in der `package.json` anpassen und den Namen der Oberfläche in `lib/app.ts` setzen. Kopf, Fuß, `app/globals.css`, `app/fonts/` und `public/ep-logo.svg` bleiben unverändert. Die neue App bleibt als eigener Ordner **im selben Repository**; beim Veröffentlichen ist dieser Ordner das `base_dir`.

## Entscheidungsbaum

1. **Wo lebt die Logik?** (**n8n ist Default #1!**)
   - n8n-Workflows → Muster A (nur Frontend, `NEXT_PUBLIC_N8N_BASE`).
   - Eigene Rechen-, Datenbank- oder Geo-Logik außerhalb von n8n (Muster B) gibt es in dieser Schulung nicht.
   - **Chat-UI mit Token-Streaming** (n8n streamt keine Tokens) → Muster C (Next-nativer AI-SDK-Route-Handler, Anthropic; Code im Skill `frontend-build`).
   - Rein statisch → Next.js ohne `/api`-Proxy.
   - ⚠️ Muster C mit echtem Key ist ein **offener KI-Proxy**, solange die App keinen Login hat: nur mit Schutz öffentlich betreiben (Details im Skill `frontend-build`).
2. **Karte nötig?** → `maplibre-gl` ergänzen, Map-Komponente **dynamisch** importieren (`next/dynamic`, `ssr: false`).
3. **Sprache in Echtzeit?** In der Schulung nicht vorgesehen. Sprachaufnahmen verarbeitet n8n (Skill `schulungs-dienste`, OpenAI).

## Starter-Artefakte (exakte Versionen)

`package.json` (Muster A, minimal, aktuelle Baseline):
```json
{
  "name": "<projekt>-frontend",
  "version": "0.1.0",
  "private": true,
  "scripts": { "dev": "next dev", "build": "next build", "start": "next start" },
  "dependencies": { "next": "^16.2.0", "react": "^19.2.0", "react-dom": "^19.2.0" },
  "devDependencies": {
    "@types/node": "^22.0.0", "@types/react": "^19.2.0", "@types/react-dom": "^19.2.0",
    "@tailwindcss/postcss": "^4.3.0", "tailwindcss": "^4.3.0", "typescript": "^5.9.0"
  }
}
```
> Kein `lint`-Script mit `next lint`: Das Kommando gibt es in Next.js 16 nicht mehr. Wer Linting braucht, richtet ESLint separat ein (`"lint": "eslint ."` plus eslint-devDependencies) und aktualisiert danach die `package-lock.json` mit `npm install`.
> Tailwind 4 braucht **kein** `autoprefixer`/`postcss` mehr (das Plugin `@tailwindcss/postcss` bündelt Lightning CSS). Exakte Patch-Versionen vor dem Festschreiben mit `npm view <pkg> version` prüfen.
- Map-App: zusätzlich `"maplibre-gl": "^4.7.1"` unter dependencies.
- AI-Streaming (Muster C): zusätzlich `"ai": "^6.0.0"`, `"@ai-sdk/anthropic": "^3.0.0"`, `"@ai-sdk/react": "^3.0.0"` unter dependencies (Code-Snippets im Skill `frontend-build`).
- Prosa/Markdown-lastig: `"@tailwindcss/typography": "^0.5.15"` unter devDependencies, in TW4 via `@plugin "@tailwindcss/typography";` in der globalen CSS aktivieren.

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "esnext"], "allowJs": true, "skipLibCheck": true,
    "strict": true, "noEmit": true, "esModuleInterop": true, "module": "esnext",
    "moduleResolution": "bundler", "resolveJsonModule": true, "isolatedModules": true,
    "jsx": "react-jsx", "incremental": true, "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`next.config.mjs`: Für Muster A genügt eine leere Datei (`export default {};`).

**Tailwind 4 (CSS-first, kein `tailwind.config.ts` mehr):**

`postcss.config.mjs`:
```js
export default { plugins: { "@tailwindcss/postcss": {} } };
```

`app/globals.css` übernimmst du unverändert aus `frontend-starter`. Sie beginnt mit `@import "tailwindcss";` und legt E&P-Farben, eckige Formen und die Bausteine `ep-…` fest. Eigene Farben kommen nicht dazu.
- Liegen Quellen außerhalb der Standardpfade: `@source "../pfad";` in der CSS ergänzen.
- `@import "tailwindcss";` ersetzt die alten `@tailwind base/components/utilities;`-Direktiven (TW3).

## Ordnergerüst
```
app/            # page.tsx, layout.tsx (E&P-Kopf und -Fuß), globals.css (E&P-Layout), fonts/ (Lato) (+ ggf. /api Routes)
components/      # EpKopf.tsx, EpFuss.tsx und eigene UI
lib/            # app.ts (Name der Oberfläche), n8n.ts | api.ts, types.ts (+ ai/model.ts bei Muster C)
public/         # ep-logo.svg, favicon.svg
postcss.config.mjs  next.config(.mjs|.ts)  tsconfig.json  .env.local.example
```

## Vor dem ersten Veröffentlichen
- `.env.local.example` mit allen benötigten Variablen, nur Platzhalter (siehe Env-Checkliste in `frontend-build`).
- `npm install && npm run build` muss grün sein.
- Veröffentlicht wird über den Hub der Schulung (kein anderer Hosting-Dienst): vorher auf `main` pushen, `base_dir` = Ordner der App (zum Beispiel `/frontend-starter`), alle Env-Variablen beim ersten `/deploy` mitgeben. Ablauf: Skill `frontend-build` und `CLAUDE.md`.
