#!/usr/bin/env node
// PostToolUse Hook: Protokolliert Workflow-Änderungen (Create/Update) nach backup/
//
// Hinweis: Dieser Hook loggt die Tool-Inputs (Intent, Operations etc.) und das Tool-Ergebnis als Kontext.
// backup/ steht in .gitignore und verschwindet in claude.ai/code mit dem Sitzungs-Container.
// Dauerhaft gesichert ist nur, was unter workflows/ committet ist (Workflow-JSON per n8n_get_workflow).

const fs = require("fs");
const path = require("path");

const BACKUP_TOOLS = [
  "mcp__n8n-mcp__n8n_create_workflow",
  "mcp__n8n-mcp__n8n_update_partial_workflow",
  "mcp__n8n-mcp__n8n_update_full_workflow"
];

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", () => {
  try {
    const data = JSON.parse(input);
    const toolName = data.tool_name || "";
    const toolInput = data.tool_input || {};
    // Claude Code liefert bei PostToolUse das Ergebnis als tool_response (tool_result nur als Rückfall).
    const toolResult = data.tool_response || data.tool_result || {};
    const cwd = data.cwd || process.cwd();

    if (!BACKUP_TOOLS.includes(toolName)) {
      process.exit(0);
    }

    const workflowId = toolInput.id || "new";
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const action = toolName.replace("mcp__n8n-mcp__", "");

    const backupDir = path.join(cwd, "backup", "workflow-changes");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const backupFile = path.join(backupDir, `${timestamp}_${action}_${workflowId}.json`);
    const backupData = {
      timestamp: new Date().toISOString(),
      action,
      workflowId,
      intent: toolInput.intent || null,
      toolInput,
      toolResult: typeof toolResult === "string" ? toolResult.slice(0, 2000) : toolResult
    };

    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2), "utf8");
  } catch {
    // Backup-Fehler sollen den Workflow nicht blockieren
  }

  process.exit(0);
});
