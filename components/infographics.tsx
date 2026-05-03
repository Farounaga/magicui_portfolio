import type { CSSProperties } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BrainCircuit,
  Braces,
  Building2,
  ChartNoAxesColumnIncreasing,
  CheckCircle2,
  CircleDot,
  CloudOff,
  Code2,
  Database,
  FileText,
  Globe2,
  GraduationCap,
  Languages,
  Network,
  RefreshCcw,
  Search,
  Server,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  Trophy,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";

type PipelineStep = {
  label: string;
  detail?: string;
  icon?: LucideIcon;
};

type StatItem = {
  value: string;
  label: string;
};

type ScoreItem = {
  label: string;
  value: number;
};

type SkillSummaryItem = {
  label: string;
  value: number;
  icon?: LucideIcon;
};

type DashboardMetric = {
  label: string;
  value: string;
  detail?: string;
  icon?: LucideIcon;
};

type EvidenceProcessProps = {
  context: string;
  action: string;
  result: string;
  trace: string;
};

const DEFAULT_PIPELINE_ICONS = [FileText, Search, BrainCircuit, Network, BarChart3, BadgeCheck];

export const RB_TKTS_PIPELINE: PipelineStep[] = [
  { label: "Zendesk XML/API", detail: "Extraction des tickets", icon: TicketCheck },
  { label: "Nettoyage", detail: "Normalisation + déduplication", icon: RefreshCcw },
  { label: "Embeddings locaux", detail: "Ollama sans cloud externe", icon: BrainCircuit },
  { label: "Clustering", detail: "Thèmes + similarité cosinus", icon: Network },
  { label: "Rapport HTML", detail: "Lecture support et produit", icon: FileText },
];

export const ESPORT_MATCHING_SCORE: ScoreItem[] = [
  { label: "Jeux en commun", value: 60 },
  { label: "Compatibilité niveau", value: 18 },
  { label: "Région", value: 10 },
  { label: "Fuseau horaire", value: 7 },
  { label: "Style de jeu", value: 5 },
];

export const SYADEM_ECOSYSTEM = [
  { label: "SIV", detail: "Systèmes d'information vaccinale", icon: Server },
  { label: "NUVA", detail: "Terminologie vaccinale", icon: Database },
  { label: "SADV / Mentor", detail: "Aide à la décision", icon: BrainCircuit },
  { label: "CVN", detail: "Carnet numérique", icon: FileText },
  { label: "Colibri", detail: "Centres de vaccination", icon: Building2 },
];

export const EXPERIENCE_WORKFLOW: PipelineStep[] = [
  { label: "Ticket utilisateur", detail: "Demande ou incident", icon: TicketCheck },
  { label: "Diagnostic", detail: "Reproduction + analyse", icon: Search },
  { label: "Analyse fonctionnelle", detail: "Lien métier / technique", icon: Workflow },
  { label: "Réponse ou outil", detail: "Support + automatisation", icon: CheckCircle2 },
];

export const SKILL_SUMMARY: SkillSummaryItem[] = [
  { label: "Backend", value: 70, icon: Server },
  { label: "Frontend", value: 38, icon: Braces },
  { label: "Langues", value: 92, icon: Languages },
  { label: "Support", value: 82, icon: Users },
];

