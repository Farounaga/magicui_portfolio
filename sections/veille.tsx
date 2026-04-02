"use client";

import * as React from "react";
import { motion } from "motion/react";
import { ScrambleText } from "@/components/effects/scramble-text";
import { RevealText } from "@/components/effects/reveal-text";
import { ArrowUpRight, RefreshCcw } from "lucide-react";

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
  { key: "cyber", label: "Cybersecurite" },
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
    if (topic === "all") {
      return items;
    }
    return items.filter((item) => item.topic === topic);
  }, [items, topic]);

  return (
    <section id="veille-technologique" className="px-6 py-20 md:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="space-y-4 border-t border-border/60 pt-8">
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">
            <ScrambleText text="Veille technologique" />
          </h2>
          <p className="max-w-3xl text-foreground/85 leading-relaxed">
            <RevealText text="Flux RSS live sur l'actualite IT, technologies et cybersecurite." />
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-3 text-xs uppercase tracking-[0.16em]">
            <div className="flex flex-wrap gap-4">
              {TOPICS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setTopic(item.key)}
                  className={topic === item.key ? "text-emerald-400" : "text-muted-foreground hover:text-foreground"}
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

            {updatedAt ? (
              <p className="text-muted-foreground">
                Maj: {new Date(updatedAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
              </p>
            ) : null}
          </div>
        </header>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}

        <div className="space-y-8">
          {isLoading && visibleItems.length === 0 ? (
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">Chargement du flux...</p>
          ) : null}

          {visibleItems.slice(0, 12).map((item, index) => (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.35, delay: index * 0.03 }}
              className="grid gap-4 border-b border-border/45 pb-6 md:grid-cols-[130px_1fr]"
            >
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.16em] text-emerald-400">{item.source}</p>
                <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                  {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString("fr-FR") : "Date inconnue"}
                </p>
              </div>

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
      </div>
    </section>
  );
}
