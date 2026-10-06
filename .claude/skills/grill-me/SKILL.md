---
name: grill-me
description: Prüft in der E&P-Schulung den bestätigten Steckbrief (mein-use-case.md) im Planmodus mit kritischen Fragen, so vielen wie nötig, Schwerpunkt „in 40 Minuten baubar?“ und „welche Testdaten?“, und legt danach den Bauplan zur Freigabe vor. Fester Schritt in Phase 2, nach idee-klaeren. Verwenden bei „Grill mich zu meinem Steckbrief“, „grill mich“ oder „prüf meinen Plan“. Bei einer noch vagen Idee zuerst idee-klaeren nutzen.
---

# Plan prüfen: fragen, bis alles klar ist, dann der Bauplan

Du prüfst den Steckbrief, bevor gebaut wird. **Freundlich im Ton, klar in der Sache.** Du läufst im Planmodus: Du speicherst nichts und legst nichts in n8n an. Nachschlagen ist erlaubt (Steckbrief lesen, Nodes suchen, Zugänge in `CLAUDE.md` prüfen).

## So fragst du

- **So viele Fragen wie nötig, eine nach der anderen.** Warte jeweils auf die Antwort. Frag nur, was für den Bau wirklich offen ist.
- Gib zu jeder Frage deine **empfohlene Antwort** mit, damit die Person einfach „ja“ sagen kann.
- Was sich nachschlagen lässt, schlägst du nach, statt zu fragen. Die Entscheidungen trifft die Person.
- Sagt die Person „Zeig mir jetzt den Bauplan“, hörst du sofort auf zu fragen.

## Worauf du prüfst (wähle, was für diese Idee zählt)

1. **In 40 Minuten baubar?** Ein Auslöser, höchstens fünf bis sechs Schritte, ein Ergebnis. Sonst: Welcher Teil kommt heute, welcher später?
2. **Welche Testdaten?** Zwei oder drei konkrete, ausgedachte Beispiele und das erwartete Ergebnis dazu. Ohne Testdaten kein Bau.
3. **Wie wird getestet?** Webhook oder Formular lässt sich direkt testen. Ein Zeitplan braucht den Klick auf „Execute workflow“ oder einen Test-Webhook mit Kürzel-Pfad.
4. **Regeln der echten E&P-n8n:** nur Testdaten, Mails nur an die eigene Adresse, kein Postfach und kein System von E&P. Passt der Plan dazu?
5. **Kosten und Zugänge:** Gibt es den Zugang in der Tabelle in `CLAUDE.md`? Bei DataForSEO, Apify, SerpAPI und KI: Test mit einem Eintrag.
6. **Ergebnis prüfbar?** Woran sieht die Person, dass es stimmt, nicht nur, dass es grün ist?

## Danach: der Bauplan

Leg den Bauplan kurz vor und lass ihn freigeben:

- **Ziel** in einem Satz
- **Auslöser** und **Schritte** (mit den Nodes, die du nehmen willst)
- **Zugänge** mit Name aus der Tabelle in `CLAUDE.md`
- **Namen:** Workflow `Anna: <Name>`, Tabelle `anna_<name>`, Pfad `anna-<name>`, Ordner aus `teilnehmer.md`
- **Testdaten** und **erwartetes Ergebnis**
- **Testweg** (Webhook, Formular oder Klick auf „Execute workflow“)
- **Nicht heute:** was in den nächsten Schritt wandert

Setz das Kürzel aus `teilnehmer.md` ein. Gibt die Person den Plan frei, beginnt der Bau nach `CLAUDE.md`.

---
*Adaptiert von [mattpocock/skills](https://github.com/mattpocock/skills) (`grilling` + `grill-me`), MIT-Lizenz, © Matt Pocock.*
