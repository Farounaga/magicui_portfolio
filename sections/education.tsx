"use client";

import { motion } from "motion/react";
import { ScrambleText } from "@/components/effects/scramble-text";
import { RevealText } from "@/components/effects/reveal-text";

const EDUCATION_ITEMS = [
  {
    id: "edu-bts-sio",
    period: "2024 - 2026",
    title: "BTS SIO - Option SLAM",
    place: "Campus Ermitage, Agen",
    description:
      "Specialisation en developpement logiciel, bases de donnees et solutions metier avec une approche orientee entreprise.",
    focus: ["Programmation", "Conception logicielle", "SQL et modelisation", "Documentation et tests"],
  },
  {
    id: "edu-bts-ci",
    period: "2016 - 2018",
    title: "BTS Commerce International",
    place: "Lycee Commercial Saint Pierre, Brunoy",
    description:
      "Formation en communication professionnelle, negociation et contextes internationaux.",
    focus: ["Anglais avance", "Espagnol intermediaire", "Communication"],
  },
  {
    id: "edu-bac",
    period: "2015 - 2016",
    title: "Baccalaureat Scientifique (SVT)",
    place: "Lycee Saint Francois de Sales, Evreux",
    description:
      "Base scientifique et methodologique solide: rigueur, logique et demarche experimentale.",
    focus: ["Rigueur", "Analyse", "Methodologie"],
  },
];

export function Education() {
  return (
    <section id="parcours-etudes" className="px-6 py-20 md:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="space-y-4 border-t border-border/60 pt-8">
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-400">02 · Parcours & Competences</p>
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">
            <ScrambleText text="Parcours d'etudes" />
          </h2>
          <p className="max-w-3xl text-foreground/85 leading-relaxed">
            <RevealText text="Un parcours qui relie sciences, langues, commerce et informatique appliquee en contexte reel." />
          </p>
        </header>

        <div className="space-y-10">
          {EDUCATION_ITEMS.map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              className="grid gap-5 border-b border-border/45 pb-9 md:grid-cols-[150px_1fr]"
            >
              <p className="text-sm font-medium uppercase tracking-[0.16em] text-muted-foreground">{item.period}</p>
              <div className="space-y-3">
                <h3 className="text-2xl font-semibold tracking-tight">{item.title}</h3>
                <p className="text-sm uppercase tracking-[0.14em] text-foreground/75">{item.place}</p>
                <p className="text-foreground/85 leading-relaxed">{item.description}</p>
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                  {item.focus.map((focus) => (
                    <span key={focus}>{focus}</span>
                  ))}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
