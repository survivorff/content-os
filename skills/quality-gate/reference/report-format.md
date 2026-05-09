# Quality Report 格式

写到 `contents/<slug>/quality-report.md`。

---

## 模板

```markdown
---
slug: kebab-case-slug
checked_at: 2026-05-10T12:30:00+08:00
overall_status: approved | approved_with_notes | rejected
platforms_approved: 2
platforms_rejected: 1
---

# Quality Report — <slug>

## 总体

- Blog: ✅ approved
- X Thread: ⚠️ approved_with_notes (1 warn)
- 小红书: ❌ rejected (2 warn → 升级)
- 抖音: (跳过，不在 platforms)

## Blog — ✅ approved

完全通过，直接可发。

## X Thread — ⚠️ approved_with_notes

### Warn 1：最后一条 CTA 的互动问题偏模糊

**位置**：`generated/<slug>/x-thread.md` 第 9 条
**问题**：结尾问"你觉得呢？" 太模糊，读者不知道答什么。
**建议**：改成"你们做 dApp 踩过最恶心的 RPC 坑是哪个？具体说。"

## 小红书 — ❌ rejected

### Fail 1：术语"MEV"没有解释

**位置**：`generated/<slug>/xiaohongshu.md` 第 2 个小标题
**问题**：MEV 对小红书受众来说太专业。
**建议**：加括号"MEV（交易排序里的套利，有人在你下单前后抢跑赚差价）"

### Warn 1：标题偏长

**位置**：`generated/<slug>/xiaohongshu.md` 标题
**问题**：当前 28 字，超 25 字上限。
**建议**：砍成 "交易所 4 年转 Web3，我踩出 5 条反常识经验"（22 字）

### Warn 2：结尾 CTA 里有链接

**位置**：`generated/<slug>/xiaohongshu.md` 结尾
**问题**：小红书贴外链会被降权。
**建议**：删掉链接，改成"主页找我" / "私信聊"

**2 个 warn 升级为 reject**。

---

## 建议的下一步

作者可选：

**A) 让我按建议改**
调 hook-polisher 或相应 skill 修复后自动重审。

**B) 回源改**
回到 `generated/<slug>/xiaohongshu.md` 手改，改完跑 `quality-gate` 再审。

**C) 强制通过**
作者确认风险后强制通过。需在 meta.json 里加 `force_pass_reason`。
```

---

## 格式规则

- **每个问题独立一个小章节**，方便作者跳转
- **位置必须具体**：文件路径 + 段落 / 行
- **建议必须具体**：改成什么，不是"改得更好"
- **最后有明确的下一步选项**，不要让作者猜

---

## 内部状态（写到 meta.json）

```json
{
  "quality_gate": {
    "blog": {
      "status": "approved",
      "checked_at": "2026-05-10T12:30:00+08:00",
      "fails": [],
      "warns": []
    },
    "x-thread": {
      "status": "approved_with_notes",
      "checked_at": "...",
      "fails": [],
      "warns": [
        {
          "type": "cta-too-vague",
          "location": "最后一条",
          "suggestion": "..."
        }
      ]
    },
    "xiaohongshu": {
      "status": "rejected",
      "checked_at": "...",
      "fails": [
        {
          "type": "term-unexplained",
          "location": "第 2 个小标题",
          "term": "MEV",
          "suggestion": "..."
        }
      ],
      "warns": [
        {"type": "title-too-long", "current": 28, "limit": 25},
        {"type": "external-link-in-cta"}
      ]
    }
  }
}
```

机器可读格式，方便后续统计。
