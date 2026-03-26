import { Client } from "@notionhq/client";
import type {
  BlockObjectResponse,
  PageObjectResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";

export const notionConfigured = Boolean(
  process.env.NOTION_API_KEY && process.env.NOTION_BLOG_DATABASE_ID,
);

export const feedsConfigured = Boolean(
  process.env.NOTION_API_KEY && process.env.NOTION_FEEDS_DATABASE_ID,
);

function getClient(): Client {
  const key = process.env.NOTION_API_KEY;
  if (!key) throw new Error("NOTION_API_KEY is not set");
  return new Client({ auth: key });
}

export function titleFromPage(page: PageObjectResponse): string {
  const props = page.properties as Record<string, unknown>;
  const titleProp =
    (props.Name as { type?: string; title?: { plain_text: string }[] }) ??
    (props.Title as { type?: string; title?: { plain_text: string }[] });
  if (titleProp && titleProp.type === "title" && titleProp.title?.length) {
    return titleProp.title.map((t) => t.plain_text).join("");
  }
  return "Untitled";
}

function slugFromPage(page: PageObjectResponse): string {
  const props = page.properties as Record<string, unknown>;
  const slugProp = props.Slug as
    | { type?: string; rich_text?: { plain_text: string }[] }
    | undefined;
  if (slugProp?.type === "rich_text" && slugProp.rich_text?.length) {
    const s = slugProp.rich_text.map((t) => t.plain_text).join("").trim();
    if (s) return s.toLowerCase().replace(/\s+/g, "-");
  }
  return page.id.replace(/-/g, "");
}

export function dateFromPage(page: PageObjectResponse): string | null {
  const props = page.properties as Record<string, unknown>;
  for (const key of ["Date", "Published", "发布"]) {
    const d = props[key] as { type?: string; date?: { start?: string } } | undefined;
    if (d?.type === "date" && d.date?.start) return d.date.start;
  }
  return null;
}

function blogStatusFilter():
  | { property: string; select: { equals: string } }
  | undefined {
  const prop = process.env.NOTION_BLOG_STATUS_PROPERTY;
  const val = process.env.NOTION_BLOG_STATUS_VALUE;
  if (!prop || !val) return undefined;
  return { property: prop, select: { equals: val } };
}

function richText(
  prop:
    | { type: "rich_text"; rich_text: { plain_text: string }[] }
    | undefined,
): string {
  if (!prop || prop.type !== "rich_text") return "";
  return prop.rich_text.map((t) => t.plain_text).join("");
}

/** 列表摘要最大字符数（超出加省略号） */
export const BLOG_LIST_EXCERPT_MAX = 160;

export type BlogPostSummary = {
  id: string;
  title: string;
  slug: string;
  date: string | null;
  /** 列表预览文案，已截断 */
  excerpt: string;
};

function excerptFromProperties(page: PageObjectResponse): string | null {
  const props = page.properties as Record<string, unknown>;
  for (const key of ["Excerpt", "Summary", "Description", "摘要"]) {
    const p = props[key];
    if (
      p &&
      typeof p === "object" &&
      "type" in p &&
      (p as { type: string }).type === "rich_text"
    ) {
      const t = richText(
        p as { type: "rich_text"; rich_text: { plain_text: string }[] },
      );
      if (t.trim()) return t.trim();
    }
  }
  return null;
}

function truncateWithEllipsis(s: string, max: number): string {
  const one = s.replace(/\s+/g, " ").trim();
  if (one.length <= max) return one;
  return one.slice(0, max).trimEnd() + "…";
}

function blockToPlainText(b: BlockObjectResponse): string {
  const rt = (items?: { plain_text: string }[]) =>
    items?.map((x) => x.plain_text).join("") ?? "";
  switch (b.type) {
    case "paragraph":
      return rt(b.paragraph?.rich_text);
    case "heading_1":
      return rt(b.heading_1?.rich_text);
    case "heading_2":
      return rt(b.heading_2?.rich_text);
    case "heading_3":
      return rt(b.heading_3?.rich_text);
    case "bulleted_list_item":
      return rt(b.bulleted_list_item?.rich_text);
    case "numbered_list_item":
      return rt(b.numbered_list_item?.rich_text);
    case "to_do":
      return rt(b.to_do?.rich_text);
    case "quote":
      return rt(b.quote?.rich_text);
    case "callout":
      return rt(b.callout?.rich_text);
    case "code":
      return rt(b.code?.rich_text);
    case "table": {
      /* 仅顶层块：表格正文在子 table_row，浅层遍历时单独处理 */
      return "";
    }
    case "table_row": {
      const cells = b.table_row?.cells;
      if (!cells?.length) return "";
      return cells
        .map((cell) => cell.map((t) => t.plain_text).join(""))
        .join(" ");
    }
    default:
      return "";
  }
}

function logNotionError(context: string, err: unknown): void {
  console.error(`[notion] ${context}`, err);
}

async function fetchShallowPlainTextForPreview(pageId: string): Promise<string> {
  try {
    const notion = getClient();
    const r = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 40,
    });
    const parts: string[] = [];
    for (const raw of r.results) {
      if (!("type" in raw)) continue;
      const t = blockToPlainText(raw as BlockObjectResponse);
      if (t) parts.push(t);
    }
    return parts.join(" ").replace(/\s+/g, " ").trim();
  } catch (err) {
    logNotionError("fetchShallowPlainTextForPreview", err);
    return "";
  }
}

