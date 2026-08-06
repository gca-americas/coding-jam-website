"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * "Right tool, right job" — a four-question picker on the homepage.
 *
 * The questions ask about setup and preference, never about skill. Someone
 * who works in the browser isn't a lesser builder than someone with a terminal
 * open, and a quiz that implies otherwise would put off exactly the people it's
 * meant to help. Every answer is a legitimate way to spend the evening.
 *
 * The two real deciders are (a) whether a dev environment already exists on the
 * laptop and (b) whether the person is willing to install a desktop IDE at all
 * — plenty of people simply don't want to, which is a preference and not a gap.
 *
 * Ties go to AI Studio deliberately: arriving with a half-working toolchain
 * costs the whole session, while someone comfortable with an IDE can switch up
 * at no cost. The cheaper mistake wins.
 */

type Tool = "ai-studio" | "antigravity";

const QUESTIONS: Array<{
  topic: string;
  q: string;
  answers: Array<{ label: string; tool: Tool }>;
}> = [
  {
    topic: "Your setup",
    q: "What's on the laptop you'll bring?",
    answers: [
      { label: "A browser. That's how I like to work.", tool: "ai-studio" },
      { label: "An editor, a terminal and Git — all set up and in use.", tool: "antigravity" },
    ],
  },
  {
    topic: "Installing things",
    q: "Antigravity is a desktop IDE. Where do you stand?",
    answers: [
      { label: "I'd rather not install anything — browser only, please.", tool: "ai-studio" },
      { label: "Already have it, or happy to install it before the jam.", tool: "antigravity" },
    ],
  },
  {
    topic: "How you'd rather work",
    q: "Building the thing itself — what sounds better?",
    answers: [
      { label: "Describe what I want, then shape what comes back.", tool: "ai-studio" },
      { label: "Keep my own project and let the agent edit files in it.", tool: "antigravity" },
    ],
  },
  {
    topic: "After the jam",
    q: "What do you want to walk out with?",
    answers: [
      { label: "Something live I can send people a link to.", tool: "ai-studio" },
      { label: "A repo on my machine I can keep building on.", tool: "antigravity" },
    ],
  },
];

const RESULTS: Record<
  Tool,
  {
    name: string;
    href: string;
    emoji: string;
    verdict: string;
    blurb: string;
    bullets: string[];
    dot: string;
  }
> = {
  "ai-studio": {
    name: "Google AI Studio",
    href: "/tools/ai-studio",
    emoji: "🎨",
    verdict: "Bring a browser. That's it.",
    blurb:
      "Nothing to install, nothing to break on the night. You describe what you want and shape what comes back.",
    bullets: [
      "Zero setup — open a tab and start building",
      "Prompt-first: describe it, refine it, ship it",
      "Right when the idea matters more than the plumbing",
    ],
    dot: "bg-gblue",
  },
  antigravity: {
    name: "Antigravity",
    href: "/tools/antigravity",
    emoji: "🚀",
    verdict: "Bring the laptop you already work on.",
    blurb:
      "An AI-driven IDE on your own machine. Your editor, your terminal, your repo — with the agent doing the typing.",
    bullets: [
      "Runs locally against a real project you can commit",
      "You direct and review; the agent types",
      "Right when you already have a dev setup you like",
    ],
    dot: "bg-gred",
  },
};

