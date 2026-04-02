"use client";

import { motion } from "motion/react";
import { ScrambleText } from "@/components/effects/scramble-text";
import { RevealText } from "@/components/effects/reveal-text";
import { DancingLetters } from "@/components/effects/dancing-letters";
import { ArrowUpRight } from "lucide-react";

const E5_E6_LINKS = [
  { label: "E5 PDF", href: "/files/e5.pdf" },
  { label: "E5 Excel", href: "/files/e5.xlsx" },
  { label: "E6 PDF", href: "/files/e6.pdf" },
  { label: "E6 Excel", href: "/files/e6.xlsx" },
];

const TICKET_PIPELINE = [
  "Extraction XML / API Zendesk",
  "Nettoyage, normalisation, deduplication",
  "Embeddings vectoriels (local)",
  "Clustering thematique + similarite",
  "Resumes automatiques et statistiques",
];

const API_SCOPE = [
  "Auth JWT (register/login) + hash des mots de passe",
  "CRUD profil et bibliotheque de jeux",
  "Matching intelligent avec score pondere",
  "Messagerie et statut des matchs",
];

const TICKET_PERSONAL_WORK = [
  "Architecture du pipeline complet (extract -> clean -> embed -> cluster -> report)",
  "Implementation des embeddings locaux via Ollama avec retries et timeout management",
  "Mise en place clustering KMeans + sorties qualite (elbow / silhouette)",
  "Module de similarite cosinus avec detection de doublons probables",
  "Generation du rapport HTML lisible pour equipe support + equipe produit",
];

const API_PERSONAL_WORK = [
  "Conception des routes FastAPI et de la couche services backend",
  "Implantation JWT + hashing password + protection des endpoints",
  "Developpement du moteur de scoring de matching pondere",
  "Connexion MySQL et modeles de donnees pour profils, jeux, matchs, messages",
  "Endpoints utilises par le front pour login, profil, jeux, matching, chat",
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
            <ScrambleText text="Realisations" />
          </h2>
          <p className="max-w-3xl text-foreground/85 leading-relaxed">
            <RevealText text="Trois sections, du dossier d'examen aux projets techniques en production." />
          </p>
        </header>

        <article id="e5-e6" className="grid gap-8 border-b border-border/50 pb-12 md:grid-cols-[220px_1fr]">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Dossiers E5 & E6</p>
          <div className="space-y-4">
            <h3 className="text-3xl font-semibold tracking-tight">Dossiers officiels d'evaluation</h3>
            <p className="text-foreground/85 leading-relaxed">
              Documents de synthese pour les epreuves BTS: conception/developpement (E5) et
              support/exploitation (E6).
            </p>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm uppercase tracking-[0.15em]">
              {E5_E6_LINKS.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  {item.label}
                </a>
              ))}
            </div>
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
              Si un fichier n'est pas encore publie dans ce repo, il reste disponible depuis la version docus.
            </p>
          </div>
        </article>

        <article id="projet-ticket-tool" className="grid gap-8 border-b border-border/50 pb-12 md:grid-cols-[220px_1fr]">
          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Outil d'analyse de tickets</p>
          <div className="space-y-6">
            <h3 className="text-3xl font-semibold tracking-tight">RB_TKTS - Ticket Intelligence Pipeline</h3>
            <p className="text-foreground/85 leading-relaxed">
              Projet interne que j'ai construit from scratch pour transformer un gros volume de tickets support
              en intelligence metier exploitable. Le pipeline parse les exports XML en streaming, normalise les textes,
              genere des embeddings locaux via Ollama, puis applique clustering + similarite cosinus.
            </p>
            <p className="text-foreground/85 leading-relaxed">
              J'ai aussi integre la partie fiabilite: retries exponentiels, timeouts, parallelisation, et
              generation de rapports HTML pour donner une lecture immediate des tendances, doublons probables
              et themes dominants.
            </p>
            <p className="text-foreground/85 leading-relaxed">
              Le point fort du projet est le fait de garder l'IA en local: vectorisation et generation de themes
              tournent sans dependre d'un service cloud externe. Ca donne un workflow plus maitrise pour un contexte
              sante/sensibilite des donnees, et surtout une reproductibilite bien meilleure pour comparer les runs
              d'un mois a l'autre.
            </p>
            <p className="text-foreground/85 leading-relaxed">
              Au-dela de la partie \"demo\", j'ai structure le code pour que ca tienne dans le temps: config centralisee
              via ENV, modules separes (parser, embeddings, clustering, similarity, visualisation), et sorties
              intermediaires versionnables (`embeddings.json`, `clusters.json`, `similar_tickets.json`,
              `clustering_metrics.json`) pour auditer le comportement du pipeline.
            </p>

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
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Ce que j'ai code personnellement</p>
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
              <DancingLetters text="Ruby · Ollama local · Nokogiri XML Reader · Rumale KMeans · Similarite cosinus" />
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
            <p className="text-foreground/85 leading-relaxed">
              Sur ce projet, je me suis concentre uniquement sur la partie API: architecture des routes,
              auth JWT, modeles de donnees et logique de matching. L'objectif etait de fournir une base backend
              solide, propre et scalable pour le front.
            </p>
            <p className="text-foreground/85 leading-relaxed">
              J'ai implemente un moteur de matching pondere (jeux en commun, compatibilite de niveau,
              region, fuseau horaire, style de jeu) avec score final sur 100, puis une couche routes
              pour exposer cette logique proprement au client.
            </p>
            <p className="text-foreground/85 leading-relaxed">
              Mon role sur Esportapp etait volontairement backend-only: je me suis concentre sur la qualite API,
              la coherence des contrats de reponse et la stabilite de la logique metier. Le but etait de livrer
              une API lisible, testable et facile a brancher cote front sans bricolage.
            </p>
            <p className="text-foreground/85 leading-relaxed">
              J'ai structure le backend avec separation claire routes/services/models et des scores de matching
              explicables (pas juste un \"score magique\"). Ca permet d'ajuster les poids selon la strategie produit
              et de faire evoluer le moteur sans casser les endpoints deja consommes par l'interface.
            </p>

            <motion.ul
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.45 }}
              transition={{ staggerChildren: 0.06 }}
              className="space-y-2 font-mono text-sm"
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
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Ce que j'ai code personnellement</p>
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
