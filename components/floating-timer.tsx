"use client";

import { Timer } from "@/components/ui/timer";

export function FloatingTimer() {
  return (
    <div className="pointer-events-none fixed bottom-4 left-4 z-[65] hidden md:block">
      <Timer
        loading
        format="MM:SS"
        variant="outline"
        size="md"
        className="pointer-events-auto bg-background/92 backdrop-blur-sm"
      />
    </div>
  );
}
