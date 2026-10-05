# Tabellen in der Schulung

## Auf einen Blick

- Für deinen Workflow reichen fast immer **n8n Data Tables**. Sie sind in n8n eingebaut und brauchen kein Credential.
- Deine Tabelle beginnt mit deinem Kürzel, zum Beispiel `anna_anfragen`.
- Halte sie klein: wenige Testzeilen, keine Dateien, keine langen Texte.
- NocoDB und Supabase sind Zusatzbausteine (P2). Es gibt sie nur, wenn Friedemann sie freigeschaltet hat.

## n8n Data Tables

- Anlegen, lesen, schreiben und ändern im Workflow mit dem Node „Data Table“ oder von Claude mit `n8n_manage_datatable`.
- Gut für: Nachschlagelisten, Status merken, kleine Listen, doppelte Einträge erkennen, Protokolle.
- Sag zum Beispiel: „Leg eine Data Table `anna_anfragen` mit den Spalten name, anliegen und status an und schreib im Workflow neue Einträge hinein.“

**Wichtig in der E&P-n8n:**

- Alle Tabellen teilen sich das Speicherlimit der Produktion. Ist es voll, scheitert jeder Schreibzugriff, auch in den echten Abläufen von E&P. Deshalb bleibt deine Tabelle klein.
- Fremde Tabellen liest und änderst du nicht. Dort können echte Daten stehen.
- Du löschst keine Tabelle und keine Zeile. Alte Testzeilen markierst du mit einer Spalte `status` = `ALT`.
- Spalten einer bestehenden Tabelle lassen sich über diese Verbindung nicht nachträglich ändern. Plan die Spalten also vorher. Im n8n-Editor geht es von Hand.

**Zwei stille Fallen:**

- Der Node „Data Table“ liefert beim Lesen ohne „Return All“ nur 50 Zeilen, auch wenn `limit` höher steht. Er meldet dabei keinen Fehler. Prüf die Zeilenzahl im Ergebnis gegen die Tabelle.
- Liefert eine Abfrage 0 Zeilen, laufen die folgenden Schritte nicht. Wer ein leeres Ergebnis erwartet, schaltet am Node „Always Output Data“ ein und prüft danach mit einem IF-Node.

## P2: NocoDB

Nur nutzbar, wenn in der Tabelle der Zugänge in `CLAUDE.md` beim Credential „Schulung NocoDB“ eine ID steht.

- NocoDB zeigt Tabellen in einer Oberfläche im Browser: https://nocodb.friedemannschuetz.de
- In n8n nutzt du den Node „NocoDB“ mit dem Credential „Schulung NocoDB“. Du legst kein eigenes Credential an.
- Auch hier: eigene Tabelle mit Kürzel, nur Testdaten.

## P2: Supabase mit Vektorsuche

Nur nutzbar, wenn in der Tabelle der Zugänge in `CLAUDE.md` beim Credential „Schulung Supabase“ eine ID steht.

- Supabase ist eine Datenbank: https://supabase.friedemannschuetz.de
- Bereit liegt die Tabelle `documents` mit Vektorsuche (Funktion `match_documents`, Spalte `embedding` mit 1536 Zahlen, passend zu `text-embedding-3-small` von OpenAI).
- So geht eine kleine Wissensbasis: Formular → Node „Supabase Vector Store“ (Modus Insert Documents, Tabelle `documents`, Option `queryName: match_documents`) mit „Default Data Loader“ und „Embeddings OpenAI“. Fragen stellst du über einen KI-Agent, an dem derselbe Vector Store als Tool hängt. Beispiel: `examples/workflows/wissensbasis-supabase.json`.
- Alle teilen sich die Tabelle `documents`. Schreib dein Kürzel in die Metadaten und filtere beim Suchen darauf.
- Das Credential nutzt den `service_role`-Schlüssel. Es bleibt in n8n. Eine Oberfläche spricht Supabase nicht direkt an, sondern ruft deinen n8n-Webhook auf.

## Faustregel

Workflow braucht eine Tabelle: **Data Table** mit Kürzel. NocoDB und Supabase nur, wenn sie freigeschaltet sind und die Idee sie wirklich braucht.
