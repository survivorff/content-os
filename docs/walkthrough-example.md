# 实战走读：从一句话到多平台成品

这是一个已经跑完的样例。读完这份文档 + 翻一遍对应文件，你就能感受 Content OS 的节奏。

输入：一个 Web3 后端工程师在 debug Solana RPC 时冒出的想法
产出：博客长文 + X Thread 10 条 + 小红书图文 + 排期队列
人工介入：**2 次**（outline 确认 + quality-report 确认）

---

## Step 0：扔想法

**文件**：[`inbox/2026-05-09-example.md`](../inbox/2026-05-09-example.md)

作者写了 14 行文字：
- 一句动机："今天 debug 发现 Solana RPC 全是坑"
- 独家视角："交易所 2 年基建经验 / 三家 provider 对比数据 / 凌晨 3 点故障复盘"
- 初步的核心观点："生产级 RPC 真正看的不是快和便宜"

没有 frontmatter（除了默认字段），没有标题，没有排期。就是原料。

**耗时**：3 分钟。

---

## Step 1：Topic Scout — 值不值得写

**产物**：[`contents/solana-rpc-production-truths/scout.md`](../contents/solana-rpc-production-truths/scout.md)

Skill 回答 5 件事：

| 问题 | 结论 |
|---|---|
| 值不值得写 | `yes`（4 条判断标准打勾 3 条） |
| 受众 | 主：Web3 Builder（EN）；次：Web2→Web3 转型者 |
| 核心 takeaway | 瓶颈不是快或便宜，是尾延迟和多节点一致性 |
| 平台 | blog ✅ / x ✅ / 小红书 ✅ / 抖音 ❌（过于硬核） |
| 候选标题 | 3 个不同角度，推荐 "生产级 Solana RPC 的三个谎言..." |

**一个关键决策**：抖音被 kill 掉。原因写在 scout.md 的"建议的平台"里。很多作者会忍不住全平台发，这一步帮作者止损。

---

## 决策点 ①：Outline 确认

**产物**：[`contents/solana-rpc-production-truths/outline.md`](../contents/solana-rpc-production-truths/outline.md)

Skill 给出：

- 结构模式：`contrarian`（反常识型）
- 3 个 hook 候选（数据钩 / 故事钩 / 反差钩），推荐故事钩
- 3 个论点：P50 是谎言 → 单 RPC 必炸 → `getProgramAccounts` 是炸弹
- 每个论点带 2-3 条具体支撑
- takeaway + CTA
- 风险提示（比如故障数据需要脱敏）

**这是作者必须停下来看的一步**。批准了，骨架就定了，后面写手不会再偏。

假设作者回复"OK"。pipeline 继续。

---

## Step 2：Blog Writer — 写源版本

**产物**：[`generated/solana-rpc-production-truths/blog.md`](../generated/solana-rpc-production-truths/blog.md)

~2850 中文字的博客长文。按 outline 三个论点展开，每个论点带：
- 具体数据表（三家 provider 的 P50/P99/P999）
- 代码示例（Rust 仲裁函数）
- 真实案例（"上线第 2 周 QPS 到 5k 就 OOM 三次"）
- 亲身经历的语气（"我们给三家 provider 做了同一组压测"）

Frontmatter 按 blog 仓库的 Astro schema 填好，可以直接 copy 到 `blog/src/data/blog/` 发布。

---

## Step 3：平台改写（并行）

### X Thread
**产物**：[`generated/solana-rpc-production-truths/x-thread.md`](../generated/solana-rpc-production-truths/x-thread.md)

10 条推文：
- 1/ 故事钩 + 🧵
- 2/ 铺垫（结论预告 bullet list）
- 3-4/ 论点 1 + 证据（数据表 + 影响解释）
- 5-7/ 论点 2 + 证据（架构图 + 陷阱 + 仲裁规则）
- 8-9/ 论点 3 + 证据（问题 + 替代方案）
- 10/ CTA（博客链接 + 互动问 + 下期预告）

每条都带字符数校验表。最高 238 字，低于 260 的安全线。

### 小红书
**产物**：[`generated/solana-rpc-production-truths/xiaohongshu.md`](../generated/solana-rpc-production-truths/xiaohongshu.md)

