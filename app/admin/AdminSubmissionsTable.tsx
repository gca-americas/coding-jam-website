"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type AdminSubmissionRow = {
  id: string;
  projectName: string;
  builderName: string;
  builderEmail?: string;
  chapter: string;
  trackLabel: string;
  jamSlug?: string;
  jamTitle?: string;
  organizerName?: string;
  submittedAt: string;
};

/**
 * Submission moderation: delete a build, or block the account behind it.
 *
 * Blocking and deleting are separate on purpose. Removing one off-topic build
 * shouldn't bar someone from the community, and blocking a spammer shouldn't
 * silently erase everything they posted — an admin should choose both.
 *
 * Block opens an inline form rather than firing straight off, because plenty of
 * older submissions predate `submittedByEmail` and have no address stored. The
 * field is prefilled when we know it and editable when we don't, so every row
 * can be acted on instead of the button silently disappearing.
 */
export default function AdminSubmissionsTable({
  rows,
  total,
  ranged,
  blockedEmails,
}: {
  rows: AdminSubmissionRow[];
  total: number;
  ranged: boolean;
  /** Lowercased emails already on the blocklist, so rows can show their state. */
  blockedEmails: string[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [blockingId, setBlockingId] = useState<string | null>(null);
  const [blockEmail, setBlockEmail] = useState("");
  const [blockReason, setBlockReason] = useState("");
  const [, startTransition] = useTransition();

  const blocked = new Set(blockedEmails.map((e) => e.toLowerCase()));

  function openBlock(row: AdminSubmissionRow) {
    setError(null);
    setNotice(null);
    setBlockingId(row.id);
    setBlockEmail(row.builderEmail ?? "");
    setBlockReason(`Spam — "${row.projectName}"`);
  }

  async function remove(row: AdminSubmissionRow) {
    if (
      !window.confirm(
        `Delete "${row.projectName}" by ${row.builderName}?\n\nIt disappears from the showcase and every jam page. This can't be undone.`,
      )
    )
      return;
    setError(null);
    setNotice(null);
    setBusy(row.id);
    try {
      const res = await fetch(`/api/projects/${encodeURIComponent(row.id)}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Delete failed." }));
        throw new Error(j.error || "Delete failed.");
      }
      setNotice(`Deleted “${row.projectName}”.`);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setBusy(null);
    }
  }

  async function submitBlock(e: React.FormEvent) {
    e.preventDefault();
    if (!blockingId) return;
    setError(null);
    setNotice(null);
    setBusy(blockingId);
    try {
      const res = await fetch("/api/blocklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: blockEmail, reason: blockReason }),
      });
      const j = await res.json().catch(() => ({ error: "Block failed." }));
      if (!res.ok) throw new Error(j.error || "Block failed.");
      setNotice(`Blocked ${blockEmail}. See the Blocklist tab.`);
      setBlockingId(null);
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Block failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="card p-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="section-eyebrow">Submissions</div>
          <h3 className="font-display font-bold text-xl text-ink mt-1">
            {ranged ? `${total} in range` : "Most recent"}
          </h3>
        </div>
        <div className="text-xs text-ash">Showing up to 50 · newest first</div>
      </div>

      {error && (
        <div className="mt-3 rounded-lg bg-gred/10 text-gred border border-gred/30 p-2 text-sm">
          {error}
        </div>
      )}
      {notice && !error && (
        <div className="mt-3 rounded-lg bg-ggreen/10 text-ggreen border border-ggreen/30 p-2 text-sm">
          {notice}
        </div>
      )}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-ash border-b border-line">
            <tr>
              <th className="py-2 font-semibold">Project</th>
              <th className="py-2 font-semibold">Builder</th>
              <th className="py-2 font-semibold">Chapter</th>
              <th className="py-2 font-semibold">Jam</th>
              <th className="py-2 font-semibold">Organizer</th>
              <th className="py-2 font-semibold">Submitted</th>
              <th className="py-2 font-semibold text-right"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-ash">
                  No submissions in this range.
                </td>
              </tr>
            )}
            {rows.flatMap((row) => [
              <tr key={row.id} className="border-b border-line/60 align-top">
                <td className="py-2 font-medium text-ink truncate">
                  {row.projectName}
                  <div className="text-[11px] text-ash">{row.trackLabel}</div>
                </td>
                <td className="py-2 text-ash truncate">
                  {row.builderName}
                  {row.builderEmail && (
                    <div className="text-[11px] text-ash/70 truncate">{row.builderEmail}</div>
                  )}
                </td>
                <td className="py-2 text-ink">{row.chapter}</td>
                <td className="py-2 text-ash truncate">
                  {row.jamSlug ? (
                    <Link href={`/jam/${row.jamSlug}`} className="text-gblue hover:underline">
                      {row.jamTitle ?? row.jamSlug}
                    </Link>
                  ) : (
                    <span className="text-ash/60">NA</span>
                  )}
                </td>
                <td className={row.organizerName ? "py-2 text-ink" : "py-2 text-ash/60"}>
                  {row.organizerName ?? "NA"}
                </td>
                <td className="py-2 text-ash tabular-nums">{row.submittedAt.slice(0, 10)}</td>
                <td className="py-2 text-right whitespace-nowrap">
                  {row.builderEmail && blocked.has(row.builderEmail.toLowerCase()) ? (
                    <span className="chip text-[10px] bg-gred/10 text-gred ring-1 ring-gred/30">
                      blocked
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={busy === row.id}
                      onClick={() => openBlock(row)}
                      className="text-xs text-ash hover:text-gred font-medium disabled:opacity-60"
                    >
                      Block
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy === row.id}
                    onClick={() => remove(row)}
                    className="ml-3 text-xs text-gred hover:underline font-medium disabled:opacity-60"
                  >
                    Delete
                  </button>
                </td>
              </tr>,
              blockingId === row.id && (
                <tr key={`${row.id}-block`} className="border-b border-line/60 bg-gred/5">
                  <td colSpan={7} className="py-4 px-2">
                    <form onSubmit={submitBlock} className="flex flex-wrap items-end gap-3">
                      <label className="block">
                        <span className="block text-xs text-ash">
                          Email to block
                          {!row.builderEmail && " — not stored on this build, type it in"}
                        </span>
                        <input
                          type="email"
                          required
                          autoFocus
                          value={blockEmail}
                          onChange={(e) => setBlockEmail(e.target.value)}
                          placeholder="builder@example.com"
                          className="input mt-1 sm:w-72"
                        />
                      </label>
                      <label className="block flex-1 min-w-[14rem]">
                        <span className="block text-xs text-ash">Reason (admins only)</span>
                        <input
                          maxLength={500}
                          value={blockReason}
                          onChange={(e) => setBlockReason(e.target.value)}
                          className="input mt-1"
                        />
                      </label>
                      <button
                        type="submit"
                        disabled={busy === row.id}
                        className="btn-google !py-2 !px-4 text-sm disabled:opacity-60"
                      >
                        Block account
                      </button>
                      <button
                        type="button"
                        onClick={() => setBlockingId(null)}
                        className="btn-ghost !py-2 !px-4 text-sm"
                      >
                        Cancel
                      </button>
                    </form>
                  </td>
                </tr>
              ),
            ]).flat().filter(Boolean)}
          </tbody>
        </table>
      </div>
    </div>
  );
}
