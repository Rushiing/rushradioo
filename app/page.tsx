import type { Metadata } from "next";
import Link from "next/link";
import { getLocalBlogPosts, getLocalFeedItems } from "@/lib/content";
import {
  feedsConfigured,
  getBlogPosts,
  getFeedItems,
  notionConfigured,
} from "@/lib/notion";

export const metadata: Metadata = {
  title: {
    absolute: "RUSHING",
  },
  description: "Rush 的长文本、知识条目与个人系统。",
};

export default async function HomePage() {
  const localPosts = await getLocalBlogPosts();
  const localFeeds = await getLocalFeedItems();
  const notionPosts =
    localPosts.length === 0 && notionConfigured ? await getBlogPosts() : [];
  const posts = localPosts.length
    ? localPosts
    : notionPosts.map((post) => ({
        ...post,
        tags: [] as string[],
        eyebrow: null as string | null,
      }));
  const notionFeeds =
    localFeeds.length === 0 && feedsConfigured ? await getFeedItems() : [];
  const feeds = localFeeds.length
    ? localFeeds
    : notionFeeds.map((item) => ({
        ...item,
        slug: "",
        tags: [] as string[],
        category: null as string | null,
      }));

  return (
    <div className="space-y-20">
      <section className="grid min-h-[54vh] gap-10 border-b border-[var(--color-line)] pb-14 md:grid-cols-[1fr_21rem] md:items-end md:pb-20">
        <div className="max-w-3xl space-y-8">
          <div className="space-y-4">
            <p className="section-label">Personal knowledge field</p>
            <h1 className="font-serif text-5xl font-semibold leading-[1.02] text-[var(--color-ink)] md:text-7xl">
              Rush Radioo
            </h1>
          </div>
          <p className="max-w-2xl text-xl leading-[1.8] text-[var(--color-muted)]">
            一个面向长文本与短知识条目的个人发布系统。记录 AI native
            生产、感知采样、生活系统，以及那些尚未被归类的信号。
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/blog" className="button-primary">
              Read Blogs
            </Link>
            <Link href="/feeds" className="button-ghost">
              Browse Feeds
            </Link>
          </div>
        </div>

        <aside className="content-card grid gap-4 p-5">
          <div>
            <p className="section-label">Current shape</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              Markdown/MDX 优先，Notion 暂时作为 fallback。Obsidian
              可以成为内容写作入口。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-[var(--color-line)] pt-4">
            <div>
              <p className="font-serif text-3xl font-semibold text-[var(--color-ink)]">
                {posts.length}
              </p>
              <p className="text-xs uppercase tracking-[0.15em] text-[var(--color-muted)]">
                Blogs
              </p>
            </div>
            <div>
              <p className="font-serif text-3xl font-semibold text-[var(--color-ink)]">
                {feeds.length}
              </p>
              <p className="text-xs uppercase tracking-[0.15em] text-[var(--color-muted)]">
                Feeds
              </p>
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-10 md:grid-cols-[0.85fr_1.15fr]">
        <div className="space-y-4">
          <p className="section-label">About</p>
          <h2 className="font-serif text-3xl font-semibold leading-tight text-[var(--color-ink)]">
            在比特与原子的缝隙间采样
          </h2>
        </div>
        <div className="space-y-5 text-[var(--color-muted)] leading-[1.9]">
          <p>
            我是一个在 0 与 1 的荒原中修筑花园的数字炼金术士。这里会逐渐沉淀长文本、知识碎片、方法论和正在成形的个人系统。
          </p>
          <p>
            对我而言，写作不是发布后的定稿，而是持续观察、修正和复用的过程。Blogs
            保留完整结构，Feeds 捕捉更轻的信号。
          </p>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-label">Latest longform</p>
              <h2 className="font-serif text-2xl font-semibold text-[var(--color-ink)]">
                Blogs
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-sm font-medium text-[var(--color-accent)]"
            >
              View all
            </Link>
          </div>
          <div className="space-y-4">
            {posts.slice(0, 3).map((post) => (
              <article key={post.id} className="content-card p-5">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {post.date ? (
                    <time
                      dateTime={post.date}
                      className="text-xs uppercase tracking-[0.15em] text-[var(--color-muted)]"
                    >
                      {post.date}
                    </time>
                  ) : null}
                  {post.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="tag-chip">
                      {tag}
                    </span>
                  ))}
                </div>
                <h3 className="font-serif text-xl font-semibold leading-snug">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-[var(--color-ink)] transition hover:text-[var(--color-accent)]"
                  >
                    {post.title}
                  </Link>
                </h3>
                {post.eyebrow ? (
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
                    {post.eyebrow}
                  </p>
                ) : null}
                {post.excerpt ? (
                  <p className="mt-3 text-sm leading-relaxed text-[var(--color-muted)]">
                    {post.excerpt}
                  </p>
                ) : null}
              </article>
            ))}
            {posts.length === 0 ? (
              <div className="empty-panel">
                <p className="section-label">No blogs yet</p>
                <p className="text-[var(--color-muted)]">
                  第一篇长文会从 <code>content/blogs</code> 进入这里。
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-label">Latest notes</p>
              <h2 className="font-serif text-2xl font-semibold text-[var(--color-ink)]">
                Feeds
              </h2>
            </div>
            <Link
              href="/feeds"
              className="text-sm font-medium text-[var(--color-accent)]"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {feeds.slice(0, 4).map((item) => (
              <article key={item.id} className="content-card p-4">
                {item.category ? (
                  <p className="mb-2 text-xs uppercase tracking-[0.14em] text-[var(--color-muted)]">
                    {item.category}
                  </p>
                ) : null}
                <h3 className="font-serif text-lg font-semibold text-[var(--color-ink)]">
                  {item.slug ? (
                    <Link
                      href={`/feeds/${item.slug}`}
                      className="transition hover:text-[var(--color-accent)]"
                    >
                      {item.title}
                    </Link>
                  ) : (
                    item.title
                  )}
                </h3>
                {item.date ? (
                  <time
                    dateTime={item.date}
                    className="mt-2 block text-xs uppercase tracking-[0.15em] text-[var(--color-muted)]"
                  >
                    {item.date}
                  </time>
                ) : null}
                {item.text ? (
                  <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-[var(--color-muted)]">
                    {item.text}
                  </p>
                ) : null}
              </article>
            ))}
            {feeds.length === 0 ? (
              <div className="empty-panel sm:col-span-2">
                <p className="section-label">No feeds yet</p>
                <p className="text-[var(--color-muted)]">
                  短知识条目会从 <code>content/feeds</code> 进入这里。
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
