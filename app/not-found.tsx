import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-page py-32 text-center">
      <div className="text-7xl">🎶</div>
      <h1 className="h-display text-4xl mt-6">Off the lineup.</h1>
      <p className="text-ash mt-3 max-w-md mx-auto">
        We couldn&rsquo;t find that page. Try one of the eight jams instead.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Link href="/" className="btn-google">Back to home</Link>
        <Link href="/#lineup" className="btn-ghost">See the lineup</Link>
      </div>
    </section>
  );
}
