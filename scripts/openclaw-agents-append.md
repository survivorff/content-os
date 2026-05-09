
---

## 📝 Content OS Integration

When the user asks you to write, create, or publish content across multiple platforms (blog, X, 小红书, 抖音), you are running a specialized pipeline called **Content OS**.

**Pipeline brain**: Read `/home/admin/content-os/AGENTS.md` for the full orchestrator workflow.

**Quick summary**:
- User sends an idea via Lark DM → you write it to `/home/admin/content-os/inbox/<date>-<slug>.md`
- Run the 10 skills in order:
  1. `topic-scout` — judge if worth writing
  2. `outline-architect` — build the bones
  3. `blog-writer` — long-form source
  4. `x-thread-maker` / `xiaohongshu-editor` / `douyin-scripter` — parallel, filtered by scout.md platforms
  5. `hook-polisher` — polish the opening of each platform
  6. `quality-gate` — final review
  7. `blog-publisher` — **the only skill that actually publishes** (copies to /home/admin/blog repo + git push)
  8. `publish-dispatcher` — schedules reminders for X/小红书/抖音 (all manual)
- Each skill has its own SKILL.md in the skills/ directory (symlinked from /home/admin/content-os/skills/)
- Outputs go to `/home/admin/content-os/contents/<slug>/` and `/home/admin/content-os/generated/<slug>/`
- After the whole pipeline: `cd /home/admin/content-os && git add . && git commit -m "auto: <slug>" && git push` so work is preserved on GitHub

**Execution mode** (IMPORTANT, read this carefully):

Once the user gives you an idea and doesn't ask for "just an outline" or "just the scout", you run the pipeline **to completion in one go**. Do NOT pause between skills asking "want to continue?". The user sent an idea to get finished content — keep going.

**Only stop (and ask the user) in these cases**:

- `topic-scout` returns `verdict: kill` → report why and ask: kill or retry with different angle?
- `topic-scout` returns `verdict: need-more-info` → ask the specific questions from scout.md
- `quality-gate` returns `rejected` on any platform → show the report, give user 3 options (A: let me fix, B: you fix, C: force through)
- You hit a real error (git push fails, file not found, API error) — but do NOT give up silently. Always try to complete remaining steps and report the partial state.

**What to do with risks/warnings scout flags**:

Scout will often write risk notes like "needs more detail on X" or "make sure to redact Y". These are **warnings for the author to later improve**, NOT blockers. **Keep running the pipeline**. The blog-writer will do its best with available info. The author can refine in the next iteration.

---

## 📬 Final Lark report format (CRITICAL — this is what the user actually sees)

The user is on mobile or a desk in a meeting. They will NOT ssh into the VM to `cat` files. So at the end of every completed pipeline, your final Lark message MUST include **the full content of the manual-publish platforms** (X Thread / 小红书), so the user can copy-paste from Lark directly into the platforms.

**Structure of the final message:**

```
✅ 跑完了：<标题>

━━━━━━━━━━━━━━━━━━
📝 Blog（已自动发布）
━━━━━━━━━━━━━━━━━━
🔗 https://blog.frankfu.cloud/posts/<slug>/
Commit: github.com/survivorff/blog/commit/<hash>

━━━━━━━━━━━━━━━━━━
🐦 X Thread（手动发，共 N 条）
━━━━━━━━━━━━━━━━━━

1/N
<推文 1 原文>

2/N
<推文 2 原文>

...

N/N (CTA)
<推文 N 原文，含博客链接>

━━━━━━━━━━━━━━━━━━
📕 小红书（手动发）
━━━━━━━━━━━━━━━━━━

【标题】
<小红书标题原文>

【正文】
<小红书正文原文，完整复制>

【标签】
#tag1 #tag2 ...

【图文建议】
- 封面：<建议>
- 正文图：<建议>

━━━━━━━━━━━━━━━━━━
📊 Quality / Status
━━━━━━━━━━━━━━━━━━
- blog: ✅ approved
- x-thread: ✅ approved
- 小红书: ⚠️ approved_with_notes (1 warn)

GitHub content-os: <commit-url>
```

**Rules for the final report:**

1. **ALWAYS include full X Thread and 小红书 text** — don't say "markdown is at /path/". The user is not in a terminal.
2. **Use Lark-friendly formatting** — `━` dividers, emoji section headers, bullet lists
3. **Copy text verbatim** from `generated/<slug>/x-thread.md` and `generated/<slug>/xiaohongshu.md` — no paraphrasing, don't re-write, just extract
4. **If a platform failed quality-gate**, say so clearly at the top, skip its content block
5. **If blog publish failed**, show the error + exact command for the user to fix or retry
6. **Keep the whole message under 8000 characters** if possible. If x-thread + 小红书 together exceed this, split into 2 consecutive Lark messages with clear "接上 1/2" markers.

---

## Failure handling

If **blog-publisher fails to push** (403 / auth / network):

1. **Do NOT abort the pipeline silently.** Continue to publish-dispatcher to at least write the queue.
2. Update `contents/<slug>/meta.json` with:
   ```json
   "published": {
     "blog": "failed",
     "blog_failure_reason": "git push 403 - likely PAT missing write permission for blog repo",
     "blog_retry_command": "cd /home/admin/blog && git push origin main"
   }
   ```
3. In the Lark report, flag the blog failure clearly and give the user a one-line fix:
   ```
   ⚠️ Blog 生成完了但 push 失败：
   原因：PAT 对 blog 仓库可能没有 Contents: Read and write 权限
   修复：去 github.com/settings/tokens 检查 fine-grained PAT，
        确认 blog repo 的 Contents = Read and write
   修完后告诉我，我 retry push。
   ```

If **any other skill fails**: similar pattern. Record to meta.json, keep going, report in final Lark message.

---

## Fallback to normal skills

If the user's intent is NOT content-creation (e.g. general question, technical help, memory query), use the regular OpenClaw skills (agent-memory, tavily-search, searxng, etc.). Don't force everything into Content OS.
