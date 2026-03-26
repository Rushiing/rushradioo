import type { Metadata } from "next";
import Image from "next/image";
import { feedsConfigured, getFeedItems } from "@/lib/notion";

export const metadata: Metadata = {
  title: "Feeds",
};

export const revalidate = 120;

export default async function FeedsPage() {
  if (!feedsConfigured) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="font-serif text-3xl font-semibold text-[var(--color-ink)]">
          Feeds
        </h1>
        <p className="leading-relaxed text-[var(--color-muted)]">
          尚未配置 Feeds 数据库：在{" "}
          <code className="rounded bg-[var(--color-line)] px-1.5 py-0.5 text-sm">
            .env.local
          </code>{" "}
          与 Vercel 中设置{" "}
          <code className="rounded bg-[var(--color-line)] px-1.5 py-0.5 text-sm">
            NOTION_FEEDS_DATABASE_ID
          </code>
          ，并在 Notion 中创建「标题」与「正文」或「Content」字段，可选「Image」或「Cover」文件字段。
        </p>
      </div>
    );
  }

  const items = await getFeedItems();

  return (
    <div className="space-y-10">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted)]">
          Stream
        </p>
        <h1 className="font-serif text-3xl font-semibold text-[var(--color-ink)] md:text-4xl">
          Feeds
        </h1>
        <p className="text-[var(--color-muted)]">
          轻量图文与摘录，来自 Notion，瀑布流布局。
        </p>
      </header>

      {items.length === 0 ? (
        <p className="text-[var(--color-muted)]">
          暂无卡片。在 Feeds 数据库中新增行即可。
        </p>
      ) : (
        <div className="feed-masonry">
          {items.map((item) => (
            <article
              key={item.id}
              className="feed-card rounded-xl border border-[var(--color-line)] bg-white/80 p-4 shadow-sm"
            >
              {item.imageUrl && (
                <div className="relative mb-3 aspect-[4/3] w-full overflow-hidden rounded-lg bg-[var(--color-line)]">
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    unoptimized
                  />
                </div>
              )}
              <h2 className="font-serif text-lg font-medium text-[var(--color-ink)]">
                {item.title}
              </h2>
              {item.date && (
                <time
                  dateTime={item.date}
                  className="mt-1 block text-xs text-[var(--color-muted)]"
                >
                  {item.date}
                </time>
              )}
              {item.text && (
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-muted)]">
                  {item.text}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
