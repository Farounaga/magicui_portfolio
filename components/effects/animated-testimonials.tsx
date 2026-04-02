"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { ExternalLink } from "lucide-react";

export type TestimonialItem = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  image: string;
  link: string;
};

type AnimatedTestimonialsProps = {
  items: TestimonialItem[];
  intervalMs?: number;
};

export function AnimatedTestimonials({
  items,
  intervalMs = 3800,
}: AnimatedTestimonialsProps) {
  const [active, setActive] = React.useState(0);

  React.useEffect(() => {
    if (items.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActive((prev) => (prev + 1) % items.length);
    }, intervalMs);

    return () => {
      window.clearInterval(timer);
    };
  }, [intervalMs, items.length]);

  const current = items[active];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.24em] text-muted-foreground">
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            className={index === active ? "text-foreground" : "hover:text-foreground"}
            onClick={() => setActive(index)}
          >
            {item.subtitle}
          </button>
        ))}
      </div>

      <div className="relative min-h-[220px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -24 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="space-y-5"
          >
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.image}
                alt={current.title}
                className="h-14 w-14 object-contain"
                loading="lazy"
              />
              <div>
                <h4 className="text-lg font-semibold tracking-tight">{current.title}</h4>
                <p className="text-sm uppercase tracking-[0.16em] text-muted-foreground">
                  {current.subtitle}
                </p>
              </div>
            </div>

            <p className="max-w-3xl text-base leading-relaxed text-foreground/90">{current.body}</p>

            <a
              href={current.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-emerald-400 hover:text-emerald-300"
            >
              Voir la preuve
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
