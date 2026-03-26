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
        <p className="text-[var(--color-muted)]">
          内容来自 Notion，更新后数分钟内会在此同步（ISR）。
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="text-[var(--color-muted)]">
          暂无文章。请在 Notion 数据库中新建页面，并填写标题与 Slug（文本类型）。
        </p>
      ) : (
        <ul className="divide-y divide-[var(--color-line)] border-t border-[var(--color-line)]">
          {posts.map((post) => (
            <li key={post.id}>
              <Link
                href={`/blog/${post.slug}`}
                className="group flex flex-col gap-1 py-6 transition-colors md:flex-row md:items-baseline md:justify-between"
              >
                <span className="font-medium text-[var(--color-ink)] group-hover:text-[var(--color-accent)]">
                  {post.title}
                </span>
                {post.date && (
                  <time
                    dateTime={post.date}
                    className="shrink-0 text-sm text-[var(--color-muted)]"
                  >
                    {post.date}
                  </time>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
