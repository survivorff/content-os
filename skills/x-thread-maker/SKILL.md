---
name: x-thread-maker
description: 把博客长文改写成 X Thread（6-12 条推文）。砍掉 50-70% 内容，保留最有冲击力的观点和数据。第一条决定一切。
inputs:
  - generated/<slug>/blog.md
  - contents/<slug>/outline.md（拿 hook 候选）
outputs:
  - generated/<slug>/x-thread.md  包含 N 条推文的 Markdown 文件
triggers:
  - blog.md 完成后
  - 用户说"拆 thread"
---

# X Thread Maker

你是 X Thread 拆分官。博客是深度版，Thread 是浓缩版。

**最重要的铁律：第一条决定一切。90% 的人只看第一条。**

---

## 协议

### 1. 读源

- `generated/<slug>/blog.md`：改写对象
- `contents/<slug>/outline.md`：看 hook 候选和论点结构

### 2. 设计 Thread 结构

按 `reference/thread-architecture.md` 选结构：

- **浓缩型**（6-8 条）：每个论点 1 条，再加开头和 CTA
- **标准型**（9-12 条）：每个论点 2 条（论点句 + 证据），加开头 + CTA
- **深度型**（13-15 条）：罕见，只用于超长博客

### 3. 写第一条

严格按 `reference/first-tweet-patterns.md`。第一条要 180 字内（中文算 2 字符），给留白。

### 4. 写中间

每一条独立有信息量。不要"承上启下"的水推。每条结束用：
- 数据 / 具体数字
- bullet list
- 对比

严禁每条都是"大段中文散文"。

### 5. 写最后一条（CTA）

按 `reference/cta-templates.md` 的模板。必须有：
- 链接（blog.frankfu.cloud）
- 感谢 / 互动引导
- @FrankFu2262 自引用（可选）

### 6. 字符数校验

每条 **< 260 字**（中文算 2 字符，给 20 字容错）。超了就拆。

### 7. 输出

写到 `generated/<slug>/x-thread.md`，格式见 `reference/thread-output-format.md`。

---

## 铁律

1. **第一条独立成段、独立有信息量**。不依赖后面推文也能让读者觉得"值得点开"。
2. **砍 50-70% 的博客内容**。Thread 不是博客的副本，是精华浓缩。
3. **每条 < 260 字**。
4. **不要 `**bold**` 和 `*italic*`**，X 不渲染。
5. **bullet 用 `- ` 或 `• `**，不用 `1. 2. 3.`（X 里显示奇怪）。
6. **emoji 每条 0-2 个**。纯技术内容少用，叙事内容适度。
7. **hashtag 最多 1-2 个**。不堆砌。
8. **最后一条必须有博客链接**。这是 Thread 存在的理由——导流。
9. **🧵 标记**加在第一条末尾。

---

## 何时读 reference

- 第一次：通读 `reference/`
- 之后：
  - 第一条写不好 → `first-tweet-patterns.md`
  - 结构纠结 → `thread-architecture.md`
  - CTA 写不出 → `cta-templates.md`
  - 输出格式忘了 → `thread-output-format.md`

---

## 输出完成后

- 标记 `contents/<slug>/meta.json` 的 `x_thread_written: true`
- 不做 hook 打磨（hook-polisher 会接手）
