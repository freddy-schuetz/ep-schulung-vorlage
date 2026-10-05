---
name: daten-visualisieren
description: Daten prüfen, auswerten und als Diagramm zeigen mit n8n, für einen Reiseveranstalter (Gruppenreisen, Skireisen, Events). Liest CSV- oder XLSX-Dateien per Upload, rechnet Kennzahlen in Knoten ohne Sprachmodell, prüft Listen auf fehlende Angaben und doppelte Einträge, zeichnet Diagramme mit dem QuickChart-Knoten und lässt ein Sprachmodell nur eine kurze Einordnung aus den fertigen Zahlen formulieren. Verwenden für Exporte wie Buchungen, Teilnehmende, Nächtigungen je Zielort oder Kampagnen-Klicks und für das Prüfen einer Teilnehmerliste.
---

# Daten auswerten, prüfen und als Diagramm zeigen

Beispiel zum Importieren: [`examples/workflows/csv-auswertung-diagramm.json`](../../../examples/workflows/csv-auswertung-diagramm.json). Ohne Postfach testbar (Formular-Upload oder erfundene Beispiel-CSV per Klick). Nur der KI-Schritt braucht das KI-Credential aus `CLAUDE.md`.

## Wann verwenden

- Ein Export liegt als CSV oder XLSX vor (Buchungen, Teilnehmende, Nächtigungen je Zielort, Newsletter- oder Kampagnenwerte) und soll ausgewertet werden.
- Eine Liste soll geprüft werden, etwa eine Teilnehmerliste auf fehlende Angaben und doppelte Einträge (Variante unten).
- Ein Diagramm für einen Bericht wird gebraucht.
- Zahlen sollen in zwei, drei Sätzen eingeordnet werden, ohne dass sich Fehler einschleichen.

Nicht dafür gedacht: sehr große Exporte (vorher an der Quelle filtern) und interaktive Dashboards (dafür eine Oberfläche mit Chart-Bibliothek).

## Grundprinzip

```
Datei  ->  Zeilen  ->  bereinigen  ->  rechnen (Knoten)  ->  Diagramm (QuickChart)
                                              |
                                              +->  Einordnung (Sprachmodell, nur formulieren)
```

Das Sprachmodell sieht **nie** die Rohdatei und rechnet **nie**. Es bekommt ein kleines JSON mit fertigen Kennzahlen.

## Empfohlene Knotenkette

Versionen wie im Beispiel-Workflow.

1. **Eingang**
   - `n8n-nodes-base.formTrigger` (2.5): ein Feld `fieldType: file`, `multipleFiles: false`, `acceptFileTypes: ".csv,.xlsx"`, `requiredField: true`. `fieldLabel` und `fieldName` gleich wählen (Beispiel: `Datei`). Pfad mit Kürzel unter `options.path`, etwa `anna-csv-auswertung`. Nach dem ersten Test im Output unter **Binary** kontrollieren, wie das Binärfeld heißt.
   - Testeingang ohne Datei: `n8n-nodes-base.manualTrigger` (1) → `n8n-nodes-base.set` (3.4) mit CSV-Text → `n8n-nodes-base.convertToFile` (1.1), `operation: toText`, `sourceProperty: csv`, `binaryPropertyName: Datei`, `options.fileName`.
2. **Weiche** `n8n-nodes-base.if` (2.3): `{{ ($binary.Datei?.fileName ?? '').toLowerCase() }}` endet auf `.xlsx`.
3. **Lesen** `n8n-nodes-base.extractFromFile` (1.1)
   - CSV: `operation: csv`, `binaryPropertyName: Datei`, `options.delimiter: ";"`, `options.headerRow: true`, `options.encoding` (`utf-8` oder `latin1`)
   - Excel: `operation: xlsx`, `options.headerRow: true`, bei Bedarf `options.sheetName`, `options.range`
