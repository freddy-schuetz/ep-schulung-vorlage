---
name: schulungs-dienste
description: Kurzanleitungen für die fertigen Zugänge der E&P-n8n in der Schulung. KI-Text mit Claude (Anthropic) oder OpenAI, OpenAI für Sprache zu Text, Text zu Sprache und Embeddings, Google-Suche über SerpAPI als Werkzeug am KI-Agenten, Mails über SMTP mit dem Node Send Email (Absender noreply@ep-reisen.de, nur an die eigene Adresse) und offene Daten ohne Zugang (Open-Meteo für Wetter und Schnee, OpenHolidays für Feiertage und Schulferien). Verwenden beim Planen und Bauen, sobald ein Workflow einen dieser Dienste braucht.
---

# Fertige Zugänge in der E&P-n8n

## Auf einen Blick

- Name, Typ und ID jedes Zugangs stehen in der Tabelle in `CLAUDE.md`. Du nimmst genau diese. Andere Credentials der E&P-n8n gehören zu echten Abläufen und sind tabu.
- Du legst kein Credential an und änderst keins. Schlüssel gehören nie in Parameter, Code, Repo oder Frontend.
- KI-Aufrufe und jede Google-Suche kosten E&P Geld. Immer zuerst mit einem Eintrag testen.
- Die KI formuliert. Zahlen, Summen und Vergleiche rechnet n8n.

## KI-Text

- Der Normalfall für alles mit KI: lesen, sortieren, zusammenfassen, Entwürfe schreiben. Standard ist Claude mit dem Credential „Anthropic account EP“.
- Der Modell-Node richtet sich nach dem Credential: „Anthropic account EP“ (`anthropicApi`) heißt `@n8n/n8n-nodes-langchain.lmChatAnthropic`, „OpenAi account EP“ (`openAiApi`) heißt `@n8n/n8n-nodes-langchain.lmChatOpenAi`. Er hängt über `ai_languageModel` an Agent, Basic LLM Chain oder Information Extractor.
- Feste Felder (Kategorie, Datum, Anzahl) holst du mit Information Extractor oder Output Parser. Freitext zerlegst du nicht selbst.
- Zum Testen kurze Texte nehmen. Lange Texte kosten mehr.

## OpenAI: Sprache und Embeddings

- **Sprache zu Text:** Node OpenAI (`@n8n/n8n-nodes-langchain.openAi`), Ressource Audio, Operation Transcribe, Modell `whisper-1`, Credential „OpenAi account EP“.
- **Text zu Sprache:** derselbe Node, Ressource Audio, Operation Generate, Modell `tts-1`.
- **Embeddings** für die Vektorsuche: `text-embedding-3-small` mit 1536 Zahlen. Nur mit dem P2-Baustein Supabase sinnvoll, siehe `docs/datenbank.md`.
- Ressourcen und Operationen vorher mit `get_node` prüfen, die Namen ändern sich zwischen Versionen.
- ⚠️ **Aufnahmen sind personenbezogen.** Zum Testen spricht die Person selbst. Andere Menschen nur mit ihrer Zustimmung. Nach dem Transkribieren bleibt nur der Text.

## Google-Suche über SerpAPI

- Für Treffer aus Google, etwa „Skiverleih in Saalbach“ oder die Angaben eines bekannten Hotels.
- Am einfachsten als Werkzeug am AI Agent: Node „SerpAPI“ (`@n8n/n8n-nodes-langchain.toolSerpApi`), Credential „SerpAPI account“, Verbindung über `ai_tool`. Der Agent entscheidet dann selbst, wann er sucht. Vorher mit `search_nodes` und `get_node` prüfen, wie der Node heißt und welche Felder er hat.
- Land und Sprache mitgeben (zum Beispiel `gl=at`, `hl=de`), sonst sucht er womöglich im falschen Land.
- ⚠️ **Jede Suche kostet Geld.** Zuerst eine einzige Suche testen. Keine Schleife über eine Tabelle ohne Obergrenze.
- Prüf das Ergebnis: Passen Name und Ort? Google-Treffer können veraltet sein.

## Mails über SMTP

- Node „Send Email“ (`n8n-nodes-base.emailSend`), Credential „SMTP account“:

  ```
  fromEmail    noreply@ep-reisen.de
  toEmail      <eigene Adresse der Person>
  subject      {{ $json.betreff }}
  emailFormat  text   (oder html)
  text         {{ $json.text }}
  ```

- Empfänger ist nur die eigene Adresse der Person. Frag sie danach. Nie an Kundinnen, Kunden oder Verteiler.
- Feldnamen vorher mit `get_node` prüfen, sie hängen von der Node-Version ab.
- Kommt die Mail nicht an: Spam-Ordner prüfen lassen, Absender prüfen, Ausführung ansehen.
- Ohne Versand geht es auch: Ergebnis in eine Data Table schreiben oder im Formular anzeigen.

## Offene Daten ohne Zugang

Node HTTP Request, Methode GET, keine Authentifizierung.

- **Ort zu Koordinaten:** `https://geocoding-api.open-meteo.com/v1/search?name=Livigno&count=1&language=de`
- **Wetter und Schnee:** `https://api.open-meteo.com/v1/forecast?latitude=46.54&longitude=10.14&daily=snowfall_sum,temperature_2m_max,temperature_2m_min&hourly=snow_depth&timezone=Europe%2FBerlin&forecast_days=3`
  - `snowfall_sum` kommt in Zentimetern je Tag, `snow_depth` in Metern je Stunde. Nenn die Einheiten im Text richtig.
  - Die freie Schnittstelle ist für nichtkommerzielle Nutzung gedacht. Für den Test heute passt das. Soll der Ablauf danach dauerhaft laufen, klärt Friedemann die Nutzung.
- **Feiertage:** `https://openholidaysapi.org/PublicHolidays?countryIsoCode=DE&languageIsoCode=DE&validFrom=2026-10-01&validTo=2026-12-31`
- **Schulferien:** `https://openholidaysapi.org/SchoolHolidays?countryIsoCode=DE&subdivisionCode=DE-BY&languageIsoCode=DE&validFrom=2026-10-01&validTo=2027-03-31`
  - Es gibt unter anderem DE, AT, CH, FR, IT und NL. Bundesländer und Kantone wählst du über `subdivisionCode`.
- Mehrere Orte: eine kleine Liste in einem Set-Node, dann je Ort ein Aufruf. Danach zählen: Kamen so viele Orte an wie erwartet?
