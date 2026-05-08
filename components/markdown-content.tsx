import Link from "next/link";

type Token =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3 | 4; text: string }
  | { type: "blockquote"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "code"; code: string; lang: string }
  | { type: "image"; alt: string; src: string }
  | { type: "table"; rows: string[][]; header: boolean }
  | { type: "divider" };

function parseMarkdown(markdown: string): Token[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const tokens: Token[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i++;
      continue;
    }

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      tokens.push({ type: "code", lang, code: code.join("\n") });
      i++;
      continue;
    }

    const image = /^!\[([^\]]*)\]\(([^)]+)\)$/.exec(line.trim());
    if (image) {
      tokens.push({ type: "image", alt: image[1], src: image[2] });
      i++;
      continue;
    }

    if (/^\s*\|.+\|\s*$/.test(line)) {
      const tableLines: string[] = [];
      while (i < lines.length && /^\s*\|.+\|\s*$/.test(lines[i])) {
        tableLines.push(lines[i]);
        i++;
      }
      const hasDivider =
        tableLines.length > 1 &&
        /^\s*\|?(\s*:?-{3,}:?\s*\|)+\s*$/.test(tableLines[1]);
      const rows = tableLines
        .filter((_, index) => !(hasDivider && index === 1))
        .map((row) =>
          row
            .trim()
            .replace(/^\||\|$/g, "")
            .split("|")
            .map((cell) => cell.trim()),
        );
      tokens.push({ type: "table", rows, header: hasDivider });
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      tokens.push({ type: "divider" });
      i++;
      continue;
    }

    const heading = /^(#{1,4})\s+(.+)$/.exec(line);
    if (heading) {
      const level = Math.min(Math.max(heading[1].length + 1, 2), 4) as
        | 2
        | 3
        | 4;
      tokens.push({ type: "heading", level, text: heading[2].trim() });
      i++;
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote: string[] = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      tokens.push({ type: "blockquote", text: quote.join(" ") });
      continue;
    }

    if (/^\s*(-|\*)\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      const itemPattern = ordered ? /^\s*\d+\.\s+/ : /^\s*(-|\*)\s+/;
      while (i < lines.length && itemPattern.test(lines[i])) {
        items.push(lines[i].replace(itemPattern, "").trim());
        i++;
      }
      tokens.push({ type: "list", ordered, items });
      continue;
    }

    const paragraph: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("```") &&
      !/^(#{1,4})\s+/.test(lines[i]) &&
      !/^>\s?/.test(lines[i]) &&
      !/^\s*(-|\*)\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i])
    ) {
      paragraph.push(lines[i].trim());
      i++;
    }
    tokens.push({ type: "paragraph", text: paragraph.join(" ") });
  }

  return tokens;
}

