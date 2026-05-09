# 部署状态快照（2026-05-09）

## ✅ 跑通的链路

```
你 (Lark DM)
  ↓ Lark 开放平台 websocket
OpenClaw gateway v2026.3.3 @ 121.41.166.234:10234
  ↓ agent 加载 /home/admin/.openclaw/workspace/
  ↓ 读 AGENTS.md + 9 个 content-os skills 的 SKILL.md
  ↓ 按 pipeline 执行
  ↓ 读写 /home/admin/content-os/{inbox,contents,generated,queue}/
  ↓ 调用 DeepSeek V4 Pro
  ↓ chudian proxy (Anthropic-compatible)
  ↓ 返回生成内容
  ↓ git push 回 github.com/survivorff/content-os
  ↓ Lark 回复"跑完了"
```

## 已经配好的组件

| 组件 | 状态 | 位置 |
|---|---|---|
| OpenClaw Gateway | ✅ running | user systemd: `openclaw-gateway.service` |
| Lark 机器人 | ✅ WebSocket 已连 | `cli_a92d4c9c0f79de1a`，domain=lark |
| DeepSeek V4 Pro | ✅ 验证通过 | `chudian/deepseek-v4-pro` |
| content-os 仓库 | ✅ clone 到 VM | `/home/admin/content-os/` |
| 9 个 skills | ✅ 软链到 workspace | `/home/admin/.openclaw/workspace/skills/*` |
| AGENTS.md 集成 | ✅ 已追加内容 | `/home/admin/.openclaw/workspace/AGENTS.md` |
| GitHub push 权限 | ✅ GH_TOKEN 生效 | `~/.openclaw/.env` |
| 钉钉 | ✅ 已删除 | - |

## 关键参数

- **Gateway port**: 10234（⚠️ 当前绑 0.0.0.0）
- **Gateway token**: 存在 `openclaw.json.gateway.auth.token`
- **Agent model**: `chudian/deepseek-v4-pro`
- **Workspace**: `/home/admin/.openclaw/workspace/`
- **Skills dir**: `/home/admin/.openclaw/workspace/skills/`（含 9 个 content-os 软链 + OpenClaw 自带 13 个）

## 下一步可做的事（按优先级）

### 1. 必做：Lark 群里验证端到端 🔥

把机器人拉进一个 Lark 群（或者私聊），@机器人发：

```
@content-os 写一个想法：做 Web3 社区运营和做 Web2 的 3 个反常识，我做了半年有一手经验
```

观察：
- Lark 群里机器人是否在 10-20 秒内回"收到"
- `/home/admin/content-os/inbox/` 是否生成新文件
- `/home/admin/content-os/contents/<slug>/` 和 `generated/<slug>/` 是否产出
- GitHub 仓库是否收到 auto push
- Lark 群里是否收到"完成"回复

### 2. 安全加固（之前你说先放一放，但放太久不行）

- Gateway 改绑 127.0.0.1
- 重开 device auth
- 阿里云安全组只开 22
- 控制 UI 走 SSH 隧道访问

### 3. 监控脚本

写一个 health-check cron：
- OpenClaw 进程是否还在
- Lark websocket 是否断开
- DeepSeek 代理能否响应
- 失败时 Lark 发警告

### 4. Skills 调优

跑过几个真实想法后，观察 content-os 的 9 个 skill 在 DeepSeek V4 Pro 上产出质量如何：
- Hook 是不是够狠
- 声音统一吗
- 跨平台一致性检查会不会挑出问题

根据结果改对应 `skills/<name>/reference/*.md`，不动 runtime。

## 常用运维命令

```bash
# 查 gateway 状态
ssh root@121.41.166.234 'sudo -u admin XDG_RUNTIME_DIR=/run/user/1000 systemctl --user status openclaw-gateway'

# 查 gateway 实时日志
ssh root@121.41.166.234 'sudo -u admin XDG_RUNTIME_DIR=/run/user/1000 journalctl --user -u openclaw-gateway -f --no-pager'

# 重启
ssh root@121.41.166.234 'sudo -u admin XDG_RUNTIME_DIR=/run/user/1000 systemctl --user restart openclaw-gateway'

# 直接通过 gateway HTTP API 发消息（绕过 Lark）
TOKEN="e53db27038b48a987a7063c48c1d0be9"  # 在服务器 openclaw.json 里
ssh root@121.41.166.234 "curl -sS -X POST http://127.0.0.1:10234/v1/chat/completions \
  -H 'Authorization: Bearer $TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{\"model\":\"chudian/deepseek-v4-pro\",\"messages\":[{\"role\":\"user\",\"content\":\"hello\"}]}'"

# 查看 content-os 产物
ssh root@121.41.166.234 'ls -la /home/admin/content-os/contents/ /home/admin/content-os/generated/'

# 手动触发 pipeline（作为 fallback，你如果 Lark 暂时不方便用）
ssh root@121.41.166.234 "sudo -u admin bash -c 'cat > /home/admin/content-os/inbox/\$(date +%Y-%m-%d)-manual.md <<EOF
我的想法...
EOF'"
# 然后你在 Lark 里发"跑 inbox 最新的文件"，或者写个触发脚本
```

## 备份

- `openclaw.json.backup-20260509-163548` — 修改前的完整配置
- `.env.backup-20260509-163548` — 修改前的环境变量
- 位置：`/home/admin/.openclaw/`

## 已知风险点

1. **Lark App 类型警告**：启动日志有 `only available in self-build & Feishu app` 提示，但 WebSocket 连上了，看实际能否收消息才知道影响。
2. **Gateway 绑 0.0.0.0**：公网能连 10234。仅靠 token，不够。
3. **Controls UI 高危配置**：`dangerouslyDisableDeviceAuth=true` + `allowInsecureAuth=true`。
4. **两个 IM 密钥曾经暴露**：旧的飞书 appSecret 和钉钉 clientSecret 在之前的对话里出现过。现在已经用新 Lark 覆盖，钉钉已删，但你可能仍想到飞书平台停用那个旧 app。
