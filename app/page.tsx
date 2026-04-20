import { Hero } from "@/sections/hero";
import { Services } from "@/sections/services";
import { Presentation } from "@/sections/presentation";
import { Education } from "@/sections/education";
import { Experience } from "@/sections/experience";
import { SkillsCertifications } from "@/sections/skills-certifications";
import { Realisations } from "@/sections/realisations";
import { Evidence } from "@/sections/evidence";
import { Veille } from "@/sections/veille";
import { Contact } from "@/sections/contact";
import ReactLenis from "lenis/react";
import type { ReactNode } from "react";

function ReadableSection({ id, children }: { id: string; children: ReactNode }) {
  return (
    <section id={id} className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/78 via-background/64 to-background/76 backdrop-blur-[1.4px]"
      />
      <div className="relative z-10">{children}</div>
    </section>
  );
}

export default function Home() {
  return (
    <ReactLenis root>
      <section id="hero">
        <Hero />
      </section>

      <section id="services">
        <Services />
      </section>

      <ReadableSection id="presentation-section">
        <Presentation />
      </ReadableSection>

      <ReadableSection id="etudes-section">
        <Education />
      </ReadableSection>

      <ReadableSection id="experience-section">
        <Experience />
      </ReadableSection>

      <ReadableSection id="competences-section">
        <SkillsCertifications />
      </ReadableSection>

      <ReadableSection id="realisations-section">
        <Realisations />
      </ReadableSection>

      <ReadableSection id="preuves-section">
        <Evidence />
      </ReadableSection>

      <ReadableSection id="veille-section">
        <Veille />
      </ReadableSection>

      <ReadableSection id="contact-section">
        <Contact />
      </ReadableSection>
    </ReactLenis>
  );
}
