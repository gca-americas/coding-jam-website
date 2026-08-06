"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export type AdminJamRow = {
  slug: string;
  title: string;
  chapter: string;
  country: string;
  organizerName: string;
  status: "draft" | "published" | "archived";
  eventDate?: string;
  topicTitle: string;
  topicEmoji: string;
  submissions: number;
};

const STATUS_CHIP: Record<AdminJamRow["status"], string> = {
  draft: "bg-cloud text-ash ring-1 ring-line",
  published: "bg-ggreen/10 text-ggreen ring-1 ring-ggreen/30",
  archived: "bg-gyellow/15 text-yellow-700 ring-1 ring-gyellow/40",
};

/**
 * Jam moderation. Admins can retarget status or delete outright.
 *
 * Archiving is offered alongside delete because it's almost always the right
 * call: it pulls the jam off every public surface while leaving the builds that
 * were submitted through it still credited. Deleting is for spam.
 */
export default function AdminJamsTable({
  rows,
  attributed,
  total,
  ranged,
}: {
  rows: AdminJamRow[];
  attributed: number;
  total: number;
  ranged: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function send(slug: string, init: RequestInit, confirmMsg?: string) {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setError(null);
    setBusy(slug);
    try {
      const res = await fetch(`/api/jams/${encodeURIComponent(slug)}`, init);
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(j.error || "Failed");
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(null);
    }
  }

  const setStatus = (row: AdminJamRow, status: AdminJamRow["status"]) =>
    send(row.slug, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

  const remove = (row: AdminJamRow) =>
    send(
      row.slug,
      { method: "DELETE" },
      `Delete "${row.title}"?\n\nThe page at /jam/${row.slug} stops working.` +
        (row.submissions > 0
          ? `\n\n${row.submissions} submission${row.submissions === 1 ? "" : "s"} came through this jam. They stay on the showcase and keep their credit, but the jam link will 404.`
          : "") +
        "\n\nArchiving hides it without breaking anything. This can't be undone.",
    );

  return (
    <div className="card p-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="section-eyebrow">Jams</div>
          <h3 className="font-display font-bold text-xl text-ink mt-1">Submissions per jam</h3>
        </div>
        <div className="text-xs text-ash">
          {attributed} of {total} submissions came through a jam{ranged ? " in this range" : ""} ·{" "}
          {total - attributed} unattributed
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-lg bg-gred/10 text-gred border border-gred/30 p-2 text-sm">
          {error}
        </div>
      )}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-ash border-b border-line">
            <tr>
              <th className="py-2 font-semibold">Jam</th>
              <th className="py-2 font-semibold">Topic</th>
              <th className="py-2 font-semibold">Organizer</th>
              <th className="py-2 font-semibold">Status</th>
              <th className="py-2 font-semibold">Date</th>
              <th className="py-2 font-semibold text-right">Builds</th>
              <th className="py-2 font-semibold text-right"></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-ash">
                  No jams yet.
                </td>
              </tr>
            )}
            {rows.map((row) => (
              <tr key={row.slug} className="border-b border-line/60 align-top">
                <td className="py-2 font-medium">
                  <Link href={`/jam/${row.slug}`} className="text-gblue hover:underline">
                    {row.title}
                  </Link>
                  <div className="text-[11px] text-ash">
                    {row.chapter} · {row.country}
                  </div>
                </td>
                <td className="py-2 text-ink">
                  {row.topicEmoji} {row.topicTitle}
                </td>
                <td className="py-2 text-ash truncate">{row.organizerName}</td>
                <td className="py-2">
                  <span className={`chip text-[10px] ${STATUS_CHIP[row.status]}`}>{row.status}</span>
                </td>
                <td className="py-2 text-ash tabular-nums">{row.eventDate ?? "—"}</td>
                <td className="py-2 text-right tabular-nums font-semibold text-ink">
                  {row.submissions}
                </td>
                <td className="py-2 text-right whitespace-nowrap">
                  <Link
                    href={`/organizer/jams/${row.slug}/edit`}
                    className="text-xs text-gblue hover:underline font-medium"
                  >
                    Edit
                  </Link>
                  {row.status !== "archived" ? (
                    <button
                      type="button"
                      disabled={busy === row.slug}
                      onClick={() => setStatus(row, "archived")}
                      className="ml-3 text-xs text-ash hover:text-ink font-medium disabled:opacity-60"
                    >
                      Archive
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy === row.slug}
                      onClick={() => setStatus(row, "published")}
                      className="ml-3 text-xs text-ash hover:text-ink font-medium disabled:opacity-60"
                    >
                      Republish
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busy === row.slug}
                    onClick={() => remove(row)}
                    className="ml-3 text-xs text-gred hover:underline font-medium disabled:opacity-60"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
