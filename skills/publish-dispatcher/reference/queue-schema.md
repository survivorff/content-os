# Queue Schema

`queue/schedule.json` 的结构。

---

## Schema

```jsonc
{
  "version": 1,
  "updated_at": "2026-05-10T12:00:00+08:00",
  "queue": [
    {
      "id": "why-solana-won-meme-blog",            // 唯一 ID: <slug>-<platform>
      "slug": "why-solana-won-meme",                // 对应 contents/<slug>/
      "platform": "blog",                           // blog | x-thread | xiaohongshu | douyin
      "mode": "auto",                               // auto | manual
      "scheduled_at": "2026-05-10T10:00:00+08:00",  // ISO 8601 带时区
      "status": "pending",                          // pending | executed | failed | skipped | cancelled
      "attempted_at": null,                         // 第一次尝试时间
      "executed_at": null,                          // 成功发布时间
      "error": null,                                // 失败时的错误信息
      "reminder": null,                             // 手动平台的提醒文本
      "external_ref": null                          // 平台返回的 ID（如 tweet ID）
    }
  ]
}
```

---

## status 状态机

```
pending ──── scheduled_at 到 ───▶ (执行)
              │
              ├─ success ──▶ executed
              └─ fail    ──▶ failed ──▶ (用户处理) ──▶ pending (重试)
                                     └─────────────▶ cancelled

pending ──── 用户手动取消 ──▶ cancelled
```

---

## 追加规则

publish-dispatcher **只追加，不覆盖**。

每次运行：
1. 读 `queue/schedule.json`
2. 追加新 entry 到 `queue` 数组
3. 更新顶层 `updated_at`
4. 写回

如果 `id` 已存在（重复调度），**更新现有条目**而不是加新的。

---

## 状态更新

只有 publish-dispatcher 可以写这个文件。

当执行完一个 entry：
- 成功 → status = executed，executed_at = now，external_ref = <返回 ID>
- 失败 → status = failed，error = <错误>，attempted_at = now
- 用户取消 → status = cancelled

---

## 查询

其他 skill / 脚本只能**读**这个文件。常见查询：

### 今天要发的

```python
# 伪代码
today = now.date()
queue_today = [
    entry for entry in queue
    if entry["scheduled_at"].date() == today
    and entry["status"] == "pending"
]
```

### 失败需要重试的

```python
failed = [entry for entry in queue if entry["status"] == "failed"]
```

### 某篇内容的所有发布状态

```python
slug_entries = [entry for entry in queue if entry["slug"] == "<slug>"]
```

---

## 清理策略

超过 90 天的 `executed` 或 `cancelled` 条目可以归档到 `queue/archive/<year>-<month>.json`。

主 queue 保持 3 个月内的数据，避免文件过大。

---

## 示例

```json
{
  "version": 1,
  "updated_at": "2026-05-10T15:30:00+08:00",
  "queue": [
    {
      "id": "why-solana-won-meme-blog",
      "slug": "why-solana-won-meme",
      "platform": "blog",
      "mode": "auto",
      "scheduled_at": "2026-05-10T10:00:00+08:00",
      "status": "executed",
      "attempted_at": "2026-05-10T10:00:05+08:00",
      "executed_at": "2026-05-10T10:00:12+08:00",
      "error": null,
      "reminder": null,
      "external_ref": null
    },
    {
      "id": "why-solana-won-meme-x-thread",
      "slug": "why-solana-won-meme",
      "platform": "x-thread",
      "mode": "auto",
      "scheduled_at": "2026-05-10T20:00:00+08:00",
      "status": "pending",
      "attempted_at": null,
      "executed_at": null,
      "error": null,
      "reminder": null,
      "external_ref": null
    },
    {
      "id": "why-solana-won-meme-xiaohongshu",
      "slug": "why-solana-won-meme",
      "platform": "xiaohongshu",
      "mode": "manual",
      "scheduled_at": "2026-05-11T12:00:00+08:00",
      "status": "pending",
      "attempted_at": null,
      "executed_at": null,
      "error": null,
      "reminder": "手动复制 generated/why-solana-won-meme/xiaohongshu.md 到小红书 App",
      "external_ref": null
    }
  ]
}
```
