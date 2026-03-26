import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NotionBlocks } from "@/components/notion-blocks";
import {
  dateFromPage,
  getBlogPostBySlug,
  notionConfigured,
  titleFromPage,
} from "@/lib/notion";

export const revalidate = 120;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!notionConfigured) return { title: "文章" };
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: "未找到" };
  return {
    title: titleFromPage(post.page),
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;

  if (!notionConfigured) {
    return (
      <p className="mx-auto max-w-3xl text-[var(--color-muted)]">
        未配置 Notion API，无法展示文章。请先配置环境变量。
      </p>
    );
  }

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
        ← 返回 Blog
      </Link>
      <header className="mb-12 space-y-3 border-b border-[var(--color-line)] pb-10">
        <h1 className="font-serif text-3xl font-semibold leading-tight text-[var(--color-ink)] md:text-[2.25rem]">
          {title}
        </h1>
        {date && (
          <time
            dateTime={date}
            className="text-sm text-[var(--color-muted)]"
          >
            {date}
          </time>
        )}
      </header>
      <NotionBlocks blocks={post.blocks} />
    </article>
  );
}