4. **Bereinigen** `n8n-nodes-base.set` (3.4): Text in Zahl umwandeln (Tausenderpunkt und Leerzeichen entfernen, Dezimalkomma zu Punkt, leere Zellen zu `null`), `options.ignoreConversionErrors: true`.
5. **Aussortieren** `n8n-nodes-base.filter` (2.3): Pflichtspalte nicht leer und `Number.isFinite(...)` true.
6. **Gruppieren** `n8n-nodes-base.summarize` (1.1): `fieldsToSplitBy: monat`, `aggregation: sum` auf `naechtigungen` und `ankuenfte`. Ergebnisfelder: `sum_naechtigungen`, `sum_ankuenfte`. Weitere Aggregationen: `average`, `count`, `countUnique`, `max`, `min`, `concatenate`, `append`.
7. **Sortieren** `n8n-nodes-base.sort` (1): `sortFieldsUi.sortField[].fieldName: monat`, `order: ascending`.
8. **Listen bauen** `n8n-nodes-base.aggregate` (1): `aggregateIndividualFields` für `monat`, `sum_naechtigungen`, `sum_ankuenfte`.
9. **Kennzahlen** `n8n-nodes-base.set` (3.4, `includeOtherFields: true`): Summe, Durchschnitt, Spitzen- und schwächster Monat, Veränderung erster zu letztem Monat, Aufenthaltsdauer, dazu `quelle`, `zeilen_gelesen`, `zeilen_verwendet`. Alles als Ausdruck, zum Beispiel `{{ $json.sum_naechtigungen.reduce((a, b) => a + b, 0) }}`.
10. **Einordnung** `@n8n/n8n-nodes-langchain.chainLlm` (1.7), `promptType: define`, Prompt enthält nur `JSON.stringify({...Kennzahlen})`, Systemnachricht über `messages.messageValues[]` mit `type: SystemMessagePromptTemplate`. Modell-Node zum KI-Credential über `ai_languageModel`. Am Chain-Knoten `onError: continueRegularOutput` setzen und in der Ausgabe einen Ersatztext vorsehen (`$('Einordnung formulieren (KI)').first().json.text ?? 'Keine KI-Einordnung erzeugt.'`), damit Diagramm und Ergebnisseite auch entstehen, wenn die KI ausfällt.
11. **Diagramm** `n8n-nodes-base.quickChart` (1): `chartType` (`bar`, `line`, `pie`, `doughnut`, `polarArea`), `labelsMode: array`, `labelsArray: {{ $('Kennzahlen berechnen').first().json.monat }}`, `data: {{ ...sum_naechtigungen }}`, `output: diagramm` (Binärfeld), `chartOptions` (`width`, `height`, `format`, `backgroundColor`, `horizontal`), `datasetOptions` (`label`, `backgroundColor`, `borderColor`, `fill`, `pointStyle`). Der Knoten legt pro Eingangs-Item eine Datenreihe an, die Beschriftungen kommen vom ersten Item. Für zwei Reihen (etwa Vorjahr und aktuelles Jahr) mit zwei Items testen.
12. **Ausgabe**
    - Formular: `n8n-nodes-base.if` mit `{{ $('Formular: Datei hochladen').isExecuted }}`, dann `n8n-nodes-base.form` (2.5), `operation: completion`, `respondWith: returnBinary`, `inputDataFieldName: diagramm`, Einordnung in `completionMessage`.
    - Testlauf: `n8n-nodes-base.noOp`, Diagramm im QuickChart-Knoten unter Binary ansehen.

## Variante: Teilnehmerliste prüfen

1. Upload wie oben, Spalten zum Beispiel `name`, `geburtsjahr`, `zimmerwunsch`, `email`. Nur eine ausgedachte Liste verwenden.
2. **Fehlende Angaben:** `n8n-nodes-base.filter` auf leere Pflichtfelder, Ergebnis als Liste „unvollständig“.
3. **Doppelte Einträge:** `n8n-nodes-base.removeDuplicates` auf die Vergleichsfelder, oder per `summarize` mit `count` je Name zählen und alles mit mehr als 1 melden.
4. **Zählen:** Zeilen gelesen, vollständig, unvollständig, doppelt. Das rechnet n8n.
5. Die KI formuliert höchstens die Meldung aus den fertigen Listen. Ergebnis im Formular oder per Mail (SMTP) an die eigene Adresse.

