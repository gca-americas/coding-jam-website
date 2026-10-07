"use client";

import { useEffect, useRef, useState } from "react";

type Step = {
  emoji: string;
  time: string;
  title: string;
  body: string;
  color: "blue" | "red" | "yellow" | "green";
};

const dotBg: Record<Step["color"], string> = {
  blue: "bg-gblue",
  red: "bg-gred",
  yellow: "bg-gyellow",
  green: "bg-ggreen",
};

/** Keys, not prose — the copy prop resolves them per locale. */
const steps: Step[] = [
  { emoji: "🍕", time: "hiw.1.time", title: "hiw.1.title", body: "hiw.1.body", color: "blue" },
  { emoji: "🎬", time: "hiw.2.time", title: "hiw.2.title", body: "hiw.2.body", color: "red" },
  { emoji: "🚀", time: "hiw.3.time", title: "hiw.3.title", body: "hiw.3.body", color: "yellow" },
  { emoji: "🎤", time: "hiw.4.time", title: "hiw.4.title", body: "hiw.4.body", color: "green" },
];

export default function HowItWorks({ copy }: { copy?: Record<string, string> }) {
  const t = (k: string) => copy?.[k] ?? k;
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleSet, setVisibleSet] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!containerRef.current) return;
    const cards = containerRef.current.querySelectorAll<HTMLElement>("[data-step-idx]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.stepIdx);
            setVisibleSet((prev) => {
              if (prev.has(idx)) return prev;
              const next = new Set(prev);
              next.add(idx);
              return next;
            });
          }
        });
      },
      { threshold: 0.3 }
    );
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, []);

  return (
    <section className="container-page py-20">
      <div className="section-eyebrow">{t("hiw.eyebrow")}</div>
      <h2 className="h-display text-3xl sm:text-4xl mt-2 max-w-2xl">
        {t("hiw.title")}
      </h2>
      <p className="text-ash mt-3 max-w-xl">
        {t("hiw.lede")}
      </p>

      <div
        ref={containerRef}
        className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5"
      >
        {steps.map((s, i) => {
          const visible = visibleSet.has(i);
          return (
            <div
              key={s.title}
              data-step-idx={i}
              className={`card p-6 flex flex-col transition-all duration-500 ease-out ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-5xl leading-none" aria-hidden>{s.emoji}</span>
                <span className={`h-1.5 w-10 rounded-full ${dotBg[s.color]}`} />
              </div>
              <div className="mt-5 text-xs font-mono uppercase tracking-widest text-ash">
                {t(s.time)}
              </div>
              <div className="font-display font-semibold text-ink text-xl mt-1">
                {t(s.title)}
              </div>
              <p className="text-sm text-ash mt-2 leading-relaxed flex-1">{t(s.body)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
