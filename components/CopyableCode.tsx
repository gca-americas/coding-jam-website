"use client";

import { useState } from "react";

export default function CopyableCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Old browsers / missing permission — silently no-op; user can still
      // select + copy manually.
    }
  }

  return (
    <div className="relative mt-3 group">
      <pre className="text-[11px] font-mono bg-cloud/60 border border-line rounded-lg p-3 pr-12 overflow-x-auto leading-relaxed text-ink">
        {code}
      </pre>
      <button
        type="button"
        onClick={onCopy}
        aria-label="Copy to clipboard"
        className="absolute top-2 right-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md bg-white border border-line text-ash hover:text-ink hover:bg-cloud opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
      >
        {copied ? "Copied ✓" : "Copy"}
      </button>
    </div>
  );
}
