"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { HeadingWaveText } from "@/components/effects/heading-wave-text";
import { RevealText } from "@/components/effects/reveal-text";
import { AnimatedTestimonials } from "@/components/effects/animated-testimonials";
import { MarqueeContainer } from "@/components/marquee-container";
import { cn } from "@/lib/utils";
import {
  Trophy,
  Code2,
  Database,
  GitBranch,
  Server,
  ShieldCheck,
  Globe,
  Languages,
  Braces,
  Workflow,
  Cpu,
  LucideIcon,
} from "lucide-react";

type SkillItem = {
  name: string;
  level: number;
  note: string;
  icon: LucideIcon;
};

type SkillGroups = {
  backend: SkillItem[];
  frontend: SkillItem[];
  langues: SkillItem[];
};

const SKILL_GROUPS: SkillGroups = {
  backend: [
    { name: "Git", level: 70, note: "Workflow quotidien et gestion rigoureuse des branches.", icon: GitBranch },
    { name: "MongoDB", level: 40, note: "Modélisation simple et requêtes orientées produit.", icon: Database },
    { name: "Ruby", level: 40, note: "Scripts internes et automatisations métier.", icon: Code2 },
    { name: "MySQL / MariaDB", level: 30, note: "Schémas, requêtes SQL et normalisation.", icon: Database },
    { name: "Python", level: 30, note: "Analyse de données, scripts et expérimentation IA.", icon: Cpu },
    { name: "Node.js", level: 10, note: "Bases API et services utilitaires.", icon: Server },
    { name: "Docker", level: 10, note: "Usage pratique : images, conteneurs et volumes.", icon: Workflow },
    { name: "PHP", level: 10, note: "Fondamentaux de syntaxe et architecture MVC.", icon: Braces },
  ],
  frontend: [
    { name: "HTML", level: 30, note: "Structure sémantique et lisibilité UI.", icon: Code2 },
    { name: "CSS", level: 30, note: "Mise en page responsive et rythme visuel.", icon: Braces },
    { name: "JavaScript", level: 25, note: "Interactions client et logique applicative.", icon: Cpu },
    { name: "Bootstrap", level: 15, note: "Composants rapides pour prototypage.", icon: Workflow },
    { name: "React", level: 10, note: "Composants, gestion d'état et composition d'interfaces.", icon: Code2 },
  ],
  langues: [
    { name: "Français", level: 100, note: "Bilingue complet : oral et écrit.", icon: Languages },
    { name: "Russe", level: 100, note: "Langue maternelle.", icon: Globe },
    { name: "Anglais", level: 85, note: "Contexte pro, lecture technique avancée.", icon: Globe },
    { name: "Espagnol", level: 55, note: "Niveau intermédiaire utilisable.", icon: Languages },
    { name: "Chinois (HSK1)", level: 30, note: "Débutant.", icon: Languages },
  ],
};

type SkillGroupKey = keyof typeof SKILL_GROUPS;

const GROUP_LABELS: Record<SkillGroupKey, string> = {
  backend: "Compétences backend",
  frontend: "Compétences frontend",
  langues: "Langues",
};

const GROUP_ORDER: SkillGroupKey[] = ["backend", "frontend", "langues"];

const STACK_MARQUEE: Array<{ label: string; icon: LucideIcon }> = [
  { label: "Git", icon: GitBranch },
  { label: "MongoDB", icon: Database },
  { label: "Ruby", icon: Code2 },
  { label: "Python", icon: Cpu },
  { label: "MySQL", icon: Database },
  { label: "Node", icon: Server },
  { label: "Docker", icon: Workflow },
  { label: "PHP", icon: Braces },
  { label: "JavaScript", icon: Code2 },
  { label: "React", icon: Code2 },
  { label: "Cyber", icon: ShieldCheck },
  { label: "Langues", icon: Languages },
];

const CERTIFICATIONS = [
  {
    id: "cert-stakeholders",
    title: "Engaging Stakeholders for Success",
    subtitle: "Cisco",
    body: "Certification orientée communication projet, collaboration et capacité à aligner les parties prenantes.",
    image:
      "https://images.credly.com/size/160x160/images/11a35743-6bcd-4406-83cd-bf74d1c8f646/image.png",
    link: "https://www.credly.com/earner/earned/badge/a7c873f2-9eb6-4a05-b9e5-1b2faaf6763c",
  },
  {
    id: "cert-cyber",
    title: "Introduction to Cybersecurity",
    subtitle: "Cisco",
    body: "Base solide sur les menaces actuelles, la sécurité réseau et les bons réflexes de protection.",
    image:
      "https://images.credly.com/size/160x160/images/af8c6b4e-fc31-47c4-8dcb-eb7a2065dc5b/I2CS__1_.png",
    link: "https://www.credly.com/earner/earned/badge/437aeff3-eeca-4819-8345-7cc6e9ecf4f8",
  },
  {
    id: "cert-iot",
    title: "Introduction to IoT",
    subtitle: "Cisco",
    body: "Compréhension des objets connectés, de leur cycle de données et des architectures réseau associées.",
    image:
      "https://images.credly.com/size/160x160/images/fce226c2-0f13-4e17-b60c-24fa6ffd88cb/Intro2IoT.png",
    link: "https://www.credly.com/earner/earned/badge/a707be29-5c1a-4e00-a4e2-99cc6b209a24",
  },
  {
    id: "cert-networking",
    title: "Networking Basics",
    subtitle: "Cisco",
    body: "Fondamentaux IP, routage et structure des infrastructures réseau modernes.",
    image:
      "https://images.credly.com/size/160x160/images/5bdd6a39-3e03-4444-9510-ecff80c9ce79/image.png",
    link: "https://www.credly.com/earner/earned/badge/eb90930e-ee6b-4335-b0f2-0a0e57598204",
  },
  {
    id: "cert-python",
    title: "Python Essentials 1",
    subtitle: "Cisco",
    body: "Fondations Python : syntaxe, logique de contrôle et structuration de scripts utiles au quotidien.",
    image:
      "https://images.credly.com/size/160x160/images/68c0b94d-f6ac-40b1-a0e0-921439eb092e/image.png",
    link: "https://www.credly.com/earner/earned/badge/cbe7143d-bfb6-4447-905c-abccbeeee9ba",
  },
];

