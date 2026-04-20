"use client";

import * as React from "react";
import { motion } from "motion/react";
import { HeadingWaveText } from "@/components/effects/heading-wave-text";
import { RevealText } from "@/components/effects/reveal-text";

const EMAIL = "7h16ciolq@mozmail.com";

export function Contact() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [status, setStatus] = React.useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name || !email || !message) {
      setStatus("Veuillez renseigner au minimum le nom, l'e-mail et le message.");
      return;
    }

    const finalSubject = subject || `Contact depuis le portfolio - ${name}`;
    const body = [
      `Nom : ${name}`,
      `E-mail : ${email}`,
      "",
      message,
    ].join("\n");

    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(body)}`;
    setStatus("Votre client de messagerie a été ouvert. Vous pouvez envoyer votre message.");
  }

  return (
    <section id="contact" className="px-6 py-20 md:px-10 lg:px-14">
      <div className="mx-auto max-w-6xl space-y-12">
        <header className="space-y-4 border-t border-border/60 pt-8">
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-6xl">
            <HeadingWaveText>Contact</HeadingWaveText>
          </h2>
          <p className="max-w-3xl text-foreground/85 leading-relaxed">
            <RevealText text="Un projet, une alternance ou une collaboration : contactez-moi directement." />
          </p>
        </header>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.35 }}
          className="grid gap-6"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <label className="space-y-2 text-sm uppercase tracking-[0.15em] text-muted-foreground">
              Nom
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="h-11 w-full border-b border-border bg-transparent px-0 text-base text-foreground outline-none focus:border-emerald-400"
                placeholder="Votre nom"
              />
            </label>

            <label className="space-y-2 text-sm uppercase tracking-[0.15em] text-muted-foreground">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 w-full border-b border-border bg-transparent px-0 text-base text-foreground outline-none focus:border-emerald-400"
                placeholder="votre.adresse@email.com"
              />
            </label>
          </div>

          <label className="space-y-2 text-sm uppercase tracking-[0.15em] text-muted-foreground">
            Sujet
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="h-11 w-full border-b border-border bg-transparent px-0 text-base text-foreground outline-none focus:border-emerald-400"
              placeholder="Sujet du message"
            />
          </label>

          <label className="space-y-2 text-sm uppercase tracking-[0.15em] text-muted-foreground">
            Message
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className="min-h-[140px] w-full border-b border-border bg-transparent px-0 py-2 text-base text-foreground outline-none focus:border-emerald-400"
              placeholder="Écris ton message"
            />
          </label>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border/50 pt-4">
            <p className="text-sm text-muted-foreground">Ou directement : {EMAIL}</p>
            <button
              type="submit"
              className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400 hover:text-emerald-300"
            >
              Envoyer
            </button>
          </div>

          {status ? <p className="text-sm text-foreground/80">{status}</p> : null}
        </motion.form>
      </div>
    </section>
  );
}
