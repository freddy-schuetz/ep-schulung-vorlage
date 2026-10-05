---
name: n8n-testdaten
description: Testdaten und Testlauf für n8n-Workflows in der Schulung. Szenarien, Testaufrufe mit n8n_test_workflow, Weg bei Zeitplan und manuellem Auslöser, Ergebnis inhaltlich prüfen. Verwenden nach dem Bauen oder nach einer größeren Änderung, bevor der Workflow als fertig gilt.
---

# Testdaten und Testlauf

Nach dem Bauen oder einer größeren Änderung testest du **einmal sauber** mit Testdaten. In der Schulung reichen zwei bis drei Szenarien.

## Regeln der echten E&P-n8n

- Nur erfundene oder öffentliche Daten. Keine Kundendaten, keine Gästenamen, keine Buchungen.
- Mails gehen nur an die eigene Adresse der Person.
- Testen, aktivieren und deaktivieren darfst du nur den eigenen Workflow (Name beginnt mit dem Kürzel). Vorher den Namen mit `n8n_get_workflow` (`mode: "minimal"`) prüfen.

## Ablauf

1. **Szenarien festlegen** (aus dem Bauplan):
   - Normalfall mit vollständigen Daten
   - ein Randfall (leeres Feld, Sonderzeichen, ungewöhnlich lange Eingabe)
   - bei Bedarf ein Fehlerfall (Pflichtfeld fehlt)
   Zu jedem Szenario schreibst du das **erwartete Ergebnis** auf.

2. **Webhook-, Formular- und Chat-Workflows** testest du über ihren Auslöser, je Szenario ein Aufruf:
   ```
   n8n_test_workflow({workflowId: "...", data: {"email": "test@example.com", "name": "Max Mustermann"}})
   ```
   Chat-Auslöser: statt `data` die Nachricht mitgeben.
   ```
   n8n_test_workflow({workflowId: "...", message: "Wann fährt der Bus zur Skireise im Februar ab?"})
   ```
   - `data` ist der Body des Aufrufs. Im Workflow liegt er beim Webhook unter `$json.body` (siehe `CLAUDE.md`).
   - Der Aufruf geht nur, wenn der Workflow **aktiv** ist. Vorher kurz der Security-Blick (Pfad mit Kürzel, keine Schlüssel). Nach einer Änderung erneut `activateWorkflow`, sonst läuft der alte Stand.

3. **Zeitplan und manueller Auslöser** lassen sich über diese Verbindung nicht starten. `n8n_test_workflow` meldet dann `Workflow cannot be triggered externally`. Auch `method: "prepare"`, `"pinned"` und `"direct"` gehen über den Hub nicht. Zwei Wege:
   - Bitte die Person, den Workflow in n8n zu öffnen und auf **Execute workflow** zu klicken. Danach liest du die Ausführung.
   - Häng zum Testen einen Webhook mit Kürzel-Pfad (zum Beispiel `anna-test`) an den ersten Verarbeitungsschritt, teste darüber und entferne ihn danach wieder.

4. **Ergebnis prüfen.** Ausführung holen, immer zum eigenen Workflow:
   ```
   n8n_executions({action: "list", workflowId: "..."})
   n8n_executions({action: "get", id: "execution-id", mode: "summary"})
   ```
   Vergleich jedes Szenario mit dem erwarteten Ergebnis. Ein grüner Lauf heißt nur, dass nichts abgestürzt ist. Stimmen Zahlen und Texte? Kamen so viele Einträge an wie erwartet? Kam die Mail an?

## Testdaten-Format

```json
{
  "testScenarios": [
    {
      "name": "Normalfall: vollständige Anfrage",
      "data": {"email": "test@example.com", "name": "Max Mustermann", "anliegen": "Skireise für 24 Personen im Februar"},
      "expectedOutput": "Kategorie Gruppenanfrage, Entwurf ohne Preis"
    },
    {
      "name": "Randfall: leere Felder",
      "data": {"email": "", "name": ""},
      "expectedOutput": "Hinweis auf fehlende Angaben, kein KI-Aufruf"
    }
  ]
}
```

Adressen in Testdaten nur mit `example.com`, `example.org` oder der eigenen Adresse der Person.

## Wann testen

- Nach dem ersten Bau: immer.
- Nach größeren Änderungen (neue Schritte, geänderte Logik).
- Nicht nach rein kosmetischen Änderungen (Position, Sticky Notes).
