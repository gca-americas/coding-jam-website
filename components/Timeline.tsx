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
    title: "tl.intro.title",
    body: "tl.intro.body",
    color: "blue",
  },
  {
    range: "0:15 – 0:30",
    title: "tl.setup.title",
    body: "tl.setup.body",
    color: "red",
    links: [
      { href: "/tools/ai-studio", label: "tl.setup.aiStudio" },
      { href: "/tools/antigravity", label: "tl.setup.antigravity" },
    ],
  },
  {
    range: "0:30 – 1:35",
    title: "tl.build.title",
    body: "tl.build.body",
    color: "yellow",
  },
  {
    range: "1:35 – 2:00",
    title: "tl.share.title",
    body: "tl.share.body",
    color: "blue",
  },
];

export default function Timeline({ copy }: { copy?: Record<string, string> }) {
  // TryJamBuilder is a client component, so the catalogue is passed in rather
  // than read here. Falling back to the key keeps the shape visible if a caller
  // forgets, instead of rendering nothing.
  const t = (k: string) => copy?.[k] ?? k;
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
            <div className="font-display font-semibold text-ink mt-0.5">{t(it.title)}</div>
            <p className="text-sm text-ash mt-1 max-w-xl whitespace-pre-line">{t(it.body)}</p>
            {it.links && (
              <div className="mt-2 flex flex-wrap gap-2">
                {it.links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="text-xs font-medium px-2.5 py-1 rounded-full border border-line bg-white text-ink hover:border-gblue hover:text-gblue transition-colors"
                  >
                    {t(l.label)}
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
