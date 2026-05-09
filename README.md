# Content OS

**一个想法，多个 agent skills，一次产出全平台内容。**

你不写脚本、不填模板、不开 N 个工具。你只抛一句话或一段思考，由 orchestrator agent（大脑）根据上下文调用不同 skill（角色）完成从选题到多平台改写的全流程。

---

## 核心理念：Agent Skills 架构

借鉴 Anthropic Agent Skills 的形态：

- **一个大脑**：`AGENTS.md`，orchestrator 的工作手册。看见想法 → 决定要哪些 skill → 按顺序调用 → 汇合结果。
- **一堆技能**：`skills/<skill-name>/SKILL.md`，每个 skill 是一个独立角色（选题侦察员、博客写手、Thread 拆分官、小红书编辑、质量审稿…）。每个 SKILL.md 只装入口说明，细节用渐进披露（progressive disclosure）放在同目录的 reference 文件里。
- **你只管抛想法**：想到什么就往 `inbox/` 扔一句话、一段语音转文字、一张截图的描述。大脑接管剩下的。

```
你抛想法
   │
   ▼
inbox/2026-05-09-random-thought.md          ← 你只写这一个
   │
   ▼
┌─────────────────────────────────────────┐
│  Orchestrator（AGENTS.md 里的大脑）       │
│  读想法 → 匹配 skills → 编排流程           │
└─────────────────────────────────────────┘
   │
   ├──▶ skills/topic-scout          （是不是值得写？）
   ├──▶ skills/outline-architect    （拆骨架）
   ├──▶ skills/blog-writer          （写长文）
   ├──▶ skills/x-thread-maker       （拆推文）
   ├──▶ skills/xiaohongshu-editor   （小红书改写）
   ├──▶ skills/douyin-scripter      （口播脚本）
   ├──▶ skills/hook-polisher        （打磨开头）
   ├──▶ skills/quality-gate         （质量终审）
   └──▶ skills/publish-dispatcher   （排期 + 调起发布）
   │
   ▼
contents/<slug>/  +  generated/<slug>/<platform>.md  +  queue/
```

---

## 快速上手：5 步走通一次

不用装任何东西。在你的 AI agent（Claude Code / Cursor / Kiro）里操作。

### Step 1 — 扔一个想法进 inbox

```bash
# 复制模板（可选）
cp templates/idea-capture.md inbox/$(date +%Y-%m-%d)-my-idea.md

# 或者极简版：直接写三行
cat > inbox/$(date +%Y-%m-%d)-my-idea.md <<'EOF'
今天 debug 发现 Solana RPC 全是坑。
想写一篇"生产环境踩过的 Solana RPC 坑"。
独特视角：交易所级别的高并发经历。
EOF
```

### Step 2 — 召唤大脑

在 chat 里说一句：

> 按 content-os/AGENTS.md 处理 `inbox/2026-05-09-example.md`。

大脑（orchestrator）会自己读 AGENTS.md，开始编排 skills。

### Step 3 — 在"决策点 ①"确认 outline

大脑跑完 topic-scout + outline-architect 会停下来，把 `contents/<slug>/outline.md` 打给你看。

你只需要回复：
- "OK" → 继续
- "第 2 点改成 XXX" → 大脑回去调整
- "换反差型 hook" → 大脑换

### Step 4 — 让大脑自己跑到 quality-gate

你确认 outline 后，大脑会**连续**跑：
- blog-writer
- x-thread-maker / xiaohongshu-editor / douyin-scripter（并行，按 platforms）
- hook-polisher（单独打磨开头）
- quality-gate（按 checklist 审）

中间不打扰你。

### Step 5 — 在"决策点 ②"决定发不发

quality-gate 跑完，会停在一份 `quality-report.md`：

- 全 approved → 大脑直接调 publish-dispatcher 写入 `queue/schedule.json`，给你一份调度总结
- 任何 rejected → 停下来给你 3 个选项（我来改 / 你回源改 / 强制通过）

---

## 实战示例：看一次完整跑通

已经有一个跑完的样例沉淀在仓库里，你可以直接翻文件感受节奏：

- 输入：[`inbox/2026-05-09-example.md`](inbox/2026-05-09-example.md)
- 每个 skill 的产物：[`contents/solana-rpc-production-truths/`](contents/solana-rpc-production-truths/) + [`generated/solana-rpc-production-truths/`](generated/solana-rpc-production-truths/)
- 逐步讲解：[`docs/walkthrough-example.md`](docs/walkthrough-example.md)

---

## 远程指挥：在外面也能把内容团队开起来

你不在电脑前时（谈业务、地铁上、咖啡馆），靠一段消息把整条流水线启动。

**当前生产链路（已跑通）**：

```
你 (Lark DM) → OpenClaw gateway @ 阿里云 VM → content-os skills + DeepSeek V4 Pro → 成品 + git push
```

