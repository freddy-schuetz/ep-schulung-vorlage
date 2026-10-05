---
name: meetingnotizen
description: Baut aus Besprechungsnotizen, Transkripten, PDF-Protokollen oder einer Sprachnotiz einen n8n-Workflow, der Zusammenfassung, Entscheidungen, Aufgaben und offene Fragen strukturiert ausgibt. Für einen Reiseveranstalter etwa Jour fixe zur Wintersaison, Nachbesprechung einer Reise oder Notizen nach dem Besuch bei einem Partnerbetrieb. Verwenden, wenn jemand Notizen oder Protokolle automatisch auswerten, Aufgaben daraus ableiten oder aus einer Sprachnotiz einen Bericht machen will.
---

# Meetingnotizen und Sprachnotizen strukturieren

Ziel: Aus Rohtext (Notizen, Transkript, PDF) oder einer kurzen Sprachnotiz wird ein Kurzprotokoll mit festem Schema. Der erste Stand läuft ohne Postfach und ohne Kalender.

**Startpunkt:** `examples/workflows/meetingnotizen-aufgaben.json` (Formular, PDF-Weiche, Information Extractor, Ergebnisseite, Data Table). Lesen, auf das Vorhaben zuschneiden, dann per n8n-mcp mit Kürzel anlegen. Nicht alles neu erfinden.

## Wann verwenden
- Jour fixe, Nachbesprechung einer Reise oder eines Events, Messe-Nachbereitung: Notizen sollen zu Protokoll und Aufgabenliste werden.
- Nach dem Besuch bei einem Partnerhotel: Eine Sprachnotiz soll zu einem kurzen Bericht werden.
- Aufgaben aus Besprechungen sollen in einer eigenen Tabelle oder als Mail an die eigene Adresse landen.

Nicht passend: Terminfindung (eigener Ablauf).

## Empfohlener Aufbau (Knotenkette)
1. `n8n-nodes-base.formTrigger` (im Beispiel typeVersion 2.3): Felder `Besprechung` (text), `Notizen` (textarea), `Datei` (file, `multipleFiles: false`). `responseMode: "lastNode"`, Pfad mit Kürzel in `options.path`, etwa `anna-meetingnotizen`.
2. `n8n-nodes-base.if` „Text eingefügt?“: `($json.Notizen || '').trim()` ist nicht leer.
3. Falsch-Zweig: `n8n-nodes-base.extractFromFile`, `operation: "pdf"`, `binaryPropertyName` = Feld-Label (`Datei`). Am Knoten `onError: "continueRegularOutput"` setzen: Bei leerem Formular gibt es kein Binärfeld, und der Knoten bricht sonst ab. Das Formular zeigt dann eine Fehlermeldung statt der Hinweisseite.
   Sollen auch .txt oder .vtt gehen: `acceptFileTypes` auf `.pdf,.txt,.vtt` erweitern, vor dem Auslesen per `n8n-nodes-base.switch` auf `(($binary.Datei || {}).fileExtension || '').toLowerCase()` verzweigen (Fallback-Ausgang für „keine Datei“ zur Hinweisseite) und für Text einen zweiten Knoten mit `operation: "text"` und `destinationKey: "text"` nehmen. Ohne `destinationKey` landet der Text in `data`, nicht in `text`.
4. `n8n-nodes-base.set` je Zweig: einheitliche Felder `text`, `besprechung`, `quelle`. Im Datei-Zweig `text` als `{{ $json.text || '' }}`, damit ein Fehler-Item leeren Text liefert.
5. `n8n-nodes-base.if` „Genug Text?“ (Länge ab etwa 50 Zeichen). Sonst `n8n-nodes-base.form` mit `operation: "completion"` und klarer Fehlermeldung. Nie ein leeres Protokoll zeigen.
6. `@n8n/n8n-nodes-langchain.informationExtractor` mit `schemaType: "manual"` (JSON-Schema: `titel`, `datum`, `zusammenfassung`, `entscheidungen[]`, `aufgaben[{aufgabe, verantwortlich, faellig_bis, beleg}]`, `offene_fragen[]`) und dem Modell-Node zum KI-Credential aus `CLAUDE.md` an `ai_languageModel`. Ergebnis liegt unter `$json.output`. Alternative: `@n8n/n8n-nodes-langchain.chainLlm` mit `hasOutputParser: true` plus `@n8n/n8n-nodes-langchain.outputParserStructured`.
7. `n8n-nodes-base.splitOut` auf `output.aufgaben`, dann `n8n-nodes-base.dataTable` (`operation: "insert"`, eigene Tabelle per `mode: "name"`, etwa `anna_meeting_aufgaben`), Spalten zum Beispiel besprechung, aufgabe, verantwortlich, faellig_bis, status.
8. `n8n-nodes-base.set` baut Markdown aus dem Schema (Listen per Ausdruck, nicht per KI), `n8n-nodes-base.markdown` (`markdownToHtml`), `n8n-nodes-base.form` (`operation: "completion"`, `respondWith: "showText"`).

## Variante: Sprachnotiz wird Bericht
1. Formular mit einem Datei-Feld für die Aufnahme (`acceptFileTypes: ".mp3,.m4a,.wav,.webm"`).
2. Node OpenAI, Ressource Audio, Operation Transcribe (Skill `schulungs-dienste`), Credential OpenAI aus `CLAUDE.md`.
3. Ab dem Transkript weiter wie oben ab Schritt 5 (Länge prüfen, strukturieren, anzeigen).
4. Die Aufnahme legst du nicht zusätzlich ab, also keine Tabelle und keine Datei. In der Ausführung in n8n bleibt sie trotzdem gespeichert und ist für alle mit dem gemeinsamen Login sichtbar. Heute nimmt die Person nur sich selbst auf.

