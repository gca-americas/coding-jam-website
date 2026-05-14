type Item = {
  range: string;
  title: string;
  body: string;
  color: "blue" | "red" | "yellow" | "green";
};

const dot: Record<Item["color"], string> = {
  blue: "bg-gblue",
  red: "bg-gred",
  yellow: "bg-gyellow",
  green: "bg-ggreen",
};

const items: Item[] = [
  {
    range: "0:00 – 0:05",
    title: "Intro",
    body: "Welcome, name tags, snacks within reach. The facilitator sets the tone: low pressure, high creativity, ship something messy.",
    color: "blue",
  },
  {
    range: "0:05 – 0:15",
    title: "The Demo",
    body: "Facilitator demos the polished version of tonight's project. Live or pre-recorded. The message: this is what's possible.",
    color: "red",
  },
  {
    range: "0:15 – 0:20",
    title: "Form a group",
    body: "Pair up, group up, or fly solo. The room collaboratively scopes the build by prompting an LLM on the projector together.",
    color: "yellow",
  },
  {
    range: "0:20 – 1:30",
    title: "Hacking",
    body: "Fork the starter, get API keys, start building. Deep work, collaboration, experimenting with LLMs, debugging together. No judges.",
    color: "green",
  },
  {
    range: "1:30 – 2:00",
    title: "Sharing",
    body: "Three volunteer screen-shares. Celebrate the messy, brilliant, half-finished prototypes. Quick wrap-up. Tease the next jam.",
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
            <p className="text-sm text-ash mt-1 max-w-xl">{it.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
