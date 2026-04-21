"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, MouseOff, MousePointer2, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";

const NAV_LINKS = [
  { id: "presentation", label: "Présentation", href: "#presentation" },
  { id: "parcours-competences", label: "Parcours & compétences", href: "#etudes-section" },
  { id: "realisations", label: "Réalisations", href: "#realisations" },
  { id: "preuves", label: "Preuves & illustrations", href: "#preuves-illustrations" },
  { id: "veille", label: "Veille", href: "#veille-technologique" },
  { id: "contact", label: "Contact", href: "#contact" },
] as const;

const EXTERNAL_LINKS = [
  { id: "github", label: "GitHub", href: "https://github.com/Farounaga" },
  { id: "campus", label: "Campus Ermitage", href: "https://campusermitage.fr/" },
] as const;

const CURSOR_TRAIL_STORAGE_KEY = "vs_cursor_trail_enabled";
const CURSOR_TRAIL_EVENT = "vs-cursor-trail-toggle";

export function Header() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [cursorTrailEnabled, setCursorTrailEnabled] = React.useState(true);

  const toggleCursorTrail = React.useCallback(() => {
    const next = !cursorTrailEnabled;
    setCursorTrailEnabled(next);

    try {
      window.localStorage.setItem(CURSOR_TRAIL_STORAGE_KEY, next ? "true" : "false");
    } catch {
      // ignore storage write issues
    }

    window.dispatchEvent(
      new CustomEvent(CURSOR_TRAIL_EVENT, {
        detail: { enabled: next },
      }),
    );
  }, [cursorTrailEnabled]);

  React.useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    };

    try {
      const stored = window.localStorage.getItem(CURSOR_TRAIL_STORAGE_KEY);
      if (stored === "false") {
        setCursorTrailEnabled(false);
      }
      if (stored === "true") {
        setCursorTrailEnabled(true);
      }
    } catch {
      // ignore storage read issues
    }

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className="fixed left-0 top-0 z-50 flex w-full justify-center px-3 pt-3 text-foreground md:px-6">
      <div className="relative w-full max-w-[1220px]">
        <div className="relative overflow-visible rounded-2xl border border-border/60 bg-background/78 shadow-[0_18px_50px_-28px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_220px_at_50%_-160px,rgba(16,185,129,0.18),transparent_60%)]"
          />

          <div className="relative flex h-16 items-center justify-between gap-2 px-3 md:gap-4 md:px-4">
          <Link className="inline-flex items-center gap-1 rounded-xl border border-border/55 bg-background/75 px-2.5 py-1.5 shadow-sm" href="/">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 text-[0.84rem] font-medium tracking-[0.06em] text-muted-foreground lg:flex">
            {NAV_LINKS.map((item) => (
              <a
                key={item.id}
                href={item.href}
                className="whitespace-nowrap rounded-full border border-transparent px-2.5 py-1.5 transition-colors hover:border-border/65 hover:bg-muted/60 hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
            <a
              href={EXTERNAL_LINKS[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className="whitespace-nowrap rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1.5 text-emerald-500 transition-colors hover:bg-emerald-500/16 hover:text-emerald-400"
            >
              {EXTERNAL_LINKS[0].label}
            </a>
          </nav>

          <div className="inline-flex items-center gap-2 md:gap-3">
            <div className="relative hidden size-2 sm:flex">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
              <span className="relative inline-flex size-full rounded-full bg-emerald-300" />
            </div>

            <div className="hidden whitespace-nowrap text-xs font-medium text-muted-foreground xl:block">
              Disponible pour des projets
            </div>

            <button
              type="button"
              onClick={toggleCursorTrail}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border transition-colors ${
                cursorTrailEnabled
                  ? "border-emerald-500/45 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/16"
                  : "border-border/60 bg-background/75 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
              aria-label={cursorTrailEnabled ? "Désactiver la traînée de souris" : "Activer la traînée de souris"}
              aria-pressed={cursorTrailEnabled}
              title={cursorTrailEnabled ? "Traînée souris: activée" : "Traînée souris: désactivée"}
            >
              {cursorTrailEnabled ? <MousePointer2 className="h-4 w-4" /> : <MouseOff className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-xl border border-border/60 bg-background/75 p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground lg:hidden"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-main-menu"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>

            <ModeToggle />
          </div>
          </div>

          {menuOpen ? (
            <div id="mobile-main-menu" className="border-t border-border/45 bg-background/92 px-3 py-4 backdrop-blur-xl lg:hidden">
              <nav className="grid gap-2 text-sm uppercase tracking-[0.14em] text-foreground/90">
              {NAV_LINKS.map((item) => (
                <a
                  key={`mobile-${item.id}`}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl border border-border/55 bg-background/70 px-3 py-2 hover:text-emerald-400"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            <div className="mt-4 flex flex-wrap gap-4 text-xs uppercase tracking-[0.14em]">
              {EXTERNAL_LINKS.map((item) => (
                <a
                  key={`mobile-external-${item.id}`}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-3 py-1.5 text-emerald-500 hover:text-emerald-400"
                >
                  {item.label}
                </a>
              ))}
            </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
