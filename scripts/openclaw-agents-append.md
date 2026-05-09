
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
- You hit a real error (git push fails, file not found, API error)

**What to do with risks/warnings scout flags**:

Scout will often write risk notes like "needs more detail on X" or "make sure to redact Y". These are **warnings for the author to later improve**, NOT blockers. **Keep running the pipeline**. The blog-writer will do its best with available info. The author can refine in the next iteration.

**Reply cadence on Lark**:

- First message after receiving idea (~10s): "收到，开始跑 [slug]。预计 10-15 分钟。"
- After quality-gate: short status ("✅ 3/3 approved" or "⚠️ xhs 有 1 warn，继续发布")
- Final message after blog-publisher + publish-dispatcher:
  ```
  ✅ 跑完了
  Blog: 已发 https://blog.frankfu.cloud/posts/<slug>
  X Thread: 2026-05-12 20:00 提醒你
  小红书: 2026-05-13 12:00 提醒你
  GitHub: <commit-url>
  ```

**Fallback to normal skills**:

If the user's intent is NOT content-creation (e.g. general question, technical help, memory query), use the regular OpenClaw skills (agent-memory, tavily-search, searxng, etc.). Don't force everything into Content OS.
