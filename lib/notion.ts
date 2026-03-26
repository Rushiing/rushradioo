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

export type BlogPostSummary = {
  id: string;
  title: string;
  slug: string;
  date: string | null;
};

export async function getBlogPosts(): Promise<BlogPostSummary[]> {
  if (!process.env.NOTION_BLOG_DATABASE_ID) return [];
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
  return pages.map((page) => ({
    id: page.id,
    title: titleFromPage(page),
    slug: slugFromPage(page),
    date: dateFromPage(page),
  }));
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
  const notion = getClient();
  return listBlocksWithChildren(notion, pageId);
}

export async function getBlogPostBySlug(
  slug: string,
): Promise<{ page: PageObjectResponse; blocks: BlockWithChildren[] } | null> {
  if (!process.env.NOTION_BLOG_DATABASE_ID) return null;
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
}

export type FeedItem = {
  id: string;
  title: string;
  text: string;
  imageUrl: string | null;
  date: string | null;
};

function richText(
  prop:
    | { type: "rich_text"; rich_text: { plain_text: string }[] }
    | undefined,
): string {
  if (!prop || prop.type !== "rich_text") return "";
  return prop.rich_text.map((t) => t.plain_text).join("");
}

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
}
