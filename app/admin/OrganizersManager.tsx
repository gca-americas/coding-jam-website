"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ChapterPicker, { type ChapterType } from "@/components/ChapterPicker";
import { COUNTRIES, DEFAULT_COUNTRY } from "@/lib/countries";
import type { Organizer } from "@/lib/organizers";

/** Per-organizer rollup computed on the server and passed down for display. */
export type OrganizerTotals = Record<string, { jams: number; builds: number }>;

type Draft = {
  email: string;
  displayName: string;
  chapterType: ChapterType;
  chapterName: string;
  country: string;
  isGde: boolean;
};

const EMPTY: Draft = {
  email: "",
  displayName: "",
  chapterType: "gdg",
  chapterName: "",
  country: DEFAULT_COUNTRY,
  isGde: false,
};

function draftFrom(o: Organizer): Draft {
  return {
    email: o.email,
    displayName: o.displayName,
    // Older records predate the directory fields; fall back to "other" with the
    // stored label so the row stays editable instead of failing validation.
    chapterType: (o.chapterType as ChapterType) ?? "other",
    chapterName: o.chapterName ?? o.chapter,
    country: o.country,
    isGde: o.isGde ?? false,
  };
}

export default function OrganizersManager({
  initialOrganizers,
  totals = {},
}: {
  initialOrganizers: Organizer[];
  totals?: OrganizerTotals;
}) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [editing, setEditing] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const organizers = initialOrganizers;

  async function send(url: string, method: string, body?: unknown) {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(url, {
        method,
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(j.error || "Failed");
      }
      startTransition(() => router.refresh());
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    const ok = await send("/api/organizers", "POST", draft);
    if (ok) {
      setDraft(EMPTY);
      setAdding(false);
    }
  }

  async function onSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const ok = await send(`/api/organizers/${encodeURIComponent(editing.email)}`, "PATCH", {
      displayName: editing.displayName,
      chapterType: editing.chapterType,
      chapterName: editing.chapterName,
      country: editing.country,
      isGde: editing.isGde,
    });
    if (ok) setEditing(null);
  }

  async function onRemove(target: string) {
    if (
      !window.confirm(
        `Remove ${target} from the organizer roster?\n\nJams they already published stay live — this only revokes their ability to create and edit jams.`,
      )
    )
      return;
    await send(`/api/organizers/${encodeURIComponent(target)}`, "DELETE");
  }

  return (
    <div className="card p-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="section-eyebrow">Organizers</div>
          <h3 className="font-display font-bold text-xl text-ink mt-1">Who can publish a jam.</h3>
          <p className="text-sm text-ash mt-1 max-w-xl">
            Organizers pick a topic for their week and get their own jam page. Admins can always
            edit any jam, whether or not they&rsquo;re on this list.
          </p>
        </div>
        {!adding && (
          <button
            type="button"
            onClick={() => {
              setAdding(true);
              setEditing(null);
              setError(null);
            }}
            className="btn-google !py-2 !px-4"
          >
            Add organizer
          </button>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-lg bg-gred/10 text-gred border border-gred/30 p-2 text-sm">
          {error}
        </div>
      )}

      {adding && (
        <form onSubmit={onAdd} className="mt-5 rounded-xl border border-line bg-cloud/60 p-4 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-ink">Google email</span>
              <input
                type="email"
                required
                placeholder="jane@example.com"
                className="input mt-1"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                disabled={busy}
              />
              <span className="hint">They sign in with this account to reach their jams.</span>
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Display name</span>
              <input
                required
                maxLength={60}
                placeholder="Jane Doe"
                className="input mt-1"
                value={draft.displayName}
                onChange={(e) => setDraft({ ...draft, displayName: e.target.value })}
                disabled={busy}
              />
              <span className="hint">Public — shown as the lead on their jam pages.</span>
            </label>
          </div>
          <div>
            <span className="text-sm font-medium text-ink">Chapter</span>
            <div className="mt-1">
              <ChapterPicker
                type={draft.chapterType}
                name={draft.chapterName}
                onChange={(next) => setDraft({ ...draft, chapterType: next.type, chapterName: next.name })}
              />
            </div>
          </div>
          <label className="block sm:max-w-xs">
            <span className="text-sm font-medium text-ink">Country</span>
            <select
              required
              className="input mt-1"
              value={draft.country}
              onChange={(e) => setDraft({ ...draft, country: e.target.value })}
              disabled={busy}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-start gap-3 rounded-xl border border-line bg-white p-3 cursor-pointer sm:max-w-md">
            <input
              type="checkbox"
              checked={draft.isGde}
              onChange={(e) => setDraft({ ...draft, isGde: e.target.checked })}
              disabled={busy}
              className="mt-0.5 h-4 w-4 accent-gblue shrink-0"
            />
            <span>
              <span className="text-sm font-medium text-ink">Google Developer Expert</span>
              <span className="hint">
                Shown alongside their name wherever they host a jam.
              </span>
            </span>
          </label>
          <div className="flex items-center gap-2">
            <button type="submit" disabled={busy || pending} className="btn-google !py-2 !px-4 disabled:opacity-60">
              Add organizer
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setDraft(EMPTY);
                setError(null);
              }}
              className="btn-ghost !py-2 !px-4"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-ash border-b border-line">
            <tr>
              <th className="py-2 font-semibold">Organizer</th>
              <th className="py-2 font-semibold">Email</th>
              <th className="py-2 font-semibold">Chapter</th>
              <th className="py-2 font-semibold">Country</th>
              <th className="py-2 font-semibold text-right">Jams</th>
              <th className="py-2 font-semibold text-right">Builds</th>
              <th className="py-2 font-semibold">Added</th>
              <th className="py-2 font-semibold text-right"></th>
            </tr>
          </thead>
          <tbody>
            {organizers.length === 0 && !adding && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-ash">
                  No organizers yet. Add one to let them publish a jam.
                </td>
              </tr>
            )}
            {organizers.map((o) => (
              <tr key={o.email} className="border-b border-line/60 align-top">
                <td className="py-2 font-medium">
                  <Link
                    href={`/admin/organizers/${encodeURIComponent(o.email)}`}
                    className="text-gblue hover:underline"
                  >
                    {o.displayName}
                  </Link>
                  {o.isGde && (
                    <div className="text-[11px] text-gblue font-medium">Google Developer Expert</div>
                  )}
                </td>
                <td className="py-2 text-ash truncate">{o.email}</td>
                <td className="py-2 text-ink">{o.chapter}</td>
                <td className="py-2 text-ash">{o.country}</td>
                <td className="py-2 text-right tabular-nums text-ink">{totals[o.email]?.jams ?? 0}</td>
                <td className="py-2 text-right tabular-nums font-semibold text-ink">
                  {totals[o.email]?.builds ?? 0}
                </td>
                <td className="py-2 text-ash tabular-nums">{o.addedAt.slice(0, 10)}</td>
                <td className="py-2 text-right whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(draftFrom(o));
                      setAdding(false);
                      setError(null);
                    }}
                    disabled={busy}
                    className="text-xs text-gblue hover:underline font-medium disabled:opacity-60"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(o.email)}
                    disabled={busy}
                    className="ml-3 text-xs text-gred hover:underline font-medium disabled:opacity-60"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <form onSubmit={onSaveEdit} className="mt-5 rounded-xl border border-gblue/40 bg-gblue/5 p-4 space-y-4">
          <div className="text-sm font-medium text-ink">
            Editing <span className="font-mono text-xs">{editing.email}</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-ink">Display name</span>
              <input
                required
                maxLength={60}
                className="input mt-1"
                value={editing.displayName}
                onChange={(e) => setEditing({ ...editing, displayName: e.target.value })}
                disabled={busy}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-ink">Country</span>
              <select
                required
                className="input mt-1"
                value={editing.country}
                onChange={(e) => setEditing({ ...editing, country: e.target.value })}
                disabled={busy}
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <span className="text-sm font-medium text-ink">Chapter</span>
            <div className="mt-1">
              <ChapterPicker
                type={editing.chapterType}
                name={editing.chapterName}
                onChange={(next) => setEditing({ ...editing, chapterType: next.type, chapterName: next.name })}
              />
            </div>
          </div>
          <label className="flex items-start gap-3 rounded-xl border border-line bg-white p-3 cursor-pointer sm:max-w-md">
            <input
              type="checkbox"
              checked={editing.isGde}
              onChange={(e) => setEditing({ ...editing, isGde: e.target.checked })}
              disabled={busy}
              className="mt-0.5 h-4 w-4 accent-gblue shrink-0"
            />
            <span>
              <span className="text-sm font-medium text-ink">Google Developer Expert</span>
              <span className="hint">
                Shown alongside their name wherever they host a jam.
              </span>
            </span>
          </label>
          <div className="flex items-center gap-2">
            <button type="submit" disabled={busy || pending} className="btn-google !py-2 !px-4 disabled:opacity-60">
              Save changes
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setError(null);
              }}
              className="btn-ghost !py-2 !px-4"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
