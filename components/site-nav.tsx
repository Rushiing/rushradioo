import Link from "next/link";

const links = [
  { href: "/", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/feeds", label: "Feeds" },
] as const;

export function SiteNav() {
  return (
    <header className="border-b border-[var(--color-line)] bg-[var(--color-paper)]/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-5 md:px-6">
        <Link
          href="/"
          className="font-serif text-lg font-medium tracking-tight text-[var(--color-ink)] transition-opacity hover:opacity-70"
        >
          RUSHING
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
          <span
            className="cursor-not-allowed select-none text-[var(--color-muted)] opacity-40"
            aria-disabled="true"
            title="敬请期待"
          >
            Sections
          </span>
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[var(--color-line)] py-10 text-center text-xs text-[var(--color-muted)]">
      <p>© {new Date().getFullYear()} · RUSH</p>
    </footer>
  );
}
