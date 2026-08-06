/**
 * The Google tech a build can be tagged with on the submit form.
 *
 * Ids are stored, labels are rendered — so a product rename is a one-line edit
 * here and doesn't rewrite anyone's submission. Free-standing from any storage
 * module: the submit form is a client component and imports this directly.
 *
 * The list is deliberately short and jam-shaped. It covers what a room actually
 * reaches for in two hours — a model, the tool they drove it from, and whatever
 * they deployed onto — rather than the full Google Cloud catalog, which would
 * turn a 10-second tagging step into a scavenger hunt.
 */
export type GoogleTech = { id: string; label: string; group: GoogleTechGroup };

export type GoogleTechGroup = "Models & AI tools" | "Cloud services";

export const GOOGLE_TECH: GoogleTech[] = [
  { id: "gemini-api", label: "Gemini API", group: "Models & AI tools" },
  { id: "ai-studio", label: "Google AI Studio", group: "Models & AI tools" },
  { id: "antigravity", label: "Antigravity", group: "Models & AI tools" },
  { id: "vertex-ai", label: "Vertex AI", group: "Models & AI tools" },
  { id: "imagen", label: "Imagen", group: "Models & AI tools" },
  { id: "veo", label: "Veo", group: "Models & AI tools" },
  { id: "gemma", label: "Gemma", group: "Models & AI tools" },
  { id: "adk", label: "Agent Development Kit", group: "Models & AI tools" },
  { id: "cloud-run", label: "Cloud Run", group: "Cloud services" },
  { id: "firebase", label: "Firebase", group: "Cloud services" },
  { id: "firestore", label: "Firestore", group: "Cloud services" },
  { id: "cloud-storage", label: "Cloud Storage", group: "Cloud services" },
  { id: "cloud-functions", label: "Cloud Functions", group: "Cloud services" },
  { id: "bigquery", label: "BigQuery", group: "Cloud services" },
];

export const GOOGLE_TECH_GROUPS: GoogleTechGroup[] = ["Models & AI tools", "Cloud services"];

const BY_ID = new Map(GOOGLE_TECH.map((t) => [t.id, t]));

export function googleTechLabel(id: string): string | null {
  return BY_ID.get(id)?.label ?? null;
}

/**
 * Trust boundary for the submit endpoint: keeps only ids we know, deduped and
 * in catalog order so two builds tagged the same way render identically.
 * Unknown ids are dropped rather than rejected — a stale tab shouldn't fail a
 * submission over a tag that was removed from the list.
 */
export function parseGoogleTech(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const picked = new Set(
    input.filter((v): v is string => typeof v === "string").map((v) => v.trim().toLowerCase()),
  );
  return GOOGLE_TECH.filter((t) => picked.has(t.id)).map((t) => t.id);
}
