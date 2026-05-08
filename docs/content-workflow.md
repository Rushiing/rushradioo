# Content Workflow

Rush Radioo uses the repository `content` folder as the public publishing space.
The private Obsidian vault remains the working knowledge base. Published pieces are copied, normalized, and committed here.

## Content Types

`content/blogs` is for longform essays, research notes, building cards, history cards, and other structured articles.

`content/feeds` is for short knowledge notes, concepts, definitions, links, and reusable observations.

## Blog Schema

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

## Feed Schema

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

## Publishing Standard

1. Copy the source note into `content/blogs` or `content/feeds`.
2. Normalize the frontmatter to the relevant schema.
3. Keep `summary` concise and suitable for cards.
4. Use `date` as the public publication date.
5. Use `updated` for later editorial changes.
6. Keep original private notes outside this repository unless intentionally published.
