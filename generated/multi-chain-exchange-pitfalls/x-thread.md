---
slug: multi-chain-exchange-pitfalls
blog_source: generated/multi-chain-exchange-pitfalls/blog.md
tweet_count: 10
estimated_read_time: 3min
lang: zh
---

# 「不就是加个 adapter 吗？」——做交易所 Web3 后端两年，多链扩展的三个血泪教训

## 1/

接第二条链的真实工时，从来不是 PM 写的"2 周加适配层"。

实际 8-12 周，上线后前 3 个月故障率是单链的 5 倍。

在交易所做 Solana + EVM 基建两年，这 3 个坑我一个不落全踩了。

🧵

## 2/

多链扩展这件事，99% 的公司都错估了工程量。

不是人不够——是他们以为自己在做"适配"，其实需要做的是"重新建造"。

三条链对"交易确认""交易顺序""交易成本"三个词的定义，根本上就不是一个东西。

## 3/

坑一：Solana 的 confirmed ≠ finalized。

EVM 开发者只认一个规则——等 N 个区块确认就安全。但 Solana 有三层：processed → confirmed → finalized。

绝大多数 RPC 默认返回 confirmed，离"不可逆"还差一步。

## 4/

凌晨 3 点，用户群炸了。节点全返回 confirmed，系统自动入金、用户卖掉了 BTC。

然后发现：confirmed ≠ finalized。钱在链上其实还没真正到账。

后来入金策略改 finalized + 业务层延迟兜底——这不是优化，是资金安全底线。

## 5/

坑二：EVM nonce 在高频下是灾难。

nonce 为单用户设计：交易顺序执行，干净优雅。但交易所提币是天然并发——几十个用户同时提，抢同一 nonce 队列。

一笔 pending，后面全堵死。

## 6/

最严重一次：gas price 设低了，一笔交易 pending 在 mempool。后面 40+ 笔提币全卡。

"待处理" 20 分钟。客服被打爆。

后来上了三件套：nonce 预分配 + 动态 gas bumping + 超时重建队列。

Solana 没 nonce——但 blockhash 1 分钟过期，是另一个差不多恶心的坑。

## 7/

坑三：手续费估算——EVM 和 Solana 是两个世界模型。

- EVM：竞拍型。gas price × gas limit，出价高先打包
- Solana：定价 + 小费型。compute unit price + prioritization fee，没 mempool，没竞拍

两套逻辑用同一套接口？定时炸弹。

## 8/

Solana meme 潮那次，优先费飙了 20 倍。估算代码用的还是 2 分钟前的基础价。

提币失败率从 0.3% 飙到 18%。重试还是失败，扣了手续费交易没确认。

拆了：EVM 一个估费服务，Solana 一个。拆完代码量反而多了，但故障停了。

## 9/

回看两年：多链扩展不是在代码上加模块，是抛弃第一条链上建立的所有"常识"。

每一条新链都在拷问你对"确认""顺序""成本"的底层理解。

交易所容错为零——每一次认知错误直接变成资金事故。

## 10/ (CTA)

完整分析（含 nonce 三件套和手续费模型对比）：
blog.frankfu.cloud/posts/multi-chain-exchange-pitfalls

你也踩过多链的坑吗？评论区讲讲。

@FrankFu2262

---

## 字符数校验

| # | 字符数 (X 规则) | 状态 |
|---|---|---|
| 1 | 148 | ✅ |
| 2 | 180 | ✅ |
| 3 | 174 | ✅ |
| 4 | 196 | ✅ |
| 5 | 168 | ✅ |
| 6 | 242 | ✅ |
| 7 | 214 | ✅ |
| 8 | 230 | ✅ |
| 9 | 172 | ✅ |
| 10 | 86 | ✅ |
