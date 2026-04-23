"use client";

import { motion } from "motion/react";
import { HeadingWaveText } from "@/components/effects/heading-wave-text";
import { RevealText } from "@/components/effects/reveal-text";
import { DancingLetters } from "@/components/effects/dancing-letters";
import { ArrowUpRight } from "lucide-react";

const E5_E6_LINKS = [
  {
    label: "E5 · Tableau PDF",
    href: "/e5-tableau-synthese-2026.pdf",
    downloadName: "e5-tableau-synthese-2026.pdf",
  },
  {
    label: "E5 · Tableau Excel",
    href: "/e5-tableau-synthese-2026.xlsx",
    downloadName: "e5-tableau-synthese-2026.xlsx",
  },
  {
    label: "E6 · Réalisation 1 (PDF)",
    href: "/Fiche_E6_SPIRINE%20realisation%201.pdf",
    downloadName: "Fiche_E6_SPIRINE realisation 1.pdf",
  },
  {
    label: "E6 · Réalisation 2 (PDF)",
    href: "/Fiche_E6_SPIRINE%20realisation%202.pdf",
    downloadName: "Fiche_E6_SPIRINE realisation 2.pdf",
  },
];

const TICKET_PIPELINE = [
  "Extraction XML / API Zendesk",
  "Nettoyage, normalisation, déduplication",
  "Embeddings vectoriels (local)",
  "Clustering thématique + similarité",
  "Résumés automatiques et statistiques",
];

const API_SCOPE = [
  "Authentification JWT (inscription/connexion) + hachage des mots de passe",
  "CRUD profil et bibliothèque de jeux",
  "Matching intelligent avec score pondéré",
  "Messagerie et statut des matchs",
];

const TICKET_PERSONAL_WORK = [
  "Architecture du pipeline complet (extract -> clean -> embed -> cluster -> report)",
  "Implémentation des embeddings locaux via Ollama avec retries et gestion des timeouts",
  "Mise en place du clustering KMeans + sorties qualité (elbow / silhouette)",
  "Module de similarité cosinus avec détection de doublons probables",
  "Génération d'un rapport HTML lisible pour l'équipe support + l'équipe produit",
];

const API_PERSONAL_WORK = [
  "Conception et structuration des routes FastAPI ainsi que de la couche de services backend.",
  "Implémentation de l'authentification JWT, du hachage des mots de passe et de la sécurisation des endpoints.",
  "Développement d'un moteur de scoring pondéré pour le matching des profils.",
  "Modélisation et intégration MySQL pour la gestion des profils, jeux, matchs et messages.",
  "Exposition d'endpoints REST consommés par le front (authentification, profil, bibliothèque de jeux, matching, messagerie).",
];

const TICKET_CODE_EXAMPLE = `while embedding.nil? && retries < max_retries
  embedding = get_embedding(text, model)
  break if embedding

  retries += 1
  delay = AppConfig.ollama_retry_base_delay * (2**(retries - 1))
  sleep delay
end`;

const API_CODE_EXAMPLE = `common_games = set(user_game_map.keys()) & set(candidate_game_map.keys())
common_game_score = min(len(common_games) * WEIGHTS["common_games"], 60)

skill_compatibility = SKILL_COMPATIBILITY.get((user_skill, candidate_skill), 0.5)
skill_score = WEIGHTS["skill_match"] * skill_compatibility

total_score = min(100, round(common_game_score + skill_score + region_score + tz_score))`;

