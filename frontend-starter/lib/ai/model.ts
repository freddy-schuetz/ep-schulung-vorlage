// Muster C: Provider und Modell an einer Stelle.
// Der Standard-Provider liest ANTHROPIC_API_KEY aus der Umgebung.
import { anthropic } from "@ai-sdk/anthropic";

// Ein günstiges Modell, weil jeder Aufruf Geld kostet (Claude Sonnet 5: 2 $ Input / 10 $ Output pro 1 Mio. Tokens).
export const getModel = () => anthropic("claude-sonnet-5");
