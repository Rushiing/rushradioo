import type { Metadata } from "next";
import Link from "next/link";
import { getLocalBlogPosts } from "@/lib/content";
import { getBlogPosts, notionConfigured } from "@/lib/notion";

export const metadata: Metadata = {
  title: "Blog",
};

export const revalidate = 120;

export default async function BlogIndexPage() {
  const localPosts = await getLocalBlogPosts();
  const notionPosts =
    localPosts.length === 0 && notionConfigured ? await getBlogPosts() : [];
  const posts = localPosts.length
    ? localPosts
    : notionPosts.map((post) => ({
        ...post,
        tags: [] as string[],
        eyebrow: null as string | null,
      }));

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <header className="grid gap-8 border-b border-[var(--color-line)] pb-10 md:grid-cols-[1fr_18rem] md:items-end">
        <div className="space-y-4">
          <p className="section-label">Longform</p>
          <h1 className="font-serif text-4xl font-semibold leading-tight text-[var(--color-ink)] md:text-6xl">
            Blogs
          </h1>
        </div>
        <p className="max-w-sm text-sm leading-relaxed text-[var(--color-muted)] md:justify-self-end">
          长文用于保存完整脉络、材料来源与结构化判断，适合持续修订和反复引用。
        </p>
      </header>

      {posts.length === 0 ? (
        <div className="empty-panel">
          <p className="section-label">No essays</p>
          <h2 className="font-serif text-2xl font-semibold text-[var(--color-ink)]">
            还没有发布长文
          </h2>
          <p className="max-w-xl leading-relaxed text-[var(--color-muted)]">
            公开档案整理完成后会在这里呈现。
          </p>
        </div>
      ) : (
        <ul className="space-y-5">
          {posts.map((post) => (
            <li key={post.id}>
              <article className="content-card group grid gap-5 p-5 md:grid-cols-[9rem_1fr] md:p-6">
                <div className="space-y-2 text-xs uppercase tracking-[0.15em] text-[var(--color-muted)]">
                  {post.date ? (
                    <time dateTime={post.date} className="block tabular-nums">
                      {post.date}
                    </time>
                  ) : null}
                  {post.eyebrow ? (
                    <p className="leading-relaxed normal-case tracking-normal text-[var(--color-muted)]">
                      {post.eyebrow}
                    </p>
                  ) : null}
                  {"tags" in post && post.tags.length ? (
                    <div className="flex flex-wrap gap-2 normal-case tracking-normal">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="tag-chip">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="min-w-0 space-y-3">
                  <h2 className="font-serif text-2xl font-semibold leading-snug">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-accent)]"
                    >
                      {post.title}
                    </Link>
                  </h2>
                  {post.excerpt ? (
                    <p className="max-w-2xl leading-relaxed text-[var(--color-muted)]">
                      {post.excerpt}
                    </p>
                  ) : null}
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
