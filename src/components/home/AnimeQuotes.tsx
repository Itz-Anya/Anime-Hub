import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const QUOTES: { quote: string; character: string; anime: string }[] = [
  { quote: "People die when they are killed.", character: "Shirou Emiya", anime: "Fate/stay night" },
  { quote: "It's not the face that makes someone a monster; it's the choices they make with their lives.", character: "Naruto Uzumaki", anime: "Naruto" },
  { quote: "The world is not beautiful, therefore it is.", character: "Kino", anime: "Kino's Journey" },
  { quote: "A lesson without pain is meaningless. For you cannot gain something without sacrificing something else in return.", character: "Edward Elric", anime: "Fullmetal Alchemist: Brotherhood" },
  { quote: "If you don't take risks, you can't create a future.", character: "Monkey D. Luffy", anime: "One Piece" },
  { quote: "Whatever you lose, you'll find it again. But what you throw away you'll never get back.", character: "Kenshin Himura", anime: "Rurouni Kenshin" },
  { quote: "Hard work is worthless for those that don't believe in themselves.", character: "Naruto Uzumaki", anime: "Naruto" },
  { quote: "The moment you think of giving up, think of the reason why you held on so long.", character: "Natsu Dragneel", anime: "Fairy Tail" },
  { quote: "If you don't like your destiny, don't accept it. Instead have the courage to change it the way you want it to be.", character: "Naruto Uzumaki", anime: "Naruto" },
  { quote: "Fear is not evil. It tells you what your weakness is. And once you know your weakness, you can become stronger.", character: "Gildarts Clive", anime: "Fairy Tail" },
  { quote: "Being lonely is more painful than getting hurt.", character: "Monkey D. Luffy", anime: "One Piece" },
  { quote: "The world isn't perfect. But it's there for us, doing the best it can. That's what makes it so damn beautiful.", character: "Roy Mustang", anime: "Fullmetal Alchemist" },
  { quote: "I'll leave tomorrow's problems to tomorrow's me.", character: "Saitama", anime: "One Punch Man" },
  { quote: "Sometimes I do feel like I'm a failure. Like there's no hope for me. But even so, I'm not gonna give up. Ever!", character: "Izuku Midoriya", anime: "My Hero Academia" },
  { quote: "The ticket to the future is always open.", character: "Vash the Stampede", anime: "Trigun" },
];

export function AnimeQuotes() {
  const [i, setI] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setI((v) => (v + 1) % QUOTES.length), 6000);
    return () => clearInterval(t);
  }, [paused]);

  const q = QUOTES[i];

  return (
    <section
      className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/15 via-accent/10 to-transparent p-6 sm:p-10">
        
        <div className="relative">
          <div className="text-xs uppercase tracking-widest text-primary">Anime quotes</div>
          <blockquote className="mt-3 min-h-[6rem] text-lg font-medium leading-relaxed sm:min-h-[5rem] sm:text-2xl">
            &ldquo;{q.quote}&rdquo;
          </blockquote>
          <div className="mt-4 text-sm">
            <span className="font-semibold">— {q.character}</span>
            <span className="text-muted-foreground"> · {q.anime}</span>
          </div>
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {QUOTES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setI(idx)}
                  aria-label={`Quote ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === i ? "w-6 bg-primary" : "w-1.5 bg-white/20 hover:bg-white/40"
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setI((v) => (v - 1 + QUOTES.length) % QUOTES.length)}
                className="rounded-full border border-border bg-card/50 p-2 hover:bg-card"
                aria-label="Previous quote"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setI((v) => (v + 1) % QUOTES.length)}
                className="rounded-full border border-border bg-card/50 p-2 hover:bg-card"
                aria-label="Next quote"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
