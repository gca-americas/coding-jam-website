"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { PublicProject } from "@/lib/projects";
import ProjectCard from "@/components/ProjectCard";

/**
 * Wraps ProjectCard with owner controls (Edit + Delete). Only used on /me for
 * builds the signed-in user submitted (not ones they're only credited on).
 */
export default function OwnerProjectCard({ project }: { project: PublicProject }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function onDelete() {
    if (!window.confirm(`Delete "${project.projectName}"? This can't be undone.`)) return;
    setError(null);
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({ error: "Delete failed" }));
        throw new Error(j.error || "Delete failed");
      }
      startTransition(() => router.refresh());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
      setDeleting(false);
    }
  }

  return (
    <div className="relative group">
      <ProjectCard project={project} />
      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
        <Link
          href={`/me/edit/${project.id}`}
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/95 border border-line text-ink hover:bg-white shadow-soft"
          title="Edit this build"
        >
          Edit
        </Link>
        <button
          type="button"
          onClick={onDelete}
          disabled={deleting || pending}
          className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white/95 border border-line text-gred hover:bg-gred hover:text-white shadow-soft disabled:opacity-60"
          title="Delete this build"
        >
          {deleting ? "Deleting…" : "Delete"}
        </button>
      </div>
      {error && (
        <div className="absolute top-12 right-2 text-[11px] bg-gred text-white px-2 py-1 rounded-md shadow-soft">
          {error}
        </div>
      )}
    </div>
  );
}
