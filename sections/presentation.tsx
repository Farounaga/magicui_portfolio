"use client";

import { motion } from "motion/react";
import { ScrambleText } from "@/components/effects/scramble-text";
import { RevealText } from "@/components/effects/reveal-text";
import { DancingLetters } from "@/components/effects/dancing-letters";
import { ArrowUpRight } from "lucide-react";

const SYADEM_TOOLS = [
  "SIV (systèmes d'information vaccinale)",
  "NUVA (terminologie internationale des vaccins)",
  "SADV / Mentor (aide à la décision vaccinale)",
  "CVN (carnet de vaccination numérique)",
  "Colibri (gestion des centres de vaccination)",
];

const SYADEM_STATS = [
  "3M+ carnets créés",
  "9M+ actes vaccinaux enregistrés",
  "40 000+ utilisateurs professionnels",
  "200+ centres équipés",
];

export function Presentation() {
  return (
    <section id="presentation" className="relative overflow-hidden px-6 py-20 md:px-10 lg:px-14">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,hsl(160_80%_55%/.14),transparent_45%)]" />

      <div className="mx-auto max-w-6xl space-y-16">
        <header className="space-y-5">
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-400">01 · Presentation</p>
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">
            <ScrambleText text="Presentation" />
          </h2>
          <p className="max-w-3xl text-lg text-foreground/85">
            <RevealText text="Je m'appelle Vladimir Spirine, étudiant en BTS SIO SLAM en alternance et passionné par les systèmes, le développement et l'impact concret du numérique dans la santé." />
          </p>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            <DancingLetters text="Build · Support · Automate · Explain" />
          </p>
        </header>

        <article id="formation" className="grid gap-8 border-t border-border/60 pt-8 md:grid-cols-[180px_1fr]">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Presentation de la formation</p>
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold uppercase tracking-tight md:text-3xl">BTS SIO</h3>
            <p className="text-foreground/85 leading-relaxed">
              Le BTS SIO est une formation en informatique orientée vers les métiers des services numériques en
              entreprise. Elle donne une base solide en développement, administration, support et gestion des
              systèmes d'information.
            </p>
            <p className="text-foreground/85 leading-relaxed">
              Deux spécialités structurent le parcours: <strong>SLAM</strong> (développement d'applications, bases de
              données, logiciels métiers) et <strong>SISR</strong> (réseaux, serveurs, cybersécurité et administration
              système).
            </p>
          </div>
        </article>

        <article id="etablissement" className="grid gap-8 border-t border-border/60 pt-8 md:grid-cols-[180px_1fr]">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Presentation de l'etablissement</p>
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold uppercase tracking-tight md:text-3xl">Campus Ermitage</h3>
            <p className="text-foreground/85 leading-relaxed">
              Le Campus Ermitage, situe a Agen, propose plusieurs formations post-bac en alternance dont
              l'informatique. L'ecole met l'accent sur l'accompagnement, la professionnalisation et le lien direct
              entre theorie et experience en entreprise.
            </p>
          </div>
        </article>

        <article id="entreprise" className="grid gap-8 border-t border-border/60 pt-8 md:grid-cols-[180px_1fr]">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Presentation de l'entreprise</p>
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold uppercase tracking-tight md:text-3xl">SYADEM</h3>
            <p className="text-foreground/85 leading-relaxed">
              SYADEM est un editeur francais de logiciels medicaux specialise dans la vaccination et la prevention.
              L'entreprise combine expertise technique et medicale pour produire des outils fiables, interopérables
              et alignes sur les recommandations officielles.
            </p>

            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.4 }}
              transition={{ staggerChildren: 0.08 }}
              className="grid gap-3"
            >
              {SYADEM_TOOLS.map((item) => (
                <motion.li
                  key={item}
                  variants={{ hidden: { opacity: 0, x: -16 }, visible: { opacity: 1, x: 0 } }}
                  className="flex items-start gap-3 text-foreground/90"
                >
                  <span className="mt-1 h-2 w-2 shrink-0 bg-emerald-400" />
                  <span>{item}</span>
                </motion.li>
              ))}
            </motion.ul>

            <div className="flex flex-wrap gap-x-8 gap-y-2 border-t border-border/60 pt-5 text-sm uppercase tracking-[0.15em] text-muted-foreground">
              {SYADEM_STATS.map((stat) => (
                <span key={stat}>{stat}</span>
              ))}
            </div>

            <a
              href="https://www.syadem.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-emerald-400 hover:text-emerald-300"
            >
              Visiter syadem.com
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
