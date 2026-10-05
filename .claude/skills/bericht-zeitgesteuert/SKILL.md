---
name: bericht-zeitgesteuert
description: Baut einen zeitgesteuerten n8n-Workflow für wiederkehrende Berichte eines Reiseveranstalters. Daten holen (eigene Data Table oder offene Daten wie Open-Meteo), von n8n zählen und rechnen lassen, von der KI nur einordnen lassen und als Datei oder per Brevo an die eigene Adresse ausgeben. Verwenden für Wochenberichte zu Anfragen, Monatsberichte zu Buchungen oder Teilnehmenden und den Schnee- und Wetterbericht am Morgen.
---

# Wiederkehrende Berichte (zeitgesteuert)

Ziel: Ein Bericht, der jeden Tag, jede Woche oder jeden Monat von selbst entsteht. Die Zahlen berechnet n8n, die KI schreibt nur die Einordnung. Der erste Stand läuft mit Testdaten oder offenen Daten und wird von Hand gestartet.

**Startpunkt:** `examples/workflows/bericht-woechentlich.json` (Beispieldaten, Summarize je Kanal und Thema, Merge, Kennzahlen per Ausdruck, Einordnung per chainLlm, HTML-Datei, deaktivierter Zeitplan mit Data Table und Leer-Prüfung, deaktivierter Outlook-Entwurf). Lesen, auf die eigene Datenquelle umbauen, dann per n8n-mcp mit Kürzel anlegen.

## Wann verwenden
- Wochenbericht Anfragen, Monatsbericht Buchungen oder Teilnehmende, Auswertung von Bewertungen.
- Schnee- und Wetterbericht für einige Skigebiete am Morgen (Variante unten).
- Jemand kopiert regelmäßig Zahlen aus einer Tabelle in eine Mail oder ein Dokument.

Nicht passend: einmalige Auswertungen (dafür reicht Claude direkt mit der Datei), Präsentationen mit Layout.

## Empfohlener Aufbau (Knotenkette)
1. Auslöser: `n8n-nodes-base.scheduleTrigger` (im Beispiel typeVersion 1.2, `rule.interval: [{ field: "weeks", weeksInterval: 1, triggerAtDay: [1], triggerAtHour: 7, triggerAtMinute: 0 }]`). Zum Testen zusätzlich `n8n-nodes-base.manualTrigger` oder ein Test-Webhook mit Kürzel-Pfad (siehe `CLAUDE.md`, Abschnitt „Testen“). In den Workflow-Settings `timezone: "Europe/Berlin"` setzen.
2. Daten holen, eine Quelle je Stufe:
   - Eigene `n8n-nodes-base.dataTable` mit Kürzel (`operation: "get"`, `returnAll: true`, `matchType: "allConditions"`, Filter auf `datum` mit `gte` `{{ $now.minus({ days: 7 }).startOf('day').toISO() }}` und `lt` `{{ $now.startOf('day').toISO() }}`). Nicht `$now.startOf('week')` nehmen: Am Montag früh sind Wochenstart und heute derselbe Tag, der Lauf findet dann 0 Zeilen.
   - Datei-Upload über `n8n-nodes-base.formTrigger` plus `n8n-nodes-base.extractFromFile` (`operation: "xlsx"` oder `"csv"`).
   - Offene Daten über `n8n-nodes-base.httpRequest` (Skill `schulungs-dienste`).
3. Leere Periode abfangen: am Datenknoten „Always Output Data“ einschalten, danach prüft `n8n-nodes-base.if`, ob echte Zeilen kamen (das leere Ersatz-Item hat keine Felder; im Beispiel „Zeilen vorhanden?“ mit `{{ $json.anzahl }}` „exists“). Nein-Zweig: kurzer Hinweis statt Bericht.
4. Zählen ohne KI: `n8n-nodes-base.summarize` (`fieldsToSummarize.values: [{ aggregation: "sum", field: "anzahl" }]`, `fieldsToSplitBy: "kanal"`). Das Ergebnisfeld heißt `sum_anzahl`. Für eine zweite Sicht ein zweiter Summarize-Knoten.
5. `n8n-nodes-base.aggregate` (`aggregateAllItemData`) je Sicht, dann `n8n-nodes-base.merge` (`mode: "combine"`, `combineBy: "combineByPosition"`) zu einem Item.
6. `n8n-nodes-base.set` „Kennzahlen berechnen“: Gesamtsumme, Anteile, Veränderung zur Vorperiode per Ausdruck (`reduce`, `Math.round`). Fertige Textzeilen für den Prompt bauen.
7. `@n8n/n8n-nodes-langchain.chainLlm` (`promptType: "define"`) mit dem Modell-Node zum KI-Credential aus `CLAUDE.md`: drei bis vier Sätze Einordnung plus Vorschläge. Ergebnis in `$json.text`. Soll die Einordnung Felder haben (etwa `auffaelligkeiten[]`), `outputParserStructured` anhängen.
8. `n8n-nodes-base.set` setzt den Bericht zusammen: Zahlen aus „Kennzahlen berechnen“, Text aus der KI, klar getrennt.
9. `n8n-nodes-base.markdown` (`markdownToHtml`) und `n8n-nodes-base.convertToFile` (`operation: "toText"`, Dateiname `.html`; für Tabellen `operation: "csv"` oder `"xlsx"`).
10. Ausgabe: Datei in der Ausführung, Archivzeile in der eigenen Data Table oder per Mail (Node „Send Email“ über SMTP) an die eigene Adresse der Person.

