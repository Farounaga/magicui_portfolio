"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";

const timerVariants = cva(
  "inline-flex items-center gap-2 rounded-full border font-medium transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border bg-background text-foreground shadow-sm",
        outline: "border-border/70 bg-background/90 text-foreground",
        ghost: "border-transparent bg-transparent text-foreground",
        destructive: "border-destructive/25 bg-destructive/10 text-destructive",
      },
      size: {
        sm: "h-6 gap-1.5 px-2 py-1 text-xs",
        md: "h-7 gap-2 px-2.5 py-1.5 text-sm",
        lg: "h-8 gap-2.5 px-3 py-2 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);

const timerIconVariants = cva("transition-transform duration-[2000ms]", {
  variants: {
    size: {
      sm: "h-3 w-3",
      md: "h-3.5 w-3.5",
      lg: "h-4 w-4",
    },
    loading: {
      true: "animate-spin",
      false: "",
    },
  },
  defaultVariants: {
    size: "md",
    loading: false,
  },
});

const timerDisplayVariants = cva("font-mono tabular-nums tracking-tight", {
  variants: {
    size: {
      sm: "text-xs",
      md: "text-sm",
      lg: "text-base",
    },
  },
  defaultVariants: {
    size: "md",
  },
});

type UseTimerOptions = {
  loading?: boolean;
  onTick?: (seconds: number, milliseconds: number) => void;
  resetOnLoadingChange?: boolean;
  format?: "SS.MS" | "MM:SS" | "HH:MM:SS";
};

type UseTimerReturn = {
  elapsedTime: number;
  milliseconds: number;
  formattedTime: {
    seconds: string;
    milliseconds: string;
    display: string;
  };
};

type TimerRootProps = VariantProps<typeof timerVariants> &
  React.HTMLAttributes<HTMLDivElement>;

type TimerIconProps = {
  icon?: React.ComponentType<{ className?: string }>;
} & VariantProps<typeof timerIconVariants> &
  React.HTMLAttributes<HTMLDivElement>;

type TimerDisplayProps = {
  time: string;
  label?: string;
} & VariantProps<typeof timerDisplayVariants> &
  React.HTMLAttributes<HTMLDivElement>;

type TimerProps = TimerRootProps &
  UseTimerOptions &
  React.HTMLAttributes<HTMLDivElement>;

export const TimerRoot = React.forwardRef<HTMLDivElement, TimerRootProps>(
  ({ variant, size, className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(timerVariants({ variant, size }), className)}
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        {...props}
      >
        {children}
      </div>
    );
  },
);
TimerRoot.displayName = "TimerRoot";

export const TimerIcon = React.forwardRef<HTMLDivElement, TimerIconProps>(
  ({ size, loading, icon: Icon = Clock, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(timerIconVariants({ size, loading }), className)}
        {...props}
      >
        <Icon className="h-full w-full" />
      </div>
    );
  },
);
TimerIcon.displayName = "TimerIcon";

export const TimerDisplay = React.forwardRef<HTMLDivElement, TimerDisplayProps>(
  ({ size, time, label, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(timerDisplayVariants({ size }), className)}
        aria-label={label || `Timer: ${time}`}
        {...props}
      >
        {time}
      </div>
    );
  },
);
TimerDisplay.displayName = "TimerDisplay";

export const Timer = React.forwardRef<HTMLDivElement, TimerProps>(
  (
    {
      loading = false,
      onTick,
      resetOnLoadingChange = true,
      format = "MM:SS",
      variant,
      size,
      className,
      ...props
    },
    ref,
  ) => {
    const { formattedTime } = useTimer({
      loading,
      onTick,
      resetOnLoadingChange,
      format,
    });

    return (
      <TimerRoot
        ref={ref}
        variant={variant}
        size={size}
        className={className}
        {...props}
      >
        <TimerIcon size={size} loading={loading} />
        <TimerDisplay size={size} time={formattedTime.display} />
      </TimerRoot>
    );
  },
);
Timer.displayName = "Timer";

export function useTimer({
  loading = false,
  onTick,
  resetOnLoadingChange = true,
  format = "MM:SS",
}: UseTimerOptions = {}): UseTimerReturn {
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [milliseconds, setMilliseconds] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(false);
  const startTimeRef = React.useRef(0);
  const rafRef = React.useRef<number | null>(null);

  const reset = React.useCallback(() => {
    setElapsedTime(0);
    setMilliseconds(0);
    startTimeRef.current = 0;
  }, []);

  const start = React.useCallback(() => {
    setIsRunning(true);
    startTimeRef.current = performance.now();
  }, []);

  const stop = React.useCallback(() => {
    setIsRunning(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
  }, []);

  React.useEffect(() => {
    if (!isRunning) {
      return;
    }

    const updateTimer = () => {
      const now = performance.now();
      const elapsed = now - startTimeRef.current;

      setElapsedTime(Math.floor(elapsed / 1000));
      setMilliseconds(Math.floor(elapsed % 1000));

      rafRef.current = requestAnimationFrame(updateTimer);
    };

    rafRef.current = requestAnimationFrame(updateTimer);
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [isRunning]);

  React.useEffect(() => {
    if (loading) {
      if (resetOnLoadingChange) {
        reset();
      }
      start();
    } else {
      stop();
    }
  }, [loading, resetOnLoadingChange, reset, start, stop]);

  React.useEffect(() => {
    if (onTick) {
      onTick(elapsedTime, milliseconds);
    }
  }, [elapsedTime, milliseconds, onTick]);

  const formatTime = React.useCallback(
    (totalSeconds: number, ms: number) => {
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      switch (format) {
        case "HH:MM:SS":
          return {
            seconds: seconds.toString().padStart(2, "0"),
            milliseconds: Math.floor(ms / 10)
              .toString()
              .padStart(2, "0"),
            display: `${hours.toString().padStart(2, "0")}:${minutes
              .toString()
              .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
          };
        case "SS.MS":
          return {
            seconds: totalSeconds.toString().padStart(2, "0"),
            milliseconds: Math.floor(ms / 10)
              .toString()
              .padStart(2, "0"),
            display: `${totalSeconds.toString().padStart(2, "0")}.${Math.floor(
              ms / 10,
            )
              .toString()
              .padStart(2, "0")}`,
          };
        case "MM:SS":
        default:
          return {
            seconds: seconds.toString().padStart(2, "0"),
            milliseconds: Math.floor(ms / 10)
              .toString()
              .padStart(2, "0"),
            display: `${minutes.toString().padStart(2, "0")}:${seconds
              .toString()
              .padStart(2, "0")}`,
          };
      }
    },
    [format],
  );

  const formattedTime = formatTime(elapsedTime, milliseconds);

  return {
    elapsedTime,
    milliseconds,
    formattedTime,
  };
}
