# The Weaver

An open-source MCP server that facilitates structured lessons-learned retrospectives on software projects by analyzing git repositories.

The Weaver helps developers improve their skills, understand project decisions, and build institutional knowledge by reflecting on their own development history — through genuine dialogue, not checklists.

## Quick Start

```bash
# Add to Claude Code (one command)
claude mcp add the-weaver -- npx -y the-weaver

# Or install globally
npm install -g the-weaver
```

Then in your AI coding tool, use the `/start_retrospective` prompt to begin.

## What It Does

The Weaver analyzes your git repository and facilitates a structured retrospective conversation — then helps you track what you learned across projects over time:

1. **Analyzes** commit history, branches, dependencies, file changes, commit messages, and branch names
2. **Identifies** patterns from 11 SDLC perspectives — deduplicated across perspectives, with evidence cited inline
3. **Facilitates** one-question-at-a-time dialogue about each finding
4. **Captures** lessons learned as actionable insights (to the project or your personal journal)
5. **Generates** a chronological narrative evolution log — the story of the project, not a stats dump
6. **Tracks** your evolution across projects through an optional **personal learning journal** — intentions, concepts, cross-project patterns, ready-to-paste prompts for mentor/tutor/future-self conversations

## How It Works

The Weaver is a **methodology delivery system**, not a standalone AI. It works through your existing AI coding tool (Claude Code, Cursor, VS Code). The host AI provides the intelligence; The Weaver provides structure.

### MCP Primitives

| Type | What It Does |
|------|-------------|
| **Tools** (13) | Mechanical operations: analyze repos, identify findings, dialogue, save lessons, manage journal + intentions |
| **Prompts** (5) | Methodology templates that appear as slash commands |
| **Resources** | Knowledge base: perspectives, methodology, best practices, session state |

### Available Prompts

| Prompt | Purpose |
|--------|---------|
| `start_retrospective` | Full facilitated session |
| `quick_scan` | Rapid analysis without dialogue |
| `investigate` | Deep dive on a specific pattern |
| `debate` | Two perspectives discuss a finding |
| `generate_report` | Produce final narrative |

### 11 SDLC Perspectives

Each perspective is a markdown file — community-contributable, no TypeScript needed:

1. Planning & Requirements
2. Architecture & Design
3. Development & Coding
4. Testing & Quality
5. Security
6. Deployment & Infrastructure
7. Project Management
8. Human-AI Collaboration
9. Documentation
10. Tool & Technology Selection
11. Learning & Growth

### Personal Learning Journal

Separate from the per-project `.weave/` directory, you can point The Weaver at a personal journal — a dedicated directory (optionally its own git repo, optionally pushed to a private GitHub remote) where your *own* evolution across projects accumulates.

```bash
# Initialize a journal once, anywhere
export WEAVER_JOURNAL_PATH="$HOME/dev-journal"
# Then ask your AI: "Initialize my Weaver journal"
```

The journal contains:

- `intentions.json` — things you want future-you to remember, with kept/abandoned status
- `current-state.md` — rolling snapshot regenerated after every session
- `sessions/` — one retrospective narrative per project, per run
- `concepts/` — a growing glossary of what you've learned
- `insights/` — cross-project patterns you name yourself
- `vault/` — private entries never included in exports without re-consent
- `prompts/ask-a-mentor.md`, `tutor-me.md`, `future-self.md` — ready-to-paste conversation seeds auto-regenerated from current journal state

Nothing leaves your machine unless you push it yourself. The journal is plain markdown and JSON — readable without The Weaver if the tool ever goes away.

## Philosophy

The Weaver is built on principles from military after-action reviews (Blue Angels, Army AAR, Navy lessons learned):

- **No Blame** — We identify improvements, not fault
- **Facts First** — What happened before why it happened
- **Safety First** — Safe words (STOP, PAUSE, BREAK, EXIT) work instantly
- **Privacy by Default** — Everything stays local, ephemeral unless you save it
- **Anti-Performance Theater** — No metrics that can be gamed, no surveillance

> "The moment reflection becomes compliance is the moment learning dies."

## Configuration

### Claude Code
```bash
claude mcp add the-weaver -- npx -y the-weaver
```

### Cursor / VS Code
```json
{
  "mcpServers": {
    "the-weaver": {
      "command": "npx",
      "args": ["-y", "the-weaver"]
    }
  }
}
```

### Team Usage
Commit `.mcp.json` to your repo so everyone gets The Weaver:
```json
{
  "mcpServers": {
    "the-weaver": {
      "command": "npx",
      "args": ["-y", "the-weaver"]
    }
  }
}
```

## Contributing

The easiest way to contribute is adding a new perspective — it's just a markdown file with YAML frontmatter. See [perspectives/README.md](perspectives/README.md) for the format and [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Development

```bash
git clone https://github.com/PatrickRutledge/the-weave.git
cd the-weave
npm install
npm run build
npm test
```

## License

MIT — see [LICENSE](LICENSE)
