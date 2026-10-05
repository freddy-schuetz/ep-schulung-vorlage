---
name: schulungs-dienste
description: Kurzanleitungen für die fertigen Zugänge der E&P-n8n in der Schulung. KI-Text mit Claude (Anthropic) oder OpenAI, OpenAI für Sprache zu Text, Text zu Sprache und Embeddings, DataForSEO (Google-Angaben bekannter Betriebe, Basic Auth, location_name je Land), Apify (Websites ohne Schnittstelle und Betriebe nach Art und Ort, maxTotalChargeUsd, Test mit 1 bis 3 Ergebnissen), Google-Suche über SerpAPI als Werkzeug am KI-Agenten, Mails über SMTP mit dem Node Send Email (Credential SMTP Freddy Posteo, Absender KI-Schulung <f.schuetz@posteo.de>, nur an die eigene Adresse) und offene Daten ohne Zugang (Open-Meteo für Wetter und Schnee, OpenHolidays für Feiertage und Schulferien). Verwenden beim Planen und Bauen, sobald ein Workflow einen dieser Dienste braucht.
---

# Fertige Zugänge in der E&P-n8n

## Auf einen Blick

- Name, Typ und ID jedes Zugangs stehen in der Tabelle in `CLAUDE.md`. Du nimmst genau diese. Andere Credentials der E&P-n8n gehören zu echten Abläufen und sind tabu.
- Du legst kein Credential an und änderst keins. Schlüssel gehören nie in Parameter, Code, Repo oder Frontend.
- KI-Aufrufe, DataForSEO, Apify und jede Google-Suche kosten E&P Geld. Immer zuerst mit einem Eintrag testen.
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
- ⚠️ **Aufnahmen sind personenbezogen.** Heute spricht die Person nur selbst, andere Menschen nimmt sie nicht auf. Die Aufnahme bleibt in der Ausführung in n8n gespeichert und ist für alle mit dem gemeinsamen Login sichtbar. Leg sie nicht zusätzlich ab, also keine Tabelle und keine Datei.

## DataForSEO: Google-Angaben bekannter Betriebe

- Für Adresse, Telefon, Öffnungszeiten, Bewertungen und Kategorien eines Betriebs, den man schon kennt, etwa eines Partnerhotels.
- Node HTTP Request, Methode POST, Adresse `https://api.dataforseo.com/v3/business_data/google/my_business_info/live`. Authentifizierung: Generic Credential Type, dann Basic Auth, dann das Credential „Schulung DataForSEO“ aus der Tabelle.
- Body als JSON, eine Liste mit einer Aufgabe:

  ```json
  [{ "keyword": "Hotel Beispielhof Saalbach", "location_name": "Austria", "language_code": "de" }]
  ```

- **Land je Ziel setzen.** Ohne `location_name` sucht der Dienst in Deutschland. Werte zum Beispiel `Germany`, `Austria`, `Switzerland`, `Italy`, `France`. Den Ort nennst du zusätzlich im `keyword`. Sonst trifft der Dienst bei gleichnamigen Betrieben den falschen und meldet keinen Fehler.
- ⚠️ **Jede Abfrage kostet Geld**, rund einen halben Cent je Betrieb. Zuerst genau einen Betrieb testen. Keine Schleife über eine Tabelle ohne Obergrenze.
- Prüf das Ergebnis: Passen Name und Ort des gefundenen Betriebs?
- Der Dienst liest nur. Einträge bei Google ändert er nicht.

## Apify: Websites ohne Schnittstelle

- Apify betreibt fertige Scraper, dort **Actors** genannt: Google-Maps-Suchen, Bewertungsportale, Hotelportale oder beliebige Websites als Text.
- Node HTTP Request, Methode POST, Adresse:
  `https://api.apify.com/v2/acts/<ACTOR>/run-sync-get-dataset-items?maxTotalChargeUsd=0.5&timeout=180`
  Authentifizierung: Generic Credential Type, dann Header Auth, dann das Credential „Schulung Apify“ aus der Tabelle. Die Eingabe des Actors geht als JSON in den Body (Send Body, Using JSON). Die Ergebnisse kommen direkt als Liste zurück.
- Die beiden Credentials „Apify account“ in der E&P-n8n sind für den MCP-Baustein gedacht. Für den HTTP Request nimmst du nur „Schulung Apify“.

