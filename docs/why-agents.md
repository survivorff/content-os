# 为什么用 Agent Skills 而不是脚本

这个决定的背后思考，记录一下。

---

## 旧版（脚本流水线）

Content OS 最早的设计是：

```
一个 Markdown 源文件
    │
    ▼
lib/generate.py
    │
    ▼ 调用
lib/generators/blog.py
lib/generators/x_thread.py
lib/generators/xiaohongshu.py
lib/generators/douyin.py
    │
    ▼ 各自调 LLM，用 steering/ 下的 prompt
    ▼
generated/*.md
```

一段时间内跑得起来。问题逐渐暴露：

1. **流程写死在代码里**。想换个顺序、想加个"hook 打磨"步骤，要改代码。
2. **角色混在一起**。generate 脚本又当写手又当编辑又当审稿，一个文件几百行。
3. **调 prompt 要改代码**。想让 X Thread 更激进一点，改 Python。
4. **新平台加起来成本高**。每加一个平台要新建 generator、改 generate、写 prompt。
5. **LLM 其实可以自己编排**。让模型当调度员比写死规则更灵活。

---

## 新版（Agent Skills）

借鉴 Anthropic 的 Agent Skills 思路：

```
用户想法
    │
    ▼
Orchestrator（LLM 本体，读 AGENTS.md）
    │
    ▼ 按需读取、按需调用
skills/topic-scout/SKILL.md
skills/outline-architect/SKILL.md
skills/blog-writer/SKILL.md
...
    │
    ▼ 每个 skill 是独立的"角色 + 手册"
    ▼ 细节渐进披露（SKILL.md → reference/*.md）
```

---

## 核心设计选择

### 1. 用 Markdown 而不是代码

每个 skill 是一份 SKILL.md + 一堆 reference。

**好处：**
- 作者能读懂每个 skill
- 改规则 = 改文档 = 下次运行生效
- 版本控制友好（git diff 清晰）

**代价：**
- 没有类型系统和 linter
- 依赖 LLM 理解和遵守规则

---

### 2. SKILL.md 是入口，reference 是细节（渐进披露）

SKILL.md 只装：
- 职责
- 协议步骤
- 铁律
- 什么时候读哪些 reference

reference/ 装具体模板、对照表、例子。

**好处：**
- 每次调 skill，LLM 只需要少量 token 加载 SKILL.md
- 真正需要细节时才按需拉
- context window 不被污染

**代价：**
- 写 skill 时要想清楚哪些放 SKILL.md、哪些放 reference
- 作者第一次读有点 confusing

---

### 3. Orchestrator 是"大脑"（AGENTS.md）

大脑不硬编码，而是读 AGENTS.md 学习怎么做。

**好处：**
- 改工作流 = 改一个 Markdown
- 能针对不同情况自适应（"已有博客只要 X Thread"这种路径）
- 用户可以通过自然语言和大脑协商

**代价：**
- 大脑可能跑偏（缓解：在 AGENTS.md 里加强约束）
- 决策点必须显式写出来，不然大脑可能自作主张（缓解：决策点 ①/② 强制停）

---

### 4. 每个 skill 有明确输入 / 输出 / 触发

在 SKILL.md 的 frontmatter 写清：

```yaml
inputs:
  - generated/<slug>/blog.md
outputs:
  - generated/<slug>/x-thread.md
triggers:
  - blog.md 完成后
```

**好处：**
- 调度时清晰知道什么时候能调谁
- 加新 skill 时知道往哪里插
- 作者能看懂流程

**代价：**
- 得认真设计，不能随手就加一个"杂活 skill"
- 需要额外的 docs/how-to-add-a-skill.md 保持标准

---

## 跟 Anthropic Agent Skills 的区别

**相同：**
- SKILL.md 作为入口
- 渐进披露的 reference
- name / description / frontmatter 约定

**不同：**
- 没有 script 目录（所有逻辑用 Markdown + LLM 推理）
- 没有官方的 skill 安装机制（直接在这个仓库里组织）
- 更强调 Orchestrator 手册（AGENTS.md）

这个系统是"借用形态 + 适配个人工作流"。不追求通用。

---

## 什么时候旧版会更好

不是所有场景都适合 agent skills。Skills 适合：

- 流程有**步骤**但步骤间需要**判断**
- 每步都是"一段文字→另一段文字"
- 你愿意让 LLM 在流程里**做决策**

如果你要：

- 把 100 篇文章批量生成 X Thread（纯批处理）
- 精准控制每个字段的字符数并报错
- 不依赖 LLM，用规则硬跑

那写脚本更好。Skills 的强项是**有判断 + 能演化**，不是**硬规则 + 批量**。

---

## 如何评估这个架构的效果

每跑完一次，问自己：

1. **我花了多少时间在这条内容上？**（目标：从 3 小时 → 30 分钟）
2. **有几次我干预了大脑？**（目标：2 次，outline 和 quality-gate 的决策点）
3. **产出质量比我手写的差多少？**（目标：80% 达到我的水平）
4. **有没有哪一步我觉得不对劲但说不清？**（那就是 skill 缺 reference 的信号）

如果 1 还高、2 超过 3 次、3 低于 60%、4 反复出现：

**改 skill 的 reference**，不是每次现场喷 prompt。

这就是 Agent Skills 的价值：系统随着使用**稳定在进化**，而不是每次重新调 prompt。
