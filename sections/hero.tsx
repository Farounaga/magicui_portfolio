'use client'
import * as React from "react";
import { ContainerStagger } from "@/components/systaliko-ui/blocks/container-stagger";
import Image from "next/image";
import { motion, MotionConfig } from 'motion/react'
import { ANIMATION_VARIANTS } from "@/components/systaliko-ui/utils/animation-variants";
import GithubIcon from "@/components/icons/github-icon";
import LinkedinIcon from "@/components/icons/linkedin-icon";
import RotatingText from '@/components/RotatingText'
import { ArrowDown } from "lucide-react";

export function Hero () {
    const scaleAnimation = ANIMATION_VARIANTS['z']
    const opacityAnimation = ANIMATION_VARIANTS['default']
    const [titleReady, setTitleReady] = React.useState(false)

    React.useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            setTitleReady(true)
        })

        const onLoad = () => setTitleReady(true)
        const timeout = window.setTimeout(() => {
            setTitleReady(true)
        }, 1200)

        window.addEventListener("load", onLoad, { once: true })

        return () => {
            window.cancelAnimationFrame(frame)
            window.clearTimeout(timeout)
            window.removeEventListener("load", onLoad)
        }
    }, [])

    const scrollToNextSection = () => {
        document.getElementById("presentation")?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <section className="space-y-6 py-12 px-6">
            <ContainerStagger className="min-h-[75vh] place-content-center place-items-center text-center space-y-4">
                <MotionConfig transition={{ duration: 0.3}}>
                    <motion.div
                        className="relative rounded-xl w-28 aspect-square overflow-hidden"
                        variants={scaleAnimation}
                    >
                        <a
                        href="https://www.github.com/Farounaga"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block size-full"
                        >
                        <Image
                            fill
                            className="object-contain"
                            sizes="(max-width: 468px) 30vw, 200px"
                            src="https://i.giphy.com/TFPdmm3rdzeZ0kP3zG.webp"
                            alt="vs"
                        />
                        </a>
                    </motion.div>

                    <motion.h1
                        className="text-[7vw] leading-none font-bold tracking-tight uppercase"
                        initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                        animate={titleReady ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 16, filter: "blur(8px)" }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                    >
                        Vladimir Spirine
                    </motion.h1>

                    <motion.div
                        variants={opacityAnimation}
                        className="flex justify-center"
                    >
                        <RotatingText
                            texts={[
                            "Alternant SIO SLAM",
                            "Support chez SYADEM",
                            "Développeur chez SYADEM",
                            "Passionné par l'informatique",
                            ]}
                            mainClassName="inline-flex w-fit max-w-[90vw] overflow-hidden rounded-lg px-2 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-2 text-center text-base sm:text-lg md:text-xl font-medium tracking-tight bg-emerald-300 text-emerald-950 dark:bg-emerald-400/15 dark:text-emerald-200 dark:ring-1 dark:ring-emerald-300/20"
                            splitBy="words"
                            staggerFrom="center"
                            initial={{ y: 14, opacity: 0, filter: "blur(8px)", scale: 0.985 }}
                            animate={{ y: 0, opacity: 1, filter: "blur(0px)", scale: 1 }}
                            exit={{ y: -12, opacity: 0, filter: "blur(6px)", scale: 1.01 }}
                            staggerDuration={0.05}
                            splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                            transition={{ type: 'spring', damping: 24, stiffness: 230, mass: 0.9 }}
                            rotationInterval={4300}
                        />
                    </motion.div>
                    
                    <motion.div className="flex gap-2" variants={opacityAnimation}>
                        <a href="https://www.github.com/Farounaga" target="_blank" className="rounded-md p-2 inline-flex items-center justify-center bg-secondary/0 hover:bg-secondary">
                            <GithubIcon className="size-6" />
                        </a>
                        <a href="https://www.linkedin.com/in/vladimir-spirine-184069173" target="_blank" className="rounded-md p-2 inline-flex items-center justify-center bg-secondary/0 hover:bg-secondary">
                            <LinkedinIcon className="size-6" />
                        </a>
                    </motion.div>

                    <motion.button
                        type="button"
                        onClick={scrollToNextSection}
                        variants={opacityAnimation}
                        className="mt-3 inline-flex items-center gap-2 border-b border-emerald-400/50 px-1 py-1 text-sm uppercase tracking-[0.18em] text-emerald-500 hover:text-emerald-400"
                    >
                        Voir la suite
                        <ArrowDown className="h-4 w-4" />
                    </motion.button>
                </MotionConfig>
            </ContainerStagger>
        </section>
    )
}
