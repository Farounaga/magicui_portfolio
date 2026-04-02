"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type RevealTextProps = {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
};

export function RevealText({
  text,
  className,
  wordClassName,
  delay = 0,
}: RevealTextProps) {
  const words = text.split(" ");

  return (
    <motion.span
      className={cn("inline", className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.45 }}
      transition={{ staggerChildren: 0.032, delayChildren: delay }}
    >
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="mr-[0.35em] inline-block overflow-hidden">
          <motion.span
            className={cn("inline-block", wordClassName)}
            variants={{
              hidden: { y: "110%", opacity: 0, filter: "blur(6px)" },
              visible: { y: "0%", opacity: 1, filter: "blur(0px)" },
            }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