function InlineText({ text }: { text: string }) {
  const cleaned = text
    .replace(/<p[^>]*>/g, "")
    .replace(/<\/p>/g, "")
    .replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, target, label) => label || target)
    .replace(/\*\*([^*]+)\*\*/g, "$1");
  const parts = cleaned.split(/(\[[^\]]+\]\([^)]+\)|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, index) => {
        const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
        if (link) {
          const [, label, href] = link;
          const external = /^https?:\/\//.test(href);
          if (external) {
            return (
              <a
                key={`${part}-${index}`}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent)] underline decoration-[var(--color-accent-soft)] underline-offset-4 transition hover:text-[var(--color-ink)]"
              >
                {label}
              </a>
            );
          }
          return (
            <Link
              key={`${part}-${index}`}
              href={href}
              className="text-[var(--color-accent)] underline decoration-[var(--color-accent-soft)] underline-offset-4 transition hover:text-[var(--color-ink)]"
            >
              {label}
            </Link>
          );
        }
        if (/^`[^`]+`$/.test(part)) {
          return (
            <code
              key={`${part}-${index}`}
              className="rounded bg-[var(--color-line)] px-1.5 py-0.5 text-[0.9em]"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <span key={`${part}-${index}`}>{part}</span>;
      })}
    </>
  );
}

export function MarkdownContent({ body }: { body: string }) {
  const tokens = parseMarkdown(body);
  return (
    <div className="article-body">
      {tokens.map((token, index) => {
        if (token.type === "heading") {
          const className =
            token.level === 2
              ? "mt-12 mb-4 border-t border-[var(--color-line)] pt-8 font-serif text-2xl font-semibold leading-tight text-[var(--color-ink)]"
              : token.level === 3
                ? "mt-10 mb-3 font-serif text-xl font-semibold leading-tight text-[var(--color-ink)]"
                : "mt-8 mb-2 text-lg font-semibold text-[var(--color-ink)]";
          const Tag = `h${token.level}` as "h2" | "h3" | "h4";
          return (
            <Tag key={index} className={className}>
              <InlineText text={token.text} />
            </Tag>
          );
        }
        if (token.type === "paragraph") {
          return (
            <p
              key={index}
              className="my-5 text-[1.02rem] leading-[1.9] text-[var(--color-ink)]"
            >
              <InlineText text={token.text} />
            </p>
          );
        }
        if (token.type === "blockquote") {
          return (
            <blockquote
              key={index}
              className="my-8 border-l-2 border-[var(--color-accent)] bg-[var(--color-wash)] px-5 py-4 font-serif text-lg leading-relaxed text-[var(--color-muted)]"
            >
              <InlineText text={token.text} />
            </blockquote>
          );
        }
        if (token.type === "list") {
          const Tag = token.ordered ? "ol" : "ul";
          return (
            <Tag
              key={index}
              className={`my-5 space-y-2 pl-6 leading-[1.85] text-[var(--color-ink)] ${
                token.ordered ? "list-decimal" : "list-disc"
              }`}
            >
              {token.items.map((item) => (
                <li key={item}>
                  <InlineText text={item} />
                </li>
              ))}
            </Tag>
          );
        }
        if (token.type === "code") {
          return (
            <pre
              key={index}
              className="my-8 overflow-x-auto rounded-lg bg-[#20211f] p-5 text-sm leading-relaxed text-[#f3efe4]"
            >
              <code>{token.code}</code>
            </pre>
          );
        }
        if (token.type === "table") {
          const [head, ...body] = token.rows;
          const bodyRows = token.header ? body : token.rows;
          return (
            <div key={index} className="my-8 w-full overflow-x-auto">
              <table className="w-full min-w-[34rem] border-collapse border border-[var(--color-line)] bg-[var(--color-card)] text-sm">
                {token.header ? (
                  <thead>
                    <tr>
                      {head.map((cell) => (
                        <th
                          key={cell}
                          className="border border-[var(--color-line)] bg-[var(--color-wash)] px-3 py-2 text-left font-medium text-[var(--color-ink)]"
                        >
                          <InlineText text={cell} />
                        </th>
                      ))}
                    </tr>
                  </thead>
                ) : null}
                <tbody>
                  {bodyRows.map((row, rowIndex) => (
                    <tr key={`${row.join("-")}-${rowIndex}`}>
                      {row.map((cell, cellIndex) => (
                        <td
                          key={`${cell}-${cellIndex}`}
                          className="border border-[var(--color-line)] px-3 py-2 align-top text-[var(--color-muted)]"
                        >
                          <InlineText text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (token.type === "divider") {
          return <hr key={index} className="my-10 border-[var(--color-line)]" />;
        }
        return (
          <figure key={index} className="my-8">
            <div className="overflow-hidden rounded-lg border border-[var(--color-line)] bg-[var(--color-line)]">
              {/* eslint-disable-next-line @next/next/no-img-element -- Markdown content images can be local or external. */}
              <img
                src={token.src}
                alt={token.alt}
                className="max-h-[min(82vh,780px)] w-full object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
            {token.alt ? (
              <figcaption className="mt-2 text-center text-sm text-[var(--color-muted)]">
                {token.alt}
              </figcaption>
            ) : null}
          </figure>
        );
      })}
    </div>
  );
}
