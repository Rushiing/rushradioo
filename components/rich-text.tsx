import type { RichTextItemResponse } from "@notionhq/client/build/src/api-endpoints";
import Link from "next/link";

function Segment({ t }: { t: RichTextItemResponse }) {
  let inner: React.ReactNode = t.plain_text;

  if (t.href) {
    const isExt = /^https?:\/\//.test(t.href);
    inner = isExt ? (
      <a
        href={t.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--color-accent)] underline underline-offset-2"
      >
        {t.plain_text}
      </a>
    ) : (
      <Link
        href={t.href}
        className="text-[var(--color-accent)] underline underline-offset-2"
      >
        {t.plain_text}
      </Link>
    );
  } else if (t.annotations.code) {
    inner = (
      <code className="rounded bg-[var(--color-line)] px-1 py-0.5 text-[0.9em]">
        {t.plain_text}
      </code>
    );
  }

  if (t.annotations.bold && !t.href && !t.annotations.code) {
    inner = <strong>{inner}</strong>;
  }
  if (t.annotations.italic && !t.annotations.code) {
    inner = <em>{inner}</em>;
  }
  if (t.annotations.strikethrough && !t.annotations.code) {
    inner = <s>{inner}</s>;
  }
  if (t.annotations.underline && !t.annotations.code) {
    inner = <span className="underline">{inner}</span>;
  }

  return <>{inner}</>;
}

export function RichText({ items }: { items: RichTextItemResponse[] }) {
  if (!items?.length) return null;
  return (
    <>
      {items.map((t, i) => (
        <Segment key={`${i}-${t.plain_text}`} t={t} />
      ))}
    </>
  );
}
