type Phase = {
  n: string;
  title: string;
  minutes: number;
  body: string;
  color: "blue" | "red" | "yellow" | "green";
};

const dotBg: Record<Phase["color"], string> = {
  blue: "bg-gblue",
  red: "bg-gred",
  yellow: "bg-gyellow",
  green: "bg-ggreen",
};

const phases: Phase[] = [
  {
    n: "1",
    title: "Setup",
    minutes: 12,
    body: "Install Antigravity, clone the starter, init the environment.",
    color: "blue",
  },
  {
    n: "2",
    title: "Plan",
    minutes: 9,
    body: "Spec conversation generates three docs: PRD, UI/UX, engineering + tests.",
    color: "red",
  },
  {
    n: "3",
    title: "Review",
    minutes: 4,
    body: "Read the docs. Leave inline comments. Iterate until approved.",
    color: "yellow",
  },
  {
    n: "4",
    title: "Build",
    minutes: 10,
    body: "Antigravity generates the app and tests. Auto-fix loop on failures.",
    color: "green",
  },
  {
    n: "5",
    title: "API",
    minutes: 5,
    body: "Create the GCP project, link credits, get the Gemini API key, fill .env.",
    color: "blue",
  },
  {
    n: "6",
    title: "Verify",
    minutes: 8,
    body: "Run the dev server. Click through. Fix the doc, not the code.",
    color: "red",
  },
];

export default function CodelabPhases() {
  return (
    <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {phases.map((p) => (
        <div key={p.n} className="card p-4 flex flex-col">
          <div className="flex items-center gap-2">
            <div className={`h-6 w-6 rounded-full ${dotBg[p.color]} text-white flex items-center justify-center font-display font-bold text-xs`}>
              {p.n}
            </div>
            <span className="text-xs font-mono text-ash">{p.minutes} min</span>
          </div>
          <div className="font-display font-semibold text-ink mt-2 text-sm">{p.title}</div>
          <p className="text-xs text-ash mt-1 leading-relaxed flex-1">{p.body}</p>
        </div>
      ))}
    </div>
  );
}