## Variante: Schnee- und Wetterbericht am Morgen
1. `scheduleTrigger` täglich um 7 Uhr, dazu zum Testen ein Webhook mit Kürzel-Pfad wie `tn3-schneebericht-test`.
2. `set` mit einer kleinen Liste von zwei bis drei Skigebieten (Name, Breite, Länge). Koordinaten findest du über die Geocoding-Adresse von Open-Meteo.
3. `splitOut`, dann je Ort `httpRequest` auf Open-Meteo mit `daily=snowfall_sum,temperature_2m_max,temperature_2m_min`, `hourly=snow_depth`, `timezone=Europe/Berlin`, `forecast_days=1` (Adressen im Skill `schulungs-dienste`).
4. `set` je Ort: Neuschnee in cm aus `daily.snowfall_sum[0]`, Schneehöhe aus `hourly.snow_depth` (Meter, für cm mal 100 und runden), Höchst- und Tiefstwert.
5. `aggregate` zu einem Item, dann prüfen: Kamen so viele Orte an wie in der Liste?
6. `chainLlm`: ein freundlicher Absatz je Ort, nur mit den gelieferten Zahlen.
7. Node „Send Email“ (SMTP) an die eigene Adresse der Person, Betreff mit Datum.

Erwartung beim Test: genau so viele Orte wie in der Liste, jede Zahl im Text steht so in den Daten, Einheiten stimmen (cm, Grad).

## Heute und später
**Heute in der Schulung**
- Beispieldaten im Set-Knoten (`mode: "raw"`, Datumswerte per `$now.minus(...)`, damit sie immer in der aktuellen Woche liegen).
- Eigene Data Table mit Kürzel als Datenquelle, befüllt mit ein paar Testzeilen.
- Offene Daten (Wetter, Schnee, Feiertage, Schulferien).
- Ergebnis als HTML- oder CSV-Datei, als Archivzeile oder per Mail (SMTP) an die eigene Adresse.

**Nach der Schulung (braucht Freigabe, mit Friedemann)**
- Daten aus Excel in OneDrive oder SharePoint (`n8n-nodes-base.microsoftExcel`) oder aus Google Sheets.
- Versand als Entwurf: `n8n-nodes-base.microsoftOutlook` (`resource: "draft"`, `operation: "create"`, `additionalFields.bodyContentType: "html"`).
- Human-in-the-loop vor dem Teamversand: `operation: "sendAndWait"` an die verantwortliche Person, erst nach deren OK an den Verteiler.
- Outlook, OneDrive, SharePoint und Teams brauchen in den meisten Organisationen eine Admin-Freigabe.

In der Schulung verbindest du kein Postfach, keine Ablage und kein Konto. Das ist die echte n8n von E&P (siehe `CLAUDE.md`).

## Testdaten (erfunden)
1. **Wochenbericht Anfragen** (Beispiel-Workflow): 12 Zeilen `datum`, `kanal`, `thema`, `anzahl`.
   Erwartung: gesamt 78; Website 44, E-Mail 19, Telefon 15; Skireisen 34, Events 32, Gruppenreisen 6, Anreise 6. Im KI-Text keine Zahl, die nicht in dieser Liste oder den Anteilen steht. Die gerundeten Kanal-Anteile ergeben 99 % (56, 24, 19), die Themen-Anteile 101 % (44, 41, 8, 8). Beides ist Rundung und kein Fehler.
