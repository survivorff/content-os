# 加一个新 Skill

当你发现现有 9 个 skill 覆盖不了某个新需求时，走这个流程。

---

## 什么时候应该加新 skill

**应该加：**

- 某一类输出反复需要（例如"帮我把博客改成英文版"）
- 某个流程步骤重复出现（例如"每次都要给我的文章生成配图"）
- 一个明显独立的角色（例如"SEO 优化师"、"图片生成员"）

**不应该加：**

- 只用一次的任务 → 直接让大脑现场做
- 对现有 skill 的小调整 → 改对应 skill 的 reference 就行
- 新平台 → 可能只是新增一个 xxx-editor skill（用同样的骨架）

---

## 流程

### 1. 设计 skill

在 issue 里（或心里）想清楚：

- **名字**：kebab-case，动宾结构（scout、polisher、editor、dispatcher）
- **一句话职责**：20 字以内
- **输入**：从哪些文件读？
- **输出**：写什么文件？
- **触发时机**：大脑什么时候应该调它？

如果这几个说不清楚，说明 skill 边界不清，再想想。

### 2. 创建目录

```
skills/<skill-name>/
├── SKILL.md
├── reference/
│   ├── <topic-1>.md
│   ├── <topic-2>.md
│   └── ...
└── examples/      （可选）
    └── ...
```

### 3. 写 SKILL.md

必须有 frontmatter：

```yaml
---
name: <skill-name>
description: <一句话职责，给 orchestrator 看的>
inputs:
  - <输入文件路径 pattern>
outputs:
  - <输出文件路径 pattern>
triggers:
  - <什么情况下被调>
---
```

正文结构：

```markdown
# <Skill 名>（中文或英文，保持一致）

<1-2 段，解释这个 skill 的定位和价值观>

## 协议

<步骤 1>
<步骤 2>
...

## 铁律

<必守的原则列表>

## 何时读 reference

<告诉自己哪些情况下要翻 reference，避免每次全读>

## 输出完成后

<完成的动作：更新 meta.json? 提示 Orchestrator?>
```

### 4. 写 reference 文件

渐进披露的精髓。SKILL.md 只装入口，细节放 reference：

- 每个 reference 文件聚焦**一个主题**
- 用 Markdown 小节组织
- 多给具体例子和对照表
- 避免长篇散文

命名约定：
- 规则类：`*-rules.md` / `*-criteria.md`
- 模板类：`*-patterns.md` / `*-templates.md`
- 格式类：`*-output-format.md` / `*-schema.md`

### 5. 更新 AGENTS.md

加两处：

1. **"可用 skills 清单"表格**里加一行
2. **"标准工作流"**里说明这个 skill 在哪里插入（或另起新工作流）

### 6. 测试

找一个真实的 inbox 走一遍，看大脑会不会正确调你的新 skill。

不会 → 看 `AGENTS.md` 的"决定要不要调 skill"判据是否写清楚了。

---

## 骨架模板

下面是一个 SKILL.md 的最小可用模板，复制到新 skill 里改改就能用：

```markdown
---
name: example-skill
description: 一句话说清楚这个 skill 做什么
inputs:
  - <input-path>
outputs:
  - <output-path>
triggers:
  - <trigger-1>
---

# Example Skill

<简短介绍。这个 skill 的定位、原则、价值观。>

---

## 协议

### 1. <第一步>

<具体做什么>

### 2. <第二步>

<具体做什么>

### 3. <输出>

<写到哪个文件，参考哪个格式>

---

## 铁律

1. <硬约束>
2. <硬约束>
3. <硬约束>

---

## 何时读 reference

- 第一次：通读 `reference/`
- 之后：
  - 需要 X → `reference/x.md`
  - 需要 Y → `reference/y.md`

---

## 输出完成后

- <要不要更新 meta.json>
- <要不要通知 Orchestrator>
- <下一个 skill 是什么>
```

---

## 常见的 skill 设计反模式

### ❌ 职责太宽

"content-writer" → 太宽，到底是博客还是 X Thread？

拆：blog-writer + x-thread-maker + ...

### ❌ 职责太窄

"h2-title-writer"（只负责写 H2 标题）→ 粒度过细

合：放到 outline-architect 或 blog-writer 里。

### ❌ 没有边界

"seo-optimizer" 但 SKILL.md 里又写了 hook 打磨 + 关键词密度 + frontmatter 检查

拆：seo-optimizer 只做 SEO，别的归对应 skill。

### ❌ 输入输出不明确

"quality-helper"：输入写了"各种文件"，输出写了"可能会改几个文件"

改：每个 skill 必须明确输入输出路径 pattern。

---

## 废弃一个 skill

如果某 skill 不再需要：

1. 从 AGENTS.md 的清单和工作流里删掉
2. 把 `skills/<name>/` 移到 `skills/_archive/<name>/`（保留历史）
3. 检查有没有其他 skill 的 reference 引用它（一般没有）
