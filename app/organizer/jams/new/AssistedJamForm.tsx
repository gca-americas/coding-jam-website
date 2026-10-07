"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Jam } from "@/lib/jams";
import type { ChapterType } from "@/components/ChapterPicker";
import JamForm, { type TrackOption } from "../JamForm";
import JamAssistant from "./JamAssistant";
import TrackNotes from "@/components/TrackNotes";

/**
 * Chat first, form second.
 *
 * The assistant creates the jam itself now, so the form is purely the manual
 * route and starts collapsed. Both write through the same validator, so a jam
 * made either way is identical.
 */
export default function AssistedJamForm(props: {
  notesCopy?: Record<string, string>;
  copyFrom?: Jam;
  tracks: TrackOption[];
  defaults: { chapterType: ChapterType; chapterName: string; country: string };
}) {
  const router = useRouter();
  const [openForm, setOpenForm] = useState(Boolean(props.copyFrom));
  const [openTracks, setOpenTracks] = useState(false);

  /* The assistant links to #track-<slug>. The panel is collapsed by default, so
     open it and the named track before the browser tries to scroll there. */
  useEffect(() => {
    const jump = () => {
      const id = window.location.hash.slice(1);
      if (!id.startsWith("track-")) return;
      setOpenTracks(true);
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el instanceof HTMLDetailsElement) el.open = true;
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };
    window.addEventListener("hashchange", jump);
    return () => window.removeEventListener("hashchange", jump);
  }, []);

  return (
    <div className="space-y-6">
      {/* A jam the assistant just made should show up in "Your jams" without a
          reload, so refresh the server data once it reports success. */}
      <JamAssistant onCreated={() => router.refresh()} />

      <div>
        <button
          type="button"
          onClick={() => setOpenTracks((v) => !v)}
          aria-expanded={openTracks}
          aria-controls="track-notes-panel"
          className="flex w-full items-center justify-between rounded-2xl border border-line bg-white px-5 py-4 text-left transition hover:bg-cloud/50"
        >
          <span>
            <span className="font-display font-semibold text-ink">The tracks</span>
            <span className="mt-0.5 block text-sm text-ash">
              What each one asks the room to build, and how to run it. Expand any track to read it.
            </span>
          </span>
          <span aria-hidden="true" className={`shrink-0 text-xl text-ash transition-transform ${openTracks ? "rotate-45" : ""}`}>
            +
          </span>
        </button>
        <div id="track-notes-panel" hidden={!openTracks} className="pt-6">
          <TrackNotes heading={false} copy={props.notesCopy ?? {}} />
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={() => setOpenForm((v) => !v)}
          aria-expanded={openForm}
          aria-controls="jam-form"
          className="flex w-full items-center justify-between rounded-2xl border border-line bg-white px-5 py-4 text-left transition hover:bg-cloud/50"
        >
          <span>
            <span className="font-display font-semibold text-ink">
              {openForm ? "The form" : "Or fill the form yourself"}
            </span>
            <span className="mt-0.5 block text-sm text-ash">
              {openForm
                ? "Every field, editable. Nothing is public until you set it to Published."
                : "Skip the chat and type it all in — same fields, same result."}
            </span>
          </span>
          <span aria-hidden="true" className={`shrink-0 text-xl text-ash transition-transform ${openForm ? "rotate-45" : ""}`}>
            +
          </span>
        </button>

        <div id="jam-form" hidden={!openForm} className="pt-6">
          <JamForm mode="create" copyFrom={props.copyFrom} tracks={props.tracks} defaults={props.defaults} />
        </div>
      </div>
    </div>
  );
}
