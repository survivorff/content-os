# Content OS

**你的多平台内容发布操作系统。**

一个人一篇长文，自动拆成博客 + X Thread + 小红书图文 + 抖音脚本，按时间自动发布到对应平台。

---

## 为什么存在

做技术 IP 最大的阻力不是"没东西写"，而是**"写完了还要发 N 个平台"**。

一篇文章的完整传播流程：
- 写一篇深度长文（博客）
- 拆成 8-12 条的 X Thread
- 改写成 3-5 张的小红书图文
- 录一段 2-3 分钟的抖音脚本
- 各个平台挑合适的时间发布
- 跟踪互动数据

如果都靠手动，**一篇文章要折腾 3-5 小时**。持续不下去。

这个项目解决这个问题：**一次写作，自动多平台**。

---

## 核心理念

```
源头只有一个（Source of Truth）
    │
    ▼
┌────────────────────────────────────────┐
│     一篇 Markdown 文件（唯一来源）      │
│     /contents/2026-05-10-xxx.md        │
└────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────┐
│          自动生成多平台版本              │
├────────────────────────────────────────┤
│  博客版（长文）                          │
│  X Thread（8-12 推）                     │
│  小红书（图文，3-5 张）                   │
│  抖音（口播脚本）                        │
│  即刻（中等篇幅）                        │
└────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────┐
│         各平台自动发布（计划）            │
├────────────────────────────────────────┤
│  blog.frankfu.cloud（即时）             │
│  @FrankFu2262 X（按排期）                │
│  小红书（手动，SDK 难用）                │
│  抖音（手动，同上）                      │
└────────────────────────────────────────┘
```

你只做三件事：
1. 写 **一个** Markdown 源文件
2. 设定发布时间
3. 确认自动生成的多平台版本

其他全自动。

---

## 项目结构

```
content-os/
├── contents/                    # 内容源文件（你唯一要写的地方）
│   └── YYYY-MM-DD-slug.md       # 每篇一个文件
│
├── generated/                   # 自动生成的多平台版本
│   └── YYYY-MM-DD-slug/
│       ├── blog.md              # 博客版
│       ├── x-thread.md          # X Thread 版
│       ├── xiaohongshu.md       # 小红书图文版
│       ├── douyin-script.md     # 抖音脚本版
│       └── meta.json            # 元信息（发布状态等）
│
├── lib/                         # 生成器脚本
│   ├── generate.py              # 主入口
│   ├── generators/
│   │   ├── blog.py              # 博客版生成
│   │   ├── x_thread.py          # X Thread 生成
│   │   ├── xiaohongshu.py       # 小红书生成
│   │   └── douyin.py            # 抖音生成
│   └── utils/
│       ├── llm.py               # LLM 调用封装
│       ├── publisher.py         # 发布到各平台
│       └── tracker.py           # 状态追踪
│
├── steering/                    # 各平台的风格指南（prompt）
│   ├── blog-style.md            # 博客的风格
│   ├── x-thread-style.md        # X Thread 的风格
│   ├── xiaohongshu-style.md     # 小红书的风格
│   └── douyin-style.md          # 抖音的风格
│
├── templates/                   # 源文件模板
│   └── content-template.md      # 写新内容时的模板
│
├── .github/workflows/           # GitHub Actions 自动化
│   ├── generate.yml             # push 时自动生成多平台版本
│   └── publish-x.yml            # 按时发 X（复用 x-auto-poster 逻辑）
│
├── docs/                        # 文档
│   ├── how-to-write.md          # 怎么写源文件
│   ├── how-to-publish.md        # 怎么触发发布
│   └── roadmap.md               # 后续规划
│
└── README.md                    # 本文件
```

---

## 工作流示例

### 1. 写源文件

```bash
# 复制模板
cp templates/content-template.md contents/2026-05-10-my-new-post.md

# 编辑
vim contents/2026-05-10-my-new-post.md
```

源文件格式：

```markdown
---
title: 我的新文章
slug: my-new-post
date: 2026-05-10
tags: [web3, solana]
summary: 一句话摘要，用于 OG 图和 Twitter 卡片
schedule:
  blog: 2026-05-10T10:00:00+08:00
  x: 2026-05-10T20:00:00+08:00
  xiaohongshu: 2026-05-11T12:00:00+08:00
  douyin: 2026-05-11T20:00:00+08:00
platforms: [blog, x, xiaohongshu]  # 不想发抖音就不列
---

（正文 Markdown）
```

### 2. 推送后自动生成

```bash
git add contents/2026-05-10-my-new-post.md
git commit -m "content: my new post"
git push
```

GitHub Actions 自动：
1. 检测新 content
2. 调用 LLM 生成各平台版本到 `generated/`
3. commit 回仓库

### 3. 你 review

```bash
git pull
# 看 generated/2026-05-10-my-new-post/ 下的各个版本
# 有需要微调的就改一下
```

### 4. 自动发布

- **博客**：到时间自动同步到 blog 仓库并部署
- **X**：到时间自动通过 X API 发 Thread（需要 credits）
- **小红书 / 抖音**：目前没有稳定的开放 API，手动复制发

---

## 启用进度

| 平台 | 状态 | 说明 |
|------|------|------|
| 博客生成器 | 🚧 开发中 | 复用现有 blog/ 目录 |
| X Thread 生成器 | 🚧 开发中 | 复用 x-auto-poster |
| 小红书生成器 | 🚧 开发中 | 只生成，手动发 |
| 抖音生成器 | 🚧 开发中 | 只生成脚本 |
| 自动发布 X | ⏸️ 待启用 | 等 X API credits |
| 自动同步博客 | ⏸️ 待启用 | 等生成器稳定 |

---

## 设计哲学

1. **Markdown 为王** — 所有内容都是纯文本，方便版本控制
2. **LLM 做重活** — 多平台改写让 AI 做，人做质量把关
3. **推送即触发** — 所有动作绕不开 git，减少需要学习的工具
4. **Human-in-the-loop** — 生成不等于发布，你始终有最终决定权
5. **平台独立性** — 每个平台的生成器独立，加新平台不影响老的

---

## 下一步（Roadmap）

- [ ] 定义各平台的 style guide（`steering/`）
- [ ] 实现博客生成器（最简单，复制 + 改 metadata）
- [ ] 实现 X Thread 生成器（LLM 改写）
- [ ] 实现小红书生成器（LLM 改写 + 标签建议）
- [ ] 实现抖音脚本生成器（LLM 改写成口播）
- [ ] 实现发布追踪（meta.json 记录每个平台的发布状态）
- [ ] 实现自动发布到 blog 和 X
- [ ] 做一个简单的 dashboard 展示待发和已发的内容

---

## 长远愿景

当这个系统成熟后：

- 你只需要写 1-2 篇 **源文件** / 月
- 系统生成 5+ 个平台版本
- 每个平台每周 1-2 次发布
- 你一个月发布 20+ 条高质量内容
- **100% 的内容来自同一个大脑，零重复劳动**

这就是"个人内容工作室"的标准配置。
