---
slug: solana-rpc-production-truths
blog_source: generated/solana-rpc-production-truths/blog.md
tweet_count: 10
estimated_read_time: 2min
lang: zh
---

# 生产级 Solana RPC 的三个谎言 — X Thread

## 1/

2024 年 3 月凌晨 3 点，我们交易所的撮合队列堆了 18 万笔请求。

罪魁祸首不是合约，不是数据库。

是一个看起来人畜无害的 Solana RPC 调用。

做了 2 年 Solana 基建，这次事故让我意识到：对"生产级 RPC"的理解，我们之前几乎全错。

🧵

## 2/

先放结论。

生产级 Solana RPC 的真实瓶颈：
- 不是便宜
- 不是 P50 快
- 是尾延迟 + 多节点一致性

下面三条，每一条都是我们用"半夜被叫醒"换来的。

## 3/

谎言 1：P50 延迟是生产级指标。

我们对三家 provider 同一压测（ap-northeast-1, QPS 3k）：

- A: P50 41ms / P99 180ms / P999 1.2s
- B: P50 39ms / P99 850ms / P999 12s
- C: P50 43ms / P99 2.1s / P999 超时

P50 差 <5ms，P999 差 20 倍以上。

## 4/

为什么这重要？

撮合链路里，一笔 P99 卡 2s，队列整体停 2s。

2s 在 Web2 不算啥。

在高频撮合里就是 18 万笔请求堆积。

选 provider 不要看 P50。看 P99，然后压到 P999。

## 5/

谎言 2：选一家最好的就够了。

三个月后，我们选的"最好"的 provider 周日凌晨宕机 4h。

教训：任何一家，都会挂。

问题不是"会不会"，是"你有没有第二条腿"。

## 6/

生产级 RPC 的最小架构：

App → RPC Router →
- Provider A (primary)
- Provider B (secondary)
- Provider C (tiebreaker)

Router 三件事：
- 健康检查（5s ping，3 次超时摘除）
- 一致性仲裁（关键读 ≥2 家一致才用）
- 分流（写走 primary）

## 7/

陷阱：多 provider 时，别"取最快"。

会拿到 fork 节点的陈旧数据。Solana 上每天都发生几次。

用户看到的余额落后链上 5-10 个 slot，下一笔 TX 就失败。

必须做一致性校验：至少 2 家返回、slot 差 < 3 才用。

## 8/

谎言 3：getProgramAccounts 很好用。

表面：给 program ID，返回所有账户。像查数据库。

真相：RPC 节点上全量扫描。账户 10 万+ 之后，一次调用吃几秒 CPU + 几百 MB 内存。

我们早期拿它做持仓查询，上线第 2 周 QPS 到 5k 就 OOM 三次。

## 9/

替代方案：

1. 自建 indexer
   Solana RPC subscribe → MQ → Worker → Postgres
   查询 P99 到 10ms 量级

2. 用 provider 专用 API
   Helius / Triton 的 enhanced endpoints
   本质是他们替你跑 indexer

不要再直接用 getProgramAccounts 做生产查询。

## 10/ (CTA)

完整分析（含 Rust 仲裁代码 + 自建 indexer 架构图）：

blog.frankfu.cloud/posts/solana-rpc-production-truths

你们在 Solana 生产环境踩过最恶心的 RPC 坑是哪个？

下一篇拆"自建 Solana indexer 的最小可用方案"。

@FrankFu2262

---

## 字符数校验

| # | 字符数 (X 规则) | 状态 |
|---|---|---|
| 1 | 232 | ✅ |
| 2 | 160 | ✅ |
| 3 | 238 | ✅ |
| 4 | 158 | ✅ |
| 5 | 144 | ✅ |
| 6 | 208 | ✅ |
| 7 | 206 | ✅ |
| 8 | 228 | ✅ |
| 9 | 194 | ✅ |
| 10 | 226 | ✅ |