Erwartung beim Test: Eine Liste mit 8 Zeilen, davon 2 ohne Geburtsjahr und 1 doppelt, ergibt genau diese Zahlen und nennt die betroffenen Zeilen.

## Varianten ohne Postfach

- Upload über das n8n-Formular oder Beispieldaten per Klick (siehe Beispiel).
- **Verlauf speichern:** Monatswerte in einer eigenen Data Table mit Kürzel (`operation: upsert`, Abgleich auf `monat`) ablegen, später den Vorjahresvergleich aus der Tabelle rechnen.
- **Tabelle statt Bild:** `n8n-nodes-base.html` mit `operation: convertToHtmlTable`.
- **Anzeige in einer eigenen Oberfläche:** Kennzahlen per Webhook als JSON ausliefern und dort mit einer Chart-Bibliothek zeichnen. Dann gehen die Zahlen nicht an QuickChart.

Dateien automatisch aus OneDrive, Google Drive oder einem Postfach holen ist ein Schritt nach der Schulung. Das braucht eine Freigabe und gehört nicht in die E&P-n8n der Schulung.

## Testdaten

**A) Nächtigungen je Monat** (steht im Beispiel, erfunden, Semikolon-getrennt, zwei Zielorte je Monat):

```
monat;ort;naechtigungen;ankuenfte
2026-01;Beispielberg;18450;5120
2026-01;Beispielsee;9320;2870
...
2026-06;Beispielsee;17890;5230
```

Erwartete Werte: Summe 159.090 Nächtigungen, 47.120 Ankünfte, Durchschnitt 26.515 je Monat, Spitzenmonat 2026-06 mit 34.310, schwächster Monat 2026-04 mit 17.520, Veränderung Januar zu Juni +23,6 %, Aufenthaltsdauer 3,38 Nächte. Weicht ein Wert ab, stimmt die Kette nicht.

**B) Kampagnen-Klicks** (erfunden):

```
datum;kanal;impressionen;klicks
2026-05-04;Newsletter;12400;620
2026-05-04;Social;48200;910
2026-05-11;Newsletter;12650;588
2026-05-11;Social;51900;1034
```

Gruppieren nach `kanal`, Summen von `impressionen` und `klicks`, Klickrate **aus den Summen**: Newsletter 1.208 / 25.050 = 4,82 %, Social 1.944 / 100.100 = 1,94 %.

**Randfälle zum Mittesten** (jeder Fall hat eine eigene Erwartung):

| Randfall | Erwartung im Beispiel-Workflow |
|---|---|
| Zahl als `18.450` oder `18 450` | wird zur Zahl 18450 und zählt normal mit |
| Text `k. A.` in einer Zahlenspalte | Zeile fliegt in „Nur gültige Zeilen“ raus, `zeilen_verwendet` ist kleiner als `zeilen_gelesen` |
| leere Zeile | fließt in keine Summe ein (entweder überspringt sie schon das Lesen oder der Filter sortiert sie aus) |
| ein Monat fehlt ganz | der Monat fehlt auch im Diagramm und in `monate_anzahl`, er wird nicht erfunden |
| Komma statt Semikolon als Trennzeichen | alles landet in einer Spalte, „Nur gültige Zeilen“ lässt nichts durch und der Workflow endet dort ohne Ergebnis und ohne Fehlermeldung (0 Items). Abhilfe: Trennzeichen in „CSV lesen“ anpassen |
| Umlaute aus einer Windows-CSV | keine Zeile fällt weg, aber Umlaute (etwa in `ort`) sind im Output von „CSV lesen“ verstümmelt. Abhilfe: `options.encoding: latin1` |
| XLSX mit formatierten Datumszellen in `monat` | Zeilen werden **nicht** aussortiert: `monat` kommt als Zahl oder formatierter Text an, Gruppierung und Sortierung stimmen dann nicht. Abhilfe: Spalte `monat` in der Datei als Text im Format `JJJJ-MM` führen |

## Qualitätsregeln

