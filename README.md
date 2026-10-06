# Dein erster eigener Workflow

Dein Projekt für die Schulung bei E&P Reisen. Hier liegen deine Ergebnisse: dein Steckbrief und dein fertiger Workflow.

## Auf einen Blick

- **Was du baust:** einen Ablauf in n8n, der dir eine wiederkehrende Aufgabe abnimmt.
- **Womit:** mit Claude im Browser. Du installierst nichts.
- **Wie:** in vier Schritten. Idee klären, Plan prüfen, bauen und testen, fertig machen.
- **Wann er fertig ist:** wenn er einmal mit Testdaten durchläuft und das Ergebnis stimmt.
- **Hilfe:** Friedemann ist im Raum.

## So startest du

1. Öffne dein Projekt über den Knopf mit deinem Namen auf der Schulungsseite friedemannschuetz.de.
2. Schreib die erste Nachricht: **KUERZEL: Los geht's**
3. Claude begrüßt dich und prüft die Verbindung. Steht da „Deine n8n ist verbunden“, passt alles.
4. Schreib: **Hilf mir, meine Idee zu klären.** Claude stellt dir Fragen, immer eine nach der anderen. Am Ende steht dein Steckbrief.
5. Stell neben dem Eingabefeld auf **Plan** und schreib: **Grill mich zu meinem Steckbrief.** Claude stellt so viele Fragen wie nötig und zeigt dir dann den Bauplan.
6. Passt der Plan, gibst du ihn frei. Claude baut deinen Ablauf in n8n und testet ihn mit Testdaten.
7. Schau dir das Ergebnis an. Passt etwas nicht, sag es in normalen Worten.

Klemmt etwas? Schreib einfach: **ich hänge**.

## Dein Kürzel

Dein Kürzel ist dein Vorname: **KUERZEL**. Es steht auch in der Datei `teilnehmer.md`. Alles, was du in n8n baust, trägt es im Namen:

- Ablauf (Workflow): `KUERZEL: Anfragen sortieren`
- Tabelle: `KLEIN_anfragen`
- Adresse für Webhook oder Formular: `KLEIN-anfragen`
- Ordner in n8n: `KUERZEL`, im Ordner „KI-Schulung“

## Deine Regeln

Das ist die echte n8n von E&P. Dort laufen Abläufe, die der Betrieb jeden Tag braucht. Deshalb gilt:

1. Du baust nur Neues mit deinem Kürzel. Fremde Abläufe siehst du, aber du änderst sie nie.
2. Du löschst nichts und änderst keine Zugänge und keine Einstellungen.
3. Nur Testdaten: keine Kundendaten, keine Namen von Gästen, keine Buchungen.
4. Mails aus deinem Ablauf gehen nur an dich selbst.

Claude kennt diese Regeln und hält sich daran. Fragt Claude um Erlaubnis für einen Schritt, darfst du zustimmen, solange es um deinen eigenen Ablauf geht. Soll etwas gelöscht werden, frag vorher Friedemann.

## Was hier liegt

- `mein-use-case.md`: dein Steckbrief (legt Claude an)
- `workflows/`: dein fertiger Ablauf als Datei (legt Claude an)
- `docs/ideen.md`: Ideen zum Stöbern
- `CLAUDE.md` und `.claude/`: Regeln und Wissen für Claude. Daran änderst du nichts.
