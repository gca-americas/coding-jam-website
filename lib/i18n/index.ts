import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import en from "./messages/en.json";
import ptBR from "./messages/pt-BR.json";
import esMX from "./messages/es-MX.json";
import zhHant from "./messages/zh-Hant.json";
import zhHans from "./messages/zh-Hans.json";
import ja from "./messages/ja.json";

/**
 * Message lookup.
 *
 * English is the source and every other locale is a partial overlay: a key that
 * has not been translated yet falls back to English rather than rendering a key
 * name or an empty string. That means a locale can ship half-finished and the
 * page still reads correctly, which is what makes translating incrementally
 * possible.
 */
type Messages = Record<string, string>;

const CATALOGUES: Record<Locale, Messages> = {
  en: en as Messages,
  "pt-BR": ptBR as Messages,
  "es-MX": esMX as Messages,
  "zh-Hant": zhHant as Messages,
  "zh-Hans": zhHans as Messages,
  ja: ja as Messages,
};

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const raw = store.get(LOCALE_COOKIE)?.value;
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

/** A translator bound to the request's locale. `t("nav.home")`. */
export async function getT(): Promise<(key: string) => string> {
  const locale = await getLocale();
  const catalogue = CATALOGUES[locale];
  const fallback = CATALOGUES[DEFAULT_LOCALE];
  return (key: string) => catalogue[key] ?? fallback[key] ?? key;
}

/**
 * A slice of the catalogue, for passing into client components.
 *
 * getT() is server-only, so a "use client" component cannot look strings up
 * itself. Its server parent calls this with the prefixes it needs and passes
 * the result down as a prop.
 */
export async function getCopy(prefixes: string[]): Promise<Record<string, string>> {
  const locale = await getLocale();
  const catalogue = CATALOGUES[locale];
  const fallback = CATALOGUES[DEFAULT_LOCALE];
  const out: Record<string, string> = {};
  for (const key of Object.keys(fallback)) {
    if (prefixes.some((p) => key.startsWith(p))) out[key] = catalogue[key] ?? fallback[key];
  }
  return out;
}

/** How much of the catalogue each locale covers. Used by scripts and /admin. */
export function translationCoverage(): Record<Locale, { done: number; total: number }> {
  const keys = Object.keys(CATALOGUES.en);
  const out = {} as Record<Locale, { done: number; total: number }>;
  for (const [code, cat] of Object.entries(CATALOGUES)) {
    out[code as Locale] = {
      done: keys.filter((k) => typeof cat[k] === "string" && cat[k] !== "").length,
      total: keys.length,
    };
  }
  return out;
}

export { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale };
export type { Locale };
