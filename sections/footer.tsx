import { MarqueeContainer } from "@/components/marquee-container";

const SOCIAL_LINKS = [
  {
    id: "social-link-github",
    label: "Github",
    link: "https://github.com/Farounaga",
  },
  {
    id: "social-link-linkedin",
    label: "LinkedIn",
    link: "https://www.linkedin.com/in/vladimir-spirine-184069173",
  },
];

export function Footer() {
  return (
    <footer className="px-6 pb-10 pt-16 md:px-10 lg:px-14">
      <MarqueeContainer baseVelocity={1.6}>
        <h2 className="mx-2 text-3xl font-bold uppercase tracking-tight text-muted-foreground md:text-5xl">
          Disponible pour alternance · Support & Developpement
        </h2>
      </MarqueeContainer>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-6 border-t border-border/60 pt-6">
        <div className="space-y-2">
          <a href="mailto:7h16ciolq@mozmail.com" className="text-lg font-semibold tracking-tight hover:text-emerald-400">
            7h16ciolq@mozmail.com
          </a>
          <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Bordeaux · France</p>
        </div>

        <nav className="flex flex-wrap gap-6 text-sm uppercase tracking-[0.16em]">
          {SOCIAL_LINKS.map((socialLink) => (
            <a key={socialLink.id} href={socialLink.link} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              {socialLink.label}
            </a>
          ))}
        </nav>
      </div>

      <p className="mt-6 text-right text-xs uppercase tracking-[0.14em] text-muted-foreground">
        © 2026 Vladimir Spirine
      </p>
    </footer>
  );
}