- **部署状态快照**：[`docs/deployment-status.md`](docs/deployment-status.md)
- **部署 playbook**：[`docs/setup-openclaw.md`](docs/setup-openclaw.md)
- **备用路径（GitHub Actions）**：[`docs/setup-stage1.md`](docs/setup-stage1.md)
- **长期架构备选**：[`docs/remote-trigger.md`](docs/remote-trigger.md) / [`docs/mvp-demo.md`](docs/mvp-demo.md)

---

## 目录

```
content-os/
├── AGENTS.md                 # ← 大脑：orchestrator 的工作指令（必读）
│
├── skills/                   # ← 所有 agent skills
│   ├── topic-scout/
│   │   ├── SKILL.md          # 入口（必读）
│   │   ├── reference/        # 渐进披露的参考
│   │   └── examples/
│   ├── outline-architect/
│   ├── blog-writer/
│   ├── x-thread-maker/
│   ├── xiaohongshu-editor/
│   ├── douyin-scripter/
│   ├── hook-polisher/
│   ├── quality-gate/
│   └── publish-dispatcher/
│
├── inbox/                    # ← 你唯一要写的地方：一句话想法
│   └── YYYY-MM-DD-*.md
│
├── contents/                 # 大脑确认选题后沉淀的源文稿
│   └── <slug>/
│       ├── source.md         # 最终的 Markdown 源
│       └── meta.json         # 追踪状态
│
├── generated/                # 各 skill 产出的平台版本
│   └── <slug>/
│       ├── blog.md
│       ├── x-thread.md
│       ├── xiaohongshu.md
│       └── douyin-script.md
│
├── queue/                    # publish-dispatcher 维护的发布队列
│   └── schedule.json
│
├── templates/
│   └── idea-capture.md       # inbox 用的最小模板（可选）
│
└── docs/
    ├── how-it-works.md       # 工作流详解
    ├── how-to-add-a-skill.md # 加新 skill 的范式
    └── why-agents.md         # 为什么用 agent skills 而不是脚本
```

---

## 最小使用示例

### 1. 抛一个想法

```bash
cat > inbox/2026-05-09-solana-rpc.md <<'EOF'
# 想法

今天 debug 发现 Solana 的 RPC 真是一堆坑。
getProgramAccounts 慢得离谱，getSignaturesForAddress 还有分页坑。
感觉能写一篇"生产环境踩过的 Solana RPC 坑"。

目标读者：做 Solana dApp 后端的工程师。
我的独特视角：交易所级别的高并发 + 真实故障经历。
EOF
```

### 2. 召唤大脑

在你的 AI agent（Claude Code、Cursor、Kiro…）里：

> 按 `content-os/AGENTS.md` 的工作流处理 `inbox/2026-05-09-solana-rpc.md`。

### 3. 大脑自动做的事

1. 读 `AGENTS.md` 看自己该怎么干
2. 调 `skills/topic-scout` → 判断值不值得写、目标受众、核心 takeaway
3. 调 `skills/outline-architect` → 拆成 3-5 个核心论点
4. 你在 terminal 确认 outline
5. 调 `skills/blog-writer` → 写长文 `generated/<slug>/blog.md`
6. 并行调 `skills/x-thread-maker` / `xiaohongshu-editor` / `douyin-scripter`
7. 调 `skills/hook-polisher` → 打磨每个版本的开头
8. 调 `skills/quality-gate` → 按 checklist 终审，不合格打回
9. 调 `skills/publish-dispatcher` → 写入 `queue/schedule.json`，等 Actions 或你手动触发

全程你只在两个点介入：
- **step 4**：outline 确认
- **step 8 之后**：拿到终审 diff，决定发不发

---

## 和旧版 content-os 的区别

| 维度 | 旧版（脚本流水线） | 新版（Agent Skills） |
|---|---|---|
| 你写什么 | 完整源文 + frontmatter + 排期 | 一段想法 |
| 流程谁编排 | 一个 `generate.py` 脚本 | Orchestrator agent（大脑） |
| 改写逻辑在哪 | `lib/generators/*.py` 硬编码 | `skills/<name>/SKILL.md` 可独立演化 |
| 加新平台成本 | 改脚本、加 prompt、调测 | 新建一个 skill 目录 |
| 风格迭代成本 | 改 prompt 看效果 | 改 skill 的 reference，下次调用自动生效 |
| 你的心智负担 | "我得把这段改成 Thread" | "我有个想法" |

---

## 下一步

1. 读 `AGENTS.md` 理解大脑怎么工作
2. 读 `skills/*/SKILL.md` 看每个角色的定位
3. 往 `inbox/` 扔第一个想法，让大脑跑一遍
4. 有不顺的地方，**改 skill 而不是改想法**

长期目标：把整个系统养成你专属的内容工作室。每个 skill 越练越懂你，最终一句话进、成品出。