async function buildExcerptForPage(
  page: PageObjectResponse,
  maxChars: number,
): Promise<string> {
  const manual = excerptFromProperties(page);
  if (manual) return truncateWithEllipsis(manual, maxChars);
  const fromBlocks = await fetchShallowPlainTextForPreview(page.id);
  if (!fromBlocks) return "";
  return truncateWithEllipsis(fromBlocks, maxChars);
}

export async function getBlogPosts(): Promise<BlogPostSummary[]> {
  if (!process.env.NOTION_BLOG_DATABASE_ID) return [];
  try {
    const notion = getClient();
    const filter = blogStatusFilter();
    const res: QueryDatabaseResponse = await notion.databases.query({
      database_id: process.env.NOTION_BLOG_DATABASE_ID,
      ...(filter ? { filter } : {}),
      sorts: [{ timestamp: "created_time", direction: "descending" }],
    });
    const pages = res.results.filter(
      (p): p is PageObjectResponse => "properties" in p,
    );
    const max = BLOG_LIST_EXCERPT_MAX;
    return await Promise.all(
      pages.map(async (page) => ({
        id: page.id,
        title: titleFromPage(page),
        slug: slugFromPage(page),
        date: dateFromPage(page),
        excerpt: await buildExcerptForPage(page, max),
      })),
    );
  } catch (err) {
    logNotionError("getBlogPosts", err);
    return [];
  }
}

export type BlockWithChildren = BlockObjectResponse & {
  children?: BlockWithChildren[];
};

async function listBlocksWithChildren(
  notion: Client,
  blockId: string,
): Promise<BlockWithChildren[]> {
  const out: BlockWithChildren[] = [];
  let cursor: string | undefined;
  do {
    const r = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100,
    });
    for (const raw of r.results) {
      if (!("type" in raw)) continue;
      const b = raw as BlockWithChildren;
      if (b.has_children) {
        b.children = await listBlocksWithChildren(notion, b.id);
      }
      out.push(b);
    }
    cursor = r.has_more ? r.next_cursor ?? undefined : undefined;
  } while (cursor);
  return out;
}

export async function getBlocksForPage(
  pageId: string,
): Promise<BlockWithChildren[]> {
  try {
    const notion = getClient();
    return await listBlocksWithChildren(notion, pageId);
  } catch (err) {
    logNotionError("getBlocksForPage", err);
    return [];
  }
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<{ page: PageObjectResponse; blocks: BlockWithChildren[] } | null> {
  if (!process.env.NOTION_BLOG_DATABASE_ID) return null;
  try {
    const notion = getClient();
    const filter = blogStatusFilter();
    const res = await notion.databases.query({
      database_id: process.env.NOTION_BLOG_DATABASE_ID,
      ...(filter ? { filter } : {}),
    });
    const pages = res.results.filter(
      (p): p is PageObjectResponse => "properties" in p,
    );
    const page = pages.find((p) => slugFromPage(p) === slug);
    if (!page) return null;
    const blocks = await getBlocksForPage(page.id);
    return { page, blocks };
  } catch (err) {
    logNotionError("getBlogPostBySlug", err);
    return null;
  }
}

export type FeedItem = {
  id: string;
  title: string;
  text: string;
  imageUrl: string | null;
  date: string | null;
};

function filesUrl(
  prop:
    | {
        type: "files";
        files: { file?: { url: string }; external?: { url: string } }[];
      }
    | undefined,
): string | null {
  if (!prop || prop.type !== "files" || !prop.files.length) return null;
  const f = prop.files[0];
  return f.file?.url ?? f.external?.url ?? null;
}

export async function getFeedItems(): Promise<FeedItem[]> {
  if (!process.env.NOTION_FEEDS_DATABASE_ID) return [];
  try {
    const notion = getClient();
    const res = await notion.databases.query({
      database_id: process.env.NOTION_FEEDS_DATABASE_ID,
      sorts: [{ timestamp: "created_time", direction: "descending" }],
    });
    const pages = res.results.filter(
      (p): p is PageObjectResponse => "properties" in p,
    );
    return pages.map((page) => {
      const props = page.properties as Record<string, unknown>;
      const title = titleFromPage(page);
      const content = props.Content as Parameters<typeof richText>[0];
      const textProp = props.Text as Parameters<typeof richText>[0];
      const text = richText(content) || richText(textProp);
      const image =
        filesUrl(props.Image as Parameters<typeof filesUrl>[0]) ||
        filesUrl(props.Cover as Parameters<typeof filesUrl>[0]);
      const dateField = props.Date as
        | { type?: string; date?: { start?: string } }
        | undefined;
      const date =
        dateField?.type === "date" ? (dateField.date?.start ?? null) : null;
      return { id: page.id, title, text, imageUrl: image, date };
    });
  } catch (err) {
    logNotionError("getFeedItems", err);
    return [];
  }
}
