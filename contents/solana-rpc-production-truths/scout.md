---
verdict: yes
slug: solana-rpc-production-truths
date_scouted: 2026-05-09
source_inbox: inbox/2026-05-09-example.md
---

# Scout Report

## 一句话判断

值得写。作者手里有三家 RPC provider 的对比数据 + 一次真实故障的时间线，同时"生产级 Solana RPC"这个切入角度在中英文社区都是空缺。

## 核心 takeaway

生产级 Solana RPC 的真实瓶颈不是"便宜"或"快"，是**尾延迟和多节点一致性**——这两点决定你的 dApp 是"跑得动 demo"还是"能扛 10 万 QPS"。

## 目标受众

- 主：西方加密开发者（Web3 Builder，EN）
- 次：中国技术转型者（Web2 → Web3）

## 独家视角

- 在交易所做 2 年 Solana 基建，单机 QPS 量级远超开源 benchmark
- 3 家 RPC provider 的真实成本 + 稳定性数据（有表）
- 凌晨 3 点的 RPC 故障时间线（已脱敏），代表"真实事故"而非"假设场景"

## 满足的判断条件

- [x] 独家视角（交易所级别 QPS 经历）
- [x] 硬数据（3 家 provider 对比 + 故障时间线）
- [x] 反常识结论（不是"便宜/快"，是"尾延迟/一致性"）
- [ ] 时效性（这个话题不急，随时可发）

4 条满足 3 条 → 强 yes。

## 候选标题

1. **Solana RPC in Production: What Benchmarks Don't Tell You**（数据/英文型）
2. **生产级 Solana RPC 的三个谎言：凌晨 3 点的故障教我的事**（反差 + 身份型）
3. **做了 2 年 Solana 基建，我终于看懂 RPC provider 的排名游戏**（身份型）

推荐：**#2**。理由：带时间锚点 + 反差 + 有故事感，中英文改写都好发挥。

## 建议的平台

- blog（默认 on，深度技术）
- x（英文版或中英 mix，国际技术受众）
- xiaohongshu（技术转型者受众有一部分覆盖，但需要大幅降维）
- ~~douyin~~（过于硬核，口播效果差，不建议）

## 风险 / 注意

- 故障时间线需要彻底脱敏（雇主 / 客户信息不能出现）
- 3 家 provider 的对比数据要标明测试时间和 region（RPC 性能时效性强）
- 代码片段需要是"示意版"，避开公司真实代码
- 推荐"#2"是中文标题，英文版需要另外起一个（blog-writer 交付时一起给）
