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

const fontSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio Template",
  description: "A portfolio template to showcase your work and experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
            <MusicVisualizerPlayer />
          </AudioVisualizerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
