import Link from "next/link";

export default function PublicNotFound() {
  return (
    <div className="mx-auto max-w-2xl py-16">
      <p className="kicker">404 — NOT INDEXED</p>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight">
        This page isn&apos;t in the library.
      </h1>
      <p className="prose-reader mt-4">
        The record you followed doesn&apos;t exist yet — or it moved. The library is still worth the
        trip.
      </p>
      <div className="mt-8 flex flex-wrap gap-1.5">
        <Link href="/investors" className="chip chip-signal">
          BROWSE INVESTORS →
        </Link>
        <a href="/#/view=search" className="chip">
          SEARCH THE LIBRARY →
        </a>
        <Link href="/" className="chip">
          OPEN THE APP →
        </Link>
      </div>
    </div>
  );
}
