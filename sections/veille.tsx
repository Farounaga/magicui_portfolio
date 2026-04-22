"use client";

import * as React from "react";
import { motion } from "motion/react";
import { HeadingWaveText } from "@/components/effects/heading-wave-text";
import { RevealText } from "@/components/effects/reveal-text";
import { ArrowUpRight, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type FeedItem = {
  id: string;
  sourceId: string;
  source: string;
  topic: "tech" | "cyber";
  language: "en" | "fr" | "ru";
  title: string;
  link: string;
  description: string;
  publishedAt: string;
};

type RssPayload = {
  updatedAt: string;
  sources?: Array<{
    id: string;
    label: string;
    topic: "tech" | "cyber";
    language: "en" | "fr" | "ru";
  }>;
  items: FeedItem[];
};

const LANGUAGES: Array<{ key: "all" | "fr" | "ru" | "en"; label: string }> = [
  { key: "all", label: "Toutes langues" },
  { key: "fr", label: "FR" },
  { key: "ru", label: "RU" },
  { key: "en", label: "EN" },
];

export function Veille() {
  const [items, setItems] = React.useState<FeedItem[]>([]);
  const [language, setLanguage] = React.useState<"all" | "fr" | "ru" | "en">("all");
  const [sources, setSources] = React.useState<Array<{ id: string; label: string }>>([]);
  const [sourceId, setSourceId] = React.useState<"all" | string>("all");
  const [updatedAt, setUpdatedAt] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const loadFeed = React.useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (language !== "all") {
        params.set("lang", language);
      }
      if (sourceId !== "all") {
        params.set("source", sourceId);
      }
      const endpoint = params.size > 0 ? `/api/rss?${params.toString()}` : "/api/rss";
      const response = await fetch(endpoint, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("rss_error");
      }

      const data = (await response.json()) as RssPayload;
      setItems(data.items ?? []);
      setUpdatedAt(data.updatedAt ?? "");
      const nextSources = (data.sources ?? []).map((source) => ({ id: source.id, label: source.label }));
      setSources(nextSources);
      if (sourceId !== "all" && nextSources.every((source) => source.id !== sourceId)) {
        setSourceId("all");
      }
    } catch {
      setError("Impossible de charger le flux RSS pour le moment.");
    } finally {
      setIsLoading(false);
    }
  }, [language, sourceId]);

  React.useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  const visibleItems = React.useMemo(() => {
    return [...items].sort((a, b) => {
      const aTime = Date.parse(a.publishedAt || "");
      const bTime = Date.parse(b.publishedAt || "");
      return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
    });
  }, [items]);

  const groupedBySource = React.useMemo(() => {
    const map = new Map<string, FeedItem[]>();
    for (const item of visibleItems) {
      const bucket = map.get(item.source) ?? [];
      bucket.push(item);
      map.set(item.source, bucket);
    }

    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0], "fr"))
      .map(([source, sourceItems]) => ({ source, items: sourceItems }));
  }, [visibleItems]);

  return (
    <section id="veille-technologique" className="px-6 py-20 md:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="space-y-4 border-t border-border/60 pt-8">
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">
            <HeadingWaveText>Veille technologique</HeadingWaveText>
          </h2>
          <p className="max-w-3xl text-foreground/85 leading-relaxed">
            <RevealText text="Flux RSS en direct sur l'actualité IT, les technologies et la cybersécurité." />
          </p>

          <div className="relative z-10 flex flex-wrap items-center gap-4 pt-3 text-xs uppercase tracking-[0.14em]">
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setLanguage(item.key)}
                  aria-pressed={language === item.key}
                  className={cn(
                    "pointer-events-auto rounded-full border px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                    language === item.key
                      ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-400"
                      : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSourceId("all")}
                aria-pressed={sourceId === "all"}
                className={cn(
                  "pointer-events-auto rounded-full border px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                  sourceId === "all"
                    ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-400"
                    : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                )}
              >
                Toutes sources
              </button>
              {sources.map((source) => (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => setSourceId(source.id)}
                  aria-pressed={sourceId === source.id}
                  className={cn(
                    "pointer-events-auto rounded-full border px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                    sourceId === source.id
                      ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-400"
                      : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                  )}
                >
                  {source.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => void loadFeed()}
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <RefreshCcw className={isLoading ? "h-3.5 w-3.5 animate-spin" : "h-3.5 w-3.5"} />
              Actualiser
            </button>

            <p className="text-muted-foreground">Articles: {visibleItems.length}</p>

            {updatedAt ? (
              <p className="text-muted-foreground">
                Mise à jour : {new Date(updatedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
              </p>
            ) : null}
          </div>
        </header>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="space-y-10">
          {isLoading && groupedBySource.length === 0 ? (
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Chargement du flux...</p>
          ) : null}

          {groupedBySource.map((group) => (
            <section key={group.source} className="space-y-4">
              <p className="text-xs uppercase tracking-[0.18em] text-emerald-400">{group.source}</p>

              <div className="space-y-5 border-y border-border/45 py-4">
                {group.items.slice(0, 8).map((item, index) => (
                  <motion.article
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.25, delay: index * 0.02 }}
                    className="grid gap-4 border-b border-border/35 pb-5 last:border-b-0 last:pb-0 md:grid-cols-[130px_1fr]"
                  >
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("fr-FR") : "Date inconnue"}
                    </p>

                    <div className="space-y-2">
                      <a
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-start gap-2 text-xl font-semibold tracking-tight hover:text-emerald-400"
                      >
                        <span>{item.title}</span>
                        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0" />
                      </a>
                      <p className="line-clamp-3 text-foreground/80">{item.description}</p>
                    </div>
                  </motion.article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  );
}
