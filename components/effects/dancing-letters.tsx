"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type DancingLettersProps = {
  text: string;
  className?: string;
};

export function DancingLetters({ text, className }: DancingLettersProps) {
  return (
    <span className={cn("inline-flex flex-wrap", className)}>
      {text.split("").map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          className="inline-block"
          animate={{ y: [0, -5, 0], rotate: [0, -2, 2, 0] }}
          transition={{
            duration: 1.8,
            ease: "easeInOut",
            repeat: Number.POSITIVE_INFINITY,
            delay: index * 0.05,
            repeatDelay: 1.25,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </span>
  );
}
