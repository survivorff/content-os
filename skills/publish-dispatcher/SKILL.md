---
name: publish-dispatcher
description: quality-gate 通过后的最后一个 skill。把已批准的内容排入发布队列，触发自动发布或提醒手动操作。
inputs:
  - contents/<slug>/meta.json  (quality_gate 字段必须为 approved 或 approved_with_notes)
  - generated/<slug>/*
  - inbox/<file>.md  (取 schedule 字段)
outputs:
  - queue/schedule.json  发布队列（追加）
  - contents/<slug>/meta.json  更新 published 字段
  - 各平台的发布命令 / 提醒
triggers:
  - quality-gate 通过后
  - 用户说"发出去"
---

# Publish Dispatcher

你是发布调度员。你的职责**不是发**，而是**决定什么时候发、用什么方式发、到时间提醒**。

---

## 协议

### 1. 前置检查

读 `contents/<slug>/meta.json`：

- 所有在 platforms 里的平台，`quality_gate.<platform>.status` 必须是 `approved` 或 `approved_with_notes`
- 任意 `rejected` → 拒绝调度，让用户先处理 quality-gate 报告

### 2. 读取排期

优先级从高到低：

1. `inbox/<file>.md` 的 frontmatter `schedule` 字段
2. 如果 inbox 没写，按 `reference/default-schedule.md` 的默认规则
3. 如果默认也给不出，询问用户

### 3. 按平台计算发布时机

参考 `reference/platform-publish-flow.md`：

| 平台 | 方式 |
|---|---|
| blog | 自动：copy 到 `blog/src/data/blog/` 然后 git push |
| x-thread | 自动（有 API credits）/ 手动提醒（没 credits） |
| xiaohongshu | 手动提醒（无稳定 API） |
| douyin | 手动提醒（需要录制） |

### 4. 写入 `queue/schedule.json`

追加条目，不要覆盖整个文件。

```json
{
  "queue": [
    {
      "slug": "why-solana-won-meme",
      "platform": "blog",
      "scheduled_at": "2026-05-10T10:00:00+08:00",
      "mode": "auto",
      "status": "pending"
    },
    {
      "slug": "why-solana-won-meme",
      "platform": "x-thread",
      "scheduled_at": "2026-05-10T20:00:00+08:00",
      "mode": "auto",
      "status": "pending"
    },
    {
      "slug": "why-solana-won-meme",
      "platform": "xiaohongshu",
      "scheduled_at": "2026-05-11T12:00:00+08:00",
      "mode": "manual",
      "status": "pending",
      "reminder": "手动复制 generated/why-solana-won-meme/xiaohongshu.md 到小红书"
    }
  ]
}
```

### 5. 即时发布判定

对每个条目：

- **scheduled_at ≤ now + 5min** → 立刻执行 / 提醒
- **scheduled_at > now** → 仅写入队列，等后续触发

### 6. 执行发布

#### Blog（auto）

- 按 `reference/platform-publish-flow.md#blog` 的步骤
- 把 `generated/<slug>/blog.md` 复制到 `blog/src/data/blog/<slug>.md`
- 在 blog 仓库 git add / commit / push（仅在用户明确允许时）
- 更新 `meta.json.published.blog` = ISO 时间戳

#### X Thread（auto）

- 检查 `x-auto-poster` 是否有 credits
- 有 → 调用 `x-auto-poster` 发送
- 无 → 降级为 manual，输出一个复制粘贴友好的文本

#### 小红书 / 抖音（manual）

- 在 terminal 输出清晰的"去发这个"提醒
- 标注文件路径 + 发布时间
- 更新 `meta.json.published.<platform>` = `pending_manual`

### 7. 更新 meta.json

```json
{
  "published": {
    "blog": "2026-05-10T10:00:12+08:00",
    "x-thread": "2026-05-10T20:00:03+08:00",
    "xiaohongshu": "pending_manual",
    "douyin": "skipped"
  }
}
```

### 8. 输出调度总结

给用户一份简报：

```
已调度：
- Blog：2026-05-10 10:00（自动，已执行）
- X Thread：2026-05-10 20:00（自动，排队中）
- 小红书：2026-05-11 12:00（手动，到时提醒你）
```

---

## 铁律

1. **绝不在 quality-gate rejected 时调度**。
2. **绝不擅自 git push**。涉及 blog 仓库的 push 必须用户明确允许。
3. **手动平台必须给出明确的"怎么发"提醒**。不要只写"手动发"。
4. **scheduled_at 必须带时区**。否则会错发 8 小时。
5. **追加队列，不要覆盖**。已有条目保留。

---

## 何时读 reference

- 第一次：全读
- 之后：
  - 默认排期规则 → `default-schedule.md`
  - 各平台发布流程 → `platform-publish-flow.md`
  - 队列 schema → `queue-schema.md`

---

## 输出完成后

向 Orchestrator 汇报：
- 每个平台的 status
- 下一个需要用户做的动作（如果有）
- 队列文件已更新

这之后流程结束，等下一次触发。
