"use client";

import * as React from "react";
import { motion } from "motion/react";
import { HeadingWaveText } from "@/components/effects/heading-wave-text";
import { RevealText } from "@/components/effects/reveal-text";
import { ArrowUpRight, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

type FeedItem = {
  id: string;
  source: string;
  topic: "tech" | "cyber";
  title: string;
  link: string;
  description: string;
  publishedAt: string;
};

type RssPayload = {
  updatedAt: string;
  items: FeedItem[];
};

const TOPICS: Array<{ key: "all" | "tech" | "cyber"; label: string }> = [
  { key: "all", label: "Tous" },
  { key: "tech", label: "IT / Tech" },
  { key: "cyber", label: "Cybersécurité" },
];

export function Veille() {
  const [items, setItems] = React.useState<FeedItem[]>([]);
  const [topic, setTopic] = React.useState<"all" | "tech" | "cyber">("all");
  const [updatedAt, setUpdatedAt] = React.useState<string>("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const loadFeed = React.useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/rss", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("rss_error");
      }

      const data = (await response.json()) as RssPayload;
      setItems(data.items ?? []);
      setUpdatedAt(data.updatedAt ?? "");
    } catch {
      setError("Impossible de charger le flux RSS pour le moment.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  const visibleItems = React.useMemo(() => {
    const scoped = topic === "all" ? items : items.filter((item) => item.topic === topic);
    return [...scoped].sort((a, b) => {
      const aTime = Date.parse(a.publishedAt || "");
      const bTime = Date.parse(b.publishedAt || "");
      return (Number.isNaN(bTime) ? 0 : bTime) - (Number.isNaN(aTime) ? 0 : aTime);
    });
  }, [items, topic]);

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
              {TOPICS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTopic(item.key)}
                  aria-pressed={topic === item.key}
                  className={cn(
                    "pointer-events-auto rounded-full border px-3 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/70",
                    topic === item.key
                      ? "border-emerald-400/70 bg-emerald-400/10 text-emerald-400"
                      : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground",
                  )}
                >
                  {item.label}
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
