"use client";

import { motion } from "motion/react";
import { HeadingWaveText } from "@/components/effects/heading-wave-text";
import { RevealText } from "@/components/effects/reveal-text";
import { DancingLetters } from "@/components/effects/dancing-letters";
import { ArrowUpRight, Code2, Network, ShieldCheck, Database } from "lucide-react";
import Image from "next/image";

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

const TECHNO_PICTOS = ["FastAPI", "Ruby", "MySQL", "Docker", "Git", "React", "Python", "Linux"];

export function Presentation() {
  return (
    <section id="presentation" className="relative overflow-hidden px-6 py-20 md:px-10 lg:px-14">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,hsl(160_80%_55%/.14),transparent_45%)]" />

      <div className="mx-auto max-w-6xl space-y-16">
        <header className="space-y-5">
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-400">01 · Présentation</p>
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">
            <HeadingWaveText>Présentation</HeadingWaveText>
          </h2>
          <p className="max-w-3xl text-lg text-foreground/85">
            <RevealText text="Je m'appelle Vladimir Spirine, étudiant en BTS SIO SLAM en alternance et passionné par les systèmes, le développement et l'impact concret du numérique dans la santé." />
          </p>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            <DancingLetters text="Build · Support · Automate · Explain" />
          </p>
        </header>

        <article id="formation" className="grid gap-8 border-t border-border/60 pt-8 md:grid-cols-[180px_1fr]">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Présentation de la formation</p>
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold uppercase tracking-tight md:text-3xl">BTS SIO</h3>
            <p className="text-foreground/85 leading-relaxed">
              Le BTS SIO est une formation en informatique orientée vers les métiers des services numériques en
              entreprise. Elle donne une base solide en développement, administration, support et gestion des
              systèmes d'information.
            </p>
            <p className="text-foreground/85 leading-relaxed">
              Deux spécialités structurent le parcours : <strong>SLAM</strong> (développement d'applications, bases de
              données, logiciels métiers) et <strong>SISR</strong> (réseaux, serveurs, cybersécurité et administration
              système).
            </p>
            <p className="text-foreground/85 leading-relaxed">
              Dans mon cas, l'option SLAM me permet de relier théorie et pratique en alternance : conception
              d'outils métier, logique applicative, qualité logicielle et communication technique avec les
              utilisateurs.
            </p>

            <div className="grid gap-4 pt-2 md:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2 border border-border/50 p-4">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-emerald-400">
                    <Code2 className="h-4 w-4" />
                    SLAM
                  </p>
                  <p className="text-sm text-foreground/85">
                    Développement d'applications, bases de données, APIs, qualité logicielle et maintenance.
                  </p>
                </div>
                <div className="space-y-2 border border-border/50 p-4">
                  <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-emerald-400">
                    <Network className="h-4 w-4" />
                    SISR
                  </p>
                  <p className="text-sm text-foreground/85">
                    Réseaux, systèmes, cybersécurité, supervision et administration d'infrastructures.
                  </p>
                </div>
              </div>

              <div className="space-y-2 border border-border/50 p-4">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-emerald-400">
                  <Database className="h-4 w-4" />
                  Technologies pratiquées
                </p>
                <div className="flex flex-wrap gap-2">
                  {TECHNO_PICTOS.map((item) => (
                    <span key={item} className="border border-border/60 px-2 py-1 text-xs uppercase tracking-[0.12em] text-foreground/80">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <figure className="space-y-2 border border-border/50 p-3">
              <div className="relative aspect-[16/6] w-full overflow-hidden">
                <Image
                  src="/images/illustrations/slam-sisr.svg"
                  alt="Schéma comparatif entre les filières SLAM et SISR"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 960px"
                />
              </div>
              <figcaption className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Schéma comparatif : orientation SLAM vs SISR
              </figcaption>
            </figure>
          </div>
        </article>

        <article id="etablissement" className="grid gap-8 border-t border-border/60 pt-8 md:grid-cols-[180px_1fr]">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Présentation de l'établissement</p>
          <div className="space-y-4">
            <h3 className="text-2xl font-semibold uppercase tracking-tight md:text-3xl">Campus Ermitage</h3>
            <p className="text-foreground/85 leading-relaxed">
              Le Campus Ermitage, situé à Agen, propose plusieurs formations post-bac en alternance, dont
              l'informatique. L'école met l'accent sur l'accompagnement, la professionnalisation et le lien direct
              entre théorie et expérience en entreprise.
            </p>
            <p className="text-foreground/85 leading-relaxed">
              Cette approche favorise une montée en compétences progressive : suivi pédagogique, objectifs concrets
              en entreprise et valorisation des projets réalisés en situation réelle.
            </p>
            <a
              href="https://campusermitage.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 break-all text-sm uppercase tracking-[0.18em] text-emerald-400 hover:text-emerald-300"
            >
              Site officiel : campusermitage.fr
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </article>

        <article id="entreprise" className="grid gap-8 border-t border-border/60 pt-8 md:grid-cols-[180px_1fr]">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Présentation de l'entreprise</p>
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold uppercase tracking-tight md:text-3xl">SYADEM</h3>
            <p className="text-foreground/85 leading-relaxed">
              SYADEM est un éditeur français de logiciels médicaux spécialisé dans la vaccination et la prévention.
              L'entreprise combine expertise technique et médicale pour produire des outils fiables, interopérables
              et alignés sur les recommandations officielles.
            </p>

            <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
              <figure className="space-y-2 border border-border/50 p-3">
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src="/images/illustrations/carnet-vaccination.svg"
                    alt="Illustration du carnet de vaccination numérique"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 320px"
                  />
                </div>
                <figcaption className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                  Illustration : Carnet de vaccination numérique
                </figcaption>
              </figure>

              <div className="space-y-3 border border-border/50 p-4">
                <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  Valeur ajoutée de l'entreprise
                </p>
                <p className="text-sm text-foreground/85">
                  Solutions orientées santé publique, interopérables (API, FHIR, DMP), hébergement en France et
                  mise à jour continue selon les recommandations officielles.
                </p>
                <p className="text-sm text-foreground/85">
                  Les outils couvrent la décision vaccinale, la traçabilité, l'aide aux professionnels et la
                  coordination des centres de vaccination.
                </p>
              </div>
            </div>

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
