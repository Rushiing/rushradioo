import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/markdown-content";
import { NotionBlocks } from "@/components/notion-blocks";
import { getLocalBlogPostBySlug } from "@/lib/content";
import {
  dateFromPage,
  getBlogPostBySlug,
  notionConfigured,
  titleFromPage,
} from "@/lib/notion";

/** 每次请求拉取最新块与图片 URL（Notion 文件签名为短时有效，避免 CDN 缓存过期链） */
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function normalizeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function readingMinutes(text: string): number {
  const chars = text.replace(/\s+/g, "").length;
  return Math.max(1, Math.ceil(chars / 500));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  if (!slug) return { title: "文章" };
  const localPost = await getLocalBlogPostBySlug(slug);
  if (localPost) {
    return {
      title: localPost.title,
      description: localPost.excerpt,
    };
  }
  if (!notionConfigured) return { title: "文章" };
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "未找到" };
  return {
    title: titleFromPage(post.page),
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  if (!slug) notFound();

  const localPost = await getLocalBlogPostBySlug(slug);

  if (localPost) {
    return (
      <article className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[15rem_1fr]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Link
            href="/blog"
            className="mb-8 inline-block text-sm text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
          >
            ← 返回 Blogs
          </Link>
          <div className="content-card space-y-5 p-5">
            <div>
              <p className="section-label">Longform</p>
              {localPost.eyebrow ? (
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
                  {localPost.eyebrow}
                </p>
              ) : null}
            </div>
            <div className="space-y-3 border-t border-[var(--color-line)] pt-4">
              {localPost.date && (
                <time
                  dateTime={localPost.date}
                  className="block text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]"
                >
                  {localPost.date}
                </time>
              )}
              <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]">
                {readingMinutes(localPost.body)} min read
              </p>
              <div className="flex flex-wrap gap-2">
                {localPost.tags.map((tag) => (
                  <span key={tag} className="tag-chip">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="mb-12 border-b border-[var(--color-line)] pb-10">
            <h1 className="font-serif text-4xl font-semibold leading-tight text-[var(--color-ink)] md:text-6xl">
              {localPost.title}
            </h1>
          </header>
          <MarkdownContent body={localPost.body} />
        </div>
      </article>
    );
  }

  if (!notionConfigured) notFound();

  const post = await getBlogPostBySlug(slug);
  if (!post) notFound();

  const title = titleFromPage(post.page);
  const date = dateFromPage(post.page);

  return (
    <article className="mx-auto max-w-3xl">
      <Link
        href="/blog"
        className="mb-10 inline-block text-sm text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
      >
        ← 返回 Blogs
      </Link>
      <header className="mb-12 space-y-4 border-b border-[var(--color-line)] pb-10">
        {date && (
          <time
            dateTime={date}
            className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]"
          >
            {date}
          </time>
        )}
        <h1 className="font-serif text-4xl font-semibold leading-tight text-[var(--color-ink)] md:text-6xl">
          {title}
        </h1>
      </header>
      <NotionBlocks blocks={post.blocks} />
    </article>
  );
}