export function Realisations() {
  return (
    <section id="realisations" className="px-6 py-20 md:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl space-y-16">
        <header className="space-y-4 border-t border-border/60 pt-8">
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">
            <HeadingWaveText>Réalisations</HeadingWaveText>
          </h2>
          <p className="max-w-3xl text-foreground/85 leading-relaxed">
            <RevealText text="Trois sections, du dossier d'examen aux projets techniques en production." />
          </p>
        </header>

        <article id="e5-e6" className="grid gap-8 border-b border-border/50 pb-12 md:grid-cols-[220px_1fr]">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Dossiers E5 & E6</p>
          <div className="space-y-4">
            <h3 className="text-3xl font-semibold tracking-tight">Dossiers officiels d'évaluation</h3>
            <p className="text-foreground/85 leading-relaxed">
              Documents de synthèse pour les épreuves BTS : conception/développement (E5) et
              support/exploitation (E6).
            </p>
            <div className="relative z-10 flex flex-wrap gap-x-6 gap-y-2 text-sm uppercase tracking-[0.15em]">
              {E5_E6_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  download={item.downloadName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto text-emerald-400 hover:text-emerald-300"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Tous les documents E5/E6 sont téléchargeables directement depuis ce portfolio.
            </p>
          </div>
        </article>

        <article id="projet-ticket-tool" className="grid gap-8 border-b border-border/50 pb-12 md:grid-cols-[220px_1fr]">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Outil d'analyse de tickets</p>
          <div className="space-y-6">
            <h3 className="text-3xl font-semibold tracking-tight">RB_TKTS - Ticket Intelligence Pipeline</h3>
            <p className="text-foreground/85 leading-relaxed">
              Projet interne que j'ai conçu entièrement pour transformer un volume important de tickets support
              en intelligence métier exploitable. Le pipeline traite les exports XML en streaming, normalise les textes,
              génère des embeddings locaux via Ollama, puis applique clustering + similarité cosinus.
            </p>
            <p className="text-foreground/85 leading-relaxed">
              J'ai aussi intégré la partie fiabilité : retries exponentiels, timeouts, parallélisation et
              génération de rapports HTML pour donner une lecture immédiate des tendances, doublons probables
              et thèmes dominants.
            </p>
            <p className="text-foreground/85 leading-relaxed">
              Le point fort du projet est le fait de garder l'IA en local : vectorisation et génération de thèmes
              tournent sans dépendre d'un service cloud externe. Cela permet un processus plus maîtrisé dans un contexte
              santé/sensibilité des données, et surtout une reproductibilité bien meilleure pour comparer les exécutions
              d'un mois à l'autre.
            </p>
            <p className="text-foreground/85 leading-relaxed">
              Au-delà de la partie démonstrative, j'ai structuré le code pour garantir sa maintenabilité dans le temps : configuration centralisée
              via ENV, modules séparés (parser, embeddings, clustering, similarity, visualisation), et sorties
              intermédiaires versionnables (`embeddings.json`, `clusters.json`, `similar_tickets.json`,
              `clustering_metrics.json`) pour auditer le comportement du pipeline.
            </p>

            <figure className="w-full max-w-[860px] space-y-2 border border-border/50 p-3">
              <div className="relative overflow-hidden">
                <video
                  className="h-auto w-full"
                  src="/rb_tkts.mp4"
                  controls
                  playsInline
                  preload="metadata"
                >
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              </div>
              <figcaption className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                Démonstration du pipeline RB_TKTS
              </figcaption>
            </figure>

            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.45 }}
              transition={{ staggerChildren: 0.07 }}
              className="space-y-2 font-mono text-sm"
            >
              {TICKET_PIPELINE.map((step, index) => (
                <motion.li
                  key={step}
                  variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}
                  className="flex items-center gap-3"
                >
                  <span className="w-7 text-emerald-400">{String(index + 1).padStart(2, "0")}</span>
                  <span>{step}</span>
                </motion.li>
              ))}
            </motion.ul>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Ce que j'ai codé personnellement</p>
              <ul className="grid gap-2 text-sm text-foreground/85">
                {TICKET_PERSONAL_WORK.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 bg-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 border-t border-border/50 pt-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Exemple de fonction (retry embeddings)</p>
              <pre className="overflow-x-auto border-l border-emerald-500/40 pl-4 font-mono text-xs leading-relaxed text-foreground/85">
                <code>{TICKET_CODE_EXAMPLE}</code>
              </pre>
            </div>

            <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">
              <DancingLetters text="Ruby · Ollama local · Nokogiri XML Reader · Rumale KMeans · Similarité cosinus" />
            </p>

            <a
              href="https://github.com/Farounaga/rb_tkts"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-emerald-400 hover:text-emerald-300"
            >
              Voir le repo rb_tkts
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </article>

        <article id="projet-2" className="grid gap-8 md:grid-cols-[220px_1fr]">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Esportapp - API</p>
          <div className="space-y-6">
            <h3 className="text-3xl font-semibold tracking-tight">Backend API FastAPI pour plateforme e-sport</h3>
            <figure className="mx-auto w-full max-w-[220px] space-y-2 border border-border/50 p-2 md:float-right md:mb-4 md:ml-6 md:mr-0 md:mt-1 md:mx-0">
              <div className="relative overflow-hidden">
                <video
                  className="h-auto w-full"
                  src="/apimeme.mp4"
                  autoPlay
                  playsInline
                  loop
                  muted
                  preload="metadata"
                >
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              </div>
              <figcaption className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">
                Illustration vidéo du projet Esportapp API
              </figcaption>
            </figure>
            <p className="text-foreground/85 leading-relaxed">
              Sur ce projet, je me suis concentré uniquement sur la partie API : architecture des routes,
              auth JWT, modèles de données et logique de matching. L'objectif était de fournir une base backend
              solide, propre et scalable pour le front.
            </p>
            <p className="text-foreground/85 leading-relaxed">
              J'ai implémenté un moteur de matching pondéré (jeux en commun, compatibilité de niveau,
              région, fuseau horaire, style de jeu) avec score final sur 100, puis une couche routes
              pour exposer cette logique proprement au client.
            </p>
            <p className="text-foreground/85 leading-relaxed">
              Mon rôle sur Esportapp était volontairement centré sur le back-end : je me suis concentré sur la qualité de l'API,
              la cohérence des contrats de réponse et la stabilité de la logique métier. Le but était de livrer
              une API lisible, testable et simple à intégrer côté front-end, sans ajustements ad hoc.
            </p>
            <p className="text-foreground/85 leading-relaxed">
              J'ai structuré le backend avec une séparation claire routes/services/models et des scores de matching
              explicables (et non un score opaque). Cela permet d'ajuster les poids selon la stratégie produit
              et de faire évoluer le moteur sans casser les endpoints déjà consommés par l'interface.
            </p>

            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.45 }}
              transition={{ staggerChildren: 0.06 }}
              className="clear-both space-y-2 font-mono text-sm"
            >
              {API_SCOPE.map((item, index) => (
                <motion.li
                  key={item}
                  variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}
                  className="flex items-center gap-3"
                >
                  <span className="w-7 text-emerald-400">{String(index + 1).padStart(2, "0")}</span>
                  <span>{item}</span>
                </motion.li>
              ))}
            </motion.ul>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Ce que j'ai codé personnellement</p>
              <ul className="grid gap-2 text-sm text-foreground/85">
                {API_PERSONAL_WORK.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 bg-emerald-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-2 border-t border-border/50 pt-4">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Exemple de logique matching (API)</p>
              <pre className="overflow-x-auto border-l border-emerald-500/40 pl-4 font-mono text-xs leading-relaxed text-foreground/85">
                <code>{API_CODE_EXAMPLE}</code>
              </pre>
            </div>

            <a
              href="https://github.com/Farounaga/Esportapp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-emerald-400 hover:text-emerald-300"
            >
              Voir le repo Esportapp (API)
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </article>
      </div>
    </section>
  );
}
