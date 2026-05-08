import { promises as fs } from "fs";
import path from "path";

const root = process.cwd();
const contentRoot = path.join(root, "content");
const blogDir = path.join(contentRoot, "blogs");
const feedDir = path.join(contentRoot, "feeds");

type Frontmatter = Record<string, string | string[] | boolean | undefined>;

export type LocalBlogPostSummary = {
  id: string;
  title: string;
  slug: string;
  date: string | null;
  excerpt: string;
  tags: string[];
  cover: string | null;
  eyebrow: string | null;
  source: "local";
};

export type LocalBlogPost = LocalBlogPostSummary & {
  body: string;
};

export type LocalFeedItem = {
  id: string;
  title: string;
  slug: string;
  text: string;
  imageUrl: string | null;
  date: string | null;
  tags: string[];
  sourceUrl: string | null;
  category: string | null;
  source: "local";
};

export type LocalFeedEntry = LocalFeedItem & {
  body: string;
};

async function listMarkdownFiles(dir: string): Promise<string[]> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const files = await Promise.all(
      entries.map(async (entry) => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return listMarkdownFiles(full);
        if (/\.(md|mdx)$/i.test(entry.name)) return [full];
        return [];
      }),
    );
    return files.flat();
  } catch {
    return [];
  }
}

function parseValue(raw: string): string | string[] | boolean {
  const value = raw.trim();
  if (value === "true") return true;
  if (value === "false") return false;
  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => item.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  return value.replace(/^["']|["']$/g, "");
}

function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
  if (!raw.startsWith("---")) return { data: {}, body: raw.trim() };
  const end = raw.indexOf("\n---", 3);
  if (end === -1) return { data: {}, body: raw.trim() };

  const lines = raw.slice(3, end).split(/\r?\n/);
  const data: Frontmatter = {};
  let arrayKey: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    if (arrayKey && trimmed.startsWith("- ")) {
      const current = data[arrayKey];
      const next = parseValue(trimmed.slice(2));
      data[arrayKey] = [
        ...(Array.isArray(current) ? current : []),
        ...(Array.isArray(next) ? next : [String(next)]),
      ];
      continue;
    }
    arrayKey = null;
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!match) continue;
    const [, key, value] = match;
    if (!value.trim()) {
      data[key] = [];
      arrayKey = key;
      continue;
    }
    data[key] = parseValue(value);
  }

  return { data, body: raw.slice(end + 4).trim() };
}

