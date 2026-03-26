import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPosts, notionConfigured } from "@/lib/notion";

export const metadata: Metadata = {
  title: "Blog",
};

export const revalidate = 120;

export default async function BlogIndexPage() {
  if (!notionConfigured) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="font-serif text-3xl font-semibold text-[var(--color-ink)]">
          Blog
        </h1>
        <p className="leading-relaxed text-[var(--color-muted)]">
          尚未配置 Notion：请在项目根目录复制{" "}
          <code className="rounded bg-[var(--color-line)] px-1.5 py-0.5 text-sm">
            .env.example
          </code>{" "}
          为{" "}
          <code className="rounded bg-[var(--color-line)] px-1.5 py-0.5 text-sm">
            .env.local
          </code>
          ，填写{" "}
          <code className="rounded bg-[var(--color-line)] px-1.5 py-0.5 text-sm">
            NOTION_API_KEY
          </code>{" "}
          与{" "}
          <code className="rounded bg-[var(--color-line)] px-1.5 py-0.5 text-sm">
            NOTION_BLOG_DATABASE_ID
          </code>
          ，并在 Vercel 项目 Environment Variables 中同步。将 Notion
          数据库分享给该集成后，文章会在此列出。
        </p>
      </div>
    );
  }

  const posts = await getBlogPosts();

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted)]">
          Writing
        </p>
        <h1 className="font-serif text-3xl font-semibold text-[var(--color-ink)] md:text-4xl">
          Blog
        </h1>
      </header>

      {posts.length === 0 ? (
        <p className="text-[var(--color-muted)]">
          暂无文章。请在 Notion 数据库中新建页面，并填写标题与 Slug（文本类型）。
        </p>
      ) : (
        <ul className="flex flex-col gap-5">
          {posts.map((post) => (
            <li key={post.id}>
              <article className="rounded-xl border border-[var(--color-line)] bg-white/80 p-5 shadow-sm transition-shadow hover:shadow-md md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="min-w-0 flex-1 space-y-2">
                    <h2 className="font-serif text-lg font-medium leading-snug md:text-xl">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="text-[var(--color-ink)] transition-colors hover:text-[var(--color-accent)]"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    {post.excerpt ? (
                      <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                        {post.excerpt}
                      </p>
                    ) : null}
                  </div>
                  {post.date ? (
                    <time
                      dateTime={post.date}
                      className="shrink-0 text-xs tabular-nums text-[var(--color-muted)] sm:pt-1 sm:text-sm"
                    >
                      {post.date}
                    </time>
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