Zum Testen spricht die Person selbst eine kurze Notiz ein. Andere Menschen nur mit ihrer Zustimmung aufnehmen.

## Heute und später
**Heute in der Schulung**
- Formular mit Textfeld oder Datei-Upload (PDF; TXT und VTT mit der Weiche aus Schritt 3, das Beispiel kann nur PDF).
- Ergebnis auf der Formular-Endseite, Aufgaben in einer eigenen Data Table, auf Wunsch per Mail (SMTP) an die eigene Adresse.
- Optional ein Prüfschritt: `n8n-nodes-base.form` mit `operation: "page"` zeigt das Protokoll zum Korrigieren, bevor gespeichert wird.

**Nach der Schulung (braucht Freigabe, mit Friedemann)**
- Protokoll als Entwurf in Outlook (`resource: "draft"`, `operation: "create"`), Aufgaben nach Microsoft To Do, Beiträge in Teams.
- Teams-Transkripte automatisch abholen geht nur über Microsoft Graph per `n8n-nodes-base.httpRequest`.
- Outlook braucht in den meisten Organisationen eine Admin-Freigabe, Teams immer.

In der Schulung verbindest du kein Postfach, keinen Kalender und kein Konto. Das ist die echte n8n von E&P (siehe `CLAUDE.md`).

## Testdaten (erfunden)
1. **Jour fixe Wintersaison:** „Jour fixe Wintersaison, 8.10.2026. Anwesend: Leitung Gruppenreisen, Kundenservice, Events. Skireise Februar: 42 von 60 Plätzen gebucht. Entschieden: Anmeldeschluss ist der 15.12. Kundenservice aktualisiert die Reiseseite bis 20.10. Marketing schickt den Newsletter-Teaser bis 25.10. Offen: Wer fragt beim Busunternehmen wegen eines zweiten Busses an? Braucht es für den Eventabend eine Schlechtwetter-Variante?“
   Erwartung: 1 Entscheidung, 2 Aufgaben mit Termin, 2 offene Fragen, „42 von 60“ wörtlich.
2. **Nachbesprechung Reisemesse:** „Nachbesprechung Reisemesse, 10.10.2026. Laut Standteam rund 380 Gespräche. Der Katalog Skireisen war am zweiten Tag vergriffen. Entschieden: Nachdruck von 2.000 Stück. Die Grafik prüft bis Ende der Woche die Druckdaten. Wer die Kontakte ins CRM überträgt, ist noch offen.“
   Erwartung: Aufgabe „Kontakte übertragen“ mit leerem `verantwortlich`, „bis Ende der Woche“ wörtlich, kein erfundenes Datum.
3. **Randfall:** eingescanntes PDF ohne Textebene oder leeres Formular. Erwartung: Hinweisseite, kein KI-Aufruf.

## Qualitätsregeln
- Zahlen nie vom Modell rechnen oder runden lassen. Summen, Zählungen und Fristen in Tagen macht n8n (Set-Ausdruck, `n8n-nodes-base.summarize`).
- Strukturierte Ausgabe nur per Information Extractor oder Output Parser, nie Freitext zerlegen.
- Prompt: nur übernehmen, was im Text steht; fehlende Angaben leer lassen; je Aufgabe ein kurzes wörtliches Zitat.
- Das Protokoll ist ein Entwurf. Ein Mensch prüft es, bevor es an andere geht.
- Mit den drei Testfällen oben prüfen, bevor andere Texte durchlaufen.

## Typische Fallen
- **PDF ohne Textebene** (Scan, Foto) liefert leeren Text. Deshalb die Längenprüfung vor der KI.
- **DOCX** kann Extract from File nicht lesen. Word als PDF speichern oder Text einfügen.
- **Binärfeld beim Formular:** In typeVersion 2.3 heißt es wie das Feld-Label, aber Sonderzeichen, Leerzeichen und Umlaute im Label werden zu „_“ („Protokoll-Datei“ wird zu `Protokoll_Datei`, „Übersicht“ zu `_bersicht`). Label einfach halten (etwa „Datei“). In jeder Version den Namen im Output des Auslösers prüfen, bevor `binaryPropertyName` gesetzt wird. Ohne hochgeladene Datei fehlt das Binärfeld ganz (siehe Schritt 3).
- **Formular-Endseite:** Laufen mehrere Zweige, zeigt n8n nur die Endseite des zuletzt ausgeführten Zweigs. Zweige werden von oben nach unten abgearbeitet, also den Zweig mit der Endseite unten platzieren.
- **Split Out mit 0 Aufgaben** gibt 0 Items aus, alles danach läuft nicht. Nichts Wichtiges hinter diesen Zweig hängen.
- **Gemeinsame n8n:** Formularpfad und Tabelle tragen das Kürzel, sonst kollidieren sie, wenn mehrere dasselbe Beispiel nutzen.
- **Lange Transkripte** kosten spürbar mehr. Erst mit kurzen Texten testen.

## Datenschutz
- In der Schulung nur erfundene Notizen oder eine eigene kurze Sprachnotiz.
- Personenbezug klein halten: Rollen statt Namen, keine Gesundheits- oder Personalthemen in Testdaten.
- In der gemeinsamen n8n sieht jede Person mit dem Login Workflows und Ausführungen. Ausführungsdaten enthalten den vollen Text.
- Das Sprachmodell bekommt nur den Text, der fürs Protokoll nötig ist.
