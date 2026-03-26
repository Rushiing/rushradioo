import Link from "next/link";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted)]">
          Hello
        </p>
        <h1 className="font-serif text-4xl font-semibold tracking-tight text-[var(--color-ink)] md:text-5xl">
          欢迎来访
        </h1>
        <p className="max-w-xl text-lg leading-relaxed text-[var(--color-muted)]">
          这里是我的个人站点：关于我、基于 Notion 的博客，以及轻量瀑布流式的知识卡片。
        </p>
      </div>
      <div className="flex flex-wrap gap-4 pt-2">
        <Link
          href="/about"
          className="rounded-full border border-[var(--color-line)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] shadow-sm transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          关于我
        </Link>
        <Link
          href="/blog"
          className="rounded-full border border-[var(--color-line)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] shadow-sm transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          阅读 Blog
        </Link>
        <Link
          href="/feeds"
          className="rounded-full border border-[var(--color-line)] bg-white px-5 py-2.5 text-sm font-medium text-[var(--color-ink)] shadow-sm transition hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          浏览 Feeds
        </Link>
      </div>
    </div>
  );
}
