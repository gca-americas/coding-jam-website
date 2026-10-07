import { getT } from "@/lib/i18n";

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

/** Titles and bodies are catalogue keys; minutes and colour are not copy. */
const phases: Phase[] = [
  { n: "1", title: "cp.1.title", minutes: 12, body: "cp.1.body", color: "blue" },
  { n: "2", title: "cp.2.title", minutes: 9, body: "cp.2.body", color: "red" },
  { n: "3", title: "cp.3.title", minutes: 4, body: "cp.3.body", color: "yellow" },
  { n: "4", title: "cp.4.title", minutes: 10, body: "cp.4.body", color: "green" },
  { n: "5", title: "cp.5.title", minutes: 5, body: "cp.5.body", color: "blue" },
  { n: "6", title: "cp.6.title", minutes: 8, body: "cp.6.body", color: "red" },
];

export default async function CodelabPhases() {
  const t = await getT();
  return (
    <div className="grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {phases.map((p) => (
        <div key={p.n} className="card p-4 flex flex-col">
          <div className="flex items-center gap-2">
            <div className={`h-6 w-6 rounded-full ${dotBg[p.color]} text-white flex items-center justify-center font-display font-bold text-xs`}>
              {p.n}
            </div>
            <span className="text-xs font-mono text-ash">{t("cp.min").replace("{n}", String(p.minutes))}</span>
          </div>
          <div className="font-display font-semibold text-ink mt-2 text-sm">{t(p.title)}</div>
          <p className="text-xs text-ash mt-1 leading-relaxed flex-1">{t(p.body)}</p>
        </div>
      ))}
    </div>
  );
}
