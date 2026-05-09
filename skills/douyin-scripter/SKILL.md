---
name: douyin-scripter
description: 把博客核心观点写成 2-3 分钟口播脚本（600-900 字）。前 3 秒必须有 Hook，每段带"视觉提示"。
inputs:
  - generated/<slug>/blog.md
  - contents/<slug>/scout.md（确认主受众和独家视角）
outputs:
  - generated/<slug>/douyin-script.md  分镜脚本 + 视觉提示
triggers:
  - scout 里 platforms 包含 douyin
---

# Douyin Scripter

你写的是**口播脚本**，不是文章。作者会照这个脚本录 2-3 分钟的视频。

抖音是听觉 + 视觉媒介。脚本要是"说出来"而不是"看出来"的。

---

## 协议

### 1. 读源

- `generated/<slug>/blog.md`：改写对象
- `contents/<slug>/scout.md`：核心 takeaway 和独家视角

### 2. 设计 3 分钟黄金结构

按 `reference/script-structure.md`：

```
0-3 秒   │ Hook（抓住人）
3-15 秒  │ 价值承诺
15-120 秒│ 主体 3-5 个要点
120-180  │ 总结 + CTA
```

### 3. 写 Hook（前 3 秒）

**最重要的 3 秒**。参考 `reference/hook-templates.md`。

Hook 必须在 3 秒内让观众决定"要不要继续看"。

### 4. 写主体

从博客提取 3-5 个**能"说得完"的**要点。参考 `reference/body-rules.md`：

- 每个要点 25-40 秒
- 短句（10-15 字为佳）
- 口语化（"说白了" > "总的来说"）
- 每个要点有一个小高潮

### 5. 加视觉提示

每段台词下面写 `（视觉：...）`，告诉作者这段说话时屏幕上显示什么。

### 6. 写 CTA

参考 `reference/cta-templates.md`。

### 7. 输出

写到 `generated/<slug>/douyin-script.md`，格式见 `reference/script-output-format.md`。

---

## 铁律

1. **前 3 秒不能平淡**。Hook 失败整个视频废。
2. **短句**。每句 10-15 字。超 20 字听众就走神。
3. **口语**。"然而" / "因此" / "综上" 全删。
4. **每个要点配视觉**。空镜 / 截图 / 对比图 / 数据大字。
5. **2-3 分钟**。超过 3 分钟完播率暴跌。
6. **总字数 600-900**。播音速度约 300 字/分钟。
7. **结尾必有 CTA**。关注 + 下期预告。
8. **不要搬博客原文读**。小红书都不让读，抖音更不行。

---

## 何时读 reference

- 第一次：全读
- 之后：
  - Hook 写不出 → `hook-templates.md`
  - 结构纠结 → `script-structure.md`
  - 具体段落写不好 → `body-rules.md`
  - CTA 不知道怎么收 → `cta-templates.md`

---

## 输出完成后

- 标记 `contents/<slug>/meta.json` 的 `douyin_written: true`
- hook-polisher 会对 Hook 单独再打磨一遍
