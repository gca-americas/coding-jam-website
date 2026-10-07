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

export type PickerCopy = Record<string, string>;

const QUESTIONS: Array<{
  topic: string;
  q: string;
  answers: Array<{ label: string; tool: Tool }>;
}> = [
  {
    topic: "tools.q1.topic",
    q: "tools.q1.q",
    answers: [
      { label: "tools.q1.a1", tool: "ai-studio" },
      { label: "tools.q1.a2", tool: "antigravity" },
    ],
  },
  {
    topic: "tools.q2.topic",
    q: "tools.q2.q",
    answers: [
      { label: "tools.q2.a1", tool: "ai-studio" },
      { label: "tools.q2.a2", tool: "antigravity" },
    ],
  },
  {
    topic: "tools.q3.topic",
    q: "tools.q3.q",
    answers: [
      { label: "tools.q3.a1", tool: "ai-studio" },
      { label: "tools.q3.a2", tool: "antigravity" },
    ],
  },
  {
    topic: "tools.q4.topic",
    q: "tools.q4.q",
    answers: [
      { label: "tools.q4.a1", tool: "ai-studio" },
      { label: "tools.q4.a2", tool: "antigravity" },
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
    verdict: "tools.aiStudio.verdict",
    blurb:
      "tools.aiStudio.blurb",
    bullets: ["tools.aiStudio.b1", "tools.aiStudio.b2", "tools.aiStudio.b3"],
    dot: "bg-gblue",
  },
  antigravity: {
    name: "Antigravity",
    href: "/tools/antigravity",
    emoji: "🚀",
    verdict: "tools.antigravity.verdict",
    blurb:
      "tools.antigravity.blurb",
    bullets: ["tools.antigravity.b1", "tools.antigravity.b2", "tools.antigravity.b3"],
    dot: "bg-gred",
  },
};

export default function ToolPicker({ copy }: { copy: PickerCopy }) {
  const c = (k: string) => copy[k] ?? k;
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
          <div className="section-eyebrow">{c("tools.eyebrow")}</div>
          <h2 className="h-display text-2xl sm:text-3xl mt-2 leading-tight">
            {c("tools.title")}
          </h2>
          <p className="text-ash mt-3">
            {c("tools.lede")}
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
                ? c("tools.undecided")
                : done
                  ? c("tools.tally").replace("{a}", String(maker)).replace("{b}", String(coder))
                  : c("tools.answered").replace("{n}", String(step)).replace("{total}", String(QUESTIONS.length))}
            </div>
          </div>

          <div className="mt-auto pt-8 text-sm">
            <p className="text-ash">{c("tools.known")}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Link href="/tools/ai-studio" className="btn-ghost !py-2 !px-3 text-sm">
                🎨 {c("tools.setupAiStudio")}
              </Link>
              <Link href="/tools/antigravity" className="btn-ghost !py-2 !px-3 text-sm">
                🚀 {c("tools.setupAntigravity")}
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
                {c(QUESTIONS[step].topic)}
              </div>
              <h3 className="font-display font-bold text-2xl text-ink mt-1.5 leading-snug">
                {c(QUESTIONS[step].q)}
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
                    <span className="flex-1">{c(a.label)}</span>
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
                  {c("tools.prev")}
                </button>
              )}
            </>
          ) : (
            <div>
              <div className="text-[11px] font-mono uppercase tracking-widest text-ash">
                {landslide ? c("tools.noContest") : c("tools.yourCall")}
              </div>
              <div className="flex items-start gap-4 mt-3">
                <span className="text-5xl leading-none">{result.emoji}</span>
                <div>
                  <div className="font-display font-bold text-3xl text-ink leading-tight">
                    {result.name}
                  </div>
                  <p className="text-ink font-medium mt-1">{c(result.verdict)}</p>
                </div>
              </div>
              <p className="text-sm text-ash mt-3">{c(result.blurb)}</p>

              <ul className="mt-4 space-y-1.5">
                {result.bullets.map((b) => (
                  <li key={b} className="text-sm text-ink flex gap-2.5">
                    <span className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${result.dot}`} />
                    {c(b)}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link href={result.href} className="btn-google !py-2 !px-4 text-sm">
                  {c("tools.setupCta")}
                </Link>
                <button
                  type="button"
                  onClick={() => setPicks([])}
                  className="text-sm text-ash hover:text-ink"
                >
                  {c("tools.playAgain")}
                </button>
              </div>

              <p className="text-xs text-ash mt-5">
                {c("tools.closeCall.a")}{" "}
                <Link href={other.href} className="text-gblue hover:underline">
                  {c("tools.closeCall.link").replace("{name}", other.name)}
                </Link>{" "}
                {c("tools.closeCall.b")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