export function SkillsCertifications() {
  const [activeGroup, setActiveGroup] = React.useState<SkillGroupKey>("backend");
  const [selectedSkillName, setSelectedSkillName] = React.useState(SKILL_GROUPS.backend[0].name);

  const skills = SKILL_GROUPS[activeGroup];

  React.useEffect(() => {
    setSelectedSkillName(SKILL_GROUPS[activeGroup][0].name);
  }, [activeGroup]);

  const selectedSkill =
    skills.find((skill) => skill.name === selectedSkillName) ?? SKILL_GROUPS[activeGroup][0];

  return (
    <section id="competences" className="px-6 py-20 md:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl space-y-16">
        <header className="space-y-4 border-t border-border/60 pt-8">
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">
            <HeadingWaveText>Compétences</HeadingWaveText>
          </h2>
          <p className="max-w-3xl text-foreground/85 leading-relaxed">
            <RevealText text="Profil polyvalent : backend orienté production, frontend pragmatique et vraie aisance linguistique." />
          </p>
        </header>

        <div className="space-y-10">
          <MarqueeContainer className="border-y border-border/40 py-3" baseVelocity={2.3}>
            <div className="inline-flex items-center gap-6 pr-6">
              {STACK_MARQUEE.map((item) => (
                <span key={item.label} className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-muted-foreground">
                  <item.icon className="h-4 w-4 text-emerald-400" />
                  {item.label}
                </span>
              ))}
            </div>
          </MarqueeContainer>

          <div className="relative z-20 isolate flex flex-wrap gap-2 border-b border-border/50 pb-3 text-xs uppercase tracking-[0.14em] md:text-sm md:tracking-[0.16em]">
            {GROUP_ORDER.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => setActiveGroup(group)}
                onPointerDown={() => setActiveGroup(group)}
                aria-pressed={activeGroup === group}
                className={cn(
                  "relative z-20 pointer-events-auto rounded-full border px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                  activeGroup === group
                    ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-400"
                    : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                )}
              >
                {GROUP_LABELS[group]}
              </button>
            ))}
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeGroup}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28 }}
                className="flex flex-wrap items-end gap-x-5 gap-y-6 border-b border-border/35 pb-8 lg:border-b-0 lg:pb-0"
              >
                {skills.map((skill, index) => {
                  const isActive = selectedSkill.name === skill.name;
                  const size = 0.9 + skill.level / 48;

                  return (
                    <motion.button
                      key={`${activeGroup}-${skill.name}`}
                      type="button"
                      onMouseEnter={() => setSelectedSkillName(skill.name)}
                      onFocus={() => setSelectedSkillName(skill.name)}
                      onClick={() => setSelectedSkillName(skill.name)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.26 }}
                      className={isActive ? "text-emerald-400" : "text-foreground/85 hover:text-foreground"}
                      style={{ fontSize: `${size}rem` }}
                    >
                      <span className="inline-flex items-center gap-2 uppercase tracking-[0.08em]">
                        <skill.icon className="h-[0.95em] w-[0.95em]" />
                        {skill.name}
                      </span>
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${activeGroup}-${selectedSkill.name}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Compétence mise en avant</p>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold tracking-tight uppercase">{selectedSkill.name}</h3>
                  <p className="leading-relaxed text-foreground/80">{selectedSkill.note}</p>
                </div>

                <div className="space-y-2">
                  <div className="h-px w-full bg-border">
                    <motion.div
                      className="h-px bg-emerald-400"
                      initial={{ width: "0%" }}
                      animate={{ width: `${selectedSkill.level}%` }}
                      transition={{ duration: 0.45, ease: "easeOut" }}
                    />
                  </div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Niveau estimé : {selectedSkill.level}%
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <div id="certifications" className="space-y-8 border-t border-border/60 pt-10">
          <h3 className="text-3xl font-semibold uppercase tracking-tight md:text-4xl">
            <HeadingWaveText>Certifications & récompenses</HeadingWaveText>
          </h3>

          <AnimatedTestimonials items={CERTIFICATIONS} />

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.4 }}
            className="border-t border-border/60 pt-5"
          >
            <p className="flex items-start gap-3 text-foreground/85 leading-relaxed">
              <Trophy className="mt-1 h-4 w-4 shrink-0 text-emerald-400" />
              <span>
                <strong>REMPAR25 - Cellule Communication:</strong> certificat de participation obtenu dans le cadre de
                l'exercice national de crise cyber organisé par l'État français.
              </span>
            </p>
            <a
              href="https://cyber.gouv.fr/actualites/rempar25-un-exercice-de-crise-cyber-dune-ampleur-inedite"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-xs uppercase tracking-[0.2em] text-emerald-400 hover:text-emerald-300"
            >
              Lire l'article officiel
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
