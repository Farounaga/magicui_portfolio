"use client";

import * as React from "react";
import { motion, useScroll, useSpring } from "motion/react";
import { StethoscopeIcon } from "@/components/ui/stethoscope";
import { CartIcon } from "@/components/ui/cart";
import { WrenchIcon } from "@/components/ui/wrench";
import { UserIcon } from "@/components/ui/user";
import { EarthIcon } from "@/components/ui/earth";
import { AirplaneIcon } from "@/components/ui/airplane";
import { ScrambleText } from "@/components/effects/scramble-text";
import { RevealText } from "@/components/effects/reveal-text";

const EXPERIENCE_HISTORY = [
  {
    id: "experience-syadem",
    company: "Syadem",
    title: "Technicien Support - Apprenti BTS SIO SLAM",
    period: "Novembre 2024 - Aujourd'hui",
    location: "Bordeaux, France",
    icon: StethoscopeIcon,
    description:
      "Role hybride entre support technique et developpement d'outils internes pour les equipes metier et techniques.",
    support:
      "Diagnostic de tickets, reproduction d'incidents, analyse fonctionnelle et communication avec les utilisateurs (professionnels de sante, ARS, etablissements).",
    development:
      "Creation d'un outil d'analyse automatique des tickets avec traitement de texte, clustering vectoriel, extraction de themes et automatisation.",
    companyText:
      "Syadem developpe des solutions logicielles pour la vaccination: MesVaccins, Colibri, NUVA et Carnet de Vaccination Numerique.",
  },
  {
    id: "experience-boulanger",
    company: "Boulanger",
    title: "Vendeur",
    period: "Novembre 2023 - Decembre 2023",
    location: "Boe, France",
    icon: CartIcon,
    description:
      "Accueil clients, conseil, vente de produits electromenagers et multimedia, suivi de stock et mise en rayon.",
  },
  {
    id: "experience-docteur-it",
    company: "Docteur IT",
    title: "Vendeur-Technicien",
    period: "Septembre 2021 - Septembre 2023",
    location: "Boe, France",
    icon: WrenchIcon,
    description:
      "Reparation de smartphones, tablettes et ordinateurs, diagnostic, remplacement de composants, vente d'accessoires.",
  },
  {
    id: "experience-hotel",
    company: "Hotel du Mont Dore",
    title: "Receptionniste",
    period: "Juin 2019 - Septembre 2019",
    location: "Paris 17e",
    icon: UserIcon,
    description:
      "Gestion de reservations, accueil clients, encaissements et coordination operationnelle avec l'equipe d'entretien.",
  },
  {
    id: "experience-venjakob",
    company: "Venjakob Maschinenbau GmbH & Co. KG",
    title: "Stage - Commerce International",
    period: "Juin 2016 - Aout 2016",
    location: "Allemagne",
    icon: EarthIcon,
    description:
      "Observation des flux export et participation a la traduction de documents techniques.",
  },
  {
    id: "experience-air-france",
    company: "Air France",
    title: "Stage - Decouverte professionnelle",
    period: "Fevrier 2012 - Mars 2012",
    location: "Moscou",
    icon: AirplaneIcon,
    description:
      "Immersion dans l'environnement aeroportuaire et decouverte des procedures d'enregistrement et d'embarquement.",
  },
] as const;

export function Experience() {
  const sectionRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 60%", "end 95%"],
  });

  const scaleY = useSpring(scrollYProgress, {
    damping: 35,
    stiffness: 220,
    restDelta: 0.001,
  });

  return (
    <section id="parcours-professionnel" ref={sectionRef} className="px-6 py-20 md:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="space-y-4 border-t border-border/60 pt-8">
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">
            <ScrambleText text="Parcours professionnel" />
          </h2>
          <p className="max-w-3xl text-foreground/85 leading-relaxed">
            <RevealText text="Support, relation utilisateur, developpement interne: un parcours operationnel avec progression technique continue." />
          </p>
        </header>

        <div className="grid grid-cols-[30px_1fr] gap-x-4">
          <div className="relative z-0">
            <div className="absolute inset-y-0 left-0 w-px bg-border" />
            <motion.div className="absolute inset-y-0 left-0 w-px origin-top bg-emerald-400" style={{ scaleY }} />
          </div>

          <div className="space-y-14">
            {EXPERIENCE_HISTORY.map((experience, index) => (
              <motion.article
                key={experience.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: index * 0.04 }}
                className="space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="-ml-[39px] flex items-start gap-3">
                    <span className="relative z-10 mt-1.5 flex h-6 w-6 items-center justify-center bg-background">
                      <experience.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="text-2xl font-semibold tracking-tight">{experience.title}</h3>
                      <p className="text-sm uppercase tracking-[0.14em] text-muted-foreground">
                        {experience.company}
                      </p>
                    </div>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-sm uppercase tracking-[0.14em] text-foreground/80">{experience.period}</p>
                    <p className="text-sm text-muted-foreground">{experience.location}</p>
                  </div>
                </div>

                <div className="space-y-3 pl-1 text-foreground/85">
                  <p className="leading-relaxed">{experience.description}</p>

                  {"support" in experience && experience.support && (
                    <p className="leading-relaxed">
                      <span className="mr-2 text-xs uppercase tracking-[0.16em] text-emerald-400">Support</span>
                      {experience.support}
                    </p>
                  )}

                  {"development" in experience && experience.development && (
                    <p className="leading-relaxed">
                      <span className="mr-2 text-xs uppercase tracking-[0.16em] text-emerald-400">Developpement</span>
                      {experience.development}
                    </p>
                  )}

                  {"companyText" in experience && experience.companyText && (
                    <p className="leading-relaxed">
                      <span className="mr-2 text-xs uppercase tracking-[0.16em] text-emerald-400">Entreprise</span>
                      {experience.companyText}
                    </p>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
