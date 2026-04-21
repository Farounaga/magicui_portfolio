import { HeadingWaveText } from "@/components/effects/heading-wave-text";
import { RevealText } from "@/components/effects/reveal-text";
import { EvidenceImageGallery } from "@/components/evidence-image-gallery";
import { ArrowUpRight } from "lucide-react";
import fs from "node:fs";
import path from "node:path";

type EvidenceItem = {
  id: string;
  title: string;
  shortText: string;
  referentiel?: string;
  links?: Array<{ label: string; href: string }>;
  imageFolder: string;
};

type EvidenceGroup = {
  id: string;
  label: string;
  items: EvidenceItem[];
};

type EvidenceImage = {
  src: string;
  alt: string;
};

const EVIDENCE_GROUPS: EvidenceGroup[] = [
  {
    id: "bloc-pro",
    label: "Activités professionnelles (SYADEM)",
    items: [
      {
        id: "guide-support",
        title: "Création des pages du guide de support",
        shortText: "Je rédige régulièrement des articles de support sur les sujets prioritaires pour les équipes.",
        links: [{ label: "Support Colibri", href: "https://support-colibri.mesvaccins.net/" }],
        imageFolder: "guide-support",
      },
      {
        id: "tickets-clients",
        title: "Réponses aux tickets des clients",
        shortText: "Capture d'écran de mon activité de traitement des tickets dans Zendesk.",
        imageFolder: "tickets-clients",
      },
      {
        id: "dashboard-tests",
        title: "Participation aux tests d'un dashboard interne",
        shortText:
          "J'analyse le front-end et le back-end sur lesquels je travaille actuellement afin d'améliorer les comportements observés. J'utilise à la fois les tests automatisés prévus par les développeurs et des simulations manuelles de cas d'usage.",
        imageFolder: "dashboard-tests",
      },
    ],
  },
  {
    id: "bloc-sisr-cyber",
    label: "TP support, SISR et cybersécurité",
    items: [
      {
        id: "vm-creation",
        title: "Création de machines virtuelles et environnements de test",
        shortText:
          "Mise en place d'environnements virtuels de test avec configuration système/réseau pour reproduire les scénarios techniques en conditions contrôlées.",
        links: [{ label: "Compte rendu TP machines virtuelles (PDF)", href: "/Machines%20Virtuelles%20Compte%20rendu%20Spirine.pdf" }],
        imageFolder: "vm-creation",
      },
      {
        id: "cyber-lab",
        title: "TP cybersécurité en laboratoire",
        shortText: "Le détail complet de l'analyse est présenté dans le document du TP.",
        links: [{ label: "TP cybersécurité - analyse mail entreprise (PDF)", href: "/tp%20cybersecurite%20analyse%20de%20mail%20d%27entreprise.pdf" }],
        imageFolder: "cyber-lab",
      },
    ],
  },
];

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);

function getFolderImages(folder: string, title: string): EvidenceImage[] {
  const folderPath = path.join(process.cwd(), "public", "images", "preuves", folder);
  if (!fs.existsSync(folderPath)) {
    return [];
  }

  const files = fs
    .readdirSync(folderPath, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .filter((fileName) => IMAGE_EXTENSIONS.has(path.extname(fileName).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, "fr"));

  return files.map((fileName, index) => ({
    src: `/images/preuves/${folder}/${encodeURIComponent(fileName)}`,
    alt: `${title} - capture ${index + 1}`,
  }));
}

export function Evidence() {
  const groupsWithImages = EVIDENCE_GROUPS.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      images: getFolderImages(item.imageFolder, item.title),
    })),
  }));

  return (
    <section id="preuves-illustrations" className="px-6 py-20 md:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="space-y-4 border-t border-border/60 pt-8">
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">
            <HeadingWaveText>Preuves & Illustrations</HeadingWaveText>
          </h2>
          <p className="max-w-3xl text-foreground/85 leading-relaxed">
            <RevealText text="Chaque activité est présentée avec contexte, action, résultat et trace vérifiable (document, lien, capture)." />
          </p>
        </header>

        {groupsWithImages.map((group) => (
          <section key={group.id} className="space-y-4">
            <p className="text-xs uppercase tracking-[0.22em] text-emerald-400">{group.label}</p>
            <div className="border-y border-border/50">
              {group.items.map((item) => (
                <details key={item.id} className="group border-b border-border/40 last:border-b-0">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-xl font-semibold tracking-tight">
                    <span>{item.title}</span>
                    <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground group-open:text-emerald-400">
                      Détails
                    </span>
                  </summary>

                  <div className="space-y-4 pb-5 text-foreground/85">
                    <p className="leading-relaxed">{item.shortText}</p>

                    {item.referentiel ? (
                      <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        Référentiel visé : {item.referentiel}
                      </p>
                    ) : null}

                    {item.links?.length ? (
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        {item.links.map((link) => (
                          <a
                            key={link.href}
                            href={link.href}
                            target={link.href.startsWith("#") ? undefined : "_blank"}
                            rel={link.href.startsWith("#") ? undefined : "noopener noreferrer"}
                            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-emerald-400 hover:text-emerald-300"
                          >
                            {link.label}
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </a>
                        ))}
                      </div>
                    ) : null}

                    {item.images?.length ? (
                      <EvidenceImageGallery images={item.images} />
                    ) : null}
                  </div>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