- **Zahlen in Knoten berechnen:** Summen, Durchschnitte, Anteile und Veränderungen immer in Summarize-, Set- oder Filter-Knoten. Das Sprachmodell rechnet nicht, zählt nicht, schätzt nicht.
- **Sprachmodell nur formulieren lassen:** Eingabe ist ausschließlich das Kennzahlen-JSON. Systemnachricht: nur Zahlen verwenden, die wörtlich im JSON stehen, keine Ursachen, Vergleiche oder Vorjahreswerte erfinden.
- **Jede Zahl mit Herkunft:** Dateiname, Zeitraum, Zeilen gelesen und verwendet, Stand der Auswertung im Ergebnis mitführen.
- **Nachkontrolle:** Zahlen aus dem KI-Text herausziehen und prüfen, ob jede in den Kennzahlen vorkommt. Wenn nicht: Text verwerfen oder markieren.
- **Quoten aus Summen**, nie als Durchschnitt von Einzelquoten.
- **Diagramm ehrlich:** Balken beginnen bei 0, Monate sortiert, Titel oder Beschriftung mit Einheit und Zeitraum. Balken für Vergleiche, Linie für Verläufe, Kreis nur für wenige Anteile, die zusammen 100 % ergeben.

## Typische Fallen

- **Trennzeichen:** Excel speichert CSV in Deutschland meist mit Semikolon. Steht im Extract-Knoten `,`, landet alles in einer Spalte.
- **Zeichensatz:** „CSV (Trennzeichen-getrennt)“ aus Excel unter Windows ist oft nicht UTF-8. Umlaute kaputt: `options.encoding: latin1` probieren oder in Excel „CSV UTF-8“ wählen.
- **Zahlen als Text:** `"18.450"` ist Text, nicht die Zahl 18450. Summarize überspringt leere Werte ohne Fehlermeldung, Summen werden dann still zu klein. Immer vorher bereinigen und `zeilen_verwendet` anzeigen.
- **Punkt als Dezimaltrenner:** Die Bereinigung im Beispiel entfernt Punkte als Tausendertrenner. Für Spalten mit Nachkommastellen (Aufenthaltsdauer, Preise) eine eigene Regel verwenden.
- **Monatsformat:** `2026-9` sortiert hinter `2026-10`. Monate immer `JJJJ-MM`.
- **XLSX-Datumszellen** kommen je nach Format als Zahl oder als formatierter Text an. Im Output prüfen oder eine Textspalte `monat` in der Datei führen.
- **0 Items:** Filtert der Filter alles weg, laufen die folgenden Knoten nicht, und es gibt keine Fehlermeldung.
- **`$('IF-Knoten').first()`** greift auf Ausgang 0 zu. Lief das Item über den anderen Ausgang, ist das Ergebnis leer. Werte lieber am Auslöser oder am letzten sicheren Knoten abholen.
- **Nach QuickChart** enthält `$json` nicht mehr die Kennzahlen. Werte per `$('Kennzahlen berechnen').first().json` holen.
- **Form Ending** nur ausführen, wenn der Form Trigger lief. Beim Testlauf per Klick gibt es keine Formularseite.
- **Leere KI-Antwort:** Das Token-Limit im Modell-Knoten nicht knapp setzen. Neuere Modelle verbrauchen einen Teil davon fürs Nachdenken.

## Datenschutz

- **QuickChart ist ein externer Dienst:** Der Knoten schickt Beschriftungen und Werte an quickchart.io. Nur zusammengefasste Zahlen ins Diagramm, keine Namen, Mailadressen oder Einzelbuchungen.
- **An das Sprachmodell gehen nur Kennzahlen**, nie Rohzeilen mit Gästen, Buchungen oder Kontaktdaten.
- **Hochgeladene Dateien bleiben in den Ausführungsdaten von n8n.** In der gemeinsamen n8n sieht jede Person mit dem Login dieselben Ausführungen. Dort nur erfundene oder veröffentlichte, zusammengefasste Zahlen verwenden.
- Echte Gäste- oder Buchungsdaten gehören nicht in die Schulung.
