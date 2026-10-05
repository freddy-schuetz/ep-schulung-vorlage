import Link from "next/link";
import { APP_TITEL } from "@/lib/app";

/**
 * Kopf im E&P-Layout wie auf ep-reisen.de: weiße Leiste mit dem E&P-Logo (nur auf hellem Grund),
 * daneben ein Strich und der Name der Oberfläche aus lib/app.ts. Darunter ein tiefblauer Balken.
 * Gehört zum festen Layout, bitte nicht umbauen.
 */
export function EpKopf() {
  return (
    <header>
      <div className="border-b border-hairline bg-surface">
        <div className="mx-auto flex max-w-5xl items-center px-4 py-3 sm:px-6 sm:py-4">
          <Link href="/" className="flex items-center gap-3 no-underline">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/ep-logo.svg"
              alt="E&P Reisen & Events"
              width={157}
              height={48}
              className="h-9 w-auto sm:h-12"
              loading="eager"
            />
            <span className="border-l border-hairline pl-3 text-sm font-black uppercase tracking-wide text-accent">
              {APP_TITEL}
            </span>
          </Link>
        </div>
      </div>
      <div className="h-2 bg-accent" aria-hidden="true" />
    </header>
  );
}
