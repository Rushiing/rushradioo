# Rush Radioo Project Notes

This repository publishes Rush Radioo, a personal knowledge site with two content types:

- `content/blogs`: longform essays and structured knowledge cards.
- `content/feeds`: short knowledge notes.

When the user asks Codex to "整理成博客文档", "整理成长文", or "发布到 blog", create or update a file under `content/blogs`.
When the user asks Codex to "整理成知识条目", "整理成 feed", or "发布到 feeds", create or update a file under `content/feeds`.

## Blog Frontmatter

Every blog file must use this frontmatter shape:

```yaml
---
title: "文章标题"
slug: "article-slug"
date: "YYYY-MM-DD"
status: "published"
type: "building | history | essay | note"
category: "分类"
period: "朝代或时期"
location: "地点"
summary: "用于列表卡片的一句话摘要。"
tags: ["标签一", "标签二"]
aliases: []
updated: "YYYY-MM-DD"
---
```

Required fields: `title`, `slug`, `date`, `status`, `type`, `category`, `summary`, `tags`.
Use `status: "draft"` for private drafts. Use `status: "published"` for public content.

## Feed Frontmatter

Every feed file must use this frontmatter shape:

```yaml
---
title: "条目标题"
slug: "note-slug"
date: "YYYY-MM-DD"
status: "published"
type: "concept"
category: "分类"
summary: "用于卡片的一句话摘要。"
tags: ["标签一", "标签二"]
sourceUrl: ""
updated: "YYYY-MM-DD"
---
```

Required fields: `title`, `slug`, `date`, `status`, `type`, `category`, `summary`, `tags`.

## Body Rules

- Do not duplicate `# title` in the body unless the source requires it; page templates render the title.
- Prefer `##` for major sections and `###` for subsections.
- Keep source material intact when copying from Obsidian, but normalize frontmatter.
- Do not edit files in the user's external Obsidian vault. Copy content into this repository first.
- Public pages must not mention implementation details such as Notion, Obsidian, Markdown, MDX, fallback, Vercel, or file paths unless the page is documentation.
