"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Admin } from "@/lib/admins";

export default function AdminsManager({
  initialAdmins,
  currentEmail,
}: {
  initialAdmins: Admin[];
  currentEmail: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const admins = initialAdmins;

  async function onAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(j.error || "Failed");
      }
      setEmail("");
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setBusy(false);
    }
  }

  async function onRemove(target: string) {
    if (!window.confirm(`Remove admin ${target}?`)) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/admins/${encodeURIComponent(target)}`, {
        method: "DELETE",
      });
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
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <div className="section-eyebrow">Admins</div>
          <h3 className="font-display font-bold text-xl text-ink mt-1">
            Who can see this page.
          </h3>
        </div>
        <form onSubmit={onAdd} className="flex items-center gap-2">
          <input
            type="email"
            required
            placeholder="new-admin@example.com"
            className="input w-64"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || pending}
            className="btn-google !py-2 !px-4 disabled:opacity-60"
          >
            Add admin
          </button>
        </form>
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
              <th className="py-2 font-semibold">Email</th>
              <th className="py-2 font-semibold">Added by</th>
              <th className="py-2 font-semibold">Added at</th>
              <th className="py-2 font-semibold text-right"></th>
            </tr>
          </thead>
          <tbody>
            {admins.map((a) => (
              <tr key={a.email} className="border-b border-line/60">
                <td className="py-2 font-medium text-ink">
                  {a.email}
                  {a.email === currentEmail && (
                    <span className="ml-2 chip bg-gblue/10 text-gblue text-[10px]">you</span>
                  )}
                </td>
                <td className="py-2 text-ash">{a.addedBy}</td>
                <td className="py-2 text-ash tabular-nums">
                  {a.addedAt.slice(0, 10)}
                </td>
                <td className="py-2 text-right">
                  {a.email !== currentEmail && (
                    <button
                      type="button"
                      onClick={() => onRemove(a.email)}
                      disabled={busy}
                      className="text-xs text-gred hover:underline font-medium disabled:opacity-60"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
