# Setup — 阶段 1：GitHub Actions 跑通 Pipeline

这是 MVP 的第一步。跑通这一步，你就能：

- 手动 push 一个 inbox 文件到 GitHub → Actions 自动跑完整条 pipeline → 产物 commit 回来
- 不需要 Bot，完全靠 git workflow

Bot（阶段 2）等这一步跑顺了再搭。

---

## 前置要求

- 仓库已经在 GitHub 上
- 你能对这个仓库 push 和改 Secrets
- Anthropic API Key（去 [console.anthropic.com](https://console.anthropic.com) 拿）

---

## 步骤

### 1. 往仓库配 Anthropic API Key

在 GitHub 仓库页面：

```
Settings → Secrets and variables → Actions → New repository secret
```

- **Name**: `ANTHROPIC_API_KEY`
- **Secret**: 粘贴你的 key（`sk-ant-...`）

点 `Add secret`。

### 2.（可选）配 Telegram 通知 Secrets

如果你想 pipeline 跑完收到 TG 通知（无 Bot 也能用 BotFather 给你的 token 单方面发消息）：

- `TELEGRAM_BOT_TOKEN`：BotFather 给的 token
- `TELEGRAM_CHAT_ID`：你自己的 TG user ID（`@userinfobot` 查）

**不配也可以**，跳过。

### 3. 验证 workflow 文件在仓库里

确认这几个文件已经被 commit：

- `.github/workflows/run-agent.yml`
- `scripts/run-pipeline.mjs`
- `package.json`

### 4. 推个 dummy inbox 触发 Actions

```bash
cd content-os

# 用示例 inbox（注意：如果你已经 commit 过 2026-05-09-example.md，会被 Actions 识别为"已有"不重跑）
# 建一个新的触发一下
cat > inbox/$(date +%Y-%m-%d)-test.md <<'EOF'
今天 debug 发现 Solana RPC 真的是一堆坑。
getProgramAccounts 慢得离谱。
想写一篇生产环境踩过的 Solana RPC 坑。
独特视角：交易所级别的高并发经历。
EOF

git add inbox/$(date +%Y-%m-%d)-test.md
git commit -m "test: first pipeline trigger"
git push
```

### 5. 看 Actions 运行

仓库页面 → `Actions` tab → 找最新的 `content-os agent` 运行。

**预期日志顺序**：

```
Checkout
Detect inbox files to process     # 输出: inbox/2026-05-09-test.md
Setup Node
Install Claude Agent SDK
Run agent pipeline                # 这里 10-15 分钟
  --- turn 1 ---
  [tool] read_file skills/topic-scout/SKILL.md
  [tool] write_file contents/.../scout.md
  ...
  ✅ Pipeline finished: ...
Commit outputs
Notify Telegram (optional)
```

### 6. 跑完后的仓库

拉一下：

```bash
git pull

# 应该多出：
# contents/<slug>/scout.md
# contents/<slug>/outline.md
# contents/<slug>/meta.json
# contents/<slug>/quality-report.md
# generated/<slug>/blog.md
# generated/<slug>/x-thread.md
# generated/<slug>/xiaohongshu.md
# queue/schedule.json 更新
```

---

## 成本确认

- 跑一次完整 pipeline：$0.3 - $1.0（看想法长度和论点数）
- Actions 免费额度：每月 2000 分钟（私有仓库），一次 pipeline 5-10 分钟
- 加起来：月 8 篇 < $10

---

## 常见失败

### ❌ Actions 报 "ANTHROPIC_API_KEY is not set"

Secret 没配。回到步骤 1。

### ❌ Claude API 401 / quota exceeded

- Key 失效 → 重生成
- 账户余额为 0 → Anthropic console 充值

### ❌ Agent 跑到一半断开

- 可能是某个 skill 的 SKILL.md 格式问题
- 看 Actions 日志最后一个 `[tool]` 调用，手动跑一遍那个 skill 看错在哪
- 本地调试：`ANTHROPIC_API_KEY=sk-ant-... npm run pipeline:example`

### ❌ Commit 被 GitHub 拒绝

- 仓库可能开了 branch protection
- 临时解决：允许 bot account push
- 或者改 workflow 用 `create pull request` 代替直接 push

### ❌ 产出质量不好

- 这是 prompt/skill 问题，不是 infra 问题
- 修对应 `skills/<name>/reference/*.md`
- 下次跑就会好

---

## 本地调试（不经过 Actions）

开发期可以本地跑 pipeline：

```bash
cd content-os
npm install
export ANTHROPIC_API_KEY=sk-ant-xxx
node scripts/run-pipeline.mjs inbox/2026-05-09-example.md
```

日志直接在 terminal 看。产物会写到本地 `contents/` 和 `generated/`。验证 OK 再 push。

---

## 下一步

- 阶段 1 跑稳定（3-5 次不出错）→ 搭阶段 2（Telegram Bot 中转）
- 看 `docs/setup-stage2-bot.md`（跑顺后我再写）

---

## 何时应该停下来不要往下走

如果阶段 1 跑 3 次有 2 次需要你手动 debug / 重跑，**不要急着加 Bot**。

先稳定 skill/workflow/prompt 层面：

- 哪个 skill 老跑不稳 → 改它的 reference/*.md
- AGENTS.md 里是不是漏了某个决策
- 产出质量反复不达标 → 改 voice.md / style 规则

**infra 只解决"手速慢"的问题**，不解决"内容差"。内容层面先稳定，再加自动化。