export default function ToolPicker() {
  const [picks, setPicks] = useState<Tool[]>([]);
  const step = picks.length;
  const done = step >= QUESTIONS.length;

  const coder = picks.filter((p) => p === "antigravity").length;
  const maker = picks.length - coder;
  // 0% = all AI Studio, 100% = all Antigravity, 50% = dead even.
  const lean = 50 + ((coder - maker) / QUESTIONS.length) * 50;

  const winner: Tool = coder > QUESTIONS.length / 2 ? "antigravity" : "ai-studio";
  const result = RESULTS[winner];
  const other = RESULTS[winner === "ai-studio" ? "antigravity" : "ai-studio"];
  const landslide = Math.abs(coder - maker) === QUESTIONS.length;

  return (
    <div className="card overflow-hidden">
      <div className="grid md:grid-cols-[1fr,1.25fr]">
        {/* Left: the framing */}
        <div className="p-8 sm:p-10 bg-cloud/50 border-b md:border-b-0 md:border-r border-line flex flex-col">
          <div className="section-eyebrow">Right tool, right job</div>
          <h2 className="h-display text-2xl sm:text-3xl mt-2 leading-tight">
            Two tools. Two very different afternoons.
          </h2>
          <p className="text-ash mt-3">
            Neither is the beginner option. It comes down to what&rsquo;s already on your laptop, and
            whether you want a desktop IDE at all. Four questions, then bring the one that fits.
          </p>

          {/* Lean meter */}
          <div className="mt-8">
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="text-gblue">🎨 AI Studio</span>
              <span className="text-gred">Antigravity 🚀</span>
            </div>
            <div className="relative mt-2 h-2.5 rounded-full bg-gradient-to-r from-gblue/25 via-line to-gred/25">
              <div
                className="absolute top-1/2 h-5 w-5 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white border-2 border-ink shadow-soft transition-[left] duration-500 ease-out"
                style={{ left: `${lean}%` }}
                aria-hidden="true"
              />
            </div>
            <div className="text-[11px] text-ash mt-2 tabular-nums">
              {step === 0
                ? "Undecided — answer the first question."
                : done
                  ? `${maker}–${coder} after four questions.`
                  : `${step} of ${QUESTIONS.length} answered.`}
            </div>
          </div>

          <div className="mt-auto pt-8 text-sm">
            <p className="text-ash">Already know which one you want?</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Link href="/tools/ai-studio" className="btn-ghost !py-2 !px-3 text-sm">
                🎨 Set up AI Studio
              </Link>
              <Link href="/tools/antigravity" className="btn-ghost !py-2 !px-3 text-sm">
                🚀 Set up Antigravity
              </Link>
            </div>
          </div>
        </div>

        {/* Right: the questions */}
        <div className="p-8 sm:p-10 flex flex-col justify-center min-h-[24rem]">
          {!done ? (
            <>
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {QUESTIONS.map((_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i < step ? "bg-ink" : i === step ? "bg-ink/30" : "bg-line"
                    }`}
                  />
                ))}
              </div>

              <div className="text-[11px] font-mono uppercase tracking-widest text-ash mt-4">
                {QUESTIONS[step].topic}
              </div>
              <h3 className="font-display font-bold text-2xl text-ink mt-1.5 leading-snug">
                {QUESTIONS[step].q}
              </h3>

              <div className="mt-5 space-y-2.5">
                {QUESTIONS[step].answers.map((a) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => setPicks((p) => [...p, a.tool])}
                    className="group w-full text-left px-4 py-3.5 rounded-xl border border-line bg-white hover:border-ink hover:shadow-soft transition-all text-ink flex items-center gap-3"
                  >
                    <span className="h-2 w-2 rounded-full bg-line group-hover:bg-ink transition-colors shrink-0" />
                    <span className="flex-1">{a.label}</span>
                    <span className="text-ash opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </button>
                ))}
              </div>

              {step > 0 && (
                <button
                  type="button"
                  onClick={() => setPicks((p) => p.slice(0, -1))}
                  className="text-xs text-ash hover:text-ink mt-5 self-start"
                >
                  ← Previous question
                </button>
              )}
            </>
          ) : (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-ash">
                {landslide ? "No contest" : "Your call, but"}
              </div>
              <div className="flex items-start gap-4 mt-3">
                <span className="text-5xl leading-none">{result.emoji}</span>
                <div>
                  <div className="font-display font-bold text-3xl text-ink leading-tight">
                    {result.name}
                  </div>
                  <p className="text-ink font-medium mt-1">{result.verdict}</p>
                </div>
              </div>
              <p className="text-sm text-ash mt-3">{result.blurb}</p>

              <ul className="mt-4 space-y-1.5">
                {result.bullets.map((b) => (
                  <li key={b} className="text-sm text-ink flex gap-2.5">
                    <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${result.dot}`} />
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href={result.href} className="btn-google !py-2 !px-4 text-sm">
                  Set it up for your jam →
                </Link>
                <button
                  type="button"
                  onClick={() => setPicks([])}
                  className="text-sm text-ash hover:text-ink"
                >
                  Play again
                </button>
              </div>

              <p className="text-xs text-ash mt-5">
                Close call? Nothing here is binding —{" "}
                <Link href={other.href} className="text-gblue hover:underline">
                  read the {other.name} guide
                </Link>{" "}
                and bring whichever sounds more like your kind of evening.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
