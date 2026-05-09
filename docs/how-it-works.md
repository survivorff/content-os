# Content OS 怎么工作

面向"使用这个系统的作者本人"。

---

## 一分钟理解

```
你扔想法 ──▶ Orchestrator（大脑） ──▶ 编排一串 Skills ──▶ 平台版本 ──▶ 排期发布
```

你只扔想法。大脑（AGENTS.md）决定叫哪些 skill（skills/*/SKILL.md）、按什么顺序、什么时候停下来问你。

---

## 完整流程图

```
inbox/YYYY-MM-DD-xxx.md
         │
         ▼
  ┌────────────────┐
  │ topic-scout    │  值得写吗？给谁看？适合哪些平台？
  └────────────────┘
         │
         ▼ (verdict = yes)
  ┌────────────────┐
  │ outline-architect │ 骨架 + hook 候选 + 论点
  └────────────────┘
         │
      [你确认 outline] ◀─── 决策点 1
         │
         ▼
  ┌────────────────┐
  │ blog-writer    │  博客长文（源版本）
  └────────────────┘
         │
         ▼ 并行
  ┌───────────────────┐
  │ x-thread-maker    │
  │ xiaohongshu-editor │
  │ douyin-scripter   │
  └───────────────────┘
         │
         ▼
  ┌────────────────┐
  │ hook-polisher  │  打磨每个平台的开头
  └────────────────┘
         │
         ▼
  ┌────────────────┐
  │ quality-gate   │  按 checklist 审 → pass/reject
  └────────────────┘
         │
      [如果 reject，你决定怎么办] ◀─── 决策点 2
         │
         ▼ (全 approved)
  ┌────────────────┐
  │ publish-       │  写入队列 + 自动发 / 手动提醒
  │ dispatcher     │
  └────────────────┘
         │
         ▼
  queue/schedule.json + meta.json 更新
```

---

## 典型一次运行

你在 Claude Code / Cursor / Kiro 里说：

> 按 content-os/AGENTS.md 处理 inbox/2026-05-09-solana-rpc.md。

大脑会：

1. **读 AGENTS.md** 加载自己的工作手册
2. **读 inbox 文件** 理解你的想法
3. **调 topic-scout** → 判断值不值得写
4. **调 outline-architect** → 给你骨架看
5. **停下来问你** → "OK 吗？"
6. 你说 OK
7. **调 blog-writer** → 写长文
8. **并行调 x-thread-maker / xiaohongshu-editor / douyin-scripter**
9. **调 hook-polisher** → 每个版本的 hook 打磨
10. **调 quality-gate** → 逐项审
11. 如果有平台被 reject → **停下来问你**
12. 如果都 approved → **调 publish-dispatcher** 写入队列
13. **汇报**：几个平台 approved，排期何时，你还要做什么

---

## 你在哪里介入

### 决策点 1：Outline 确认

大脑写完 outline.md 会停下来让你看。

你可以：
- 说 "OK" → 继续
- 说 "第 2 点不对，应该是 XXX" → 大脑回去调 outline-architect 重做
- 说 "换一个 hook 候选" → 大脑调整
- 说 "算了不写" → 大脑放弃

### 决策点 2：Quality Gate Reject

如果某个平台的质量不过关，大脑停下来告诉你：
- 哪里不行
- 建议怎么改
- 3 个选项（让我改 / 你回源改 / 强制通过）

### 可选介入：任何时候叫停

你可以在任何地方说 "停一下"。大脑会：
- 列出已产出的文件和它们处于流水线的哪一步
- 等你决定下一步

---

## 产出文件的角色

| 文件 | 谁写 | 谁改 | 作用 |
|---|---|---|---|
| `inbox/<file>.md` | 你 | 你 | 粗料 |
| `contents/<slug>/scout.md` | topic-scout | 不改 | 选题判断 |
| `contents/<slug>/outline.md` | outline-architect | 你看完说 OK | 骨架 |
| `generated/<slug>/blog.md` | blog-writer | hook-polisher 改 hook | 博客源版本 |
| `generated/<slug>/x-thread.md` | x-thread-maker | hook-polisher | X 版本 |
| `generated/<slug>/xiaohongshu.md` | xiaohongshu-editor | hook-polisher | 小红书版本 |
| `generated/<slug>/douyin-script.md` | douyin-scripter | hook-polisher | 抖音脚本 |
| `contents/<slug>/quality-report.md` | quality-gate | 不改 | 审查报告 |
| `contents/<slug>/meta.json` | quality-gate / publish-dispatcher | 自动 | 状态追踪 |
| `queue/schedule.json` | publish-dispatcher | 自动 | 发布队列 |

---

## 何时绕过某个 skill

### 只想发到某一个平台

在 inbox 里 `platforms: [blog]`。大脑看到就只调 blog 相关 skill。

### 已有博客，只想生成 X Thread

告诉大脑：

> 用 `generated/<slug>/blog.md`，只跑 x-thread-maker → hook-polisher → quality-gate。

大脑会跳过 topic-scout / outline-architect / blog-writer。

### 已生成内容，只想重审

```
让 quality-gate 重跑 generated/<slug>/*
```

### 修改已发布的内容

不在这个系统的支持范围内。已发布的手动改对应仓库 / 平台。

---

## 重要约定

1. **你只写 inbox**。其他目录里的文件不用手写。
2. **要改别人写的，就告诉大脑**，不要直接去改（容易被下次生成覆盖）。
3. **不要同时跑多个 inbox**。大脑一次处理一个。
4. **大脑的自由度在 AGENTS.md**。要调整工作流，改 AGENTS.md 而不是每次都喊话。
5. **skill 要进化**。发现某个 skill 的输出总是差那个味，改 `skills/<name>/reference/`，不要每次喊话补丁。

---

## 调试技巧

### 如果某个 skill 的输出不好

1. 去看它的 `SKILL.md` 的"铁律"和"何时读 reference"
2. 去读对应 reference 看是不是规则有缺漏
3. 补充 reference（不用改 SKILL.md）
4. 重跑那个 skill

### 如果大脑没按工作流走

1. 去看 `AGENTS.md`
2. 看"标准工作流"和"强约束"
3. 是不是缺了某个约束？补一条。
4. 下次运行会自动遵守。

### 如果产物风格跑偏

1. 回到对应 skill 的 `voice.md` 或 `*-style` reference
2. 看"声音特征"有没有漏
3. 补充后重跑
