# Scout Report 输出格式

写到 `contents/<slug>/scout.md`。

---

## 模板

```markdown
---
verdict: yes | kill | maybe | need-more-info
slug: kebab-case-slug
date_scouted: YYYY-MM-DD
source_inbox: inbox/<file>.md
---

# Scout Report

## 一句话判断

<一句话解释 verdict>

## 核心 takeaway

<读者读完这篇应该记住的一句话；必须能独立成句、有信息量>

## 目标受众

- 主：<persona 名>
- 次：<persona 名，可省>

## 独家视角

<作者凭什么写这个；没有就直说"弱，建议 kill">

## 满足的判断条件

- [x] 独家视角
- [ ] 硬数据
- [x] 反常识结论
- [ ] 时效性

（至少 2 条打勾才应该是 `yes`）

## 候选标题

1. <数据型标题>
2. <反差型标题>
3. <身份型标题>

推荐：#<序号>，理由 <一句话>

## 建议的平台

- blog（默认）
- x
- (其他看情况)

## 风险 / 注意

- <比如"话题可能踩雷"、"证据不够硬"、"和之前 XX 篇重合">

---

<以下只在 verdict != yes 时填>

## 如果 verdict = kill

理由：<简短的 1-3 句>
作者能做什么：<是换角度还是彻底放弃>

## 如果 verdict = maybe

现在的问题：<简短>
建议的新角度：<1-2 个>

## 如果 verdict = need-more-info

需要作者补充：
1. <具体问题>
2. <具体问题>
3. <具体问题>
```

---

## 注意

- **不要偷懒写"嗯还不错可以写"**。一句话判断必须有明确的 yes/kill/maybe/need-more-info。
- **候选标题不要 3 个都很像**。至少 3 个不同角度（数据型 / 反差型 / 身份型 / 悬念型）。
- **风险 / 注意一定要填**。哪怕写"暂无风险"。这是让作者警觉的机制。