export function PipelineGraphic({ steps, title }: { steps: PipelineStep[]; title?: string }) {
  return (
    <div className="space-y-4 border border-border/50 p-4">
      {title ? <p className="text-xs uppercase tracking-[0.18em] text-emerald-400">{title}</p> : null}
      <div
        className="grid gap-3 md:[grid-template-columns:repeat(var(--step-count),minmax(0,1fr))]"
        style={{ "--step-count": steps.length } as CSSProperties}
      >
        {steps.map((step, index) => {
          const Icon = step.icon ?? DEFAULT_PIPELINE_ICONS[index % DEFAULT_PIPELINE_ICONS.length];

          return (
            <div key={`${step.label}-${index}`} className="relative min-h-32 border border-border/45 p-3">
              {index < steps.length - 1 ? (
                <ArrowRight className="absolute -right-5 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-emerald-400 md:block" />
              ) : null}
              <div className="flex h-full flex-col justify-between gap-4">
                <div className="flex items-center justify-between gap-3">
                  <Icon className="h-5 w-5 text-emerald-400" />
                  <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold uppercase tracking-[0.12em]">{step.label}</p>
                  {step.detail ? <p className="text-xs leading-relaxed text-muted-foreground">{step.detail}</p> : null}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function LocalAiNote() {
  return (
    <div className="grid gap-3 border border-emerald-400/45 bg-emerald-400/5 p-4 sm:grid-cols-[auto_1fr]">
      <CloudOff className="h-6 w-6 text-emerald-400" />
      <div className="space-y-1">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-400">IA locale</p>
        <p className="text-sm leading-relaxed text-foreground/80">
          Vectorisation et génération de thèmes exécutées localement pour limiter l'exposition des données sensibles.
        </p>
      </div>
    </div>
  );
}

export function MatchingScoreGraphic({ items }: { items: ScoreItem[] }) {
  const total = items.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="grid gap-5 border border-border/50 p-4 md:grid-cols-[180px_1fr]">
      <div className="flex aspect-square items-center justify-center rounded-full border border-emerald-400/50 bg-emerald-400/5">
        <div className="text-center">
          <p className="font-mono text-4xl font-semibold text-emerald-400">{total}</p>
          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">score /100</p>
        </div>
      </div>
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.18em] text-emerald-400">Matching explicable</p>
        {items.map((item) => (
          <div key={item.label} className="space-y-1">
            <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.14em]">
              <span className="text-foreground/80">{item.label}</span>
              <span className="font-mono text-emerald-400">{item.value}</span>
            </div>
            <div className="h-px bg-border">
              <div className="h-px bg-emerald-400" style={{ width: `${item.value}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ContributionMap({ items }: { items: string[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((item, index) => (
        <div key={item} className="border border-border/50 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Code2 className="h-4 w-4 text-emerald-400" />
            <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
          </div>
          <p className="text-sm leading-relaxed text-foreground/85">{item}</p>
        </div>
      ))}
    </div>
  );
}

export function AlternanceFlow() {
  const items = [
    { label: "École", icon: GraduationCap },
    { label: "Projet", icon: Workflow },
    { label: "Entreprise", icon: Building2 },
    { label: "Compétence", icon: Trophy },
  ];

  return (
    <div className="grid gap-3 border border-border/50 p-4 sm:grid-cols-4">
      {items.map((item, index) => (
        <div key={item.label} className="relative flex min-h-24 flex-col justify-between gap-4 border border-border/45 p-3">
          {index < items.length - 1 ? (
            <ArrowRight className="absolute -right-5 top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-emerald-400 sm:block" />
          ) : null}
          <item.icon className="h-5 w-5 text-emerald-400" />
          <p className="text-sm font-semibold uppercase tracking-[0.14em]">{item.label}</p>
        </div>
      ))}
    </div>
  );
}

export function EcosystemMap() {
  return (
    <div className="grid gap-3 border border-border/50 p-4 md:grid-cols-[1fr_160px_1fr]">
      <div className="grid gap-3">
        {SYADEM_ECOSYSTEM.slice(0, 2).map((item) => (
          <EcosystemNode key={item.label} {...item} />
        ))}
      </div>
      <div className="flex min-h-36 items-center justify-center border border-emerald-400/50 bg-emerald-400/5 p-4 text-center">
        <div>
          <ShieldCheck className="mx-auto mb-3 h-7 w-7 text-emerald-400" />
          <p className="text-lg font-semibold uppercase tracking-[0.18em]">SYADEM</p>
          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">vaccination & prévention</p>
        </div>
      </div>
      <div className="grid gap-3">
        {SYADEM_ECOSYSTEM.slice(2).map((item) => (
          <EcosystemNode key={item.label} {...item} />
        ))}
      </div>
    </div>
  );
}

function EcosystemNode({ label, detail, icon: Icon }: { label: string; detail: string; icon: LucideIcon }) {
  return (
    <div className="flex items-start gap-3 border border-border/45 p-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.13em]">{label}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

export function StatsInfographic({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="border border-border/50 p-4">
          <p className="font-mono text-3xl font-semibold text-emerald-400">{stat.value}</p>
          <p className="mt-2 text-xs uppercase tracking-[0.15em] text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

export function HybridProfileGraphic() {
  return (
    <div className="grid gap-3 border border-border/50 p-4 md:grid-cols-[1fr_auto_1fr_auto_1fr]">
      <ProfilePillar icon={Users} title="Support" body="Comprendre les utilisateurs, diagnostiquer et expliquer." />
      <PlusSign />
      <ProfilePillar icon={Code2} title="Développement" body="Automatiser, structurer et fiabiliser les outils." />
      <PlusSign label="=" />
      <ProfilePillar icon={Sparkles} title="Profil hybride" body="Faire le pont entre besoin métier et solution technique." />
    </div>
  );
}

function ProfilePillar({ icon: Icon, title, body }: { icon: LucideIcon; title: string; body: string }) {
  return (
    <div className="space-y-3 border border-border/45 p-3">
      <Icon className="h-5 w-5 text-emerald-400" />
      <p className="text-sm font-semibold uppercase tracking-[0.14em]">{title}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function PlusSign({ label = "+" }: { label?: string }) {
  return <div className="flex items-center justify-center font-mono text-xl text-emerald-400">{label}</div>;
}

export function SkillSynthesis({ items = SKILL_SUMMARY }: { items?: SkillSummaryItem[] }) {
  return (
    <div className="grid gap-4 border border-border/50 p-4 md:grid-cols-2">
      {items.map((item) => {
        const Icon = item.icon ?? ChartNoAxesColumnIncreasing;

        return (
          <div key={item.label} className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.15em]">
              <span className="inline-flex items-center gap-2 text-foreground/85">
                <Icon className="h-4 w-4 text-emerald-400" />
                {item.label}
              </span>
              <span className="font-mono text-emerald-400">{item.value}%</span>
            </div>
            <div className="h-2 bg-border/70">
              <div className="h-full bg-emerald-400" style={{ width: `${item.value}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function VeilleDashboard({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon ?? CircleDot;

        return (
          <div key={metric.label} className="border border-border/50 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <Icon className="h-4 w-4 text-emerald-400" />
              <span className="h-2 w-2 bg-emerald-400" />
            </div>
            <p className="font-mono text-2xl font-semibold">{metric.value}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.14em] text-muted-foreground">{metric.label}</p>
            {metric.detail ? <p className="mt-2 text-xs leading-relaxed text-foreground/70">{metric.detail}</p> : null}
          </div>
        );
      })}
    </div>
  );
}

export function VeilleFlow() {
  return (
    <PipelineGraphic
      title="Méthode de veille"
      steps={[
        { label: "Sources", detail: "Flux RSS IT / cyber", icon: Globe2 },
        { label: "Collecte", detail: "API interne", icon: RefreshCcw },
        { label: "Filtrage", detail: "Langue + source", icon: Search },
        { label: "Lecture", detail: "Articles récents", icon: FileText },
        { label: "Suivi", detail: "Mise à jour datée", icon: BadgeCheck },
      ]}
    />
  );
}

export function EvidenceProcess({ context, action, result, trace }: EvidenceProcessProps) {
  const items = [
    { label: "Contexte", value: context, icon: CircleDot },
    { label: "Action", value: action, icon: Workflow },
    { label: "Résultat", value: result, icon: CheckCircle2 },
    { label: "Trace", value: trace, icon: FileText },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-4">
      {items.map((item, index) => (
        <div key={item.label} className="border border-border/45 p-3">
          <div className="mb-3 flex items-center justify-between gap-3">
            <item.icon className="h-4 w-4 text-emerald-400" />
            <span className="font-mono text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
          </div>
          <p className="text-xs uppercase tracking-[0.15em] text-emerald-400">{item.label}</p>
          <p className="mt-2 text-xs leading-relaxed text-foreground/80">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