680 字，完全重构：
- 标题重写为数字 + 身份型："三个谎言，我用半年踩出来的"
- 开场身份锚定（💼 emoji）+ 故事钩（凌晨 3 点）
- 3 个 emoji 小标题（⚠️ 🔥 💣）
- 所有技术术语翻译或大幅降维（P99 → "最差速度"、fork → "暂时没同步的节点"）
- 去掉了所有代码
- 结尾 CTA 走"主页 + 评论区"路线
- 8 个标签 + 图文建议（封面 + 3 张可选正文图）

---

## Step 4：Hook Polisher

对每个平台的开头单独打磨。Meta.json 里记录结果：

- blog hook: 故事钩保留（已够强，pass）
- x-thread 1/: 微调字数（有一处从"罪魁祸首不是合约 bug"改成"罪魁祸首不是合约"节省 2 字）
- 小红书标题: 打磨后"...我用半年踩出来的"（原版本太长）

这一 skill 的价值：4 个平台的 hook **气质不同**，不像同一个 AI 写的。

---

## 决策点 ②：Quality Gate

**产物**：[`contents/solana-rpc-production-truths/quality-report.md`](../contents/solana-rpc-production-truths/quality-report.md)

按平台过 checklist：
- Blog: ✅ approved（0 warn）
- X Thread: ⚠️ approved_with_notes（第 3 条接近字符上限）
- 小红书: ⚠️ approved_with_notes（fork 的翻译可以更清楚）

2 个 warn 不阻塞发布。作者看完报告后的选择：
- A) 让我改（调回对应 skill 修复）
- B) 回源改
- C) 直接放行

本例选 **C 直接放行**，warn 记录在 `meta.json` 的 `quality_gate` 字段里备查。

---

## Step 5：Publish Dispatcher — 排期

**产物**：[`queue/schedule.json`](../queue/schedule.json)

按默认排期规则（`skills/publish-dispatcher/reference/default-schedule.md`）：

| 平台 | 时间 | 模式 | 理由 |
|---|---|---|---|
| Blog | 2026-05-12 10:00 (+08) | auto | D-Day（周二）10 点，工作日早上推 RSS |
| X Thread | 2026-05-12 20:00 (+08) | manual | 当晚 20 点；X API 暂无 credits，降级手动 |
| 小红书 | 2026-05-13 12:00 (+08) | manual | 次日中午午休时段 |

> D-Day 避开了周末（今天是周六，默认排到下周二）。

scheduled_at 都是未来，所以目前都是 `pending` 状态，等 Actions 或手动触发到时间再执行。

---

## 最后的调度总结（大脑给作者的简报）

```
✅ 入口想法：inbox/2026-05-09-example.md
✅ Scout verdict: yes
✅ Outline 已批准
✅ 3 个平台版本生成
✅ Hook 打磨完
⚠️ Quality: 3/3 approved（2 个 warn 不阻塞）
✅ 已排期：
   - Blog: 2026-05-12 10:00 (auto)
   - X Thread: 2026-05-12 20:00 (manual, 无 API credits)
   - 小红书: 2026-05-13 12:00 (manual)

作者待办：
- 2026-05-12 20:00: 手动复制 X Thread 10 条
- 2026-05-13 12:00: 手动发布小红书（附封面图）
```

**作者全程介入 2 次**：outline 确认 + quality-report 确认。一次大概 5-10 分钟。

---

## 耗时对比

| 流程 | 手工写作 | Content OS |
|---|---|---|
| 出选题 | 30 分钟纠结 | 3 分钟写 inbox |
| 列骨架 | 1 小时反复调 | 5 分钟看 outline |
| 写博客 | 4-5 小时 | 跟着 AI 跑 + review |
| 改 X Thread | 1-2 小时 | 自动生成 + 微调 |
| 改小红书 | 1-2 小时 | 自动生成 + 微调 |
| 排期发布 | 半小时拼日历 | 0 分钟（自动） |
| **总计** | **8-10 小时** | **30-60 分钟** |

这就是"一个想法 → 一套成品"的价值。
