# Attribution & Drittanbieter-Lizenzen

Diese Vorlage für eine Schulung zu n8n und Claude Code nutzt und bündelt Arbeit von Romuald Członkowski (n8n-mcp / n8n-skills). Vielen Dank!

## Grundlage / Inspiration
- Die Idee und Grundlage dieses Starters stammt von **snipKI**: https://snipki.de

## n8n-mcp (MCP-Server)
- Projektseite: https://github.com/czlonkowski/n8n-mcp
- Über einen **HTTP-MCP-Endpoint** angebunden (via `.mcp.json`); der Server selbst ist nicht in diesem Repo enthalten.

## Gebündelte n8n-Skills (vendored)
Die folgenden Skills unter `.claude/skills/` stammen aus dem Projekt
[`czlonkowski/n8n-skills`](https://github.com/czlonkowski/n8n-skills) und stehen unter MIT-Lizenz:

`n8n-code-javascript`, `n8n-code-python`, `n8n-expression-syntax`,
`n8n-mcp-tools-expert`, `n8n-node-configuration`, `n8n-validation-expert`,
`n8n-workflow-patterns`

**Angepasst:** In `n8n-expression-syntax`, `n8n-mcp-tools-expert` und `n8n-validation-expert` sind
kurze Abschnitte zu typischen n8n-Fallen ergänzt. `n8n-mcp-tools-expert` (`SKILL.md` und
`WORKFLOW_GUIDE.md`) trägt zusätzlich einen Hinweis auf die Werkzeuge, die in der Schulung gesperrt sind.
Die übrigen Dateien sind unverändert.

**Update:** Diese Skills sind ein Snapshot. Aktuelle Version bei Bedarf aus
`czlonkowski/n8n-skills` (`skills/*`) nachziehen.

```
MIT License

Copyright (c) 2025 Romuald Członkowski (https://www.aiadvisors.pl/en)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND.
```

## grill-me (Skill)
Der Skill `.claude/skills/grill-me/` ist **adaptiert** von
[mattpocock/skills](https://github.com/mattpocock/skills) (`grilling` + `grill-me`),
MIT-Lizenz, © Matt Pocock.

## Eigene Skills & Code
Alle übrigen Skills (`idee-klaeren`, `schulungs-dienste`, `n8n-dokumentation`, `n8n-testdaten`,
`n8n-security-audit`, `frontend-build`, `frontend-scaffold` sowie die Themen-Skills
`mail-triage-entwuerfe`, `bericht-zeitgesteuert`, `daten-visualisieren` und `meetingnotizen`),
die Beispiele unter `examples/workflows/` und `frontend-starter/` stehen unter der MIT-Lizenz
dieses Repos (siehe `LICENSE`).

## Bewusst nicht enthalten
Die Office-Skills von Anthropic (`pptx`, `docx`, `xlsx` aus
[anthropics/skills](https://github.com/anthropics/skills)) stehen unter einer proprietären
Lizenz. Sie sind in dieser Vorlage weder kopiert noch als Grundlage für eigene Skills verwendet.
