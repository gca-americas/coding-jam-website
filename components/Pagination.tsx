import Link from "next/link";

/**
 * Page navigation, shared by /showcase and /jams.
 *
 * Takes an `href` builder rather than search params, so each page keeps its own
 * filter params in the URL without this component needing to know about them.
 */

/** A compact list of page numbers with '…' gaps once there are too many to show. */
export function pageList(current: number, total: number): Array<number | "…"> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  const out: Array<number | "…"> = [];
  for (let i = 0; i < sorted.length; i++) {
    out.push(sorted[i]);
    if (i < sorted.length - 1 && sorted[i + 1] - sorted[i] > 1) out.push("…");
  }
  return out;
}

export default function Pagination({
  page,
  totalPages,
  href,
  label,
}: {
  page: number;
  totalPages: number;
  /** Builds the URL for a given page, carrying whatever filters are active. */
  href: (page: number) => string;
  /** Accessible name, e.g. "Showcase pagination". */
  label: string;
}) {
  if (totalPages <= 1) return null;
  const items = pageList(page, totalPages);

  return (
    <nav aria-label={label} className="mt-10 flex items-center justify-between gap-3 flex-wrap">
      <PageButton href={href(page - 1)} disabled={page === 1}>
        ← Previous
      </PageButton>

      <ol className="flex items-center gap-1">
        {items.map((it, i) =>
          it === "…" ? (
            <li key={`gap-${i}`} className="px-2 text-ash text-sm select-none">
              …
            </li>
          ) : (
            <li key={it}>
              <Link
                href={href(it)}
                aria-current={it === page ? "page" : undefined}
                className={`min-w-9 h-9 px-3 inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  it === page ? "bg-ink text-white" : "text-ink hover:bg-cloud border border-line"
                }`}
              >
                {it}
              </Link>
            </li>
          ),
        )}
      </ol>

      <PageButton href={href(page + 1)} disabled={page === totalPages}>
        Next →
      </PageButton>
    </nav>
  );
}

function PageButton({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="btn border border-line bg-cloud/50 text-ash/60 cursor-not-allowed select-none !px-4 !py-2 text-sm">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className="btn-ghost !px-4 !py-2 text-sm">
      {children}
    </Link>
  );
}
