declare module "@/components/RotatingText" {
  import * as React from "react";

  type RotatingTextProps = {
    texts: string[];
    transition?: Record<string, unknown>;
    initial?: Record<string, unknown>;
    animate?: Record<string, unknown>;
    exit?: Record<string, unknown>;
    animatePresenceMode?: "sync" | "popLayout" | "wait";
    animatePresenceInitial?: boolean;
    rotationInterval?: number;
    staggerDuration?: number;
    staggerFrom?: "first" | "last" | "center" | "random" | number;
    loop?: boolean;
    auto?: boolean;
    splitBy?: "characters" | "words" | "lines" | string;
    onNext?: (index: number) => void;
    mainClassName?: string;
    splitLevelClassName?: string;
    elementLevelClassName?: string;
  } & React.HTMLAttributes<HTMLSpanElement>;

  const RotatingText: React.ForwardRefExoticComponent<
    RotatingTextProps & React.RefAttributes<unknown>
  >;

  export default RotatingText;
}
