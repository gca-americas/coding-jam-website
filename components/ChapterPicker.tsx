"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export type ChapterType = "gdg" | "campus" | "other";

const MAX_RESULTS = 50;

const TYPE_LABELS: { value: ChapterType; key: string; label: string; hint: string }[] = [
  { value: "gdg", key: "gdg", label: "GDG chapter", hint: "A city chapter — pick yours from the directory." },
  { value: "campus", key: "campus", label: "GDG on Campus", hint: "A university chapter — pick yours from the directory." },
  { value: "other", key: "other", label: "Not a GDG chapter", hint: "Building solo or with another community? Type where you're from." },
];

/** Strips accents so typing "Sao Paulo" finds "São Paulo" and "Montreal" finds "Montréal". */
function fold(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "").trim().toLowerCase();
}

/**
 * Ranks directory entries against the query: prefix matches first (a person
 * typing "san" wants "San Juan" before "Busan"), then substring matches, each
 * group alphabetical because the source list already is.
 */
function rank(list: string[], query: string): string[] {
  const q = fold(query);
  if (!q) return list.slice(0, MAX_RESULTS);
  const prefix: string[] = [];
  const contains: string[] = [];
  for (const item of list) {
    const folded = fold(item);
    if (folded.startsWith(q)) prefix.push(item);
    else if (folded.includes(q)) contains.push(item);
    if (prefix.length >= MAX_RESULTS) break;
  }
  return [...prefix, ...contains].slice(0, MAX_RESULTS);
}

export default function ChapterPicker({
  copy,
  type,
  name,
  onChange,
}: {
  /** Catalogue slice from a server parent. Absent means English. */
  copy?: Record<string, string>;
  type: ChapterType;
  name: string;
  onChange: (next: { type: ChapterType; name: string }) => void;
}) {
  const t = (key: string, fallback: string) => copy?.[key] ?? fallback;
  const [query, setQuery] = useState(name);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [list, setList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Directories are immutable per build — fetch each at most once per session.
  const cache = useRef<Partial<Record<ChapterType, string[]>>>({});
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (type === "other") {
      setList([]);
      return;
    }
    const cached = cache.current[type];
    if (cached) {
      setList(cached);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    fetch(`/api/chapters?type=${type}`)
      .then((r) => {
        if (!r.ok) throw new Error(t("chapter.loadError", "Could not load the chapter directory."));
        return r.json() as Promise<{ chapters: string[] }>;
      })
      .then((j) => {
        if (cancelled) return;
        cache.current[type] = j.chapters;
        setList(j.chapters);
      })
      .catch((e: unknown) => {
        if (!cancelled) setLoadError(e instanceof Error ? e.message : t("chapter.loadError", "Could not load the chapter directory."));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type]);

  // Close the dropdown when focus leaves the combobox entirely.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const results = useMemo(() => rank(list, query), [list, query]);
  const exactMatch = useMemo(() => list.some((c) => fold(c) === fold(query)), [list, query]);

  function pickType(next: ChapterType) {
    setQuery("");
    setOpen(false);
    onChange({ type: next, name: "" });
  }

  function choose(value: string) {
    setQuery(value);
    setOpen(false);
    onChange({ type, name: value });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      setOpen(true);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      // Don't submit the form while the user is choosing a chapter.
      if (results[highlight]) {
        e.preventDefault();
        choose(results[highlight]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const active = TYPE_LABELS.find((x) => x.value === type);
  const activeHint = active ? t(`chapter.${active.key}.hint`, active.hint) : "";

  return (
    <div className="space-y-3">
      {/* Which kind of chapter is this? */}
      <div className="grid sm:grid-cols-3 gap-2">
        {TYPE_LABELS.map((opt) => {
          const on = opt.value === type;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => pickType(opt.value)}
              aria-pressed={on}
              className={[
                "px-3 py-2 rounded-xl border text-sm font-medium transition-colors text-left",
                on
                  ? "border-gblue bg-gblue/10 text-gblue"
                  : "border-line bg-white text-ash hover:border-gblue/40 hover:text-ink",
              ].join(" ")}
            >
              {t(`chapter.${opt.key}.label`, opt.label)}
            </button>
          );
        })}
      </div>

      {type === "other" ? (
        <input
          value={name}
          onChange={(e) => onChange({ type, name: e.target.value })}
          required
          maxLength={80}
          placeholder={t("chapter.otherPlaceholder", "Where are you building from?")}
          className="input"
        />
      ) : (
        <div ref={boxRef} className="relative">
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setHighlight(0);
              setOpen(true);
              // Typing invalidates the selection until they pick again.
              if (name) onChange({ type, name: "" });
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            role="combobox"
            aria-expanded={open}
            aria-autocomplete="list"
            aria-controls="chapter-listbox"
            autoComplete="off"
            placeholder={
              loading
                ? t("chapter.loading", "Loading directory…")
                : type === "gdg"
                  ? t("chapter.placeholderCity", "Start typing your city — Seattle, Chicago, Austin…")
                  : t("chapter.placeholderUni", "Start typing your university…")
            }
            disabled={loading || Boolean(loadError)}
            className="input"
          />

          {open && !loading && !loadError && (
            <ul
              id="chapter-listbox"
              role="listbox"
              className="absolute z-20 mt-1 w-full max-h-64 overflow-auto rounded-xl border border-line bg-white shadow-soft"
            >
              {results.length === 0 ? (
                <li className="px-3 py-2 text-sm text-ash">
                  {t("chapter.noMatch", "No chapter matches “{q}”. Check the spelling, or choose").replace("{q}", query.trim())}{" "}
                  <b>{t("chapter.other.label", "Not a GDG chapter")}</b>.
                </li>
              ) : (
                results.map((c, i) => (
                  <li key={c} role="option" aria-selected={i === highlight}>
                    <button
                      type="button"
                      onMouseEnter={() => setHighlight(i)}
                      onClick={() => choose(c)}
                      className={[
                        "w-full text-left px-3 py-2 text-sm",
                        i === highlight ? "bg-gblue/10 text-ink" : "text-ink hover:bg-cloud",
                      ].join(" ")}
                    >
                      {c}
                    </button>
                  </li>
                ))
              )}
            </ul>
          )}

          {loadError && <p className="text-xs text-gred mt-1">{loadError}</p>}

          {!loadError && name && exactMatch && (
            <p className="text-xs text-ggreen mt-1">
              ✓ {type === "gdg" ? `GDG ${name}` : `GDG on Campus ${name}`}
            </p>
          )}
          {!loadError && !name && query.trim() && !loading && (
            <p className="text-xs text-gred mt-1">{t("chapter.pickToContinue", "Pick a chapter from the list to continue.")}</p>
          )}
        </div>
      )}

      <div className="hint">{activeHint}</div>
    </div>
  );
}
