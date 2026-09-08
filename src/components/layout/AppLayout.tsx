import { Link, useLocation, useNavigate } from "react-router-dom";
import { Compass, Heart, Info, ListVideo, Search } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { SITE } from "../../lib/site";

const nav = [
  { to: "/", label: "Discover", icon: Compass },
  { to: "/search", label: "Search", icon: Search },
  { to: "/watchlist", label: "Watchlist", icon: ListVideo },
  { to: "/about", label: "About", icon: Info },
] as const;

export function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        navigate("/search");
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [navigate]);

  return (
    <div className="min-h-screen">
      <header
        className={cn(
          "sticky top-0 z-40 transition-all",
          scrolled ? "backdrop-blur-xl bg-background/70 border-b border-border" : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg shadow-glow ring-1 ring-white/10">
              <img src={SITE.image} alt={`${SITE.name} logo`} className="h-full w-full object-cover" />
            </span>
            <span className="text-lg tracking-tight">
              Anime<span className="text-gradient">Hub</span>
            </span>
          </Link>
          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {nav.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                    active && "text-foreground bg-white/5",
                  )}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to="/search"
              className="glass inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Search anime</span>
              <kbd className="hidden rounded bg-white/10 px-1.5 py-0.5 text-[10px] sm:inline">⌘K</kbd>
            </Link>
          </div>
        </div>
      </header>
      <main className="pb-24">{children}</main>
      <nav className="fixed bottom-3 left-1/2 z-40 flex -translate-x-1/2 gap-1 rounded-full glass px-2 py-1.5 md:hidden">
        {nav.map((n) => {
          const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              to={n.to}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[10px]",
                active
                  ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                  : "text-muted-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>
      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4">
          <p className="flex items-center justify-center gap-1.5">
            Crafted with <Heart className="h-3 w-3 text-accent" /> by Anya &amp; Murali.
          </p>
        </div>
      </footer>
    </div>
  );
}
