'use client'
import { Parallax, ParallaxItem, PrallaxContainer } from "@/components/systaliko-ui/blocks/parallax";
import Image from "next/image";

export function Services () {
    return (
        <section>
            <Parallax className="min-h-[72rem] px-4 py-8 sm:min-h-[88rem] sm:px-6 md:min-h-[100rem]">
                <div className='sticky top-0 z-10 flex h-screen w-full flex-col items-center justify-center space-y-3 px-2 text-center sm:space-y-4'>
                    <h1 
                    onClick={() => document.getElementById("presentation")?.scrollIntoView({ behavior: "smooth" })}
                    className="cursor-pointer text-[clamp(1.8rem,8vw,4.5rem)] font-bold uppercase tracking-tight text-foreground/90 hover:text-foreground">
                        Présentation
                    </h1>
                    <h1
                    onClick={() => document.getElementById("parcours-etudes")?.scrollIntoView({ behavior: "smooth" })}
                    className="cursor-pointer text-[clamp(1.8rem,8vw,4.5rem)] font-bold uppercase tracking-tight text-foreground/90 hover:text-foreground">
                        Parcours & Compétences
                    </h1>
                    <h1
                    onClick={() => document.getElementById("realisations")?.scrollIntoView({ behavior: "smooth" })}
                    className="cursor-pointer text-[clamp(1.8rem,8vw,4.5rem)] font-bold uppercase tracking-tight text-foreground/90 hover:text-foreground">
                        Réalisations
                    </h1>
                    <h1
                    onClick={() => document.getElementById("preuves-illustrations")?.scrollIntoView({ behavior: "smooth" })}
                    className="cursor-pointer text-[clamp(1.5rem,6.8vw,3.8rem)] font-bold uppercase tracking-tight text-foreground/90 hover:text-foreground">
                        Preuves & Illustrations
                    </h1>
                    <h1
                    onClick={() => document.getElementById("veille-technologique")?.scrollIntoView({ behavior: "smooth" })}
                    className="cursor-pointer text-[clamp(1.8rem,8vw,4.5rem)] font-bold uppercase tracking-tight text-foreground/90 hover:text-foreground">
                        Veille technologique
                    </h1>
                </div>

                <PrallaxContainer className="flex w-full flex-wrap justify-center gap-3 sm:gap-4">
                    <ParallaxItem
                        className="relative h-[26vh] min-h-[170px] basis-full sm:h-[32vh] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.75rem)]"
                        start={0}
                        end={-200}
                    >
                    <Image
                        fill 
                        className="object-contain"
                        sizes="(max-width: 640px) 95vw, (max-width: 1024px) 48vw, 31vw"
                        src="/bigscreenmeme.jpg"
                        alt="showcase"
                    />
                    </ParallaxItem>

                    <ParallaxItem
                        className="relative h-[26vh] min-h-[170px] basis-full sm:h-[32vh] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.75rem)]"
                        start={300}
                        end={-100}
                    >
                        <Image
                            fill 
                            sizes="(max-width: 640px) 95vw, (max-width: 1024px) 48vw, 31vw"
                            className="object-contain"
                            src="https://i.pinimg.com/736x/4d/1e/d6/4d1ed63d68d090c93e5d1e5698b1cd65.jpg"
                            alt="showcase"
                        />
                    </ParallaxItem>

                    <ParallaxItem
                        className="relative h-[26vh] min-h-[170px] basis-full sm:h-[32vh] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.75rem)]"
                        start={400}
                        end={-100}
                    >
                        <Image
                            fill 
                            sizes="(max-width: 640px) 95vw, (max-width: 1024px) 48vw, 31vw"
                            className="object-contain"
                            src="https://i.pinimg.com/736x/62/9c/3d/629c3d0b08f4a5c1bd7edd83a32c452f.jpg"
                            alt="showcase"
                        />
                    </ParallaxItem>

                    <ParallaxItem
                        className="relative h-[26vh] min-h-[170px] basis-full sm:h-[32vh] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.75rem)]"
                        start={500}
                        end={-100}
                    >
                        <Image
                            fill 
                            sizes="(max-width: 640px) 95vw, (max-width: 1024px) 48vw, 31vw"
                            className="object-contain"
                            src="https://images.unsplash.com/photo-1633194486274-8953df0d4064?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDF8fHxlbnwwfHx8fHw%3D"
                            alt="showcase"
                        />
                    </ParallaxItem>

                    <ParallaxItem
                        className="relative h-[26vh] min-h-[170px] basis-full sm:h-[32vh] sm:basis-[calc(50%-0.5rem)] lg:basis-[calc(33.333%-0.75rem)]"
                        start={400}
                        end={-200}
                    >
                        <Image
                            fill 
                            sizes="(max-width: 640px) 95vw, (max-width: 1024px) 48vw, 31vw"
                            className="object-contain"
                            src="https://images.unsplash.com/photo-1547658718-1cdaa0852790?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                            alt="showcase"
                        />
                    </ParallaxItem>
                </PrallaxContainer>

            </Parallax>
        </section>
    )
}
