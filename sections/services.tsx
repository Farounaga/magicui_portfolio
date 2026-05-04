'use client'
import * as React from "react";
import { Parallax, ParallaxItem, PrallaxContainer } from "@/components/systaliko-ui/blocks/parallax";
import Image from "next/image";

type ClipRect = {
    top: number;
    right: number;
    bottom: number;
    left: number;
};

function InvertingHeading({
    children,
    className,
    targetId,
}: {
    children: string;
    className: string;
    targetId: string;
}) {
    const ref = React.useRef<HTMLButtonElement>(null);
    const [clips, setClips] = React.useState<ClipRect[]>([]);
    const lastSignatureRef = React.useRef("");

    React.useEffect(() => {
        let frame = 0;
        const timeouts: number[] = [];

        const updateClips = () => {
            frame = 0;
            const heading = ref.current;
            if (!heading) {
                return;
            }

            const headingRect = heading.getBoundingClientRect();
            const imageRects = Array.from(document.querySelectorAll<HTMLImageElement>("[data-invert-backdrop='true']"))
                .map((element) => {
                    const rect = element.getBoundingClientRect();
                    const naturalWidth = element.naturalWidth || rect.width;
                    const naturalHeight = element.naturalHeight || rect.height;
                    const imageRatio = naturalWidth / naturalHeight;
                    const boxRatio = rect.width / rect.height;

                    if (boxRatio > imageRatio) {
                        const visibleWidth = rect.height * imageRatio;
                        const inset = (rect.width - visibleWidth) / 2;
                        return new DOMRect(rect.left + inset, rect.top, visibleWidth, rect.height);
                    }

                    const visibleHeight = rect.width / imageRatio;
                    const inset = (rect.height - visibleHeight) / 2;
                    return new DOMRect(rect.left, rect.top + inset, rect.width, visibleHeight);
                });

            const nextClips = imageRects
                .map((imageRect) => {
                    const left = Math.max(imageRect.left, headingRect.left);
                    const right = Math.min(imageRect.right, headingRect.right);
                    const top = Math.max(imageRect.top, headingRect.top);
                    const bottom = Math.min(imageRect.bottom, headingRect.bottom);

                    if (right <= left || bottom <= top) {
                        return null;
                    }

                    return {
                        top: top - headingRect.top,
                        right: headingRect.right - right,
                        bottom: headingRect.bottom - bottom,
                        left: left - headingRect.left,
                    };
                })
                .filter((clip): clip is ClipRect => Boolean(clip));

            const signature = nextClips
                .map((clip) => `${Math.round(clip.top)}:${Math.round(clip.right)}:${Math.round(clip.bottom)}:${Math.round(clip.left)}`)
                .join("|");

            if (signature !== lastSignatureRef.current) {
                lastSignatureRef.current = signature;
                setClips(nextClips);
            }
        };

        const scheduleUpdate = () => {
            if (frame) {
                return;
            }
            frame = window.requestAnimationFrame(updateClips);
        };

        scheduleUpdate();
        timeouts.push(window.setTimeout(scheduleUpdate, 500));
        timeouts.push(window.setTimeout(scheduleUpdate, 1500));
        window.addEventListener("scroll", scheduleUpdate, { passive: true });
        window.addEventListener("resize", scheduleUpdate);
        window.addEventListener("load", scheduleUpdate);

        return () => {
            if (frame) {
                window.cancelAnimationFrame(frame);
            }
            timeouts.forEach((timeout) => window.clearTimeout(timeout));
            window.removeEventListener("scroll", scheduleUpdate);
            window.removeEventListener("resize", scheduleUpdate);
            window.removeEventListener("load", scheduleUpdate);
        };
    }, []);

    return (
        <button
            ref={ref}
            type="button"
            onClick={() => document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" })}
            className={`relative inline-block border-0 bg-transparent p-0 text-black dark:text-white ${className}`}
        >
            <span className="relative z-0">{children}</span>
            {clips.map((clip, index) => (
                <span
                    key={`${children}-${index}-${clip.top}-${clip.left}`}
                    aria-hidden
                    className={`pointer-events-none absolute inset-0 z-10 text-white ${className}`}
                    style={{
                        clipPath: `inset(${clip.top}px ${clip.right}px ${clip.bottom}px ${clip.left}px)`,
                    }}
                >
                    {children}
                </span>
            ))}
        </button>
    );
}

export function Services () {
    const headingClassName =
        "max-w-[calc(100vw-1rem)] cursor-pointer whitespace-normal break-words text-center font-bold uppercase leading-none tracking-tight";

    return (
        <section className="bg-background">
            <Parallax className="isolate min-h-[72rem] bg-background px-4 py-8 sm:min-h-[88rem] sm:px-6 md:min-h-[100rem]">
                <div className='sticky top-0 z-10 flex h-screen w-full flex-col items-center justify-center space-y-3 px-2 text-center sm:space-y-4'>
                    <InvertingHeading targetId="presentation" className={`${headingClassName} text-[clamp(1.8rem,8vw,4.5rem)]`}>
                        Présentation
                    </InvertingHeading>
                    <InvertingHeading targetId="parcours-etudes" className={`${headingClassName} text-[clamp(1.8rem,8vw,4.5rem)]`}>
                        Parcours & Compétences
                    </InvertingHeading>
                    <InvertingHeading targetId="realisations" className={`${headingClassName} text-[clamp(1.8rem,8vw,4.5rem)]`}>
                        Réalisations
                    </InvertingHeading>
                    <InvertingHeading targetId="preuves-illustrations" className={`${headingClassName} text-[clamp(1.5rem,6.8vw,3.8rem)]`}>
                        Preuves & Illustrations
                    </InvertingHeading>
                    <InvertingHeading targetId="veille-technologique" className={`${headingClassName} text-[clamp(1.8rem,8vw,4.5rem)]`}>
                        Veille technologique
                    </InvertingHeading>
                </div>

                <PrallaxContainer className="relative z-0 flex w-full flex-wrap justify-center gap-3 sm:gap-4">
                    <ParallaxItem
                        className="relative h-[26vh] min-h-[170px] basis-full sm:h-[32vh] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.75rem)]"
                        start={0}
                        end={-200}
                    >
                    <Image
                        data-invert-backdrop="true"
                        fill 
                        className="object-contain"
                        sizes="(max-width: 640px) 95vw, (max-width: 1024px) 48vw, 31vw"
                        src="/images/services/bigscreenmeme.webp"
                        alt="showcase"
                        unoptimized
                    />
                    </ParallaxItem>

                    <ParallaxItem
                        className="relative h-[26vh] min-h-[170px] basis-full sm:h-[32vh] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.75rem)]"
                        start={300}
                        end={-100}
                    >
                        <Image
                            data-invert-backdrop="true"
                            fill 
                            sizes="(max-width: 640px) 95vw, (max-width: 1024px) 48vw, 31vw"
                            className="object-contain"
                            src="/images/services/code-screen.webp"
                            alt="showcase"
                            unoptimized
                        />
                    </ParallaxItem>

                    <ParallaxItem
                        className="relative h-[26vh] min-h-[170px] basis-full sm:h-[32vh] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.75rem)]"
                        start={400}
                        end={-100}
                    >
                        <Image
                            data-invert-backdrop="true"
                            fill 
                            sizes="(max-width: 640px) 95vw, (max-width: 1024px) 48vw, 31vw"
                            className="object-contain"
                            src="/images/services/debug-meme.webp"
                            alt="showcase"
                            unoptimized
                        />
                    </ParallaxItem>

                    <ParallaxItem
                        className="relative h-[26vh] min-h-[170px] basis-full sm:h-[32vh] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.75rem)]"
                        start={500}
                        end={-100}
                    >
                        <Image
                            data-invert-backdrop="true"
                            fill 
                            sizes="(max-width: 640px) 95vw, (max-width: 1024px) 48vw, 31vw"
                            className="object-contain"
                            src="/images/services/blue-desk.webp"
                            alt="showcase"
                            unoptimized
                        />
                    </ParallaxItem>

                    <ParallaxItem
                        className="relative h-[26vh] min-h-[170px] basis-full sm:h-[32vh] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.75rem)]"
                        start={400}
                        end={-200}
                    >
                        <Image
                            data-invert-backdrop="true"
                            fill 
                            sizes="(max-width: 640px) 95vw, (max-width: 1024px) 48vw, 31vw"
                            className="object-contain"
                            src="/images/services/web-code.webp"
                            alt="showcase"
                            unoptimized
                        />
                    </ParallaxItem>
                </PrallaxContainer>

            </Parallax>
        </section>
    )
}
