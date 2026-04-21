import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/sections/header";
import { Footer } from "@/sections/footer";
import { ThemeProvider } from "next-themes";
import { ScrollProgress } from "@/components/scroll-progress"
import { AudioVisualizerProvider } from "@/components/audio-visualizer-context";
import { MusicVisualizerPlayer } from "@/components/music-visualizer-player";
import { DeferredVisualEffects } from "@/components/deferred-visual-effects";
import { FloatingTimer } from "@/components/floating-timer";

const fontSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio - Vladimir Spirine",
  description: "Portfolio de Vladimir Spirine - BTS SIO SLAM, projets, compétences et réalisations professionnelles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${geistMono.variable} antialiased`}
      >
        <ScrollProgress color="bg-green-300" />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AudioVisualizerProvider>
            <DeferredVisualEffects />
            <div className="relative z-10">
              <Header />
              {children}
              <Footer />
            </div>
            <FloatingTimer />
            <MusicVisualizerPlayer />
          </AudioVisualizerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
