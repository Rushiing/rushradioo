import type { Metadata } from "next";
import Link from "next/link";
import { getLocalFeedItems } from "@/lib/content";
import { feedsConfigured, getFeedItems } from "@/lib/notion";

export const metadata: Metadata = {
  title: "Feeds",
};

export const dynamic = "force-dynamic";

export default async function FeedsPage() {
  const localItems = await getLocalFeedItems();
  const notionItems =
    localItems.length === 0 && feedsConfigured ? await getFeedItems() : [];
  const items = localItems.length
    ? localItems
    : notionItems.map((item) => ({
        ...item,
        slug: "",
        tags: [] as string[],
        sourceUrl: null as string | null,
        category: null as string | null,
      }));

  return (
    <div className="space-y-12">
      <header className="grid gap-8 border-b border-[var(--color-line)] pb-10 md:grid-cols-[1fr_18rem] md:items-end">
        <div className="space-y-4">
          <p className="section-label">Knowledge stream</p>
          <h1 className="font-serif text-4xl font-semibold leading-tight text-[var(--color-ink)] md:text-6xl">
            Feeds
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-[var(--color-muted)] md:justify-self-end">
          短文本、截图、链接和知识碎片。它们可以保持轻盈，也可以在未来被合成长文。
        </p>
      </header>

      {items.length === 0 ? (
        <div className="empty-panel">
          <p className="section-label">Open slots</p>
          <h2 className="font-serif text-2xl font-semibold text-[var(--color-ink)]">
            还没有知识条目
          </h2>
          <p className="max-w-xl leading-relaxed text-[var(--color-muted)]">
            在 <code>content/feeds</code> 中放入 Markdown 文件，配好标题、日期和标签，
            就能作为卡片发布。
          </p>
        </div>
      ) : (
        <div className="feed-masonry">
          {items.map((item) => (
            <article
              key={item.id}
              className="feed-card content-card group p-4"
            >
              {item.imageUrl && (
                <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-lg bg-[var(--color-line)]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- Notion 文件 URL，与 next/image 白名单易冲突 */}
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              )}
              {item.category ? (
                <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
                  {item.category}
                </p>
              ) : null}
              <h2 className="font-serif text-lg font-semibold leading-snug text-[var(--color-ink)]">
                {item.slug ? (
                  <Link
                    href={`/feeds/${item.slug}`}
                    className="transition group-hover:text-[var(--color-accent)]"
                  >
                    {item.title}
                  </Link>
                ) : (
                  item.title
                )}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {item.date && (
                  <time
                    dateTime={item.date}
                    className="text-xs tabular-nums text-[var(--color-muted)]"
                  >
                    {item.date}
                  </time>
                )}
                {item.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className="tag-chip">
                    {tag}
                  </span>
                ))}
              </div>
              {item.text && (
                <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                  {item.text}
                </p>
              )}
              {item.slug ? (
                <Link
                  href={`/feeds/${item.slug}`}
                  className="mt-4 inline-block text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]"
                >
                  Read note
                </Link>
              ) : null}
              {item.sourceUrl ? (
                <a
                  href={item.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]"
                >
                  Source
                </a>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
