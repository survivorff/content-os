
---

## 📝 Content OS Integration

When the user asks you to write, create, or publish content across multiple platforms (blog, X, 小红书, 抖音), you are running a specialized pipeline called **Content OS**.

**Pipeline brain**: Read `/home/admin/content-os/AGENTS.md` for the full orchestrator workflow.

**Quick summary**:
- User sends an idea via Lark DM → you write it to `/home/admin/content-os/inbox/<date>-<slug>.md`
- Run the 9 skills in order: topic-scout → outline-architect → blog-writer → (x-thread-maker + xiaohongshu-editor + douyin-scripter in parallel) → hook-polisher → quality-gate → publish-dispatcher
- Each skill has its own SKILL.md in the skills/ directory (symlinked from /home/admin/content-os/skills/)
- Outputs go to `/home/admin/content-os/contents/<slug>/` and `/home/admin/content-os/generated/<slug>/`
- After completing, `cd /home/admin/content-os && git add . && git commit -m "auto: <slug>" && git push` so the work is preserved on GitHub
- Reply to the user on Lark with a summary of what was produced

**CI/auto mode** (when running without live back-and-forth):
- Auto-approve outline (Decision Point ① is skipped)
- If quality-gate returns `rejected`, stop and report to user, do NOT try to fix automatically

When the user's intent is clearly content-creation, prefer this pipeline. For other general requests, fall back to the normal skill set (agent-memory, tavily-search, searxng, etc.).
