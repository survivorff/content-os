#!/usr/bin/env node
/**
 * Content OS — Pipeline Runner
 *
 * Usage:
 *   node scripts/run-pipeline.mjs inbox/2026-05-09-foo.md
 *
 * What it does:
 *   1. Reads AGENTS.md as the orchestrator system prompt
 *   2. Feeds the inbox file and skills/ directory to Claude
 *   3. Lets Claude run the full pipeline using tool calls (read_file, write_file, list_dir)
 *   4. Produces contents/<slug>/*, generated/<slug>/*, updates queue/schedule.json
 *
 * MVP behavior:
 *   - Auto-approves outline (no human-in-loop) for unattended CI runs
 *   - Runs to quality-gate but does NOT auto-publish (publish-dispatcher only writes queue)
 *   - Commits all outputs for human review after the fact
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const MODEL = process.env.CONTENT_OS_MODEL || 'claude-opus-4-5';
const MAX_TURNS = 60;

const inboxFile = process.argv[2];
if (!inboxFile) {
  console.error('Usage: run-pipeline.mjs <inbox-file>');
  process.exit(1);
}

if (!fs.existsSync(inboxFile)) {
  console.error(`Inbox file not found: ${inboxFile}`);
  process.exit(1);
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ---------- Tool definitions ----------

const tools = [
  {
    name: 'read_file',
    description: 'Read a text file relative to the content-os root. Use for SKILL.md, reference/*, generated outputs, etc.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'Relative path from content-os/' },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description: 'Create or overwrite a text file. Creates parent directories as needed. Only allowed under contents/, generated/, queue/.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        content: { type: 'string' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'list_dir',
    description: 'List files in a directory relative to content-os root.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string' },
      },
      required: ['path'],
    },
  },
  {
    name: 'finish',
    description: 'Call this when the pipeline is complete. Provide a short summary of what was done.',
    input_schema: {
      type: 'object',
      properties: {
        summary: { type: 'string' },
      },
      required: ['summary'],
    },
  },
];

// ---------- Tool handlers ----------

const WRITE_ALLOWED_PREFIXES = ['contents/', 'generated/', 'queue/'];

function resolveSafe(p) {
  const abs = path.resolve(ROOT, p);
  if (!abs.startsWith(ROOT)) throw new Error(`Path escapes root: ${p}`);
  return abs;
}

function handleTool(name, input) {
  if (name === 'read_file') {
    const abs = resolveSafe(input.path);
    if (!fs.existsSync(abs)) return { error: `Not found: ${input.path}` };
    return { content: fs.readFileSync(abs, 'utf8') };
  }
  if (name === 'write_file') {
    if (!WRITE_ALLOWED_PREFIXES.some((p) => input.path.startsWith(p))) {
      return { error: `Write not allowed outside ${WRITE_ALLOWED_PREFIXES.join(', ')}` };
    }
    const abs = resolveSafe(input.path);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, input.content, 'utf8');
    return { ok: true, bytes: Buffer.byteLength(input.content) };
  }
  if (name === 'list_dir') {
    const abs = resolveSafe(input.path);
    if (!fs.existsSync(abs)) return { error: `Not found: ${input.path}` };
    const entries = fs.readdirSync(abs, { withFileTypes: true }).map((e) => ({
      name: e.name,
      type: e.isDirectory() ? 'dir' : 'file',
    }));
    return { entries };
  }
  if (name === 'finish') {
    throw new FinishSignal(input.summary);
  }
  return { error: `Unknown tool: ${name}` };
}

class FinishSignal extends Error {
  constructor(summary) {
    super('pipeline finished');
    this.summary = summary;
  }
}

// ---------- Build initial messages ----------

const agentsMd = fs.readFileSync(path.join(ROOT, 'AGENTS.md'), 'utf8');
const inboxContent = fs.readFileSync(path.join(ROOT, inboxFile), 'utf8');

const systemPrompt = `You are the Orchestrator (大脑) of Content OS. You follow AGENTS.md exactly.

=== AGENTS.md ===
${agentsMd}
=== end AGENTS.md ===

IMPORTANT CI RULES (this is an unattended run):
- Skip Decision Point ① (outline confirmation). Auto-approve the outline you produce and continue.
- Skip Decision Point ② when quality-gate returns approved or approved_with_notes. Only stop for rejected.
- If quality-gate returns rejected for any platform, write the quality-report.md, mark meta.json appropriately, then call finish with a summary including "BLOCKED: <reason>". Do NOT try to fix automatically.
- Respect platforms from scout.md. Skip skills for platforms not listed.
- Write only under contents/, generated/, queue/.
- When you are done, call the finish tool.

Work through the pipeline step by step. Use tools to read SKILL.md and reference files on demand (progressive disclosure).`;

const userPrompt = `New inbox file to process: \`${inboxFile}\`

Content:
\`\`\`markdown
${inboxContent}
\`\`\`

Begin the pipeline per AGENTS.md. Read skills/topic-scout/SKILL.md first.`;

// ---------- Main loop ----------

async function main() {
  const messages = [{ role: 'user', content: userPrompt }];
  let turn = 0;

  while (turn++ < MAX_TURNS) {
    process.stdout.write(`\n--- turn ${turn} ---\n`);

    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: systemPrompt,
      tools,
      messages,
    });

    // Collect tool uses
    const toolUses = response.content.filter((c) => c.type === 'tool_use');
    const texts = response.content.filter((c) => c.type === 'text');

    for (const t of texts) {
      if (t.text?.trim()) console.log(`[assistant] ${t.text.substring(0, 500)}`);
    }

    if (response.stop_reason === 'end_turn' && toolUses.length === 0) {
      console.log('Assistant ended turn without tool use. Stopping.');
      break;
    }

    // Push assistant response
    messages.push({ role: 'assistant', content: response.content });

    // Execute tools
    const toolResults = [];
    for (const tu of toolUses) {
      console.log(`[tool] ${tu.name} ${JSON.stringify(tu.input).substring(0, 200)}`);
      try {
        const result = handleTool(tu.name, tu.input);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: tu.id,
          content: JSON.stringify(result).substring(0, 50000),
        });
      } catch (e) {
        if (e instanceof FinishSignal) {
          console.log(`\n✅ Pipeline finished: ${e.summary}`);
          return;
        }
        toolResults.push({
          type: 'tool_result',
          tool_use_id: tu.id,
          content: JSON.stringify({ error: String(e.message) }),
          is_error: true,
        });
      }
    }

    messages.push({ role: 'user', content: toolResults });
  }

  console.log(`\nReached max turns (${MAX_TURNS}). Stopping.`);
}

main().catch((err) => {
  console.error('Pipeline error:', err);
  process.exit(1);
});
