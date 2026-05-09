# Setup — OpenClaw + content-os + Lark + DeepSeek

把你在阿里云杭州 VM (121.41.166.234) 已经装好的 OpenClaw 升级成一个"私人内容团队"：

- **前端**：Lark (Larksuite) 机器人，你发消息给它就启动
- **大脑**：OpenClaw 2026.3.2 agent
- **模型**：DeepSeek V4 Pro（通过 `llm.chudian.site` Anthropic 兼容代理）
- **技能**：content-os 的 9 个 skill，挂载到 OpenClaw 的 skill 目录
- **仓库**：clone 在 VM 的 `/home/admin/content-os/`

---

## 0. 前提 / 你已经做的

- VM 能 SSH：`ssh root@121.41.166.234`
- OpenClaw 2026.3.2 装在 `/opt/openclaw`，数据在 `/home/admin/.openclaw/`
- `openclaw-gateway.service` 跑在 admin 用户的 user-level systemd
- 已有 `.env` 里的 `GH_TOKEN`、`TAVILY_API_KEY`
- 已有飞书配置（要换成 Lark + 换密钥）、钉钉配置（要换密钥）

---

## 1. Lark 开放平台准备（你来做，5 分钟）

> 为什么：OpenClaw 的 `feishu` 扩展同时支持飞书和 Lark，只差一个 `domain` 字段。但密钥在两边是**隔离的**，要在 Lark 上重新建个 app。

### 1.1 在 Lark Developer Console 创建 App

1. 打开 https://open.larksuite.com/app
2. Create Custom App
   - Name: `content-os`
   - Description: `my personal content workstation`
3. 记下 App 的：
   - **App ID**（形如 `cli_xxxxxxxxxxxxxx`）
   - **App Secret**

### 1.2 配 App 权限 & 事件订阅

1. 左侧 Permissions & Scopes → 勾选最小集：
   - `im:message`
   - `im:message.group_at_msg`
   - `im:message.p2p_msg`
   - `im:chat`
2. Event Subscriptions：
   - 暂不配回调 URL（先用 long-polling，后续再切换 webhook）
   - 勾选事件：`Receive message v2.0`
3. Release → 创建版本 → 发布给自己

### 1.3 发送给我

你执行完后，告诉我这 2 个值：

```
LARK_APP_ID=cli_xxxxxxxx
LARK_APP_SECRET=xxxxx
```

> 我会用它们覆盖 `openclaw.json` 里原来的飞书配置。

---

## 2. 钉钉（如果你还用）

你说要重置 IM。钉钉的 client secret 已经在上次对话里暴露。**你现在就到钉钉开放平台把旧的 secret 作废，不重新生成也行**（你不再用钉钉就算了，只保留 Lark）。

