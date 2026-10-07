/**
 * Locales the site speaks.
 *
 * Locale lives in a cookie rather than a URL segment. Putting it in the path
 * would mean moving all ~25 routes under app/[locale]/ — a large, risky change
 * for a site whose copy is still settling. The cookie gets a working switcher
 * today and a path-based scheme can be layered on later without the messages
 * moving again.
 */
export const LOCALES = [
  { code: "en", label: "English", short: "EN" },
  { code: "pt-BR", label: "Português (Brasil)", short: "PT" },
  { code: "es-MX", label: "Español (México)", short: "ES" },
  { code: "zh-Hant", label: "繁體中文", short: "繁中" },
  { code: "zh-Hans", label: "简体中文", short: "简中" },
  { code: "ja", label: "日本語", short: "日本語" },
] as const;

export type Locale = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: Locale = "en";

/** Cookie name. Read on the server, written by the switcher in the browser. */
export const LOCALE_COOKIE = "jam_locale";

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && LOCALES.some((l) => l.code === v);
}

export function localeLabel(code: Locale): string {
  return LOCALES.find((l) => l.code === code)?.label ?? code;
}
