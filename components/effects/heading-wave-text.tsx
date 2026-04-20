"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { GradientWaveText } from "@/components/gradient-wave-text";

type HeadingWaveTextProps = {
  children: React.ReactNode;
  className?: string;
};

export function HeadingWaveText({ children, className }: HeadingWaveTextProps) {
  return (
    <GradientWaveText
      align="left"
      inView
      once
      speed={1.1}
      bandGap={4}
      bandCount={10}
      customColors={["#10b981", "#22d3ee", "#34d399", "#2dd4bf", "#10b981", "#99f6e4"]}
      className={cn("h-auto", className)}
    >
      {children}
    </GradientWaveText>
  );
}
