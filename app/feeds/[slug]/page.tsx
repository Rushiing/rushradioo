import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MarkdownContent } from "@/components/markdown-content";
import { getLocalFeedItemBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

function normalizeSlug(slug: string): string {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function withoutLeadingTitle(body: string, title: string): string {
  const pattern = new RegExp(`^#\\s+${escapeRegExp(title)}\\s*\\n+`);
  return body.replace(pattern, "");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  const item = await getLocalFeedItemBySlug(slug);
  if (!item) return { title: "知识条目" };
  return {
    title: item.title,
    description: item.text,
  };
}

export default async function FeedDetailPage({ params }: Props) {
  const { slug: rawSlug } = await params;
  const slug = normalizeSlug(rawSlug);
  if (!slug) notFound();

  const item = await getLocalFeedItemBySlug(slug);
  if (!item) notFound();

  return (
    <article className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[15rem_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <Link
          href="/feeds"
          className="mb-8 inline-block text-sm text-[var(--color-muted)] transition hover:text-[var(--color-accent)]"
        >
          ← 返回 Feeds
        </Link>
        <div className="content-card space-y-5 p-5">
          <div>
            <p className="section-label">Knowledge note</p>
            {item.category ? (
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {item.category}
              </p>
            ) : null}
          </div>
          <div className="space-y-2 border-t border-[var(--color-line)] pt-4">
            {item.date ? (
              <time
                dateTime={item.date}
                className="block text-xs uppercase tracking-[0.16em] text-[var(--color-muted)]"
              >
                {item.date}
              </time>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {item.tags.map((tag) => (
                <span key={tag} className="tag-chip">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          {item.sourceUrl ? (
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block border-t border-[var(--color-line)] pt-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-accent)]"
            >
              Source
            </a>
          ) : null}
        </div>
      </aside>

      <div className="min-w-0">
        <header className="mb-10 border-b border-[var(--color-line)] pb-8">
          <h1 className="font-serif text-4xl font-semibold leading-tight text-[var(--color-ink)] md:text-6xl">
            {item.title}
          </h1>
        </header>
        <MarkdownContent body={withoutLeadingTitle(item.body, item.title)} />
      </div>
    </article>
  );
}
