import Link from "next/link";

type Item = {
  range: string;
  title: string;
  body: string;
  color: "blue" | "red" | "yellow" | "green";
  /** Optional follow-ups, e.g. the tool setup guides during the setup slot. */
  links?: Array<{ href: string; label: string }>;
};

const dot: Record<Item["color"], string> = {
  blue: "bg-gblue",
  red: "bg-gred",
  yellow: "bg-gyellow",
  green: "bg-ggreen",
};

const items: Item[] = [
  {
    range: "0:00 – 0:15",
    title: "Intro",
    body: "Grab a name tag and a slice, say hello to the instructor, and meet the people either side of you — you'll be asking them things later, so it pays to know their names now. Low pressure, high creativity, ship something messy.\n\nThen a quick word on what the room is building tonight, and you're off.",
    color: "blue",
  },
  {
    range: "0:15 – 0:30",
    title: "Credits & setup",
    body: "The instructor shares the Google Cloud credits with the room. Everyone gets their environment ready — whichever tool they brought. Nobody should be installing anything once the build starts.",
    color: "red",
    links: [
      { href: "/tools/ai-studio", label: "🎨 AI Studio setup" },
      { href: "/tools/antigravity", label: "🚀 Antigravity setup" },
    ],
  },
  {
    range: "0:30 – 1:35",
    title: "Build",
    body: "Heads down, and enjoy it — this is the part everyone came for. The agent does the typing; you decide what it's making. Ask the room when you get stuck; someone two seats away hit the same wall ten minutes ago.\n\nWant more structure? The codelab walks the spec-driven route — Setup → Plan → Review → Build → API → Verify — but nobody has to follow it.",
    color: "yellow",
  },
  {
    range: "1:35 – 2:00",
    title: "Share & submit",
    body: "Show the room what you made — two minutes, screen-shared from your seat. Half-finished is welcome; the wobbly ones are usually the most interesting. Say what surprised you along the way, and cheer for everyone else while you're at it.\n\nThen submit your build before you leave. This is the one thing not to skip — it's what puts your name and your chapter on the showcase, and it takes about two minutes.",
    color: "blue",
  },
];

export default function Timeline() {
  return (
    <ol className="relative">
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-line hidden sm:block" />
      {items.map((it) => (
        <li key={it.range} className="flex gap-4 sm:gap-6 pb-6 last:pb-0">
          <div className="relative shrink-0">
            <div className={`h-8 w-8 rounded-full ${dot[it.color]} ring-4 ring-white shadow-soft`} />
          </div>
          <div className="flex-1 -mt-1">
            <div className="text-xs font-mono text-ash">{it.range}</div>
            <div className="font-display font-semibold text-ink mt-0.5">{it.title}</div>
            <p className="text-sm text-ash mt-1 max-w-xl whitespace-pre-line">{it.body}</p>
            {it.links && (
              <div className="mt-2 flex flex-wrap gap-2">
                {it.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-xs font-medium px-2.5 py-1 rounded-full border border-line bg-white text-ink hover:border-gblue hover:text-gblue transition-colors"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
