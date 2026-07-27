import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback } from "react";
import { Quote, Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Ananya Banerjee",
    role: "Jadavpur University · Student",
    quote: "I check Omni-Shield before every late lab session. The safest route via College Street has actually changed where I walk after 9 PM.",
    ward: "Ward 92",
  },
  {
    name: "Rahul Sengupta",
    role: "Salt Lake · IT commuter",
    quote: "Green Hours nudged me to run the AC at noon instead of 8 PM. My CESC bill dropped ₹600 in a month, and the city grid is happier too.",
    ward: "Ward 31",
  },
  {
    name: "Dr. Mitali Roy",
    role: "Behala · Pediatrician",
    quote: "I tell every parent to use the AQI washout timer. Knowing exactly when PM2.5 will clear changes when I tell families to take their kids out.",
    ward: "Ward 124",
  },
  {
    name: "Imran Ali",
    role: "Howrah · Daily-wage worker",
    quote: "The heatwave advisory in Bengali saved me from a brutal afternoon shift last May. One tap, and I knew to take the 1 PM break.",
    ward: "Ward 17",
  },
  {
    name: "Sister Maria",
    role: "Park Street · Elderly outreach",
    quote: "Our cooling-hub locator points directly to the nearest shelter for any address. We've rerouted five seniors away from heatstroke this summer.",
    ward: "Ward 63",
  },
];

export function TestimonialCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" }, [
    Autoplay({ delay: 4500, stopOnInteraction: false }),
  ]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="min-w-0 flex-[0_0_100%] px-2 md:flex-[0_0_60%]">
              <div className="glass relative h-full rounded-3xl p-6 md:p-8">
                <Quote className="absolute right-5 top-5 h-8 w-8 text-emerald/30" />
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber text-amber" />
                  ))}
                </div>
                <p className="mt-4 text-base leading-relaxed text-foreground md:text-lg">"{t.quote}"</p>
                <div className="mt-5 flex items-center gap-3 border-t border-border pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald/15 text-sm font-semibold text-emerald">
                    {t.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role} · {t.ward}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-4 flex items-center justify-center gap-2">
        <button onClick={scrollPrev} className="rounded-full border border-border bg-card/60 px-3 py-1 text-xs hover:bg-accent">← Prev</button>
        <button onClick={scrollNext} className="rounded-full border border-border bg-card/60 px-3 py-1 text-xs hover:bg-accent">Next →</button>
      </div>
    </div>
  );
}
