import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { Header } from "@/sections/header";
import { Footer } from "@/sections/footer";
import { ThemeProvider } from "next-themes";
import { ScrollProgress } from "@/components/scroll-progress"
import { ClientEffectsShell } from "@/components/client-effects-shell";
import { StartupReveal } from "@/components/startup-reveal";

const geistMono = GeistMono;
const geistSans = GeistSans;

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
    <html
      lang="fr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body
        className={`${geistSans.className} antialiased`}
      >
        <ScrollProgress color="bg-green-300" />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <StartupReveal>
            <ClientEffectsShell />
            <div className="relative z-10">
              <Header />
              {children}
              <Footer />
            </div>
          </StartupReveal>
        </ThemeProvider>
      </body>
    </html>
  );
}
