import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { EpKopf } from "@/components/EpKopf";
import { EpFuss } from "@/components/EpFuss";
import { APP_BESCHREIBUNG, APP_TITEL } from "@/lib/app";

// Hausschrift von ep-reisen.de (Lato, freie Lizenz OFL). Die Dateien liegen im Projekt,
// damit der Build ohne Internet klappt. Lato hat keine Stärke 600, font-semibold erscheint fett.
const lato = localFont({
  src: [
    { path: "./fonts/lato-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/lato-700.woff2", weight: "700", style: "normal" },
    { path: "./fonts/lato-900.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-lato",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${APP_TITEL} · E&P Reisen`,
  description: APP_BESCHREIBUNG,
  robots: { index: false, follow: false },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

// E&P-Layout für jede Seite: Kopf mit Logo, Inhalt, Fuß. Seiten liefern nur ihren Inhalt, kein eigenes <main>.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={lato.variable}>
      <body className="flex min-h-screen flex-col bg-ground text-ink">
        <a href="#inhalt" className="skip-link">
          Zum Inhalt springen
        </a>
        <EpKopf />
        <main id="inhalt" className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
          {children}
        </main>
        <EpFuss />
      </body>
    </html>
  );
}
