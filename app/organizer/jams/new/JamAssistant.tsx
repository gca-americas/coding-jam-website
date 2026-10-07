"use client";

import { useT } from "@/lib/i18n/client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * Guided setup chat for a new jam.
 *
 * The agent asks one thing at a time. When a value has to match real data —
 * chapter, country, track — its tool emits a "choices" signal and those render
 * here as buttons, so the organizer picks rather than types a name that then
 * fails validation.
 *
 * The whole transcript is sent on every turn: the route rebuilds the session
 * per request because Cloud Run gives no session affinity.
 */
type Turn = { role: "user" | "model"; text: string };
type Choice = { value: string; label: string; hint?: string };
type Search = { field: string; prompt: string; placeholder: string; options: Choice[] };

export default function JamAssistant({ onCreated }: { onCreated: () => void }) {
  const t = useT();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [choices, setChoices] = useState<{ field: string; prompt: string; items: Choice[] } | null>(null);
  const [search, setSearch] = useState<Search | null>(null);
  const [dateAsk, setDateAsk] = useState<{ field: string; prompt: string } | null>(null);
  /* Set when propose_draft lands. The chat is finished at that point and the
     organizer has one thing left to do, so say so plainly. */
  const [created, setCreated] = useState<{ slug: string; title: string; status: "draft" | "published" } | null>(null);
  /* Values already answered, by field. Sent with every turn so the agent
     knows what is settled — inferring it from the transcript made it
     re-ask for things the organizer had just picked. */
  const [collected, setCollected] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);
  // The button renders before React hydrates; a click in that window is lost.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, choices, busy]);

  async function send(text: string, field?: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setError(null);
    setChoices(null);
    setSearch(null);
    setDateAsk(null);
    setFilter("");
    setInput("");
    const next: Turn[] = [...turns, { role: "user", text: trimmed }];
    const nextCollected = field ? { ...collected, [field]: trimmed } : collected;
    if (field) setCollected(nextCollected);
    setTurns(next);
    setBusy(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turns: next, collected: nextCollected }),
      });
      if (!res.ok || !res.body) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.error ?? "The assistant is unavailable.");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let reply = "";
      setTurns([...next, { role: "model", text: "" }]);

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n");
        buffer = chunks.pop() ?? "";
        for (const chunk of chunks) {
          const line = chunk.replace(/^data: /, "").trim();
          if (!line) continue;
          let evt: {
            type: string;
            text?: string;
            signal?: {
              kind: string;
              field?: string;
              slug?: string;
              title?: string;
              status?: "draft" | "published";
              prompt?: string;
              placeholder?: string;
              choices?: Choice[];
              options?: Choice[];
            };
            message?: string;
          };
          try { evt = JSON.parse(line); } catch { continue; }

          if (evt.type === "text" && evt.text) {
            reply += reply ? "\n" + evt.text : evt.text;
            setTurns([...next, { role: "model", text: reply }]);
          } else if (evt.type === "signal" && evt.signal) {
            // Replace whatever picker was showing — two at once is never right.
            setChoices(null);
            setSearch(null);
            setDateAsk(null);
            if (evt.signal.kind === "choices" && evt.signal.choices) {
              setChoices({
                field: evt.signal.field ?? "",
                prompt: evt.signal.prompt ?? "Pick one",
                items: evt.signal.choices,
              });
            } else if (evt.signal.kind === "search" && evt.signal.options) {
              setSearch({
                field: evt.signal.field ?? "",
                prompt: evt.signal.prompt ?? "Find yours",
                placeholder: evt.signal.placeholder ?? "Type to filter…",
                options: evt.signal.options,
              });
            } else if (evt.signal.kind === "date") {
              setDateAsk({
                field: evt.signal.field ?? "eventDate",
                prompt: evt.signal.prompt ?? "When is the jam?",
              });
            } else if (evt.signal.kind === "created" && evt.signal.slug) {
              setCreated({
                slug: evt.signal.slug,
                title: evt.signal.title ?? "Your jam",
                status: evt.signal.status === "published" ? "published" : "draft",
              });
              onCreated();
            }
          } else if (evt.type === "error") {
            setError(evt.message ?? "Something went wrong.");
          }
        }
      }
      if (!reply) setTurns(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setTurns(next);
    } finally {
      setBusy(false);
    }
  }

  if (!started) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-ink text-white">
        <div className="absolute inset-0 dotted-bg opacity-10" />
        <div className="relative flex flex-wrap items-center gap-6 p-8 sm:p-10">
          <span className="text-5xl" aria-hidden="true">💬</span>
          <div className="min-w-0 flex-1">
            <h2 className="h-display text-2xl leading-tight sm:text-3xl">
              {t("asst.title")}
            </h2>
            <p className="mt-2 max-w-xl text-white/80">
              {t("asst.lede")}
            </p>
          </div>
          <button
            type="button"
            disabled={!ready}
            className="btn shrink-0 bg-white text-ink hover:shadow-pop disabled:opacity-60"
            onClick={() => { setStarted(true); send("Hi — help me set up a jam."); }}
          >
            {ready ? "Start →" : "Loading…"}
          </button>
        </div>
        <div className="relative grid h-1.5 grid-cols-4">
          <div className="bg-gblue" />
          <div className="bg-gred" />
          <div className="bg-gyellow" />
          <div className="bg-ggreen" />
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <div className="flex items-center gap-2">
          <span aria-hidden="true">💬</span>
          <span className="font-display font-semibold text-ink">{t("asst.setup")}</span>
        </div>
        <span className="text-xs text-ash">{t("asst.creates")}</span>
      </div>

      <div ref={logRef} className="max-h-[26rem] overflow-y-auto px-5 py-4 space-y-3">
        {turns.map((t, i) => (
          <div key={i} className={t.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                t.role === "user"
                  ? "max-w-[85%] rounded-2xl rounded-br-sm bg-gblue px-4 py-2 text-sm text-white whitespace-pre-wrap"
                  : "max-w-[85%] rounded-2xl rounded-bl-sm bg-cloud px-4 py-2 text-sm text-ink whitespace-pre-wrap"
              }
            >
              {t.role === "model" ? <Linkify text={t.text} /> : t.text}
              {!t.text && busy && i === turns.length - 1 ? "…" : ""}
            </div>
          </div>
        ))}

        {busy && turns[turns.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-cloud px-4 py-2 text-sm text-ash">Thinking…</div>
          </div>
        )}

        {error && <p className="text-sm text-gred">{error}</p>}
      </div>

      {/* Docked above the composer rather than inline in the transcript: the log
          scrolls, and options that scroll out of view read as a dead end. */}
      {choices && !busy && (
        <div className="border-t border-line bg-cloud/40 px-5 py-3">
          <div className="text-xs font-medium text-ash mb-2">{choices.prompt}</div>
          <div className="flex flex-wrap gap-2">
            {choices.items.map((c) => (
              <button
                key={c.value}
                type="button"
                title={c.hint}
                onClick={() => send(c.label, choices.field)}
                className={`rounded-full border px-3 py-1.5 text-sm transition hover:border-ink hover:shadow-soft ${
                  c.hint ? "border-gblue/40 bg-gblue/5 text-gblue" : "border-line bg-white text-ink"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {created && !busy && (
        <div className="border-t border-line bg-ggreen/5 px-5 py-4">
          <div className="font-display font-semibold text-ink">
            &ldquo;{created.title}&rdquo; is saved.
          </div>
          <p className="mt-1 text-sm text-ash">
            {created.status === "published"
              ? "It is live. Anyone with the link can see it, and it is listed on the site."
              : "It is a draft — nobody else can see it until you set its status to Published."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link href={`/jam/${created.slug}`} className="btn-google !py-2 !px-4 text-sm">
              {created.status === "published" ? "See the live page →" : "See the jam page →"}
            </Link>
            <Link href="/organizer/jams" className="btn-ghost !py-2 !px-4 text-sm">
              {t("asst.yourJams")}
            </Link>
          </div>
        </div>
      )}

      {dateAsk && !busy && (
        <div className="border-t border-line bg-cloud/40 px-5 py-3">
          <div className="mb-2 text-xs font-medium text-ash">{dateAsk.prompt}</div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              id="jam-assistant-date"
              type="date"
              className="input !w-auto !py-2 !text-sm"
              onChange={(e) => {
                if (e.target.value) send(e.target.value, dateAsk.field);
              }}
            />
            <button
              type="button"
              onClick={() => send(t("asst.notDecided"), dateAsk.field)}
              className="rounded-full border border-line bg-white px-3 py-1.5 text-sm text-ink transition hover:border-ink hover:shadow-soft"
            >
              {t("asst.notDecided")}
            </button>
          </div>
        </div>
      )}

      {search && !busy && (
        <div className="border-t border-line bg-cloud/40 px-5 py-3">
          <SearchPicker
            search={search}
            filter={filter}
            onFilter={setFilter}
            onPick={(v) => send(v, search.field)}
          />
        </div>
      )}

      <form
        onSubmit={(e) => { e.preventDefault(); send(input); }}
        className="flex gap-2 border-t border-line px-5 py-3"
      >
        <input
          id="jam-assistant-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={busy}
          placeholder={choices || search || dateAsk ? "Pick an option above, or type…" : "Type your answer…"}
          className="input !py-2"
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn-google !py-2 !px-4 text-sm shrink-0 disabled:opacity-50">
          Send
        </button>
      </form>
    </div>
  );
}

/**
 * A long list filtered in the browser. The whole directory arrives once with
 * the tool result, so typing costs nothing — no model call per keystroke.
 */
function SearchPicker({
  search,
  filter,
  onFilter,
  onPick,
}: {
  search: Search;
  filter: string;
  onFilter: (v: string) => void;
  onPick: (v: string) => void;
}) {
  const q = filter.trim().toLowerCase();
  const hits = (q ? search.options.filter((o) => o.label.toLowerCase().includes(q)) : search.options).slice(0, 24);

  return (
    <div>
      <div className="text-xs font-medium text-ash mb-2">{search.prompt}</div>
      <input
        id="jam-assistant-filter"
        autoFocus
        value={filter}
        onChange={(e) => onFilter(e.target.value)}
        placeholder={search.placeholder}
        className="input !py-2 !text-sm"
      />
      <div className="mt-2 flex flex-wrap gap-2 max-h-44 overflow-y-auto">
        {hits.length === 0 ? (
          <p className="text-xs text-ash">
            Nothing matches &ldquo;{filter}&rdquo;. Try a different spelling, or type your answer below.
          </p>
        ) : (
          hits.map((o) => (
            <button
              key={o.value}
              type="button"
              title={o.hint}
              onClick={() => onPick(o.label)}
              className={`rounded-full border px-3 py-1.5 text-sm transition hover:border-ink hover:shadow-soft ${
                o.hint ? "border-gblue/40 bg-gblue/5 text-gblue" : "border-line bg-white text-ink"
              }`}
            >
              {o.label}
            </button>
          ))
        )}
      </div>
      {!q && search.options.length > hits.length && (
        <p className="mt-1.5 text-[11px] text-ash">
          Showing {hits.length} of {search.options.length} — type to narrow it down.
        </p>
      )}
    </div>
  );
}

/**
 * Renders the agent's [text](#track-slug) links as real anchors.
 *
 * Deliberately narrow: only in-page anchors match, so a model that writes an
 * external URL gets plain text rather than a clickable link out of the page.
 */
function Linkify({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\((#[a-z0-9-]+)\)/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    parts.push(
      <a
        key={`${m.index}-${m[2]}`}
        href={m[2]}
        className="font-medium text-gblue underline underline-offset-2 hover:text-ink"
      >
        {m[1]}
      </a>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
