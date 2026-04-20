"use client";

import { motion } from "motion/react";
import { HeadingWaveText } from "@/components/effects/heading-wave-text";
import { RevealText } from "@/components/effects/reveal-text";

const EDUCATION_ITEMS = [
  {
    id: "edu-bts-sio",
    period: "2024 - 2026",
    title: "BTS SIO - Option SLAM",
    place: "Campus Ermitage, Agen",
    description:
      "Spécialisation en développement logiciel, bases de données et solutions métier, avec une approche orientée entreprise et alternance.",
    focus: ["Programmation", "Conception logicielle", "SQL et modélisation", "Documentation et tests"],
  },
  {
    id: "edu-bts-ci",
    period: "2016 - 2018",
    title: "BTS Commerce International",
    place: "Lycée Commercial Saint-Pierre, Brunoy",
    description:
      "Formation en communication professionnelle, négociation et contextes internationaux.",
    focus: ["Anglais avancé", "Espagnol intermédiaire", "Communication"],
  },
  {
    id: "edu-bac",
    period: "2015 - 2016",
    title: "Baccalauréat Scientifique (SVT)",
    place: "Lycée Saint-François-de-Sales, Évreux",
    description:
      "Base scientifique et méthodologique solide : rigueur, logique et démarche expérimentale.",
    focus: ["Rigueur", "Analyse", "Méthodologie"],
  },
];

export function Education() {
  return (
    <section id="parcours-etudes" className="px-6 py-20 md:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="space-y-4 border-t border-border/60 pt-8">
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-400">02 · Parcours & Compétences</p>
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">
            <HeadingWaveText>Parcours d'études</HeadingWaveText>
          </h2>
          <p className="max-w-3xl text-foreground/85 leading-relaxed">
            <RevealText text="Un parcours qui relie sciences, langues, commerce et informatique appliquée en contexte réel." />
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
