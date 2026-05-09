# Blog Frontmatter Schema

博客仓库（`blog/`）的 Astro 要求的 frontmatter 结构。`generated/<slug>/blog.md` 必须按这个写，这样 publish-dispatcher 可以直接 copy 到 blog 仓库。

---

## 模板

```yaml
---
author: Frank Fu
pubDatetime: 2026-05-10T10:00:00.000Z
modDatetime: 2026-05-10T10:00:00.000Z
title: "实际标题"
slug: url-slug-kebab-case
featured: false
draft: false
tags:
  - web3
  - solana
description: |
  140 字以内的一句话描述，用于 OG 图和社交卡片。必须能独立成句。
ogImage: ""
canonicalURL: ""
---
```

---

## 字段规则

### 必填

- `author`：固定 "Frank Fu"
- `pubDatetime`：发布日期，ISO 8601 带时区
- `title`：标题，含引号，特殊字符要转义
- `slug`：kebab-case
- `tags`：2-4 个，参考已有标签
- `description`：140 字内

### 常用可选

- `modDatetime`：如果不是首次发布就填
- `featured`：精品文章设 true（慎用，主页只显示最近几个）
- `draft`：true 的话不会上线，可以作为开关
- `series`：如果是系列，填系列名

### 极少用

- `ogImage`：自定义 OG 图，留空用默认
- `canonicalURL`：如果同时发在别处，指向"正本"

---

## tags 的选择

参考 `blog/TAGS.md`。**不要瞎造新 tag**。

常用 tag：
- `web3` / `solana` / `evm`
- `engineering` / `backend` / `architecture`
- `career` / `opinion`
- `meme` / `rpc` / `mev`

超过 4 个 tag = 没有 tag。收敛。

---

## 常见错误

- ❌ `title` 没加引号 → yaml 解析错误
- ❌ `pubDatetime` 用北京时间没转 UTC → 发布时间错乱
- ❌ `description` 复用了标题 → 重复
- ❌ `tags` 用中文 → 不符合 blog 的约定
- ❌ 忘记 `slug` → 文件名和 URL 对不上