2. **Monatsbericht Teilnehmende:** September Vorjahr 1.240, September aktuell 1.315, aufgeteilt nach Reiseart.
   Erwartung: Veränderung +6,0 % berechnet n8n im Set-Knoten, die KI zitiert nur.
3. **Leere Woche:** Die Datenquelle liefert 0 Zeilen. Erwartung: Hinweis „keine Daten“, kein KI-Aufruf, kein leerer Bericht. Im Beispiel läuft das nur über den Tabellen-Zweig („Always Output Data“ plus „Zeilen vorhanden?“). Also erst Schritt 3 der Notiz „Vor dem Start eintragen“ umsetzen und dann mit leerer Tabelle testen.

## Qualitätsregeln
- Zahlen nie vom Modell rechnen, summieren, runden oder vergleichen lassen. Alles Rechnen passiert in Summarize, Set-Ausdrücken oder, wenn es nicht anders geht, im Code-Knoten.
- Im fertigen Bericht stammen die Zahlen aus n8n-Feldern, nicht aus dem KI-Text. Den KI-Abschnitt als Entwurf kennzeichnen.
- Prompt: nur gelieferte Zahlen verwenden, keine erfundenen Ursachen, Vermutungen als offene Frage.
- Strukturierte Ausgabe per Output Parser, wenn der Text weiterverarbeitet wird.
- Vor dem ersten Versand an andere prüft ein Mensch. In der Schulung geht der Bericht nur an die eigene Adresse.
- Die Testfälle nach jeder Änderung an Prompt oder Rechenlogik prüfen.

## Typische Fallen
- **0 Items stoppen alles:** Liefert der Datenknoten nichts, laufen die folgenden Knoten nicht, und niemand merkt es. Siehe Schritt 3.
- **Data Table Get liefert ohne `returnAll` nur 50 Zeilen**, auch wenn `limit` höher steht, und meldet keinen Fehler. Zeilenzahl im Ergebnis gegen die Tabelle prüfen.
- **Versand über „Send Email“ (SMTP):** Node `n8n-nodes-base.emailSend`, Credential „SMTP account“, Absender `noreply@ep-reisen.de`, Empfänger nur die eigene Adresse der Person. Details im Skill `schulungs-dienste`.
- **Zeitzone:** Zeitplan und `$now` richten sich nach der Workflow-Zeitzone. Ohne Einstellung gilt die Zeitzone der Instanz, der Bericht kommt dann zur falschen Stunde oder mit verschobenem Zeitraum.
- **Zeitplan läuft automatisch nur bei aktivem Workflow.** Im Editor lässt er sich per Klick testen, das beweist aber nicht, dass der Zeitplan aktiv ist.
- **Zeitplan über diese Verbindung nicht startbar:** `n8n_test_workflow` meldet `Workflow cannot be triggered externally`. Dann klickt die Person „Execute workflow“, oder du testest über einen Test-Webhook mit Kürzel-Pfad.
- **XLSX:** Die Option „Sheet Name“ muss exakt dem Blattnamen entsprechen (etwa „Tabelle1“).
- **CSV mit deutschem Zahlenformat** (1.234,5) kommt als Text an. Vor Summarize in Zahlen umwandeln und das Ergebnis gegen eine Handrechnung prüfen.
- **PDF als Quelle:** Ein PDF ohne Textebene liefert leeren Text.
- **Deaktivierte Knoten reichen Daten durch:** Wer die Beispieldaten-Knoten nur deaktiviert, schickt beim Test das leere Item des manuellen Auslösers in die Zählung. Beispieldaten-Knoten entfernen und den Test-Auslöser an den echten Datenknoten hängen.
- **Merge braucht beide Eingänge:** Die Leer-Prüfung gehört vor die Aufteilung in die Summarize-Zweige, damit beide Zweige Daten bekommen.
- **Formate:** n8n hat keinen PowerPoint-Knoten. Für Folien liefert der Ablauf Gliederung und Texte oder eine HTML-Datei.
- **Gemeinsame n8n:** Workflow-Namen und Tabellen mit Kürzel. Den Zeitplan erst scharf schalten, wenn der Test sauber war.

## Datenschutz
- Berichte arbeiten mit Summen und Anteilen. Keine personenbezogenen Rohdaten (Namen, Mailadressen) an die KI geben.
- In der Schulung nur erfundene oder öffentlich zugängliche Zahlen.
- In der gemeinsamen n8n sieht jede Person mit dem Login Workflows, Ausführungen und Data Tables.
- Der Bericht geht heute nur an die eigene Adresse der Person.
