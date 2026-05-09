# Thread 输出格式

写到 `generated/<slug>/x-thread.md`。

---

## 文件结构

```markdown
---
slug: kebab-case-slug
blog_source: generated/<slug>/blog.md
tweet_count: 10
estimated_read_time: 3min
lang: zh | en | mix
---

# <标题>（只在文件里，不会发到 X）

## 1/

<第一条推文正文>

## 2/

<第二条推文正文>

## 3/

<第三条推文正文>

...

## 10/ (CTA)

<CTA 推文正文>

---

## 字符数校验

| # | 字符数 (X 规则) | 状态 |
|---|---|---|
| 1 | 178 | ✅ |
| 2 | 240 | ✅ |
| 3 | 255 | ⚠️ 接近上限 |
| ... | ... | ... |

（这个表由 quality-gate 自动生成或由 skill 手工填）
```

---

## 说明

### 为什么每条一个 H2？

- 方便作者在 IDE 里读
- 方便 `x-auto-poster` 脚本抓取每条
- 最后一条标注 `(CTA)` 方便识别

### 为什么要字符数表？

- X 有 280 字符硬上限（中文算 2）
- 超了发布会失败
- 接近上限的（>260）建议重写

### 如果中英混发怎么办

`lang` 字段写 `mix`，字符数按 X 的规则（英文 1 字符、中文 2 字符）计算。

---

## 示例（节选）

```markdown
---
slug: why-solana-won-meme
blog_source: generated/why-solana-won-meme/blog.md
tweet_count: 9
estimated_read_time: 2min
lang: zh
---

# 为什么是 Solana 赢了 Meme

## 1/

Base、BSC、以太坊都在做 Meme，但 Solana 占了 90%+ 的市场。

不是"便宜+快"那么简单。

作为在交易所做 2 年 meme 基建的人，告诉你是哪三个被忽略的因素。

🧵

## 2/

先摆数据。

2024 年 Q4：
- Solana meme 交易量 $450B+
- Ethereum $30B
- Base $12B
- BSC $9B

Solana 独吞 90%+。这不是"稍微领先"，是碾压。

## 3/

...

## 9/ (CTA)

完整 5000 字分析（含链上数据和 MEV 细节）：

blog.frankfu.cloud/posts/why-solana-won-meme

你觉得其他链还有机会回来吗？评论区。

@FrankFu2262
```
