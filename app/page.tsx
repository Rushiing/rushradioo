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
  description: "Rush Radioo 的长文档案与知识条目。",
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
            <p className="section-label">Knowledge archive</p>
            <h1 className="font-serif text-5xl font-semibold leading-[1.02] text-[var(--color-ink)] md:text-7xl">
              Rush Radioo
            </h1>
          </div>
          <p className="max-w-2xl text-xl leading-[1.8] text-[var(--color-muted)]">
            一座面向长文档案与知识条目的个人索引。这里收录建筑、历史、技术与生活系统中的观察、材料和判断。
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/blog" className="button-primary">
              阅读长文
            </Link>
            <Link href="/feeds" className="button-ghost">
              浏览条目
            </Link>
          </div>
        </div>

        <aside className="content-card grid gap-4 p-5">
          <div>
            <p className="section-label">Archive status</p>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              长文与条目按统一字段归档，便于检索、扩展和持续修订。
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
            从现场、材料与系统中提取结构
          </h2>
        </div>
        <div className="space-y-5 text-[var(--color-muted)] leading-[1.9]">
          <p>
            Rush Radioo 以长文保留完整脉络，以知识条目记录可复用的概念、事实与线索。
          </p>
          <p>
            内容从个人学习和实地观察中生长，经整理后进入公开档案，供之后的写作、研究和项目引用。
          </p>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-label">Latest essays</p>
              <h2 className="font-serif text-2xl font-semibold text-[var(--color-ink)]">
                Blogs
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-sm font-medium text-[var(--color-accent)]"
            >
              查看全部
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
                <p className="section-label">No essays</p>
                <p className="text-[var(--color-muted)]">
                  暂无公开长文。
                </p>
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="section-label">Latest entries</p>
              <h2 className="font-serif text-2xl font-semibold text-[var(--color-ink)]">
                Feeds
              </h2>
            </div>
            <Link
              href="/feeds"
              className="text-sm font-medium text-[var(--color-accent)]"
            >
              查看全部
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
                <p className="section-label">No entries</p>
                <p className="text-[var(--color-muted)]">
                  暂无公开知识条目。
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
