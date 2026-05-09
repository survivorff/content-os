---
# ============ 基本信息 ============
title: 文章标题（也是 OG 图上的大字）
slug: url-slug-kebab-case
date: 2026-05-10
tags:
  - tag1
  - tag2
summary: 一句话的摘要，140 字以内，用于 OG 卡片和各平台的头部

# ============ 发布配置 ============
# 哪些平台要发（不需要的就不列）
platforms:
  - blog
  - x
  - xiaohongshu
  # - douyin

# 每个平台的发布时间（ISO 8601，带时区）
# 一般博客先发，社交媒体分时段二次扩散
schedule:
  blog: 2026-05-10T10:00:00+08:00
  x: 2026-05-10T20:00:00+08:00
  xiaohongshu: 2026-05-11T12:00:00+08:00
  # douyin: 2026-05-12T20:00:00+08:00

# ============ 生成配置 ============
# 各平台版本的"语气"或特别要求（传给 LLM）
# 留空就用 steering/ 下的默认风格
voice_overrides:
  x: 更激进一点，多用数据和对比
  # xiaohongshu: 更柔和，面向新人

# 是否需要人工 review 才能发布（强烈建议 true）
require_review: true
---

# （正文 Markdown 从这里开始）

## 为什么写这篇

（一段开场白，说明这篇文章的动机和你要讲什么）

## 主体内容

（正常的 Markdown 写作）

...
