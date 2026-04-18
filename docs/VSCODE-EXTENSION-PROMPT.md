# VS Code Extension — Planning Prompt

> Recovered from the `D:\weaver` session on 2026-04-17. This is the paste-ready prompt originally intended for a fresh Claude Code session started in `D:\the-weave`. Use it as the first message (or argument to `/ultraplan`) to kick off planning.

---

# Goal
Design a VS Code extension that wraps The Weaver MCP server to give developers continuous, longitudinal repo review — surfacing not just technical issues but the *human* patterns behind them: procrastination, selective sweat (polishing easy work while hard problems sit), under-skill, poor cooperation, haste, impatience, weak communication, and the cognitive biases that quietly sink software projects.

# Context — read these first
- **This repo (`D:\the-weave`)** — The Weaver MCP server, v0.1.0, fully built. Read: `README.md`, `docs/PHILOSOPHY.md`, `docs/METHODOLOGY.md`, `src/index.ts`, `src/server/tools.ts`, `src/server/prompts.ts`, `perspectives/*.md`. 8 tools, 5 prompts, 11 SDLC perspectives, 81 passing tests, MCP SDK v1.26, ESM + Node16.
- **Sibling design workspace (`D:\weaver`, NOT a git repo)** — read `D:\weaver\STATUS.md` for full project history and `D:\weaver\Untitled-1.md` for the original brief and agent personas.
- **Trust-first philosophy is non-negotiable**: consent gates, comfort meters, safe words (STOP/PAUSE/BREAK/EXIT), rehearsal mode, ephemeral by default. The extension cannot feel like surveillance.

# What the extension should do
1. **Continuous workspace observation** — longitudinal record of decisions, refactors, abandonments, hot spots, rework loops. Persisted in `.weave/` (already designed in the server).
2. **Lessons-learned ledger** — running, editable list the developer can promote/dismiss. Feeds retrospectives.
3. **Semantic signal detection** — beyond linters and coverage:
   - *Procrastination* — stale branches, TODO rot, postponed refactors
   - *Selective sweat* — heavy polish on easy areas while hard problems stay untouched; bikeshedding markers
   - *Under-skill / undertrained* — copy-paste patterns, repeated API misuse, missing idioms for the chosen framework
   - *Lack of cooperation* — solo branches without review, ignored PR feedback, parallel reinvention
   - *Haste* — late-night megacommits, missing tests, fast revert chains, "fix fix fix" sequences
   - *Impatience* — abandoned spikes, premature framework swaps, dependency churn
   - *Pragmatic shortcut vs. laziness* — distinguish; context matters, don't moralize
   - *Poor communication* — vague commit messages, undocumented breaking changes, missing ADRs
   - *Technical* — hot files, complexity drift, dep age, security, perf
4. **Heuristic library** — codify the cognitive/PM biases that plague projects. Research broadly. Cover at minimum: planning fallacy, sunk-cost, Dunning-Kruger, confirmation bias, scope creep, bikeshedding (Parkinson's law of triviality), NIH syndrome, gold-plating, second-system effect, Conway's law mismatches, hero culture, broken-windows theory, Hofstadter's law, Brooks's law, Maslow's hammer, premature optimization, YAGNI violations, cargo-cult engineering, normalization of deviance, Goodhart's law / metric gaming, survivorship bias in tooling, IKEA effect, status-quo bias, optimism bias. **Find more** — ground each entry in behavioral-economics or software-engineering literature with a short source citation.
5. **VS Code surface**:
   - Sidebar Tree View — live Weave (lessons, signals, comfort meter)
   - Status bar — comfort/load indicator
   - Command palette — `Weaver: Start Retrospective`, `Quick Scan`, `Investigate`, `Debate Perspectives`, `Generate Report`
   - Optional CodeLens / hover hints on hot files (opt-in per workspace, off by default)
   - Webview — markdown report viewer

# Deliverables (planning only — no extension code yet)
1. **`docs/HEURISTICS.md`** — researched heuristic library with sources.
2. **Architecture proposal** — how the extension talks to the existing MCP server. Evaluate three options with explicit tradeoffs and recommend one:
   - (a) Extension spawns Weaver as a child MCP process over stdio
   - (b) Extension as thin client to a user-run Weaver server
   - (c) Extension embeds Weaver logic directly, MCP boundary dropped
   Include sequence diagrams for the main flows (startup, retrospective, signal surfacing).
3. **Phased roadmap** — skeleton → MVP → polish. Each phase: scope, deliverables, acceptance criteria, rough effort.
4. **Repo layout decision** — monorepo (`packages/server`, `packages/extension`) vs. sibling repo (`the-weaver-vscode`). Recommend one.
5. **Tooling choices** — bundler (esbuild vs. webpack), test runner (`@vscode/test-electron`), CI updates.
6. **Risks & open questions** — list them; don't bury.

# Constraints
- Plan only. Do not scaffold extension code until I approve the plan.
- The MCP server must keep working standalone for non-VS-Code clients (Cursor, Claude Code, etc.). No breaking changes.
- No telemetry. Nothing leaves the workspace without explicit consent.
- Windows dev environment — preserve existing CRLF handling, ESM patterns, `simpleGit` named-import convention.

# How to execute
Run two agents in parallel:
- **Plan agent** — architecture, roadmap, repo layout, tooling.
- **General-purpose agent with WebSearch** — heuristic research for `docs/HEURISTICS.md`.

When both return, synthesize into a single proposal and present it for review. Don't start building until I say go.
