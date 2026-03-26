import Image from "next/image";
import type { BlockWithChildren } from "@/lib/notion";
import { RichText } from "@/components/rich-text";

function ListGroup({
  blocks,
  ordered,
}: {
  blocks: BlockWithChildren[];
  ordered: boolean;
}) {
  const Tag = ordered ? "ol" : "ul";
  const listClass = ordered ? "list-decimal" : "list-disc";
  return (
    <Tag
      className={`my-4 pl-6 ${listClass} space-y-2 text-[var(--color-ink)]`}
    >
      {blocks.map((b) => {
        const rich =
          ordered && b.type === "numbered_list_item"
            ? b.numbered_list_item?.rich_text
            : !ordered && b.type === "bulleted_list_item"
              ? b.bulleted_list_item?.rich_text
              : undefined;
        return (
          <li key={b.id} className="leading-relaxed">
            {rich && <RichText items={rich} />}
            {b.children?.length ? (
              <div className="mt-2">
                <NotionBlocks blocks={b.children} />
              </div>
            ) : null}
          </li>
        );
      })}
    </Tag>
  );
}

function BlockInner({ block }: { block: BlockWithChildren }) {
  switch (block.type) {
    case "paragraph":
      return (
        <p className="my-4 leading-[1.75] text-[var(--color-ink)]">
          {block.paragraph?.rich_text?.length ? (
            <RichText items={block.paragraph.rich_text} />
          ) : (
            <br />
          )}
        </p>
      );
    case "heading_1":
      return (
        <h2 className="font-serif mt-12 mb-4 text-2xl font-medium tracking-tight text-[var(--color-ink)]">
          {block.heading_1?.rich_text && (
            <RichText items={block.heading_1.rich_text} />
          )}
        </h2>
      );
    case "heading_2":
      return (
        <h3 className="font-serif mt-10 mb-3 text-xl font-medium tracking-tight text-[var(--color-ink)]">
          {block.heading_2?.rich_text && (
            <RichText items={block.heading_2.rich_text} />
          )}
        </h3>
      );
    case "heading_3":
      return (
        <h4 className="mt-8 mb-2 text-lg font-medium text-[var(--color-ink)]">
          {block.heading_3?.rich_text && (
            <RichText items={block.heading_3.rich_text} />
          )}
        </h4>
      );
    case "quote":
      return (
        <blockquote className="border-l-2 border-[var(--color-accent)] pl-4 my-6 italic text-[var(--color-muted)]">
          {block.quote?.rich_text && (
            <RichText items={block.quote.rich_text} />
          )}
        </blockquote>
      );
    case "divider":
      return <hr className="my-10 border-[var(--color-line)]" />;
    case "code":
      return (
        <pre className="my-6 overflow-x-auto rounded-lg bg-[#1e1e1e] p-4 text-sm text-zinc-100">
          <code>
            {block.code?.rich_text?.map((t) => t.plain_text).join("") ?? ""}
          </code>
        </pre>
      );
    case "image": {
      const src =
        block.image?.type === "external"
          ? block.image.external?.url
          : block.image?.type === "file"
            ? block.image.file?.url
            : null;
      const caption = block.image?.caption;
      if (!src) return null;
      return (
        <figure className="my-8">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-[var(--color-line)]">
            <Image
              src={src}
              alt={caption?.map((c) => c.plain_text).join("") || ""}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 42rem"
              unoptimized
            />
          </div>
          {caption?.length ? (
            <figcaption className="mt-2 text-center text-sm text-[var(--color-muted)]">
              <RichText items={caption} />
            </figcaption>
          ) : null}
        </figure>
      );
    }
    case "callout":
      return (
        <div className="my-6 flex gap-3 rounded-lg border border-[var(--color-line)] bg-white/60 p-4">
          {block.callout?.icon?.type === "emoji" && (
            <span className="text-xl" aria-hidden>
              {block.callout.icon.emoji}
            </span>
          )}
          <div className="min-w-0 flex-1 leading-relaxed">
            {block.callout?.rich_text && (
              <RichText items={block.callout.rich_text} />
            )}
            {block.children?.length ? (
              <div className="mt-2">
                <NotionBlocks blocks={block.children} />
              </div>
            ) : null}
          </div>
        </div>
      );
    case "to_do":
      return (
        <div className="my-2 flex items-start gap-2">
          <input
            type="checkbox"
            checked={block.to_do?.checked ?? false}
            readOnly
            className="mt-1"
            aria-label="todo"
          />
          <span
            className={
              block.to_do?.checked
                ? "text-[var(--color-muted)] line-through"
                : ""
            }
          >
            {block.to_do?.rich_text && (
              <RichText items={block.to_do.rich_text} />
            )}
          </span>
        </div>
      );
    default:
      return null;
  }
}

export function NotionBlocks({ blocks }: { blocks: BlockWithChildren[] }) {
  const out: React.ReactNode[] = [];
  let i = 0;
  while (i < blocks.length) {
    const b = blocks[i];
    if (b.type === "bulleted_list_item") {
      const group: BlockWithChildren[] = [];
      while (i < blocks.length && blocks[i].type === "bulleted_list_item") {
        group.push(blocks[i]);
        i++;
      }
      out.push(<ListGroup key={group[0].id} blocks={group} ordered={false} />);
      continue;
    }
    if (b.type === "numbered_list_item") {
      const group: BlockWithChildren[] = [];
      while (i < blocks.length && blocks[i].type === "numbered_list_item") {
        group.push(blocks[i]);
        i++;
      }
      out.push(<ListGroup key={group[0].id} blocks={group} ordered />);
      continue;
    }
    out.push(<BlockInner key={b.id} block={b} />);
    i++;
  }
  return <div className="max-w-none">{out}</div>;
}
