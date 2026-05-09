# MVP Demo：从 Telegram 一条消息到多平台成品

> 最简单的闭环。你在 Telegram 发一条想法 → 15 分钟后仓库里多了一套平台内容。

---

## 目标（刻意克制版）

**只做一件事做好**：

```
你在 Telegram 发一段想法
      ↓
Bot 写到 inbox/ 并 git push
      ↓
GitHub Actions 调 Claude API 跑 AGENTS.md 整条 pipeline
      ↓
结果 commit 回来 + Bot 发消息通知你
```

**MVP 阶段不做**：

- ❌ 多用户支持（只你一个人用）
- ❌ 多 Bot 平台（微信、飞书以后再说）
- ❌ 图片/语音输入（后续迭代）
- ❌ 自动发博客/X/小红书（先只生成，不自动发）
- ❌ Bot 做 outline 确认交互（初期默认自动批准 outline）

---

## 架构

```
┌──────────────┐
│  Telegram    │ ← 你发消息
└──────┬───────┘
       │ bot webhook
       ▼
┌──────────────────────────┐
│  Cloudflare Workers      │ ← 免费，24h 在线
│  (Bot 中转)               │
└──────┬───────────────────┘
       │ GitHub REST API: create file
       ▼
┌──────────────────────────┐
│  content-os/inbox/xxx.md │
└──────┬───────────────────┘
       │ push 触发
       ▼
┌──────────────────────────┐
│  GitHub Actions          │
│  .github/workflows/agent │
└──────┬───────────────────┘
       │ 调 Claude API, 跑 AGENTS.md
       ▼
┌──────────────────────────┐
│  commit:                 │
│  contents/<slug>/*       │
│  generated/<slug>/*      │
│  queue/schedule.json     │
└──────┬───────────────────┘
       │ Actions 最后一步：调 Bot webhook 回推
       ▼
┌──────────────────────────┐
│  Bot → 你的 Telegram     │
│  "✅ 跑完了，看 PR #42"   │
└──────────────────────────┘
```

---

## 准备清单（需要你提供 / 操作）

在我这边写代码之前，你需要先做这 6 件事：

### 1. 创建 Telegram Bot（5 分钟）

- 打开 Telegram，搜 `@BotFather`
- 发送 `/newbot`
- 起个名字，例如 `frank-content-os-bot`
- 起个 username（必须 `_bot` 结尾），例如 `frank_content_os_bot`
- BotFather 会给你一个 **Bot Token**，形如 `1234567890:ABCDEFghijklmn-...`
- **记下这个 Token**

### 2. 拿到你自己的 Telegram User ID（1 分钟）

- 在 Telegram 搜 `@userinfobot`
- 发送 `/start`
- 它会回你一个数字 ID，例如 `123456789`
- **记下这个 ID**（用来做白名单，别人发消息不会触发）

### 3. 创建 Anthropic API Key（3 分钟）

