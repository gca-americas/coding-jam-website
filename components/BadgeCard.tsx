"use client";

import type { EarnedBadge } from "@/lib/badges";
import { useT } from "@/lib/i18n/client";

const COLOR_CLASSES: Record<
  EarnedBadge["color"],
  { ring: string; text: string; bgSoft: string; gradient: string }
> = {
  gblue:   { ring: "ring-gblue",   text: "text-gblue",   bgSoft: "bg-gblue/10",   gradient: "from-gblue/90 to-gblue/60" },
  gred:    { ring: "ring-gred",    text: "text-gred",    bgSoft: "bg-gred/10",    gradient: "from-gred/90 to-gred/60" },
  gyellow: { ring: "ring-gyellow", text: "text-yellow-700", bgSoft: "bg-gyellow/10", gradient: "from-gyellow/90 to-gyellow/60" },
  ggreen:  { ring: "ring-ggreen",  text: "text-ggreen",  bgSoft: "bg-ggreen/10",  gradient: "from-ggreen/90 to-ggreen/60" },
};

export default function BadgeCard({
  badge,
  totalSubmissions,
  hideClaim = false,
}: {
  badge: EarnedBadge;
  totalSubmissions: number;
  /** When true (public profile views), don't show the personal claim button. */
  hideClaim?: boolean;
}) {
  const t = useT();
  const c = COLOR_CLASSES[badge.color];
  const earned = badge.earned;
  const initial = badge.label.charAt(0).toUpperCase();

  return (
    <div
      className={`card p-6 flex flex-col items-center text-center ${
        earned ? "" : "opacity-60"
      }`}
    >
      <div
        className={`relative h-24 w-24 flex items-center justify-center ${
          badge.imageUrl
            ? earned
              ? ""
              : "grayscale opacity-70"
            : `rounded-full overflow-hidden bg-gradient-to-br ${c.gradient} text-white ring-4 ${earned ? c.ring : "ring-line"} ring-offset-2 ring-offset-white ${earned ? "" : "grayscale"}`
        }`}
      >
        {badge.imageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={badge.imageUrl}
            alt={badge.label}
            className="h-full w-full object-contain"
          />
        ) : (
          <span className="font-display font-bold text-4xl drop-shadow-sm">{initial}</span>
        )}
      </div>

      <h3 className="font-display font-bold text-lg text-ink mt-4">{badge.label}</h3>
      <div className={`text-xs font-semibold mt-1 ${earned ? c.text : "text-ash"}`}>
        {t(badge.threshold === 1 ? "card.buildOne" : "card.buildMany").replace("{n}", String(badge.threshold))}
      </div>

      {earned ? (
        hideClaim ? (
          <div className={`mt-4 text-xs font-semibold ${c.text}`}>{t("badge.earned")}</div>
        ) : badge.claimUrl ? (
          <a
            href={badge.claimUrl}
            target="_blank"
            rel="noreferrer"
            className={`mt-4 inline-flex items-center justify-center gap-1.5 w-full px-4 py-2 rounded-lg ${c.bgSoft} ${c.text} text-sm font-semibold hover:opacity-90 transition-opacity`}
          >
            {t("badge.claim")}
          </a>
        ) : (
          <div className="mt-4 text-xs text-ash italic px-2">
            {t("badge.soon")}
          </div>
        )
      ) : (
        <div className="mt-4 text-xs text-ash">
          {t(badge.remaining === 1 ? "badge.shipOne" : "badge.shipMany").replace("{n}", String(badge.remaining))}
        </div>
      )}

      {earned && (
        <div className="mt-3 text-[11px] text-ash">
          {t(totalSubmissions === 1 ? "badge.soFarOne" : "badge.soFarMany").replace("{n}", String(totalSubmissions))}
        </div>
      )}
    </div>
  );
}
