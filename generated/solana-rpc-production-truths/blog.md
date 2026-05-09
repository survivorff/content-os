---
author: Frank Fu
pubDatetime: 2026-05-10T10:00:00.000Z
modDatetime: 2026-05-10T10:00:00.000Z
title: "生产级 Solana RPC 的三个谎言：凌晨 3 点的故障教我的事"
slug: solana-rpc-production-truths
featured: false
draft: false
tags:
  - solana
  - rpc
  - backend
  - engineering
description: |
  做了 2 年 Solana 基建，被凌晨 3 点的一次 RPC 故障教做人。本文拆解三个生产级 RPC 的常见认知陷阱：P50 延迟是虚假指标、单 RPC 必然爆炸、getProgramAccounts 是定时炸弹。
---

> 本文基于 2024 年 Q1-Q3 的压测和故障数据，RPC provider 性能时效性强，选型时请以最新 benchmark 为准。

## 开场

2024 年 3 月凌晨 3 点，我们交易所的撮合队列堆了 18 万笔请求。

罪魁祸首不是合约 bug，不是数据库瓶颈。是一个看起来人畜无害的 Solana RPC 调用。

事后复盘花了 4 个小时。结论让整个团队沉默了很久：**我们之前对"生产级 RPC"的理解，几乎全错**。

后来我花了大半年重做 RPC 这层基础设施。今天把三个最反常识的教训写下来，给做 Solana dApp 后端的同行。

---

## 谎言 1：P50 延迟是"生产级性能"

做选型的时候，大部分 provider 的宣传页都给 P50 延迟。"我们的 P50 只有 38ms。"

这个数字本身没错。骗人的地方在于：**P50 在生产环境完全没用**。

我们给三家 provider 做了同一组压测（region: ap-northeast-1，QPS 3k，持续 1 小时）：

| Provider | P50 | P99 | P999 |
|---|---|---|---|
| A | 41ms | 180ms | 1.2s |
| B | 39ms | 850ms | 12s |
| C | 43ms | 2.1s | 超时 |

白天看 P50，三家都在 40ms 左右，几乎没差。

凌晨流量尖峰那 10 分钟，P99 差了 **20 倍以上**。

为什么这个差距如此重要？因为撮合链路里，一笔请求 P99 卡 2 秒，就意味着这个用户的订单会排在后面所有订单之前——但**队列本身也停了 2 秒**。2 秒在 Web2 不算什么，在撮合引擎里就是 18 万笔请求堆积。

教训很直白：**选 provider 不要看 P50。看 P99，然后压测到 P999**。

---

## 谎言 2：选一家"最好的" provider 就够了

选完 P99 最好的 provider，我们以为万事大吉。

三个月后，这家 provider 在一个周日凌晨宕机 4 小时。整条链路被迫降级。

教训：**任何一家 RPC provider，都会挂**。问题不是"会不会"，是"挂的时候你有没有第二条腿"。

生产级 RPC 的真实架构，至少是这样：

```
App → [RPC Router] ─┬─→ Provider A (primary)
                    ├─→ Provider B (secondary)
                    └─→ Provider C (tiebreaker / read-only)
```

Router 做三件事：
1. **健康检查**：每 5 秒 ping 每个 provider，连续 3 次超时就摘下
2. **一致性仲裁**：关键读（比如拿 slot 号、查余额）至少两家返回一致才用
3. **分流**：写（如果这个 dApp 有写）走 primary，读可以分散

陷阱在第 2 点。我们早期版本只做"取最快"，结果拿到 fork 节点的陈旧数据——这在 Solana 上每天都会发生几次。用户看到的账户余额比链上真实状态落后 5-10 个 slot，然后下一个交易就因为"余额不足"失败。

一致性校验的伪代码：

```rust
async fn get_slot_with_quorum(providers: &[RpcClient]) -> Result<u64> {
    let results = join_all(providers.iter().map(|p| p.get_slot())).await;
    let valid: Vec<u64> = results.into_iter().filter_map(|r| r.ok()).collect();

    // 至少 2 家返回、且 slot 差 < 3
    if valid.len() < 2 {
        return Err("quorum not met");
    }
    let max = *valid.iter().max().unwrap();
    if valid.iter().all(|&s| max.saturating_sub(s) < 3) {
        Ok(max)
    } else {
        Err("providers inconsistent - likely fork")
    }
}
```

配了多 provider + 仲裁，我们的 incident 频率从"每月 1-2 次"降到"季度 0-1 次"。这条是真正拉开"能跑 demo"和"能扛生产"差距的一条。

---

## 谎言 3：`getProgramAccounts` 用起来挺方便

这个接口是 Solana 新手最爱用的一个，也是生产环境里最容易把你的项目炸掉的一个。

表面看它很友好：给我一个 program ID，返回所有账户。写查询逻辑像查数据库一样。

背后的真相是：**这个调用在 RPC 节点上是全量扫描**。账户数量上 10 万之后，一次调用可能占几秒 CPU + 几百 MB 内存。节点的全部 QPS 容量，被一两个这种请求吃光。

真实案例：我们做用户持仓系统，早期用 `getProgramAccounts` 拉 token account。单用户场景跑得飞快，演示给投资人看也没问题。

上线第二周 QPS 到 5k，整个 RPC 集群 OOM 三次。SRE 直接找到我说"你们这条链路不能留"。

替代方案有两条：

**1. 自建 indexer**

```
Solana RPC (subscribe) → Message Queue → Worker → Postgres
```

订阅 `logsSubscribe` 或 `accountSubscribe`，把你关心的账户实时落地到 Postgres。查询走数据库，不走链。

工程量不小（主要是补历史、处理重组），但一旦跑起来，查询 P99 能到 10ms 量级。

**2. 用 provider 的专用 API**

Helius / Triton / QuickNode 都提供了"增强型 API"：按 owner 查 token、按 mint 查持仓、按时间范围查交易。

这些 API 背后其实就是他们替你跑的 indexer。贵，但省去自建成本。对中小项目足够。

**不要再直接用 `getProgramAccounts` 做生产查询**。这一条如果你只带走一句话，就带这句。

---

## 结尾

这三条听起来都不复杂。但每一条都是我们用"凌晨被电话叫醒"换来的。

生产级 Solana RPC 的核心问题从来不是"选哪家最好"。核心是：

> **假设每一家都会挂，你的系统还能活多久？**

能扛 4 小时，就够见投资人；能扛 24 小时，就够上主网；能扛到用户感知不到，就是真正的生产系统。

---

下一篇打算写"自建 Solana indexer 的最小可用方案"——把上面论点 3 里的 indexer 架构拆到代码级别。

_[订阅 RSS](/rss.xml) 或 [关注 X](https://x.com/FrankFu2262)，不错过更新。_
