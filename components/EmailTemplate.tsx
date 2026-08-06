"use client";

import { useEffect, useState } from "react";

/**
 * A copyable email draft in a dialog.
 *
 * The body is editable — every organizer has details we can't know (room
 * number, headcount, whether pizza is happening), and a template you can't
 * adjust in place just gets pasted into a mail client and fixed there anyway.
 *
 * Copy is the primary action rather than mailto:. Long bodies blow past the URL
 * length some mail clients accept, and a silently truncated email is worse than
 * one paste. mailto: is offered as a convenience for short drafts.
 */
export default function EmailTemplate({
  label,
  title,
  blurb,
  to,
  subject,
  body,
  variant = "ghost",
}: {
  /** Button text. */
  label: string;
  /** Dialog heading. */
  title: string;
  blurb: string;
  to?: string;
  subject: string;
  body: string;
  variant?: "ghost" | "google";
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(body);
  const [draftSubject, setDraftSubject] = useState(subject);
  const [copied, setCopied] = useState<"subject" | "body" | null>(null);

  // Re-seed when the source template changes (e.g. a different jam).
  useEffect(() => {
    setDraft(body);
    setDraftSubject(subject);
  }, [body, subject]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  async function copy(what: "subject" | "body") {
    try {
      await navigator.clipboard.writeText(what === "subject" ? draftSubject : draft);
      setCopied(what);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  const mailto = `mailto:${to ?? ""}?subject=${encodeURIComponent(draftSubject)}&body=${encodeURIComponent(draft)}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={variant === "google" ? "btn-google !py-2 !px-4 text-sm" : "btn-ghost !py-2 !px-4 text-sm"}
      >
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 sm:p-8 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-lift w-full max-w-2xl my-8 overflow-hidden"
          >
            <div className="p-6 border-b border-line flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-xl text-ink">{title}</h2>
                <p className="text-sm text-ash mt-1">{blurb}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="h-8 w-8 rounded-full hover:bg-cloud text-ash hover:text-ink shrink-0 flex items-center justify-center text-lg"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              {to && (
                <div>
                  <span className="block text-xs text-ash">To</span>
                  <div className="mt-1 flex items-center gap-2">
                    <code className="flex-1 input font-mono text-xs bg-cloud/60 truncate">{to}</code>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(to).catch(() => {})}
                      className="btn-ghost !py-2 !px-3 text-xs shrink-0"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}

              <label className="block">
                <span className="block text-xs text-ash">Subject</span>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    value={draftSubject}
                    onChange={(e) => setDraftSubject(e.target.value)}
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => copy("subject")}
                    className="btn-ghost !py-2 !px-3 text-xs shrink-0"
                  >
                    {copied === "subject" ? "Copied ✓" : "Copy"}
                  </button>
                </div>
              </label>

              <label className="block">
                <span className="block text-xs text-ash">
                  Body — edit anything in square brackets before sending
                </span>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={16}
                  className="input mt-1 font-mono text-xs leading-relaxed"
                />
              </label>
            </div>

            <div className="p-6 border-t border-line flex flex-wrap items-center gap-3">
              <button type="button" onClick={() => copy("body")} className="btn-google !py-2 !px-4 text-sm">
                {copied === "body" ? "Copied ✓" : "Copy the email"}
              </button>
              <a href={mailto} className="btn-ghost !py-2 !px-4 text-sm">
                Open in mail app
              </a>
              <button
                type="button"
                onClick={() => {
                  setDraft(body);
                  setDraftSubject(subject);
                }}
                className="text-sm text-ash hover:text-ink ml-auto"
              >
                Reset to template
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
