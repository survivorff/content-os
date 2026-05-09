# 怎么写一篇新内容

这是一份给"未来的你"的使用手册。

---

## 原则

**你只写源文件，其他让系统做。**

- 不要手动改 `generated/` 下的版本（会被下次生成覆盖）
- 不要手动发布到各平台（等自动化）
- 不要同时维护多个平台的不同版本

如果你发现自己在重复劳动，说明系统还没跑通，先修系统再写。

---

## 从 0 到发布的步骤

### 1. 挑一个选题

看 `topics/backlog.md`（如果有）或者记在 Obsidian / Notion / 脑子里。

如果脑子空，这几个问题能激发：

- 最近在工作里遇到一个有意思的 bug / 决策？
- 看了某篇文章觉得"我能写得更好"？
- 读者/同行问了一个高频问题？
- 行业发生了大事件，你有独特视角？

### 2. 用模板创建源文件

```bash
# 复制模板
cp templates/content-template.md contents/$(date +%Y-%m-%d)-my-post.md
```

**文件命名：** `YYYY-MM-DD-slug.md`
- 日期是**你开始写的日期**，不是发布日期
- slug 用英文 kebab-case

### 3. 填 frontmatter

**必填：**
- `title`
- `slug`
- `date`
- `tags`
- `summary`
- `platforms`（要发哪些平台）
- `schedule`（每个平台的发布时间）

**可选：**
- `voice_overrides`（某个平台特别要求）
- `require_review`（默认 true）

### 4. 写正文

写作要点：

- **第一段 hook**：这是博客和 X Thread 的共同灵魂。花最多时间打磨。
- **中间夯实**：3-5 个核心观点，每个观点有论据（数据、代码、经历）
- **结尾收尾**：一个 takeaway 或下一步

不要太在意各平台的差异，**写一个最完整的版本就行**，系统会帮你改写。

### 5. 本地预览（可选）

```bash
# 生成各平台版本（本地）
python lib/generate.py contents/2026-05-10-my-post.md

# 看 generated/ 下的效果
```

### 6. Commit 推送

```bash
git add contents/
git commit -m "content: 2026-05-10 my-post"
git push
```

GitHub Actions 自动生成 `generated/` 下的各平台版本，commit 回来。

### 7. Review

```bash
git pull
# 查看生成结果
ls generated/2026-05-10-my-post/
cat generated/2026-05-10-my-post/x-thread.md
cat generated/2026-05-10-my-post/xiaohongshu.md
```

感觉 OK 就继续。不 OK 就调整源文件（或 steering 里的 prompt）。

### 8. 等自动发布

系统会在你设定的时间自动发布：

- 博客：到时间 push 到 blog 仓库，触发部署
- X：到时间调用 X API 发 Thread
- 小红书/抖音：**目前还是手动**，系统会提醒你

---

## 常见问题

### Q: 我改了源文件，已经生成的版本要重新生成吗？

是。系统检测到源文件 hash 变了会重新生成。如果某个平台已经发布过了，会跳过不重发（状态在 meta.json 里）。

### Q: 生成的 X Thread 太啰嗦/太激进怎么办？

两个办法：
1. 改源文件（让内容本身更聚焦）
2. 改源文件的 `voice_overrides.x`（个性化 prompt）

如果所有生成的 X Thread 都有同样的问题，改 `steering/x-thread-style.md`（全局调整）。

### Q: 我想某篇文章不发 X 怎么办？

在 frontmatter 的 `platforms` 里不列 `x`。

### Q: 我能同一天发两篇不同的文章吗？

可以，但不推荐。**X 和小红书都有"同一个账号短时间发多条"被限流的风险**。

建议一天最多 1 个 Thread / 1 篇小红书 / 1 个视频。

---

## 选题规划

保持 **4-8 周** 的选题储备。这样：

- 写作日期和发布日期解耦（你有灵感时一口气写，没灵感时慢慢修）
- 可以合理排布系列文章的发布节奏
- 避免"今天想写什么"的无脑挣扎

在 `topics/backlog.md`（如果有）维护一个表：

```markdown
| 选题 | 方向 | 难度 | 状态 |
|------|------|------|------|
| AI 写代码的边界 | AI | 中 | 待写 |
| Solana 账户模型详解 | Web3 | 高 | 已写（draft） |
| ... | ... | ... | ... |
```

---

## 质量 checklist（每篇发布前自检）

- [ ] 标题有 hook，不是"今天来聊 XXX"
- [ ] 第一段 3 句话能讲清"为什么值得看"
- [ ] 有至少一个独家视角或独家数据
- [ ] 技术内容有代码或图表支撑
- [ ] 结尾有明确的 takeaway
- [ ] 2-4 个 tag，符合你的分类体系
- [ ] summary 140 字内，能独立成句
- [ ] 生成的 X Thread 第一条够吸引人
- [ ] 生成的小红书版本够口语化
- [ ] 发布时间避开凌晨和周末清晨
