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

const steps: Step[] = [
  {
    emoji: "🍕",
    time: "0:00",
    title: "Show up",
    body: "Bring a laptop. No prep, no prior project. The room handles the rest.",
    color: "blue",
  },
  {
    emoji: "🎬",
    time: "10 min",
    title: "Watch the demo",
    body: "The polished version of tonight's app, shipped live by the facilitator. This is what's possible.",
    color: "red",
  },
  {
    emoji: "🚀",
    time: "75 min",
    title: "Build",
    body: "Antigravity writes the code. You direct it with a one-page PRD. Fix the doc, not the code.",
    color: "yellow",
  },
  {
    emoji: "🎤",
    time: "Walk out",
    title: "Show it off",
    body: "A working app on your laptop. A new collaborator. Bragging rights.",
    color: "green",
  },
];

export default function HowItWorks() {
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
      <div className="section-eyebrow">How a jam works</div>
      <h2 className="h-display text-3xl sm:text-4xl mt-2 max-w-2xl">
        Four beats, and you&rsquo;re out with a working app.
      </h2>
      <p className="text-ash mt-3 max-w-xl">
        No prep required. No prior project. Drop in to any track on any week.
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
                {s.time}
              </div>
              <div className="font-display font-semibold text-ink text-xl mt-1">
                {s.title}
              </div>
              <p className="text-sm text-ash mt-2 leading-relaxed flex-1">{s.body}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
