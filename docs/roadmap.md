# Roadmap

---

## Phase 0: 设计阶段（✅ 已完成）

- [x] 项目结构
- [x] 源文件格式（templates/）
- [x] 各平台的 style guide（steering/）
- [x] 工作流文档（docs/）

**产出：** 完整的设计文档，但没有任何自动化。

---

## Phase 1: 手动工作流（🚧 进行中）

这个阶段还没有自动化，但所有**工作流规范**都定好了。

### 你的流程

1. 写源文件 `contents/YYYY-MM-DD-slug.md`
2. 手动 review 内容和发布时间
3. 手动复制正文到博客（或同步到 blog 仓库）
4. 手动按 `steering/` 指南改写出 X Thread，发到 X（或用 x-auto-poster）
5. 手动按 `steering/` 指南改写出小红书版本，发
6. 手动按 `steering/` 指南改写抖音脚本

### 手动阶段的价值

- **建立内容库**：积累 10+ 篇源文件
- **验证 steering 指南**：风格准则是否能指导改写
- **形成节奏**：发现你能承受什么样的发布频率

---

## Phase 2: 自动生成（规划中）

用 LLM 自动从源文件生成各平台版本。

### 要做的事

- [ ] `lib/generate.py`：入口脚本
- [ ] `lib/generators/blog.py`：博客生成器（基本就是复制+改 frontmatter）
- [ ] `lib/generators/x_thread.py`：调用 LLM 按 `steering/x-thread-style.md` 改写
- [ ] `lib/generators/xiaohongshu.py`：类似
- [ ] `lib/generators/douyin.py`：类似
- [ ] GitHub Actions：push 源文件后自动生成

### 验收标准

- 给任意一个源文件，自动生成 4 个平台的版本
- 生成质量高到 **80% 的情况不用改**（剩下 20% 手动调）
- 人的精力从"改写 4 次"变成"把关 1 次"

---

## Phase 3: 自动发布（规划中）

生成的内容到时间自动发布到对应平台。

### 博客

- 从 `generated/*/blog.md` 同步到 blog 仓库的 `src/data/blog/`
- 推送触发 blog 部署
- **难度：低**（已有 blog 部署系统）

### X

- 复用 `x-auto-poster` 的逻辑
- 但源头从 `x-auto-poster/threads/` 变成 `content-os/generated/*/x-thread.md`
- **难度：中**（需要整合两个系统）
- **前提：** X API 有 credits

### 小红书 / 抖音

坏消息：**没有稳定的开放 API**。

选项：
- 半自动：生成内容 + 邮件/通知你去发布
- 用第三方工具（Metricool、Blotato）——但中国平台支持不好
- 写浏览器自动化（Playwright）——脆弱，容易坏
- 手动发（接受现实）

**决定：初期手动。** 等找到靠谱的方案再自动化。

---

## Phase 4: 智能化（远期）

### 选题建议

用 LLM 分析：
- 近期热点话题
- 你已写过的内容缺口
- 读者评论和问题

自动生成 5-10 个选题建议，你挑着写。

### 发布效果追踪

追踪每个平台每篇内容的：
- 阅读量、点赞、转发、评论
- 点击链接率（从各平台回到博客）
- 新关注增长

生成月报，指导后续方向。

### 内容复用

- 旧文章自动改写成新 Thread（每月自动"翻旧账"）
- 多篇文章合并成系列
- 识别"流量好的"选题，衍生更多同类内容

---

## 技术栈决策

| 方面 | 选择 | 理由 |
|------|------|------|
| 脚本语言 | Python | LLM 生态最成熟 |
| LLM | Claude（或 ChatGPT） | 长文本能力 + 中文 |
| 存储 | Git 仓库 | 版本控制 + 透明 |
| 自动化 | GitHub Actions | 免费 + 集成度高 |
| 通知 | Telegram Bot | 简单且可靠 |

---

## 非目标（不做的事）

- ❌ 不做 UI（Git + Markdown 就是最好的 UI）
- ❌ 不做多账号管理（一个人一个账号）
- ❌ 不做商业化（这是个人工具）
- ❌ 不做定制化到每个用户（只服务 survivorff）
- ❌ 不追求"完美"的自动化（80% 自动 + 20% 人工把关）
