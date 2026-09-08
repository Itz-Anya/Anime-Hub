import { Link } from "react-router-dom";
import {
  Code2,
  Compass,
  Github,
  Heart,
  ListVideo,
  Palette,
  Search,
  Send,
  Sparkles,
  Star,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { SITE } from "../lib/site";

type Creator = {
  name: string;
  role: string;
  tag: string;
  Icon: LucideIcon;
  accent: string;
  chipBg: string;
  img: string;
  github: string;
  githubLabel: string;
  telegram: string;
  telegramLabel: string;
  quote: string;
};

const CREATORS: Creator[] = [
  {
    name: "Anya",
    role: "Designer & Developer",
    tag: "Frontend",
    Icon: Palette,
    accent: "linear-gradient(135deg, oklch(0.75 0.18 320), oklch(0.7 0.2 350))",
    chipBg: "bg-fuchsia-500/15 text-fuchsia-300",
    img: "https://random-images-anya.vercel.app/anya",
    github: "https://github.com/itz-Anya",
    githubLabel: "GitHub — itz-Anya",
    telegram: "https://t.me/SylveonLab",
    telegramLabel: "Telegram — SylveonLab",
    quote: "Crafts the calm.",
  },
  {
    name: "Murali",
    role: "API Owner & Pro Coder",
    tag: "Backend",
    Icon: Code2,
    accent: "linear-gradient(135deg, oklch(0.7 0.18 50), oklch(0.65 0.2 25))",
    chipBg: "bg-orange-500/15 text-orange-300",
    img: "https://itz-murali-images.vercel.app/api",
    github: "https://github.com/Itz-Murali",
    githubLabel: "GitHub — Itz-Murali",
    telegram: "https://t.me/ChikuBots",
    telegramLabel: "Telegram — ChikuBots",
    quote: "Powers the engine.",
  },
];

export default function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/20 via-accent/10 to-transparent p-6 sm:p-12">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/30 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-accent/30 blur-3xl" />
        <div className="relative grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
          <div className="mx-auto h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border bg-background/50 p-2 shadow-glow ring-1 ring-white/10 sm:mx-0 sm:h-28 sm:w-28">
            <img src={SITE.image} alt={`${SITE.name} logo`} className="h-full w-full object-contain" />
          </div>
          <div className="min-w-0 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-primary" /> About {SITE.name}
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">
              A love letter to <span className="text-gradient">anime</span>,
              <br className="hidden sm:block" /> built for real fans.
            </h1>
            <p className="mt-4 max-w-2xl text-sm text-muted-foreground sm:text-base">
              {SITE.name} is a modern, mobile-first platform to discover, explore, and track everything
              you watch. No accounts, no clutter — just a fast, beautiful way to find your next favorite series.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold sm:text-2xl">What you can do</h2>
        <p className="mt-1 text-sm text-muted-foreground">Everything you need to keep up with the seasons.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <FeatureCard icon={<Compass className="h-4 w-4" />} title="Discover" desc="Trending, top-rated, seasonal, and upcoming anime — curated on a single home feed." />
          <FeatureCard icon={<Search className="h-4 w-4" />} title="Advanced Search" desc="Filter by type, status, rating, and genre with instant suggestions and ⌘K shortcut." />
          <FeatureCard icon={<ListVideo className="h-4 w-4" />} title="Personal Watchlist" desc="Track progress across Watching, Completed, Plan, Dropped, and On Hold — stored locally." />
          <FeatureCard icon={<Star className="h-4 w-4" />} title="Favorites & History" desc="Save shows you love and jump back into anything you recently viewed." />
        </div>
      </section>

      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Zap className="h-4 w-4 text-primary" /> Built with care
          </div>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li>· React 18 + Create React App</li>
            <li>· React Router DOM for routing</li>
            <li>· TanStack Query + Axios for data</li>
            <li>· Tailwind CSS with custom OKLCH palette</li>
            <li>· Local-first storage — your data stays on your device</li>
          </ul>
        </div>
        <div className="glass rounded-2xl p-6">
          <div className="text-sm font-semibold">Our principles</div>
          <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
            <li>· Fast, first — every screen loads in a blink</li>
            <li>· Beautiful by default — thoughtful motion & typography</li>
            <li>· Private by design — no tracking, no accounts required</li>
            <li>· Made for fans, by fans</li>
          </ul>
        </div>
      </section>

      <section className="mt-14">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-semibold sm:text-2xl">The creators</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Two people. One shared obsession with anime & clean code.
            </p>
          </div>
          <span className="hidden text-xs text-muted-foreground sm:inline">Powered by curiosity ✦</span>
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {CREATORS.map((c) => (
            <CreatorCard key={c.name} c={c} />
          ))}
        </div>
      </section>

      <section className="mt-12 rounded-2xl border border-border bg-card/40 p-6 text-center">
        <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          Crafted with <Heart className="h-4 w-4 text-accent" /> by Anya &amp; Murali.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-2 text-sm font-semibold text-primary-foreground shadow-glow"
          >
            <Compass className="h-4 w-4" /> Start exploring
          </Link>
          <Link
            to="/watchlist"
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ListVideo className="h-4 w-4" /> Your watchlist
          </Link>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
          {icon}
        </span>
        {title}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function CreatorCard({ c }: { c: Creator }) {
  const Icon = c.Icon;
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-border bg-card/40 p-5 transition-all hover:-translate-y-0.5 hover:shadow-glow">
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-40 blur-3xl transition-opacity group-hover:opacity-70"
        style={{ background: c.accent }}
      />
      <div className="relative flex items-center gap-4">
        <div
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full p-[2px] shadow-lg"
          style={{ background: c.accent }}
        >
          <div className="h-full w-full overflow-hidden rounded-full bg-background">
            <img src={c.img} alt={c.name} className="h-full w-full rounded-full object-cover" loading="lazy" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-semibold">{c.name}</h3>
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${c.chipBg}`}>
              <Icon className="h-3 w-3" /> {c.tag}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{c.role}</p>
          <p className="mt-1 text-xs italic text-foreground/70">“{c.quote}”</p>
        </div>
      </div>
      <div className="relative mt-5 flex flex-wrap gap-2">
        <a
          href={c.github}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={c.githubLabel}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/40 px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <Github className="h-3.5 w-3.5" /> GitHub
        </a>
        <a
          href={c.telegram}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={c.telegramLabel}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background/40 px-3 py-1.5 text-xs text-muted-foreground transition hover:text-foreground"
        >
          <Send className="h-3.5 w-3.5" /> Telegram
        </a>
      </div>
    </article>
  );
}
