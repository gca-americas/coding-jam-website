"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LOCALES, LOCALE_COOKIE, type Locale } from "@/lib/i18n/config";

/**
 * Language picker.
 *
 * Writes the locale cookie and refreshes, so the server components re-render in
 * the new language. A year-long cookie because a language choice is not a
 * session preference — someone who reads Portuguese reads it next week too.
 */
export default function LocaleSwitcher({ current }: { current: Locale }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  function choose(code: string) {
    if (code === current) return;
    document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    setPending(true);
    router.refresh();
    // The refresh is async; clear the disabled state once React has swapped in
    // the new tree rather than leaving the control stuck.
    setTimeout(() => setPending(false), 600);
  }

  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Language</span>
      <select
        value={current}
        disabled={pending}
        onChange={(e) => choose(e.target.value)}
        className="cursor-pointer appearance-none rounded-full border border-line bg-white py-1.5 pl-3 pr-7 text-xs font-medium text-ash transition hover:text-ink focus:outline-none focus:ring-2 focus:ring-gblue/30 disabled:opacity-60"
      >
        {LOCALES.map((l) => (
          <option key={l.code} value={l.code}>
            {l.short}
          </option>
        ))}
      </select>
      <span aria-hidden="true" className="pointer-events-none absolute right-2.5 text-[9px] text-ash">
        ▼
      </span>
    </label>
  );
}
