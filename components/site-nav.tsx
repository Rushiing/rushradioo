import Link from "next/link";

const links = [
  { href: "/", label: "Index" },
  { href: "/blog", label: "Blogs" },
  { href: "/feeds", label: "Feeds" },
] as const;

export function SiteNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-[var(--color-line)] bg-[var(--color-paper)]/88 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-4 md:px-6">
        <Link
          href="/"
          className="font-serif text-lg font-semibold tracking-tight text-[var(--color-ink)] transition-opacity hover:opacity-70"
        >
          RUSH RADIOO
        </Link>
        <nav
          className="flex flex-wrap items-center justify-end gap-6 text-sm text-[var(--color-muted)]"
          aria-label="主导航"
        >
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="transition-colors hover:text-[var(--color-ink)]"
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--color-line)] py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-5 text-xs text-[var(--color-muted)] md:flex-row md:items-center md:justify-between md:px-6">
        <p>© {new Date().getFullYear()} · RUSH</p>
        <p>Blogs, feeds, and working notes.</p>
      </div>
    </footer>
  );
}
