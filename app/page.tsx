import { Hero } from "@/sections/hero";
import { Services } from "@/sections/services";
import { Presentation } from "@/sections/presentation";
import { Education } from "@/sections/education";
import { Experience } from "@/sections/experience";
import { SkillsCertifications } from "@/sections/skills-certifications";
import { Realisations } from "@/sections/realisations";
import { Veille } from "@/sections/veille";
import { Contact } from "@/sections/contact";
import ReactLenis from "lenis/react";

export default function Home() {
  return (
    <ReactLenis root>
      <section id="hero">
        <Hero />
      </section>

      <section id="services">
        <Services />
      </section>

      <section id="presentation-section">
        <Presentation />
      </section>

      <section id="etudes-section">
        <Education />
      </section>

      <section id="experience-section">
        <Experience />
      </section>

      <section id="competences-section">
        <SkillsCertifications />
      </section>

      <section id="realisations-section">
        <Realisations />
      </section>

      <section id="veille-section">
        <Veille />
      </section>

      <section id="contact-section">
        <Contact />
      </section>
    </ReactLenis>
  );
}
