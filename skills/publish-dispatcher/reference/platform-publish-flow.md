# 各平台发布流程

---

## Blog（自动）

### 条件

- `generated/<slug>/blog.md` 已通过 quality-gate
- 用户明确允许推送 blog 仓库

### 步骤

1. **复制文件**：
   ```
   generated/<slug>/blog.md → ../blog/src/data/blog/<slug>.md
   ```
   （假设 content-os 和 blog 在同一个 workspace 根下）

2. **检查 frontmatter**：
   - `pubDatetime` 有没有写？没有就用当前时间
   - `draft: false` 有没有设？确认非 draft

3. **git 操作**（仅在用户允许时）：
   ```bash
   cd ../blog
   git add src/data/blog/<slug>.md
   git commit -m "content: <slug>"
   git push origin main
   ```

4. **等部署**：
   - blog 是 Astro + Cloudflare / GitHub Pages（看 blog 仓库的 `.github/workflows/`）
   - 部署完成可以通过 `blog.frankfu.cloud/posts/<slug>` 验证

5. **更新 meta**：
   ```
   meta.json.published.blog = <实际上线时间>
   ```

### 失败处理

- git push 失败 → 回滚本地，告诉用户，保持 pending
- 部署失败 → 3 分钟后重查，仍失败给用户看 deploy log

---

## X Thread（自动 / 手动）

### 检查 X API credits

1. 看 `x-auto-poster/.env` 或同路径下 credits 文件
2. 或者调 `x-auto-poster/scripts/check-credits.py`（如果存在）

### 自动路径（有 credits）

1. **复制文件**：
   ```
   generated/<slug>/x-thread.md → x-auto-poster/threads/<slug>.md
   ```

2. **调发布脚本**：
   ```bash
   cd ../x-auto-poster
   python scripts/post-thread.py threads/<slug>.md
   ```

3. **记录 Thread ID**：发布脚本返回的 ID 存到 meta.json

4. **更新 meta**：
   ```
   meta.json.published.x-thread = <ISO 时间戳>
   meta.json.x_thread_id = <Thread ID>
   ```

### 手动路径（没 credits）

1. **打印到 terminal**：
   ```
   ⚠️ X API 无 credits，降级为手动。

   请做以下事：
   1. 打开 x.com
   2. 按顺序复制以下推文并发送：
      [推文 1 原文]
      [推文 2 原文]
      ...
   3. 发完回复 "x 发好了"，我会更新 meta.json
   ```

2. **等用户确认**：用户确认后才更新 `meta.json.published.x-thread = <确认时间>`

---

## 小红书（手动）

### 步骤

1. **打印提醒**：
   ```
   📱 小红书到点了。

   请做以下事：
   1. 打开小红书 App
   2. 新建图文帖
   3. 标题复制：[标题]
   4. 正文复制 generated/<slug>/xiaohongshu.md 的正文部分
   5. 标签：复制 generated/<slug>/xiaohongshu.md 末尾的"标签（发布时粘贴）"
   6. 图文建议看 generated/<slug>/xiaohongshu.md 的"图文建议"区
   7. 发布后回复 "xhs 发好了"，我会更新 meta.json
   ```

2. **等用户确认**：

3. **更新 meta**：
   ```
   meta.json.published.xiaohongshu = <确认时间>
   ```

---

## 抖音（手动）

### 步骤

1. **打印提醒**：
   ```
   🎥 抖音脚本就绪：generated/<slug>/douyin-script.md

   录制前再过一遍：
   - Hook 是不是前 3 秒
   - 视觉素材准备好了吗（Hook / 数据大字 / CTA）
   - 录制时长控制在 2-3 分钟

   录完、剪辑完、发布后回复 "抖音发好了"。
   ```

2. **等用户确认**：

3. **更新 meta**：
   ```
   meta.json.published.douyin = <确认时间>
   ```

---

## 跨平台对照

| 平台 | 自动化程度 | 关键依赖 |
|---|---|---|
| Blog | 高（全自动） | blog 仓库部署配置 |
| X Thread | 中（有 API 就全自动） | X API credits |
| 小红书 | 低（手动） | 无稳定 API |
| 抖音 | 低（需录制） | 录制 + 剪辑 |

---

## 发布失败的处理

对任何平台，失败时：

1. **不要重复触发**（避免多发）
2. **记录失败到 meta.json**：
   ```json
   "published": {
     "x-thread": {
       "status": "failed",
       "attempted_at": "...",
       "error": "API 401 Unauthorized"
     }
   }
   ```
3. **告诉用户**：具体错误 + 可能原因 + 下一步（重试 / 切手动 / 跳过）
