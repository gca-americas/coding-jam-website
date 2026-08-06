import COUNTRIES_JSON from "@/data/countries.json";

/**
 * Every country and inhabited territory, English names, alphabetical.
 * Generated from ICU region data — see data/countries.json.
 *
 * Small enough (~245 entries) to ship in the client bundle, unlike the chapter
 * directories in lib/chapters.ts.
 */
export const COUNTRIES: string[] = COUNTRIES_JSON as string[];

export const DEFAULT_COUNTRY = "United States";

export function isValidCountry(name: string): boolean {
  return COUNTRIES.includes(name.trim());
}

/** Case-insensitive lookup returning the canonical spelling, or null. */
export function canonicalCountry(name: string): string | null {
  const needle = name.trim().toLowerCase();
  return COUNTRIES.find((c) => c.toLowerCase() === needle) ?? null;
}