| Zweck | Actor | Menge begrenzen mit |
|---|---|---|
| Orte aus Google Maps (Adresse, Öffnungszeiten, Bewertung) | `compass~crawler-google-places` | `maxCrawledPlacesPerSearch` |
| Beliebige Website als Text | `apify~website-content-crawler` | `maxCrawlPages` und `maxCrawlDepth`, dazu Pflichtfeld `proxyConfiguration` |
| Tripadvisor (Hotels, Restaurants, Ausflugsziele) | `maxcopell~tripadvisor` | `maxItemsPerQuery` |
| Booking.com (Unterkünfte, Preise) | `voyager~booking-scraper` | `maxItems` im Body; Preise nur mit `checkIn`, `checkOut`, `adults` und `rooms` |

- Beispiel Google Maps: `{ "searchStringsArray": ["Skiverleih"], "locationQuery": "Garmisch-Partenkirchen, Germany", "maxCrawledPlacesPerSearch": 1, "language": "de" }`
- Beispiel Website: `{ "startUrls": [{ "url": "https://…" }], "maxCrawlPages": 1, "maxCrawlDepth": 0, "proxyConfiguration": { "useApifyProxy": true } }`
- **Bekannter Betrieb oder Suche?** Einen bekannten Betrieb schlägst du mit DataForSEO nach. Apify nimmst du, um Betriebe nach Art und Ort zu finden.
- Vor dem ersten Lauf im Apify Store nachsehen: volle Kennung mit Benutzername (es gibt Nachbauten), Name des Mengenfelds, keine monatliche Miete („rental“).
- ⚠️ **Jeder Lauf kostet Geld.** Deshalb:
  - Die Menge im Body begrenzen, mit dem Feld aus der Tabelle. Ohne Grenze holt der Google-Maps-Actor alle Orte.
  - `maxTotalChargeUsd` in der Adresse deckelt die Kosten eines Laufs. Der Google-Maps-Actor verlangt mindestens 0.5, darunter kommt Fehler 400.
  - `maxItems` in der Adresse bremst nicht. Es deckelt nur bei manchen Actors die Abrechnung.
  - Zuerst mit 1 bis 3 Ergebnissen testen. Keine Schleife und kein Zeitplan, ohne vorher Anzahl und Kosten zu überschlagen.
  - Fehler 402 heißt: Budget aufgebraucht. Dann sagt die Person Friedemann Bescheid.
- **Zeit:** Der Aufruf wartet höchstens 5 Minuten. Danach kommt Fehler 408, und der Lauf arbeitet im Hintergrund weiter. `timeout=180` in der Adresse beendet ihn vorher. Die Option „Timeout“ im HTTP-Node weglassen oder auf mindestens 200000 ms stellen.
- ⚠️ **Erfolg heißt nicht, dass die Seite stimmt.** Apify meldet auch Erfolg, wenn die Seite nur „nicht gefunden“ enthält. Schau dir den Text des ersten Ergebnisses an.
- Bewertungen enthalten Namen von Gästen. Werte nur aus, was gebraucht wird, und speichere keine Namen.

## Google-Suche über SerpAPI

- Für Treffer aus Google, etwa „Skiverleih in Saalbach“ oder die Angaben eines bekannten Hotels.
- Am einfachsten als Werkzeug am AI Agent: Node „SerpAPI“ (`@n8n/n8n-nodes-langchain.toolSerpApi`), Credential „SerpAPI account“, Verbindung über `ai_tool`. Der Agent entscheidet dann selbst, wann er sucht. Vorher mit `search_nodes` und `get_node` prüfen, wie der Node heißt und welche Felder er hat.
- Land und Sprache mitgeben (zum Beispiel `gl=at`, `hl=de`), sonst sucht er womöglich im falschen Land.
- ⚠️ **Jede Suche kostet Geld.** Zuerst eine einzige Suche testen. Keine Schleife über eine Tabelle ohne Obergrenze.
- Prüf das Ergebnis: Passen Name und Ort? Google-Treffer können veraltet sein.

## Mails über SMTP

- Node „Send Email“ (`n8n-nodes-base.emailSend`), Credential „SMTP Freddy Posteo“:

  ```
  fromEmail    KI-Schulung <f.schuetz@posteo.de>
  toEmail      <eigene Adresse der Person>
  subject      {{ $json.betreff }}
  emailFormat  text   (oder html)
  text         {{ $json.text }}
  ```

- Den Absender übernimmst du genau so. Einen anderen lehnt der Mailserver ab. Das ältere Credential „SMTP account“ nutzt du nie.
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