function stringField(data: Frontmatter, keys: string[]): string {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

function tagsField(data: Frontmatter): string[] {
  const value = data.tags ?? data.Tags;
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

function isPublished(data: Frontmatter): boolean {
  const status = stringField(data, ["status", "Status"]).toLowerCase();
  return !status || status === "published" || status === "public";
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function plainText(markdown: string): string {
  const withoutTables = markdown
    .split(/\r?\n/)
    .filter((line) => !/^\s*\|.+\|\s*$/.test(line))
    .join("\n");
  return withoutTables
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\[\[([^\]|]+)\|?([^\]]*)\]\]/g, (_, target, label) => label || target)
    .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[#>*_`~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function excerptFrom(body: string, data: Frontmatter): string {
  const manual = stringField(data, ["summary", "excerpt", "description"]);
  const text = manual || plainText(body);
  if (text.length <= 160) return text;
  return text.slice(0, 160).trimEnd() + "…";
}

function blogEyebrow(data: Frontmatter): string | null {
  const parts = [
    stringField(data, ["period", "dynasty"]),
    stringField(data, ["location", "province"]),
    stringField(data, ["category", "type"]),
  ].filter(Boolean);
  return parts.length ? parts.slice(0, 2).join(" / ") : null;
}

function feedTextFrom(body: string): string {
  const text = plainText(body);
  if (text.length <= 320) return text;
  return text.slice(0, 320).trimEnd() + "…";
}

async function readMarkdownFile(file: string) {
  const raw = await fs.readFile(file, "utf8");
  return parseFrontmatter(raw);
}

export async function getLocalBlogPosts(): Promise<LocalBlogPostSummary[]> {
  const files = await listMarkdownFiles(blogDir);
  const posts = await Promise.all(
    files.map(async (file) => {
      const { data, body } = await readMarkdownFile(file);
      if (!isPublished(data)) return null;
      const fallbackTitle = path.basename(file).replace(/\.(md|mdx)$/i, "");
      const title = stringField(data, ["title", "Title"]) || fallbackTitle;
      const slug =
        stringField(data, ["slug", "Slug"]) ||
        slugify(path.basename(file).replace(/\.(md|mdx)$/i, ""));
      return {
        id: path.relative(blogDir, file),
        title,
        slug,
        date:
          stringField(data, ["date", "Date", "published", "created"]) || null,
        excerpt: excerptFrom(body, data),
        tags: tagsField(data),
        cover: stringField(data, ["cover", "image", "Cover", "Image"]) || null,
        eyebrow: blogEyebrow(data),
        source: "local" as const,
      };
    }),
  );

  return posts
    .filter((post): post is LocalBlogPostSummary => Boolean(post))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export async function getLocalBlogPostBySlug(
  slug: string,
): Promise<LocalBlogPost | null> {
  const files = await listMarkdownFiles(blogDir);
  for (const file of files) {
    const { data, body } = await readMarkdownFile(file);
    if (!isPublished(data)) continue;
    const fallbackTitle = path.basename(file).replace(/\.(md|mdx)$/i, "");
    const title = stringField(data, ["title", "Title"]) || fallbackTitle;
    const postSlug =
      stringField(data, ["slug", "Slug"]) ||
      slugify(path.basename(file).replace(/\.(md|mdx)$/i, ""));
    if (postSlug !== slug) continue;
    return {
      id: path.relative(blogDir, file),
      title,
      slug: postSlug,
      date: stringField(data, ["date", "Date", "published", "created"]) || null,
      excerpt: excerptFrom(body, data),
      tags: tagsField(data),
      cover: stringField(data, ["cover", "image", "Cover", "Image"]) || null,
      eyebrow: blogEyebrow(data),
      source: "local",
      body,
    };
  }
  return null;
}

export async function getLocalFeedItems(): Promise<LocalFeedItem[]> {
  const files = await listMarkdownFiles(feedDir);
  const items = await Promise.all(
    files.map(async (file) => {
      const { data, body } = await readMarkdownFile(file);
      if (!isPublished(data)) return null;
      const fallbackTitle = path.basename(file).replace(/\.(md|mdx)$/i, "");
      const title = stringField(data, ["title", "Title"]) || fallbackTitle;
      const slug =
        stringField(data, ["slug", "Slug"]) ||
        slugify(path.basename(file).replace(/\.(md|mdx)$/i, ""));
      return {
        id: path.relative(feedDir, file),
        title,
        slug,
        text: feedTextFrom(body),
        imageUrl:
          stringField(data, ["image", "cover", "Image", "Cover"]) || null,
        date:
          stringField(data, ["date", "Date", "published", "created"]) || null,
        tags: tagsField(data),
        sourceUrl: stringField(data, ["sourceUrl", "url", "link"]) || null,
        category: stringField(data, ["category", "type"]) || null,
        source: "local" as const,
      };
    }),
  );

  return items
    .filter((item): item is LocalFeedItem => Boolean(item))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));
}

export async function getLocalFeedItemBySlug(
  slug: string,
): Promise<LocalFeedEntry | null> {
  const files = await listMarkdownFiles(feedDir);
  for (const file of files) {
    const { data, body } = await readMarkdownFile(file);
    if (!isPublished(data)) continue;
    const fallbackTitle = path.basename(file).replace(/\.(md|mdx)$/i, "");
    const title = stringField(data, ["title", "Title"]) || fallbackTitle;
    const entrySlug =
      stringField(data, ["slug", "Slug"]) ||
      slugify(path.basename(file).replace(/\.(md|mdx)$/i, ""));
    if (entrySlug !== slug) continue;
    return {
      id: path.relative(feedDir, file),
      title,
      slug: entrySlug,
      text: feedTextFrom(body),
      imageUrl: stringField(data, ["image", "cover", "Image", "Cover"]) || null,
      date: stringField(data, ["date", "Date", "published", "created"]) || null,
      tags: tagsField(data),
      sourceUrl: stringField(data, ["sourceUrl", "url", "link"]) || null,
      category: stringField(data, ["category", "type"]) || null,
      source: "local",
      body,
    };
  }
  return null;
}
