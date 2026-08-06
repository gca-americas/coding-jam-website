"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { BlockedUser } from "@/lib/blocklist";

/**
 * The blocklist. A blocked email can't sign in at all, and can't submit even
 * with a session cookie issued before the block landed.
 *
 * `attempts` is worth watching: repeated sign-in attempts after a block usually
 * mean a determined spammer rather than someone who wandered in by mistake.
 */
export default function BlocklistManager({ initialBlocked }: { initialBlocked: BlockedUser[] }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/blocklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reason }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(j.error || "Failed");
      }
      setEmail("");
      setReason("");
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function onRemove(target: string) {
    if (!window.confirm(`Unblock ${target}?\n\nThey'll be able to sign in and submit again.`)) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/blocklist/${encodeURIComponent(target)}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(j.error || "Failed");
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="card p-6">
      <div className="section-eyebrow">Blocklist</div>
      <h3 className="font-display font-bold text-xl text-ink mt-1">Accounts barred from the jam.</h3>
      <p className="text-sm text-ash mt-1 max-w-2xl">
        A blocked account can&rsquo;t sign in or submit. Their existing builds stay up — remove
        those from the Submissions tab if you want them gone too.
      </p>

      <form onSubmit={onAdd} className="mt-5 rounded-xl border border-line bg-cloud/60 p-4">
        <div className="grid sm:grid-cols-[1fr,1.5fr,auto] gap-3 items-end">
          <label className="block">
            <span className="block text-xs text-ash">Email</span>
            <input
              type="email"
              required
              placeholder="spammer@example.com"
              className="input mt-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
            />
          </label>
          <label className="block">
            <span className="block text-xs text-ash">Reason (admins only)</span>
            <input
              maxLength={500}
              placeholder="Repeated off-topic submissions"
              className="input mt-1"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={busy}
            />
          </label>
          <button type="submit" disabled={busy} className="btn-google !py-2 !px-4 disabled:opacity-60">
            Block
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-3 rounded-lg bg-gred/10 text-gred border border-gred/30 p-2 text-sm">
          {error}
        </div>
      )}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-widest text-ash border-b border-line">
            <tr>
              <th className="py-2 font-semibold">Email</th>
              <th className="py-2 font-semibold">Reason</th>
              <th className="py-2 font-semibold">Blocked by</th>
              <th className="py-2 font-semibold">Blocked</th>
              <th className="py-2 font-semibold text-right">Attempts since</th>
              <th className="py-2 font-semibold text-right"></th>
            </tr>
          </thead>
          <tbody>
            {initialBlocked.length === 0 && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-ash">
                  Nobody is blocked. Long may it last.
                </td>
              </tr>
            )}
            {initialBlocked.map((b) => (
              <tr key={b.email} className="border-b border-line/60">
                <td className="py-2 font-medium text-ink truncate">{b.email}</td>
                <td className="py-2 text-ash">{b.reason || <span className="text-ash/60">—</span>}</td>
                <td className="py-2 text-ash truncate">{b.blockedBy}</td>
                <td className="py-2 text-ash tabular-nums">{b.blockedAt.slice(0, 10)}</td>
                <td className="py-2 text-right tabular-nums">
                  {b.attempts ? (
                    <span className="text-gred font-semibold" title={`Last: ${b.lastAttemptAt ?? "—"}`}>
                      {b.attempts}
                    </span>
                  ) : (
                    <span className="text-ash/60">0</span>
                  )}
                </td>
                <td className="py-2 text-right">
                  <button
                    type="button"
                    onClick={() => onRemove(b.email)}
                    disabled={busy}
                    className="text-xs text-gblue hover:underline font-medium disabled:opacity-60"
                  >
                    Unblock
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
