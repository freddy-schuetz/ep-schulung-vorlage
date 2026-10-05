---
name: n8n-security-audit
description: Security-Checkliste vor dem Aktivieren eines eigenen Workflows und erweiterter Blick für Workflows mit sensiblen Daten. In der Schulung als kurzer Security-Blick in Phase 4. Verwenden vor dem Aktivieren oder bei einem Security-Review.
---

# Security-Checkliste (vor dem Aktivieren)

In der Schulung reicht ein **kurzer Blick** über diese Punkte. Es geht nur um den eigenen Workflow (Name beginnt mit dem Kürzel).

## Secrets und Credentials
- [ ] Keine Schlüssel, Tokens oder Passwörter in Node-Parametern
- [ ] Alle Zugänge über die fertigen Credentials aus `CLAUDE.md`
- [ ] Keine Secrets in Code-Nodes

## Webhooks und Formulare
- [ ] Pfad mit eigenem Kürzel, zum Beispiel `anna-anfragen`, nicht erratbar (kein `/test`, kein `/webhook`)
- [ ] Authentifizierung, wenn der Webhook Daten ändert (Header Auth oder Basic Auth). „None“ nur bei harmlosen, öffentlichen Endpunkten
- [ ] Respond to Webhook vorhanden, wenn eine Antwort erwartet wird (kein hängender Aufruf)
- [ ] Test-Webhooks nach dem Test wieder entfernt

## Fehlerbehandlung
- [ ] HTTP-Request-Nodes mit sinnvoller Fehlerbehandlung (Continue on Fail oder klare Fehlermeldung)
- [ ] IF und Switch: Jeder Ausgang hat ein Ziel

## Daten und Datenschutz
- [ ] Nur Testdaten oder öffentliche Daten, keine Kundendaten, keine Gästenamen
- [ ] Keine personenbezogenen Daten in Sticky Notes oder Node-Namen
- [ ] Nur nötige Felder gehen an die KI oder an externe Dienste
- [ ] Mails nur an die eigene Adresse der Person

## Allgemein
- [ ] Name mit Kürzel, aussagekräftig
- [ ] Validierung durchgelaufen (`n8n_validate_workflow`)
- [ ] Testlauf mit inhaltlich geprüftem Ergebnis (Skill `n8n-testdaten`)

---

# Erweiterter Blick (bei sensiblen Daten)

Für Workflows, die später mit echten Daten laufen sollen, zusätzlich prüfen:

## Secrets-Scan im Workflow-JSON
- Muster wie `sk-`, `xoxb-`, `Bearer`, `token=`
- Passwörter im Klartext
- Base64-kodierte Zugangsdaten
- Adressen mit Zugangsdaten in Query-Parametern

## Webhooks
- Keine `authentication: "none"` bei Webhooks, die Daten ändern
- Sinnvolle Antwortcodes (nicht immer 200)
- Überlegung zu Missbrauch und Mengenbegrenzung

## Code-Nodes
- Kein `eval()` oder `Function()` mit Eingaben von außen
- Keine ungeprüften Eingaben in HTTP-Adressen

## Betrieb
- Error Workflow für Abläufe, die später dauerhaft laufen
- Timeout bei lang laufenden Aufrufen
- Wiederholung bei externen Diensten, wo sinnvoll

## Kein Instanz-Audit in der Schulung
Das Werkzeug `n8n_audit_instance` prüft die ganze n8n, also auch alle Workflows und Credentials von E&P. In der Schulung ist es gesperrt. Ruf es nicht auf und such keinen Umweg. Fragen zur Sicherheit der ganzen n8n gehen an Friedemann.
