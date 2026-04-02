"use client";

import * as React from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";

const SCRAMBLE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*";

type ScrambleTextProps = {
  text: string;
  className?: string;
  durationMs?: number;
  triggerOnHover?: boolean;
};

export function ScrambleText({
  text,
  className,
  durationMs = 900,
  triggerOnHover = true,
}: ScrambleTextProps) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.8 });
  const [output, setOutput] = React.useState(text);
  const [playToken, setPlayToken] = React.useState(0);
  const hasPlayedOnView = React.useRef(false);

  React.useEffect(() => {
    if (!inView || hasPlayedOnView.current) {
      return;
    }

    hasPlayedOnView.current = true;
    setPlayToken((prev) => prev + 1);
  }, [inView]);

  React.useEffect(() => {
    if (playToken === 0) {
      return;
    }

    let frame = 0;
    const totalFrames = Math.max(1, Math.floor(durationMs / 28));
    setOutput(text);

    const timer = window.setInterval(() => {
      frame += 1;
      const progress = frame / totalFrames;

      const next = text
        .split("")
        .map((char, index) => {
          if (char === " ") {
            return " ";
          }

          if (index / text.length <= progress) {
            return text[index];
          }

          const randomIndex = Math.floor(Math.random() * SCRAMBLE_CHARS.length);
          return SCRAMBLE_CHARS[randomIndex];
        })
        .join("");

      setOutput(next);

      if (frame >= totalFrames) {
        window.clearInterval(timer);
        setOutput(text);
      }
    }, 28);

    return () => {
      window.clearInterval(timer);
    };
  }, [durationMs, playToken, text]);

  return (
    <motion.span
      ref={ref}
      className={cn("inline-block", className)}
      onMouseEnter={() => {
        if (!triggerOnHover || !inView) {
          return;
        }
        setPlayToken((prev) => prev + 1);
      }}
      onFocus={() => {
        if (!triggerOnHover || !inView) {
          return;
        }
        setPlayToken((prev) => prev + 1);
      }}
      initial={{ opacity: 0.5, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {output}
    </motion.span>
  );
}
