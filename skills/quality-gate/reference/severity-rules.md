# 严重程度规则

一个 checklist 项目没通过时怎么定级。

---

## ❌ Fail（必须改，不改不发）

- 合法性问题（八卦、攻击个人、歧视、泄密）
- 数据错误 / 来源编造
- 代码不能运行（标错为"示意"除外）
- 平台硬规则违反（X 字符超限、小红书贴外链、抖音超 3 分钟）
- Frontmatter 错误导致无法发布
- 术语误导（例如把 MEV 说成"抢跑"）

**处理**：平台 status = `rejected`，必须改后重审。

---

## ⚠️ Warn（应该改，但不致命）

- Hook 不够强（通过 3 秒测试但不是最优）
- 段落偏长（博客 6-7 行，小红书 4 句）
- 术语虽然有解释但不够通俗
- 标签数量偏多或偏少（但在合理范围）
- CTA 比较弱
- 字数轻微超标（±10%）
- 作者声音稍微飘（但没走失）

**处理**：记录 notes，如果某平台有 2+ warn 也要 reject。单个 warn → `approved_with_notes`。

---

## ✅ Pass

- 完全通过检查
- 或者有小瑕疵但不影响阅读体验

---

## 边界案例判定

### Case 1：博客数据没带来源

- 如果是作者一手经历（"我们交易所上个月..."）→ warn，建议加"（来自作者在 XX 公司期间）"
- 如果是行业数据（"Solana 2024 交易量"）→ fail，必须带来源链接

### Case 2：Hook 偏弱

- 3/9 到 4/9 的 hook → warn，建议 hook-polisher 再跑一次
- 低于 3/9 → fail，hook 必重写

### Case 3：术语没解释

- 高阶术语（MEV、Bonding Curve）小红书没解释 → fail
- 中阶术语（RPC）没解释 → warn
- 通用术语（API、SDK）技术博客没解释 → pass（技术博客受众能懂）

### Case 4：字数超标

- 博客 3200 字（目标 3000） → pass（10% 内）
- 博客 3500 字（目标 3000） → warn
- 博客 4500 字（目标 3000） → fail（50%，应拆系列）

- 小红书 850 字（目标 800）→ warn
- 小红书 1000 字（目标 800）→ fail

- X 单条 270 字 → warn
- X 单条 285 字 → fail（X 硬上限 280）

### Case 5：声音不统一

- 4 个平台 hook 气质一样（都像广告）→ fail，hook-polisher 必重跑
- 4 个平台 hook 有差异但某一个飘了 → warn

---

## 聚合判定

对每个平台：

| Fail 数 | Warn 数 | Status |
|---|---|---|
| 0 | 0 | approved |
| 0 | 1 | approved_with_notes |
| 0 | ≥ 2 | rejected |
| ≥ 1 | 任意 | rejected |

**warn 只在单平台内聚合，不跨平台**。
- 例：blog 0 warn + x-thread 2 warn → blog approved，x-thread rejected（各自独立）
- 不要把 "所有平台加起来 3 个 warn" 当一个整体指标。每个平台独立评判。

## 跨平台一致性（独立检查）

所有平台的 status 判定完后，**额外跑一次** cross-platform check：

对照 `contents/<slug>/outline.md` 里的 takeaway 和核心数据，检查每个 generated 文件：

- [ ] takeaway 一致（不能 blog 讲 A，小红书讲 B）
- [ ] 核心论点对齐（3 个论点在 4 个平台都出现，且顺序合理）
- [ ] 数据一致（blog 说 "P99 差 20 倍"，其他平台不能写 "差 10 倍"）
- [ ] 作者声音统一（都是第一人称 + 专业 + 有温度）
- [ ] 时间/地点细节统一（"2024 年 3 月凌晨 3 点" 不能在小红书变成 "某天晚上"）

任一不一致 → 加一条 `cross-platform-warn` 到 `meta.json`：

```json
"cross_platform_check": {
  "status": "inconsistent",
  "issues": [
    {
      "type": "data-mismatch",
      "field": "P99 差距",
      "blog_says": "20 倍",
      "xiaohongshu_says": "10 倍",
      "suggestion": "统一按 blog 的 20 倍"
    }
  ]
}
```

跨平台 inconsistent 时，**整个 pipeline 状态降为 approved_with_notes**，让作者决定要不要修。但不自动 reject（修复成本低，不值得回退整个流程）。

---

## 对作者的沟通

- **approved**：一句话"XX 平台过"
- **approved_with_notes**：列出 warn，但不阻塞发布
- **rejected**：**必须停下来**，列出所有问题 + 给出修复方案 + 等作者选择

绝不在 rejected 状态下偷偷推进。
