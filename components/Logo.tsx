export default function Logo({ size = 28 }: { size?: number }) {
  // Four-bar audio waveform in the four Google colors — the "jam" mark.
  const w = size;
  const h = size;
  return (
    <svg width={w} height={h} viewBox="0 0 32 32" fill="none" aria-hidden>
      <rect x="3" y="10" width="4" height="12" rx="2" fill="#4285F4" className="origin-center animate-bar1" />
      <rect x="10" y="6" width="4" height="20" rx="2" fill="#EA4335" className="origin-center animate-bar2" />
      <rect x="17" y="9" width="4" height="14" rx="2" fill="#FBBC04" className="origin-center animate-bar3" />
      <rect x="24" y="11" width="4" height="10" rx="2" fill="#34A853" className="origin-center animate-bar4" />
    </svg>
  );
}
