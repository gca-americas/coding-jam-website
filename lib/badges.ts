/**
 * Badge tiers — single source of truth.
 *
 * Edit this table to add tiers, change thresholds, or fill in real artwork +
 * claim URLs. The /me page renders straight from this constant; no other
 * code touches it. If we ever need non-engineers to manage badges, we can
 * lift this into Firestore with the same shape.
 */
export type Badge = {
  id: string;
  threshold: number;
  label: string;
  /** Tailwind color token from our palette: gblue | gred | gyellow | ggreen */
  color: "gblue" | "gred" | "gyellow" | "ggreen";
  /** Public URL to the badge artwork (PNG/SVG). Empty → falls back to emoji. */
  imageUrl: string;
  /** Public URL where the user goes to claim the badge externally. */
  claimUrl: string;
};

export const BADGES: readonly Badge[] = [
  {
    id: "builder",
    threshold: 1,
    label: "Coding Jam Builder",
    color: "gblue",
    imageUrl: "/badge/builder.png",
    claimUrl: "",
  },
  {
    id: "maker",
    threshold: 5,
    label: "Coding Jam Maker",
    color: "ggreen",
    imageUrl: "/badge/maker.png",
    claimUrl: "",
  },
  {
    id: "champion",
    threshold: 10,
    label: "Coding Jam Champion",
    color: "gyellow",
    imageUrl: "/badge/champion.png",
    claimUrl: "",
  },
] as const;

export type EarnedBadge = Badge & { earned: boolean; remaining: number };

export function badgesFor(count: number): EarnedBadge[] {
  return BADGES.map((b) => ({
    ...b,
    earned: count >= b.threshold,
    remaining: Math.max(0, b.threshold - count),
  }));
}
