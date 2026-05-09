# 远程指挥：在外面也能开动整个工作室

你的使用场景：

> 在外面谈业务，突然冒出一个值得写的点子。你只想发一条消息给"大脑"，让它启动整个 skills 流水线，等你回酒店的时候成品已经躺在仓库里。

下面是 3 条可选路径，从简单到完整。

---

## 路径 A：手机 Git 客户端（零配置，5 分钟上手）

最基础的方案。你手机装 [Working Copy](https://workingcopy.app/)（iOS）或 GitJournal（Android），相当于带着 Git 在路上。

### 流程

1. 手机打开 Working Copy，新建一个文件到 `inbox/YYYY-MM-DD-slug.md`
2. 写你的想法（可以极简到 3 行）
3. 提交并推送到 GitHub
4. （下一步看你选 B 或 C）

### 优点

- 零配置、零依赖
- 完全私有（无第三方）
- 支持离线写、有网络再推送

### 缺点

- 想触发大脑还得额外一步（手动开 Kiro/Cursor，或走 B/C）

---

## 路径 B：GitHub Actions 跑 Hermes Agent（全自动）

**Hermes** 是 Anthropic Claude SDK / Amazon Q / OpenAI Agents SDK 之类"agent-in-CI"的统称。核心思路：

> push 到 inbox/ → GitHub Actions 触发 → agent 读 AGENTS.md → 跑完整条 pipeline → 产物 commit 回来

### 架构

```
[手机 push 到 inbox/]
         │
         ▼
[GitHub Actions: .github/workflows/run-agent.yml]
         │
         ▼
[agent 容器]
  - 拉取仓库
  - 识别新增的 inbox 文件
  - 把 AGENTS.md 注入 system prompt
  - 依次读 skills/*/SKILL.md 按需执行
         │
         ▼
[commit 回来：
  contents/<slug>/
  generated/<slug>/
  queue/schedule.json 更新]
         │
         ▼
[你收到 GitHub 的 notification → review → 确认]
```

### 工作流示例（未启用，设计稿）

`.github/workflows/run-agent.yml`：

```yaml
name: content-os agent
on:
  push:
    paths:
      - 'inbox/**'

jobs:
  run-pipeline:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Detect new inbox files
        id: detect
        run: |
          CHANGED=$(git diff --name-only HEAD^ HEAD | grep '^inbox/' || true)
          echo "files=$CHANGED" >> $GITHUB_OUTPUT

      - name: Run agent
        if: steps.detect.outputs.files != ''
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          for f in ${{ steps.detect.outputs.files }}; do
            npx @anthropic-ai/sdk-cli run \
              --system-file AGENTS.md \
              --prompt "按 AGENTS.md 处理 $f，跑到 quality-gate 后停下来。" \
              --allow-tools "read,write,bash"
          done

      - name: Commit outputs
        run: |
          git config user.name "content-os-bot"
          git config user.email "bot@frankfu.cloud"
          git add contents/ generated/ queue/
          git commit -m "agent: auto-pipeline for new inbox" || echo "no changes"
          git push
```

### 决策点怎么办（人在外面怎么确认 outline？）

两个选择：

**B-1：自动批准 outline（信任模式）**

在 inbox 的 frontmatter 加：

```yaml
auto_approve_outline: true
auto_publish_if_all_approved: false  # 仍停在 quality-gate
```

告诉 AGENTS.md 里的 orchestrator：跳过决策点 ①，直接跑到 quality-gate。

**B-2：通过 GitHub notification 确认**

Actions 跑完后 bot 创建一个 GitHub Issue：

> Pipeline 跑完了。outline 在 `contents/<slug>/outline.md`。
> 回复 "approved" 或 "reject" + 原因。

你在手机 GitHub app 里回一句 "approved"，触发第二个 workflow 继续跑后面的 skills。

### 要的前置

- `ANTHROPIC_API_KEY` 放 GitHub Secrets
- Agent runner 能读 AGENTS.md 并执行 read/write/bash 工具
- Actions 有 commit 权限（通常 `GITHUB_TOKEN` 就够）

---

## 路径 C：Telegram Bot 前端（最丝滑）

C 其实是 B 的一层壳——你在 Telegram 里发消息，bot 帮你写 inbox、触发 Actions、把结果回推给你。

### 用户体验

```
你 -> 发消息到 @content-os-bot:
  "想写一篇 Solana RPC 生产踩坑。
   角度：交易所 2 年经验，三家 provider 对比。"

Bot -> 回复:
  "✅ 已写入 inbox/2026-05-09-solana-rpc.md
   Pipeline 触发中，预计 3-5 分钟后给你 outline。"

（几分钟后）

Bot -> 回复:
  "📋 Outline 就绪：
   标题: 生产级 Solana RPC 的三个谎言...
   三个论点: P50 是谎言 / 单 RPC 必炸 / getProgramAccounts 是炸弹
   三个 hook 候选。推荐故事钩。
   
   回复 '1 OK' 批准，或 '1 改' 然后说改啥。"

你 -> "1 OK"

（10-15 分钟后）

Bot -> 回复:
  "✅ 全流程跑完。3 个平台版本已生成。
   Quality: Blog approved, X Thread/小红书 有 2 个小 warn（字符上限 + 术语翻译），不阻塞。
   
   已排期：
   - Blog: 2026-05-12 10:00 (自动)
   - X Thread: 2026-05-12 20:00 (手动)
   - 小红书: 2026-05-13 12:00 (手动)
   
   PR 链接：https://github.com/xxx/content-os/pull/42"
```

### 架构

```
Telegram -> Bot -> GitHub API (create file / trigger workflow)
                   │
                   ▼
                GitHub Actions (跑 agent pipeline)
                   │
                   ▼
                回调 Bot webhook -> Telegram 回复你
```

### 最小实现（伪代码）

`bot.py`：

```python
from telegram.ext import Application, MessageHandler
import httpx

app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

async def on_message(update, context):
    text = update.message.text
    slug = slugify(text[:40])
    date = today().strftime("%Y-%m-%d")
    path = f"inbox/{date}-{slug}.md"

    # 1. 写文件到 GitHub 仓库
    await github_commit(path, content=text)

    # 2. 触发 workflow（push 会自动触发；或 dispatch）
    await update.message.reply_text(f"✅ 已写入 {path}，pipeline 运行中。")

    # 3. 等 workflow 完成（由 GitHub webhook 回调另一个 handler 处理）

app.add_handler(MessageHandler(filters.TEXT, on_message))
app.run_polling()
```

Bot 本身可以托管在 Cloudflare Workers / Vercel / 一个 $5 VPS。

### 优点

- 丝滑（像和人聊天一样）
- 在路上可用（地铁、咖啡馆、谈业务间隙）
- 支持图片转文字（配合 OpenAI Whisper / Claude vision 的话）

### 代价

- 搭建成本：2-4 小时
- 依赖：一个小 bot server + 一个 GitHub app token

---

## 路径选择建议

| 场景 | 推荐路径 |
|---|---|
| 就你一个人、每月发 3-5 篇 | 路径 A（手机 Git） |
| 每周发 1+ 篇、想全自动 | 路径 B（GitHub Actions） |
| 经常在路上、不想开 App 切 Git | 路径 C（Telegram Bot） |

---

## 安全和成本

### 安全

- `ANTHROPIC_API_KEY` 只放 GitHub Secrets，**不要**提交到代码库
- Telegram Bot 要加 `authorized_users` 白名单，避免陌生人触发
- Bot 接收的消息只写 `inbox/`，不要让它直接改 `generated/` 或 `queue/`（只有 Actions 里的 agent 能写）

### 成本

- Claude API：一次跑一整条 pipeline 约消耗 $0.30-$1.00（取决于文章长度）
- GitHub Actions：公开仓库免费；私有仓库每月 2000 分钟免费，一次 pipeline 占 5-10 分钟
- Bot 托管：Cloudflare Workers 免费额度足够，或 $5/月 小 VPS

月成本预估（每月 8 篇）：Claude $3-8 + 基建 $0-5 = **< $15**。

---

## 不推荐的路径

### ❌ 完全不确认直接发

即使信任 AI，不在决策点 ② 看一眼 quality-report 就发布，风险太高：
- 数据可能错
- 语气可能偏
- 脱敏可能漏

永远保留 quality-report 的 review，就算 5 秒扫一眼也好。

### ❌ 多人共用一个 Bot

多作者共享会让 skill 的 reference（voice、受众、风格）没法稳定——系统会变成"什么味都有"。Content OS 的强项是养一个专属的作者工作室。

---

## 最小可行路径（今天就能开跑）

如果你想今晚就感受一次，推荐顺序：

1. **现在**：在 Kiro 里手动跑一次（不用任何自动化）——感受流程对不对你胃口
2. **本周**：跑 3-5 次，发现 skill 的 reference 缺了什么，补上
3. **下周**：接入路径 B 的 GitHub Actions（Telegram Bot 可以再晚一点）
4. **下下周**：路径 C 的 Bot（如果你真的需要"在外面触发"）

不要一上来就搭 Bot。先把 skills 养熟，再自动化。