告诉我：
- 钉钉还要不要？如果不要，我在配置里删掉。
- 如果要，到 [open.dingtalk.com](https://open.dingtalk.com) 重置 secret，把新值给我。

---

## 3. 模型配置（我来改，等你确认）

你给的配置我会翻译成 OpenClaw 的 provider 格式：

```json
"chudian": {
  "baseUrl": "https://llm.chudian.site",
  "apiKey": "sk-ag-973925f109b3f722072904a1393433f9",
  "api": "anthropic-messages",
  "models": [
    {
      "id": "deepseek-v4-pro",
      "name": "DeepSeek V4 Pro",
      "api": "anthropic-messages",
      "reasoning": true,
      "input": ["text"],
      "cost": { "input": 0, "output": 0, "cacheRead": 0, "cacheWrite": 0 },
      "contextWindow": 128000,
      "maxTokens": 8192
    }
  ]
}
```

默认 agent 改成 `chudian/deepseek-v4-pro`。

⚠️ **注意**：你给的 key 现在在这份文档里是明文。等配完我会在服务器上重置为从 `.env` 引用。

---

## 4. content-os 挂载到 VM

在 VM 上 clone 仓库并把 skills 挂给 OpenClaw。

### 4.1 Clone

```bash
# 在 VM 上
sudo -u admin -i
cd /home/admin
git clone https://github.com/survivorff/content-os.git
cd content-os
```

### 4.2 让 OpenClaw agent 能看到 content-os 的 skills

OpenClaw 的 skill 目录：`/home/admin/.openclaw/extensions/*/skills/` 或 `/home/admin/.openclaw/agents/<agent>/skills/`。

方案：创建一个 content-os 专属的 agent，skill 目录软链到仓库里。

```bash
# 作为 admin
AGENT_DIR=/home/admin/.openclaw/agents/content-os
mkdir -p "$AGENT_DIR"
ln -s /home/admin/content-os/skills "$AGENT_DIR/skills"
cp /home/admin/content-os/AGENTS.md "$AGENT_DIR/AGENTS.md"
```

这样 OpenClaw 启动时会读到 AGENTS.md 当 boot 指令，读到所有 SKILL.md 自动注册成工具。

### 4.3 配 git 身份（让 agent 能 commit/push 回仓库）

```bash
# 作为 admin
cd /home/admin/content-os
git config user.name  "content-os-bot"
git config user.email "bot@users.noreply.github.com"

# 确认 GH_TOKEN 能 push (/home/admin/.openclaw/.env 里已有)
git remote set-url origin "https://$(grep GH_TOKEN /home/admin/.openclaw/.env | cut -d= -f2)@github.com/survivorff/content-os.git"

# 验证
git fetch
```

---

## 5. 我会做的机器侧改动

以下操作我会通过 SSH 执行（每一步都会先告诉你，敏感值从 `.env` 读）：

1. **升级 OpenClaw 到 2026.3.3**（次要小版本，看 changelog 决定）
2. **重写 `openclaw.json`**：
   - `models.providers` 加 chudian（DeepSeek）
   - `agents.defaults.model.primary` = `chudian/deepseek-v4-pro`
   - `channels.feishu.accounts.default.domain` = `lark`
   - `channels.feishu.accounts.default.appId/appSecret` = 你新给的
   - 钉钉段：要么删，要么换新 secret
3. **重启 gateway**：
   ```bash
   systemctl --user restart openclaw-gateway
   journalctl --user -u openclaw-gateway -f
   ```

---

## 6. 首次端到端验证

配完后，你在 Lark 的机器人对话窗口发：

```
@content-os 帮我测试一下，写一个关于"做后端的人为什么值得学一点 Solana"的想法
```

预期：

1. Bot 10 秒内回：`✅ 已收到，创建 inbox/2026-05-09-backend-solana.md，topic-scout 正在跑...`
2. 1-2 分钟后：`📋 Scout 结果: yes. Takeaway: ...`
3. 2-5 分钟后：`📝 Outline 就绪，我已自动批准继续（CI 模式）`
4. 10-15 分钟：`✅ 全部跑完，commit: https://github.com/survivorff/content-os/commit/xxx`

---

## 7. Fallback：如果 Lark 不通

退路是**不经过 OpenClaw 前端，直接 SSH 触发**：

```bash
# 在你自己电脑上
ssh root@121.41.166.234 'sudo -u admin bash -c "cd /home/admin/content-os && cat > inbox/$(date +%Y-%m-%d)-test.md <<EOF
我的想法写在这里
EOF
# 下面这一步等我做好触发脚本
/home/admin/.openclaw/scripts/content-os-run.sh inbox/2026-05-09-test.md"'
```

---

## 我现在需要你给我的

按顺序回复这 4 项：

1. **Lark App ID + App Secret**（按 Step 1 创建）
2. **钉钉保留还是删掉**？（保留的话给我新 secret）
3. **是否同意我升级 OpenClaw 2026.3.2 → 2026.3.3**？（可以先不升）
4. **模型 key `sk-ag-973925...` 是共享的还是你独占**？如果是你独占，暴露就意味着别人能花你的额度——需要和 chudian 那边作废/重生一次。

给齐 1 和 4 我就能开始动手。2 和 3 可以等。