- 到 [console.anthropic.com](https://console.anthropic.com)
- 注册 / 登录 → API Keys → Create Key
- 复制 key，形如 `sk-ant-...`
- 首充 $5 够跑 10-15 次完整 pipeline（初期够用）
- **记下这个 Key**

### 4. 创建 Cloudflare 账号（2 分钟）

- 到 [dash.cloudflare.com](https://dash.cloudflare.com)
- 注册（免费）
- 后面部署 Worker 用

### 5. 确认 content-os 仓库在 GitHub 上（你说建好了）

- 告诉我仓库全名（例如 `survivorff/content-os`）
- 我要用它配置 Actions 和 Worker 访问路径

### 6. 创建一个 GitHub Personal Access Token（3 分钟）

用于 Bot Worker 往仓库里写 inbox 文件。

- 到 [github.com/settings/tokens](https://github.com/settings/tokens)
- `Generate new token (classic)`（fine-grained 也行，但 classic 简单）
- Scope 只勾：`repo`（读写你自己的仓库）
- 有效期建议 90 天
- **记下这个 Token**

---

## 你给我以下 4 个值，我就开始搭

- [ ] 仓库全名（例如 `survivorff/content-os`）
- [ ] Bot Token（BotFather 给的）
- [ ] 你的 Telegram User ID
- [ ] GitHub Token（你 classic PAT）

> **Claude API Key 和 Cloudflare 账号不需要告诉我** —— 你自己在 Cloudflare 和 GitHub Secrets 里配就行，我给配置步骤。

不用一次给齐，一边搭一边给也可以。

---

## 实现路径（我来做的部分）

### 阶段 1：GitHub Actions 跑 pipeline（可先脱离 Bot 验证）

**文件**：`.github/workflows/run-agent.yml`

**触发**：`push` 到 `inbox/**`

**步骤**：
1. Checkout 仓库
2. 识别 diff 里新增的 inbox 文件
3. 调 Claude API 跑 AGENTS.md
4. 检查 agent 的产出（生成 contents/ 和 generated/）
5. Commit & push

**验证方式**：你手动往 inbox 里 push 一个文件，看 Actions 有没有自动跑 + 产出 commit 回来。

### 阶段 2：Bot 写 inbox

**文件**：`bot/worker.ts`（Cloudflare Worker）

**逻辑**：

```
Telegram webhook → Worker
  1. 校验 user_id 是否在白名单
  2. 提取消息文本
  3. 生成 slug (文本前 30 字 → kebab-case)
  4. 生成 inbox/<date>-<slug>.md
  5. 调 GitHub Contents API 创建文件
  6. 回 Telegram: "✅ inbox 已创建，agent 在跑..."
```

**验证方式**：你在 TG 发一条消息 → 1 秒后仓库里多一个 inbox 文件 → 几分钟后 Actions 跑完 → 看产物。

### 阶段 3：Bot 回推结果（可选，但推荐）

**逻辑**：

```
Actions 跑完最后一步 → curl https://worker/notify
  → Worker 调 Telegram Bot API
  → 你 Telegram 收到: "✅ pipeline 跑完了。PR: https://..."
```

---

## 你会感受到什么

假设你现在在星巴克，想到一个选题：

```
你（在 TG 发）:
"做 Web3 社区运营和做 Web2 有什么不同？
我自己做了半年，3 个反常识点。"

Bot（1 秒回）:
"✅ 已创建 inbox/2026-05-09-web3-community-ops.md
Pipeline 触发中。等我 10-15 分钟。"

（你继续谈业务 15 分钟）

Bot:
"✅ Pipeline 跑完:
- Scout: yes (Web3 Builder + 转型者受众)
- Outline 已自动批准
- Blog: 2800 字 ✅
- X Thread: 10 条 ⚠️ 1 warn (第 3 条接近字符上限)
- 小红书: 650 字 ✅
- Quality: 3/3 approved
- 已排期: 周二 10:00 / 20:00 / 周三 12:00

查看: https://github.com/xxx/content-os/commit/abc123
编辑产物直接在仓库里改即可。"
```

你回酒店打开笔记本，仓库里已经躺着成品，你 review 一下就行。

---

## 成本预估

| 项 | 月成本 |
|---|---|
| Telegram Bot | $0（免费） |
| Cloudflare Workers | $0（免费额度够用） |
| GitHub Actions | $0（私有仓库每月 2000 分钟免费，一次 pipeline 5-10 分钟 → 够跑 200+ 次） |
| Anthropic Claude API | ~$3-8（每月 8 篇，每篇 $0.3-1） |
| **合计** | **~$5-10** |

---

## 风险和缓解

### 1. Agent 自作主张

- **现象**：outline 和你想的不一样
- **缓解**：初期设 `auto_approve_outline: false`，Bot 会在 outline 就绪时推给你确认再继续（这是你在 TG 里唯一一次需要介入）

### 2. Claude API 超时或失败

- **现象**：跑到一半断了
- **缓解**：Actions 里每个 skill 单独一个 step，失败的 step 可以 retry；`meta.json` 记录到哪一步了，下次从断点继续

### 3. 敏感内容被写进产物

- **现象**：你扔的想法里有客户名字，agent 可能照搬
- **缓解**：Bot 在写 inbox 前扫一遍 `sensitive_keywords`（你预配置一个清单），命中就不写 + 提示你删

---

## 迭代路线（Demo 稳定之后）

- **v0.1**（当前 MVP）：TG 消息 → inbox → Actions → 产物 commit
- **v0.2**：Bot 支持 outline 交互（发出按钮给你批准/退回）
- **v0.3**：加语音输入（OpenAI Whisper → 转文字 → 写 inbox）
- **v0.4**：自动同步 blog 到 blog 仓库（复用 blog 仓库的部署）
- **v0.5**：X Thread 自动发（等 X API credits）
- **v0.6**：小红书/抖音还是手动，但 Bot 到点推送"该发了"

不要一次到 v0.6。v0.1 跑稳定 2-4 周再看要不要 v0.2。

---

## 我需要你现在做的

1. 看完这份文档
2. 如果同意这个路径，告诉我：
   - 仓库全名
   - 是否按以下顺序搭建：**先只做"GitHub Actions 跑 pipeline"部分（阶段 1），不做 Bot**？这样能最快验证 agent 这部分是否跑得通。
   - 或者：**一起搭 Bot + Actions**（阶段 1+2），但需要你给齐 4 个值

我倾向**先搭阶段 1**，因为：
- Bot 只是"把消息转成 push"的前端，等 Actions 跑通后加 Bot 会非常快
- Actions 跑通后，就算没 Bot 你也可以手动 push inbox 触发
- Bot 在 MVP 的最后加，不影响核心 workflow 验证
