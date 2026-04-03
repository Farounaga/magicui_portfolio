import { Logo } from "@/components/logo";
import { ModeToggle } from "@/components/mode-toggle";
import Link from "next/link";

export function Header() {
  return (
    <header className="fixed left-0 top-0 z-50 flex w-full justify-center px-3 text-foreground md:px-12">
      <div className="container flex h-16 items-center justify-between gap-2 md:gap-4">
        <Link className="inline-flex items-center gap-1" href="/">
          <Logo />
        </Link>

        <div className="inline-flex items-center gap-2">
          <div className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500"></span>
            <span className="relative inline-flex rounded-full size-full bg-emerald-300"></span>
          </div>
          <div className="hidden text-xs font-medium text-muted-foreground sm:block">
            Available for projects
          </div>
        </div>
        <ModeToggle />
      </div>
    </header>
  );
}
