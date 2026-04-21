"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";

const NAV_LINKS = [
  { id: "presentation", label: "Présentation", href: "#presentation" },
  { id: "realisations", label: "Réalisations", href: "#realisations" },
  { id: "preuves", label: "Preuves", href: "#preuves-illustrations" },
  { id: "veille", label: "Veille", href: "#veille-technologique" },
  { id: "contact", label: "Contact", href: "#contact" },
] as const;

const EXTERNAL_LINKS = [
  { id: "github", label: "GitHub", href: "https://github.com/Farounaga" },
  { id: "campus", label: "Campus Ermitage", href: "https://campusermitage.fr/" },
] as const;

export function Header() {
  const [menuOpen, setMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 1024) {
        setMenuOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header className="fixed left-0 top-0 z-50 flex w-full justify-center px-3 text-foreground md:px-10">
      <div className="container relative border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="flex h-20 items-center justify-between gap-2 md:h-22 md:gap-5">
          <Link className="inline-flex items-center gap-1" href="/">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-7 text-sm uppercase tracking-[0.12em] text-muted-foreground lg:flex">
            {NAV_LINKS.map((item) => (
              <a key={item.id} href={item.href} className="hover:text-foreground">
                {item.label}
              </a>
            ))}
            <a
              href={EXTERNAL_LINKS[0].href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500 hover:text-emerald-400"
            >
              {EXTERNAL_LINKS[0].label}
            </a>
          </nav>

          <div className="inline-flex items-center gap-2 md:gap-3">
            <div className="relative hidden size-2 sm:flex">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
              <span className="relative inline-flex size-full rounded-full bg-emerald-300" />
            </div>

            <div className="hidden text-sm font-medium text-muted-foreground sm:block">
              Disponible pour des projets
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="inline-flex items-center justify-center border border-border/60 p-2 text-muted-foreground hover:text-foreground lg:hidden"
              aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-main-menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <ModeToggle />
          </div>
        </div>

        {menuOpen ? (
          <div id="mobile-main-menu" className="border-t border-border/50 bg-background/95 px-3 py-4 lg:hidden">
            <nav className="grid gap-3 text-sm uppercase tracking-[0.14em] text-foreground/90">
              {NAV_LINKS.map((item) => (
                <a
                  key={`mobile-${item.id}`}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="border-b border-border/40 pb-2 hover:text-emerald-400"
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
                  className="text-emerald-500 hover:text-emerald-400"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
