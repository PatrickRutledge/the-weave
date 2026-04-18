# VS Code Extension Plan — The Weaver

## 1. Architecture Proposal

### Option (a) — Extension spawns Weaver as child MCP process over stdio

The extension ships the Weaver server as a bundled or optionally-installed npm dependency, then spawns `node dist/index.js` as a child process and speaks MCP JSON-RPC over stdin/stdout using the official `@modelcontextprotocol/sdk` client (`StdioClientTransport`).

Pros:
- Zero change to `src/index.ts`, `src/server/*`, or existing tests. The server stays the canonical API for Cursor, Claude Code, and the extension alike.
- The MCP contract is the only public surface, which keeps honesty about what the extension does — every extension action maps to an existing tool/prompt/resource the user can audit.
- Crash isolation: if the server throws, the extension host stays up. Restart is `childProcess.spawn` again.
- Consent/trust modules (`src/trust/*`) continue to own their domain inside the server process; the extension cannot bypass safe words.

Cons:
- Process boundary has cost. Child spawn is ~200–400 ms on Windows, and every analysis round-trips through JSON-RPC serialization. For the "continuous observation" use case this adds up.
- stdio lifecycle inside the VS Code extension host needs care on Windows: stdio pipes, process tree cleanup on window close, orphan `node.exe` processes if the extension crashes. Must handle via `context.subscriptions.push({ dispose })` and `tree-kill` fallback on Windows.
- Any large payload (full `RepositoryAnalysis` serialized) crosses the pipe; a 5k-commit repo can produce multi-MB JSON. Needs either streaming or pagination.
- Node version mismatch risk — the extension host Node and the spawned server Node are the same runtime, but users on older VS Code (< 1.89) have older Node; the server's `engines.node >= 18` is fine today, stays fine.

### Option (b) — Thin client to a user-run Weaver server

The user starts `the-weaver` themselves (`npx the-weaver` in a terminal or via a system service); the extension connects to it over a socket/named pipe or HTTP.

Pros:
- One server process can serve multiple VS Code windows (multi-root, multi-project).
- Manual lifecycle is clear to the user — it feels less magical.

Cons:
- Requires a new transport. Current server is stdio-only. Adding HTTP/websocket is feasible but is a breaking addition and introduces auth concerns (localhost trust is not free).
- Significantly worse UX: "install extension, now also run this command in a terminal, now configure the port." This violates the install-and-go expectation of VS Code extensions.
- Violates "ephemeral unless chosen" instincts — a long-running server is a new trust surface.
- Adds a port/pipe management problem on Windows where firewall prompts can appear.

### Option (c) — Embed Weaver logic, drop MCP boundary

Import `src/engine/*`, `src/orchestrator/*`, `src/trust/*` directly into the extension and skip MCP entirely.

Pros:
- Fastest path, no IPC cost. In-process calls are direct.
- Simpler debugging — single process, single stack.

Cons:
- **Forks the project.** The MCP server stops being the single source of truth. Every engine change must be tested in two integration contexts.
- Kills the "use the same tool from Cursor or Claude Code or VS Code" promise. Users who split time across tools lose parity.
- The extension becomes the de-facto UI for The Weaver, which inverts the "methodology delivery system, not a standalone AI" design intent from `PHILOSOPHY.md`. The host AI stops being the reasoner.
- Bundling an ESM Node16 TypeScript package into the extension host has real friction: the extension must be ESM too (VS Code supports this now but many tools assume CJS) or transpile to CJS and lose the named-import `{ simpleGit }` invariant — one of the explicit Windows-safe conventions.
- Tests fork. 81 server tests no longer cover the extension's code path.

### Recommendation: **Option (a)**

Spawn as a child MCP process. This is the only option that:
1. Preserves the MCP server as the untouched standalone artifact for Cursor/Claude Code users.
2. Keeps consent gates, safe words, rehearsal mode, and comfort meters inside the server process where they are already proven by 81 tests.
3. Makes the extension a thin, auditable client — a UX shell over a public protocol — which aligns with the anti-performance-theater tenet.

Mitigations for the performance concern:
- For "continuous observation," keep a single long-lived child process per workspace rather than re-spawning per command.
- For large payloads, add a server-side **resource** that streams analysis deltas by date range rather than returning the whole graph (a non-breaking addition; no existing tool changes).
- Cache analysis results inside the server `SessionOrchestrator` (already has `lastAnalysis`), so subsequent tool calls hit cache until the git HEAD moves.

### Sequence Diagrams

**Startup flow**

```
User           VS Code Extension Host        Weaver child (stdio)        .weave/
 |                    |                              |                      |
 |--open workspace--->|                              |                      |
 |                    |--resolve weaver binary------>|                      |
 |                    |    (prefer workspace-local   |                      |
 |                    |     node_modules, then       |                      |
 |                    |     extension-bundled)       |                      |
 |                    |--spawn node dist/index.js--->| (start McpServer)    |
 |                    |<--stderr: "running"----------|                      |
 |                    |--MCP: initialize------------>|                      |
 |                    |<--MCP: capabilities----------|                      |
 |                    |--MCP: list_tools------------>|                      |
 |                    |<--MCP: 8 tools---------------|                      |
 |                    |--read .weave/lessons (FS)--------------------> exists?
 |                    |<--lessons JSON-------------------------------- yes/no
 |                    |--render sidebar tree view--->|                      |
 |<--sidebar visible--|                              |                      |
 |                    | (NO analysis run yet — awaits explicit command)     |
```

**Retrospective flow**

```
User        Extension           Weaver child          Trust subsystem
 |              |                    |                       |
 |--palette: "Weaver: Start Retrospective"------>|           |
 |              |--show consent modal------------>|          |
 |<--modal: "Share repo analysis with host AI?  " (native VS Code dialog)
 |--Grant------>|                                 |          |
 |              |--MCP: callTool('analyze_repository', {path})-->|
 |              |                    |--GitAnalyzer.analyze() |
 |              |                    |--PatternDetector--->  |
 |              |<--analysis JSON-----|                       |
 |              |--MCP: callTool('identify_lessons')---------->|
 |              |                    |--apply perspectives   |
 |              |                    |--startSession-------> grant(session-start)
 |              |<--findings list-----|                       |
 |              |--render findings in sidebar-------->        |
 |              |--open webview: first question-------->      |
 |<--question displayed                                       |
 |--type answer (or STOP/PAUSE/BREAK/EXIT)------>|           |
 |              |--MCP: callTool('agent_dialogue',{response})->|
 |              |                    |--interceptInput------>  safe-word check
 |              |                    |  (if safe word: revoke & short-circuit)
 |              |                    |--ReviewOrchestrator.processResponse
 |              |                    |--advanceFinding       |
 |              |<--next question or "all done"---|           |
 |              |--loop until done, then offer save----->     |
 |<--report webview with Save button                          |
```

**Signal surfacing (continuous / passive)**

```
User                  Extension                  Weaver child
 |                        |                            |
 | (writes code, commits) |                            |
 |                        |--VS Code FileSystemWatcher fires on .git/HEAD
 |                        |--debounce 5s               |
 |                        |--MCP: callTool('analyze_repository', {maxCommits:50, sinceHash})-->|
 |                        |                            |--incremental analysis
 |                        |<--delta analysis-----------|
 |                        |--local SignalDetector runs over delta
 |                        |   (procrastination, selective-sweat, haste, etc.)
 |                        |--if new signals & severity >= threshold:
 |                        |    update sidebar tree badge count
 |                        |    update status bar comfort/load indicator
 |                        |    (NO toast — silent surface; user pulls, tool never pushes)
 |<--user glances at sidebar when they choose to        |
```

Note on the last diagram: the tool never interrupts. All passive surfaces (sidebar badge, status bar) update silently. This is the concrete expression of "the tool disappears when not needed" from `PHILOSOPHY.md`. The user must click into the sidebar to see detail; nothing pops up.

---

## 2. Repo Layout Decision

**Recommendation: sibling repo `the-weaver-vscode`** consuming `the-weaver` from npm.

Reasoning:

- The MCP server's identity is `the-weaver` on npm with `bin: the-weaver`. `package.json` is already configured for a clean `npm publish`. A monorepo refactor would force either a breaking rename (`@the-weaver/server`) or a complicated workspaces-plus-publish dance to preserve the unscoped name.
- The server must keep shipping as a standalone tool for Cursor, Claude Code, and any MCP-compatible client. Separate repo makes that boundary visible and prevents accidental coupling ("oh, I'll just import from `../extension/…`").
- Extension release cadence will differ from server release cadence. The VS Code marketplace has its own review timeline (~1–2 days initially, near-instant after). Tying them together via a monorepo version means every extension patch bumps the server version or vice versa. Separate repos → independent SemVer → no surprise bumps for npm users.
- CI cost: the existing `.github/workflows/ci.yml` (to be added — currently missing) stays focused on build + 81 tests. The extension repo gets its own CI with `@vscode/test-electron`, which is heavier (downloads a VS Code binary). Keeping those separate keeps both pipelines fast.
- Trust semantics: the server repo's open source identity is about the methodology. The extension repo can have a different README focused on developer experience. Conflating them muddles messaging.
- No loss of code sharing: the extension depends on `the-weaver` as an npm dep, spawns its `bin`, and talks MCP. That's already a better abstraction boundary than any monorepo import.

Concrete layout:

```
D:\the-weave\                      (this repo — unchanged, no new packages/)
  src/                             MCP server source
  perspectives/
  docs/
  package.json                     "the-weaver" v0.1.0 → v0.2.0 (+1 non-breaking)

D:\the-weaver-vscode\              (new sibling repo, to be created by user)
  src/
    extension.ts                   activate/deactivate
    mcp/
      client.ts                    StdioClientTransport wrapper
      lifecycle.ts                 spawn, restart, dispose
    ui/
      sidebar/                     TreeDataProvider for Weave view
      webview/                     Markdown report viewer
      statusbar/                   comfort/load indicator
      codelens/                    opt-in hot-file lens
    signals/
      detector.ts                  orchestrates the 9 families
      families/
        procrastination.ts
        selective-sweat.ts
        under-skill.ts
        cooperation.ts
        haste.ts
        impatience.ts
        pragmatic-vs-lazy.ts
        communication.ts
        technical.ts
      heuristics.ts                loads heuristic library (content from research agent)
    commands/                      palette command handlers
    storage/                       longitudinal .weave/observations ledger writer
  media/                           icons, sidebar webview assets
  test/
    suite/                         @vscode/test-electron suites
    unit/                          vitest for pure modules
  .vscodeignore
  .github/workflows/ci.yml
  package.json                     "the-weaver-vscode", deps: "the-weaver": "^0.2.0"
  esbuild.config.mjs
  tsconfig.json                    NOTE: CommonJS for the extension host —
                                    VS Code extensions still prefer CJS entry
                                    even though ESM is supported. Transpile
                                    the extension to CJS, but import the MCP
                                    SDK as ESM-interop (already works with the SDK).
  CHANGELOG.md
  LICENSE                          (MIT, matching server)
  README.md
```

Note on ESM boundary: The server is ESM (`type: "module"`, Node16 resolution). The extension will consume it at runtime by **spawning its binary**, not by importing its modules. That means the extension's own module system can be CJS (standard for VS Code) without any ESM/CJS interop pain. This is a second-order benefit of Option (a) from §1 — the transport boundary doubles as the module-system boundary.

---

## 3. Phased Roadmap

### Phase 0 — Skeleton  (effort: S, ~3–5 days)

Scope: prove the spawn-and-speak-MCP pipe works end to end inside a VS Code extension host. No UI beyond a single command.

Deliverables:
- `the-weaver-vscode` repo bootstrapped (`yo code` starter, then customized).
- Bundler: **esbuild** (see §4) with watch mode.
- `McpClient` wrapper around `StdioClientTransport` with lifecycle: spawn, ready, dispose.
- Single command `Weaver: Ping Server` that calls `list_tools` and logs the 8 tool names.
- Server bundled in the extension as a hard dependency; preference order: (1) workspace-local `node_modules/the-weaver`, (2) extension's own bundled copy.
- CI: GitHub Actions workflow that builds + runs a smoke test via `@vscode/test-electron`.

Acceptance:
- `F5` in VS Code launches the extension host.
- Palette → `Weaver: Ping Server` prints 8 tools in the Output channel.
- Killing the extension host terminates the child `node.exe` on Windows (no orphans — verify with Task Manager).
- CI is green.

Signal families shipped: **0** (zero — this phase is plumbing only).

### Phase 1 — MVP  (effort: L, ~3–4 weeks)

Scope: a coherent first release that a developer can install from the Marketplace, run on their own repo, and get real retrospective value from — without any continuous observation yet. Purely command-driven.

Deliverables:
- Commands (all 5): `Start Retrospective`, `Quick Scan`, `Investigate`, `Debate Perspectives`, `Generate Report`. Each maps to the corresponding MCP prompt.
- Sidebar tree view **minimal**: shows current session status (idle / analyzing / dialogue / complete), current finding, captured lessons count.
- Webview for report viewing (markdown render of `generate_narrative` output).
- Native VS Code consent modal before any analysis runs. Matches `ConsentGate.grant` call site.
- Safe words wired: any `STOP/PAUSE/BREAK/EXIT` typed into the dialogue webview input is forwarded as `agent_dialogue` response; the existing `consent-gate.ts` handles it. Extension observes the `isError` return and closes the session UI.
- Rehearsal mode toggle in a VS Code setting (`weaver.rehearsalMode`); when on, saves are blocked (server already enforces this).
- `.weave/` read-back: on activation, read existing `lessons/*.json` and show them in the tree.
- Packaging: `vsce package` produces a `.vsix`. Publish to Marketplace under `PatrickRutledge.the-weaver-vscode`.

Signal families shipped: **2 of 9** — `technical` (delegated entirely to existing server pattern detection) and `haste` (detectable from existing data without new engine code: revert chains + burst periods + "fix/fix/fix" in existing `MessagePattern` output).

Acceptance:
- A user installs from Marketplace, opens a real repo, runs `Weaver: Start Retrospective`, answers 5 findings, types `STOP` on the 6th and the session ends cleanly.
- `generate_narrative` output renders in the webview with syntax highlighting.
- `.weave/lessons/` is populated after explicit save.
- No child process orphaned after 50 open/close cycles (Windows-specific soak test).
- CI includes a headless `@vscode/test-electron` run against a fixture repo.

### Phase 2 — Continuous Observation & Signals  (effort: L, ~4–6 weeks)

Scope: this is where the extension earns its distinct identity versus just-use-the-MCP-server-from-Claude-Code. Passive surfacing of signals while the user works.

Deliverables:
- Long-lived MCP client per workspace (spawn once on activate, dispose on deactivate).
- File system watcher on `.git/HEAD`, `.git/refs/**`, and `package.json`, debounced 5 s.
- Incremental analysis: add a new **non-breaking** server tool `analyze_recent` (takes `sinceHash` or `maxCommits`, reuses `GitAnalyzer` with a tighter window). Or alternatively, just call existing `analyze_repository` with `maxCommits: 50` and diff client-side.
- `SignalDetector` module in the extension that transforms the server's `RepositoryAnalysis` into the 9 human pattern families. For each: source evidence (see §5), a confidence score, and a short natural-language narrative.
- Sidebar tree view **full**: Live Weave, Signals (grouped by family, each expandable), Lessons, Comfort meter reading.
- Status bar item: `$(pulse) Weave: 3 signals · comfort OK`. Click opens sidebar.
- CodeLens (opt-in per workspace via `weaver.codeLens.enabled`, default `false`): on files matching `hotspots` from the last analysis, show a lens above the top of file: `⚠ 12 changes in 30 days · investigate`. Clicking opens an investigation for that file.
- Heuristic library surfacing: each signal card in the sidebar can expand to show the relevant heuristic (e.g., a haste signal cites "Hofstadter's law" with the source). Content is loaded from `docs/HEURISTICS.md` in the extension repo, which the heuristics research agent is producing in parallel.
- Longitudinal ledger: every debounced analysis appends a one-line record to `.weave/observations.ndjson` (gitignored by default — extension suggests adding it to `.gitignore` on first write, but never silently modifies user files). Ledger is editable; "promote to lesson" and "dismiss" commands on each entry.

Signal families shipped: **all 9**. See §5 for each family's mapping.

Acceptance:
- Extension runs for 8 continuous hours with under 200 MB RSS on a 10k-commit repo.
- A commit burst after midnight with a following revert triggers a "haste" signal card within 10 s of the revert being committed.
- Editing a hot file shows the CodeLens (only when enabled).
- Disabling CodeLens clears it within one editor refresh.
- No toast notifications are ever shown. All surfaces are pull-based.
- User can right-click any signal → "dismiss permanently" → `.weave/dismissed.json` records the pattern so it never re-fires.

### Phase 3 — Polish  (effort: M, ~2–3 weeks)

Scope: make it feel considered, not beta.

Deliverables:
- Multi-root workspace support (one MCP client per folder; merge view in sidebar).
- Report webview: cross-project comparison (wraps `cross_project_patterns` tool).
- Debate view: webview that renders the MCP `debate` prompt's two-perspective exchange as a styled transcript.
- Comfort meter visualization: a small inline sparkline in the status bar, computed from `ComfortMeter` signals forwarded via a new read-only server resource (non-breaking).
- Theme-aware icons and colors (light/dark/high contrast).
- Extension-side settings schema, all defaults off for anything passive.
- Marketplace listing: screenshots, short video, categories, keywords.
- Accessibility: screen reader labels on tree items, keyboard shortcuts for the five palette commands.

Signal families shipped: no new families; refinements to the 9 (better narratives, more evidence citations).

Acceptance:
- `vscode-axe` or `@vscode/test-web` accessibility audit passes with no errors.
- Marketplace listing live with a non-trivial install count after 2 weeks of soft launch.
- No user-reported P0/P1 issues for 2 weeks post-launch.

### Out-of-scope for v1 (explicitly)

- Telemetry of any kind. Not even anonymized. (Non-negotiable per PHILOSOPHY.md.)
- Team/shared `.weave/` sync. A separate future project.
- Remote MCP servers. Local only.
- AI inference inside the extension. The host AI is still the reasoner; the extension surfaces patterns, the AI interprets them.

---

## 4. Tooling Choices

**Bundler: esbuild.** VS Code's own guidance recommends esbuild for modern extensions. Sub-second rebuilds, native TypeScript, watch mode, handles the `@modelcontextprotocol/sdk` ESM-to-CJS interop cleanly with `--format=cjs --platform=node --external:vscode`. Webpack is the legacy default but costs 5–10× in build time and has no benefit for a node-target extension without asset pipelines. Decision: esbuild with a tiny `esbuild.config.mjs` plus `--watch` for dev.

**Test runner: `@vscode/test-electron` for integration, `vitest` for units.** Integration suite launches a real VS Code instance against a fixture git repo in a temp dir, verifies the sidebar tree renders and a retrospective completes. Unit suite covers pure modules (SignalDetector, heuristic loader) with vitest — matching the server's existing test stack, so contributors only learn one runner. Add `@vscode/test-electron` only for the things that actually need a running extension host (commands, UI, lifecycle).

**CI updates — `the-weave` server repo:**

The existing repo has **no `.github/workflows/ci.yml`** (STATUS.md lists adding it as medium priority). Create it regardless of the extension:

```
.github/workflows/ci.yml
  jobs:
    test:
      matrix: [ubuntu-latest, windows-latest]   # Windows matters — CRLF
      steps: checkout → setup-node 20 → npm ci → npm run lint → npm test → npm run build
```

Windows in the matrix is non-negotiable given the CRLF perspective loader and `simpleGit` conventions. No extension-specific changes to this file — the server repo CI stays about the server.

**CI — extension repo:**

```
.github/workflows/ci.yml
  jobs:
    build-and-test:
      matrix: [ubuntu-latest, windows-latest]
      steps: checkout → setup-node 20 → npm ci → npm run lint →
             xvfb-run -a npm test (on linux) / npm test (on windows) →
             npm run build → vsce package --no-dependencies
```

**Packaging: `@vscode/vsce`.** Standard path. `vsce package` locally for testing, `vsce publish` from a GitHub Actions release job gated on a tag push. Use `--no-dependencies` because esbuild already bundled everything; shipping `node_modules` inside the VSIX is both enormous and needless. Personal Access Token stored as a GitHub encrypted secret.

**Versioning:**
- `the-weaver` (server): strict SemVer. The extension's `package.json` pins `"the-weaver": "^0.x.y"` during the 0.x era, will move to `"^1"` post-1.0. A breaking server change = a major bump = extension needs an explicit upgrade.
- `the-weaver-vscode` (extension): Marketplace SemVer (Marketplace does not support prerelease tags via `~` the way npm does — use Marketplace's "pre-release" flag for beta channel).
- **Keep the MCP tool/prompt/resource names as the public API contract.** Renaming any of the 8 tools is a breaking change for the extension *and* for Claude Code/Cursor users. CI should include a contract test that asserts the 8 tool names + 5 prompt names + 5 resource URI patterns are present, so accidental renames fail CI on the server repo.

---

## 5. Signal Detection Design

For each of the 9 families: evidence source, which existing `src/engine/*` module surfaces it, and whether new server work is needed.

| Family | Evidence | Existing engine module | New server work? |
|--------|----------|------------------------|------------------|
| **Procrastination** | Stale branches (`BranchInfo.daysSinceLastCommit > N`); TODOs that have been in-file > M days (requires blame); abandoned WIP branches not merged | `git-analyzer.ts` (stale branches already), `file-analyzer.ts` | Yes — add **TODO/FIXME age scan** as a new engine module `todo-scanner.ts` that runs `git blame` on TODO lines. Exposed as non-breaking new tool `analyze_todos`. |
| **Selective sweat** | Heavy churn on low-complexity files (docs, config, formatting) while known hot logic files stay cold; bikeshedding = many small commits to the same non-load-bearing file | `file-analyzer.ts` (churn + hotspots); need file classification (logic vs. config vs. docs) | Yes — extend `file-analyzer.ts` with a lightweight classifier (by path + extension heuristics: `*.md`, `*.config.*`, `test/**` are "peripheral"; everything else is "core"). Expose `coreVsPeripheralChurn` field on `RepositoryAnalysis`. Non-breaking addition. |
| **Under-skill / undertrained** | Copy-paste patterns (duplicated blocks ≥ N lines); repeated API misuse across commits (e.g., the same anti-pattern re-introduced after being fixed); missing idioms for detected framework | `dependency-analyzer.ts` (knows framework), `pattern-detector.ts` (knows circular re-adds) | Yes — new engine module `duplication-scanner.ts` using AST-lite string hashing on current working tree (not git history). New tool `analyze_duplication`. This is heavier work; could be deferred to Phase 2.5 if needed. |
| **Lack of cooperation** | Solo branches (`BranchInfo.uniqueAuthors === 1`) that land without review markers in commit messages; ignored PR feedback (harder — requires GitHub API, intentionally out of scope for local-only v1); parallel reinvention (same topic touched by different authors in disjoint branches) | `git-analyzer.ts` (authors per branch), `pattern-detector.ts` (topic extraction) | Mostly no — existing data suffices for solo-branches and parallel-reinvention. New perspective markdown file `perspectives/cooperation.md` with triggers for these patterns. No new tool. |
| **Haste** | Late-night megacommits (hour-of-day + file count per commit); missing tests (commit touches `src/` without touching `test/`); fast revert chains (`RevertPattern.daysBetween < 2`); "fix/fix/fix" message sequences | `git-analyzer.ts` (commit frequency hourly, reverts), `pattern-detector.ts` (message patterns, sentiment) | No. All data already flows; extension-side `SignalDetector` aggregates. |
| **Impatience** | Abandoned spikes (branches with < 5 commits, never merged, ≥ 30 days stale); premature framework swaps (dep added then removed within N weeks — needs historical dep tracking); dependency churn (count of `package.json` edits per quarter) | `dependency-analyzer.ts` (current snapshot only), `git-analyzer.ts` (commit history) | Yes — `dependency-analyzer.ts` is snapshot-only today. Add a `DependencyHistoryAnalyzer` that walks `package.json` through `git log -p` to reconstruct dep churn. Non-breaking new tool `analyze_dependency_history`. |
| **Pragmatic shortcut vs. laziness** | Context-dependent — shortcuts near release dates (correlate with tags/release commits) are pragmatic; shortcuts without external pressure are laziness signals | `git-analyzer.ts` (tags — not currently parsed!), `pattern-detector.ts` | Yes — `git-analyzer.ts` needs to parse tags (one new call `git.tags()` and tag dates). This is a small, non-breaking addition. Extension-side detector then correlates each `frustration` sentiment indicator or revert with nearest tag. Per the brief, the tool surfaces the distinction; it never moralizes. |
| **Poor communication** | Vague commit messages (< N chars, or regex-matched "update", "fix", "wip" without context); undocumented breaking changes (dep major bumps without corresponding doc edits); missing ADRs (no `docs/adr/` or `decisions/` directory despite architectural churn) | `pattern-detector.ts` (message patterns already), `file-analyzer.ts` (for ADR directory presence) | No. Existing `MessagePattern` output plus a directory existence check is sufficient. New perspective file `perspectives/communication.md` can define triggers. |
| **Technical** | Hot files, complexity drift (file-size growth over time), dep age (requires registry lookup — explicitly out of scope for local-only v1; limit to "pinned to old major version X") | `file-analyzer.ts`, `dependency-analyzer.ts`, existing `pattern-detector.ts` | No. Already covered by existing analysis. The extension surfaces it in the sidebar's "Technical" group. |

**Summary of new server-side work needed** (all non-breaking additions):
1. `todo-scanner.ts` + tool `analyze_todos` (for Procrastination)
2. File classification extension to `file-analyzer.ts` (for Selective sweat)
3. `duplication-scanner.ts` + tool `analyze_duplication` (for Under-skill)
4. Tag parsing in `git-analyzer.ts` (for Pragmatic-vs-lazy)
5. `DependencyHistoryAnalyzer` + tool `analyze_dependency_history` (for Impatience)
6. Two new perspective markdown files: `perspectives/cooperation.md`, `perspectives/communication.md` (community-contributable, no code changes)

These are additive. The 8 existing tools and 5 existing prompts keep their signatures. Server version bumps from 0.1.0 to 0.2.0 (minor) — Cursor/Claude Code users see new tools, nothing breaks.

**Where the heuristic library lives:** `the-weaver-vscode/src/signals/heuristics.ts` loads a JSON or YAML file whose content is produced by the parallel heuristics research agent. The extension attaches relevant heuristic IDs to signal cards. The server does not need to know about heuristics — they are a UX concern. This keeps the server lean and the research/content iteration cycle fast.

---

## 6. Risks & Open Questions

**MCP-over-stdio lifecycle inside the VS Code extension host.**
- Risk: orphan `node.exe` processes on Windows when the extension host crashes (VS Code's `window.onDidCloseTerminal`-style disposal does not cover spawned children cleanly).
- Mitigation: use `context.subscriptions.push({ dispose: () => killTree(childPid) })`, implement via `tree-kill` npm package on Windows. Soak test: open/close window 100×, verify Task Manager shows zero leaked `node.exe` with the weaver command line.
- Open question: should we adopt a named-pipe transport as a Phase-2 resilience improvement? MCP SDK supports custom transports. Would let the extension reconnect to a still-alive server after an extension host reload.

**Consent gates surfacing through VS Code UI without feeling naggy.**
- Risk: the current `ConsentGate.grant('session-start')` is a single event, but users will run many sessions. If every session prompts, users will click-through and consent becomes theater — the exact failure mode `PHILOSOPHY.md` warns about.
- Mitigation: native VS Code modal on *first* retrospective of the workspace; thereafter a small ambient indicator in the status bar showing "consent: granted this session." Revoke is always one click away via the status bar. Rehearsal mode is a checkbox in the consent modal. No modal for passive signal surfacing — that is pull-based and requires no new consent beyond "install the extension," documented in the README.
- Open question: do we treat workspace trust (VS Code's own `isTrusted` API) as a precondition? Probably yes — if VS Code doesn't trust the workspace, we shouldn't read its git history. Needs decision in Phase 0.

**Performance on large repos.**
- Risk: 10k+ commit repos. Current `maxCommits` default is 500; extending history to the full repo for first analysis can take 30+ seconds on Windows (simpleGit is fork-based per call).
- Mitigation: default cap stays at 500, with a "deep analysis" opt-in command that runs the full history in a VS Code progress notification (cancellable). Cache the result keyed by repo path + HEAD hash in extension global state.
- Open question: do we parallelize branch-by-branch analysis? `git-analyzer.ts` currently loops branches serially. A repo with 50 branches takes ages. Parallelism is easy but adds complexity — deferrable to Phase 3.

**Windows-specific gotchas.**
- CRLF: already handled in perspective loader; extension-side markdown rendering in the webview must not double-newline. Use a deterministic markdown renderer (`marked` with `gfm: true, breaks: false`) and test on a Windows fixture.
- Path separators: `path.join` everywhere; never string-concatenate paths. Already the server convention.
- `simpleGit` named import: the extension's mcp client doesn't import `simpleGit`, but any future in-process analysis (which we are not doing per §1 recommendation) would need to preserve the named-import pattern. Document in CONTRIBUTING.
- File locking on `.git`: Windows holds locks longer than Linux. File watchers can double-fire on `.git/index.lock`. Debounce window must account for this — 5 s is conservative enough; validate empirically.
- `node.exe` spawn with stdio pipes: on Windows, stdio buffers can deadlock if not drained. MCP SDK handles this internally, but if we ever add raw-process hooks (log streaming) we must drain.

**Other risks / open questions:**

- **VS Code marketplace identity.** Publisher ID needs to be registered under `PatrickRutledge`. Confirm with the user; alternative is `burnfiddlesticks` (per email domain).
- **Heuristics attribution.** The heuristics research agent will produce sourced entries. We must commit the bibliography verbatim (not paraphrased) into the extension repo to preserve scholarly honesty. Risk: source URLs rot. Plan: archive each source via `web.archive.org` on commit and include the archive URL.
- **When the `.weave/` directory gets checked into git.** Some users will commit it (team lessons-learned); others won't want observations tracked. Extension should offer a first-run choice: "Add `.weave/observations.ndjson` to `.gitignore`?" Default yes (observations are noisy); `.weave/lessons/*.json` are left unignored so users can deliberately commit them. Never silently modify user files — always ask.
- **Signal fatigue.** The 9 families can produce a lot of cards on a messy repo. Risk: user ignores all signals because too many. Mitigation: cap visible signals at 10, rank by severity + recency, make the rest accessible via "show all." Also support per-signal-type mute from the sidebar.
- **Testing the dialogue UX.** Hard to test conversational flows with `@vscode/test-electron` alone; consider Playwright for webview interaction tests in Phase 3.
- **Contract testing between server versions and extension versions.** A user on extension v1.2.0 might have server v0.1.0 pinned in their workspace. Extension must gracefully detect missing new tools (`list_tools` doesn't include `analyze_todos`) and silently disable the features that need them rather than erroring.
- **Claude Code / Cursor parity.** Features Phase 2 adds (the 9 signal families) are currently extension-only logic. Open question: do we port the `SignalDetector` into the server as a tool, so Cursor users get the same value via a slash command? Leaning yes for Phase 3 — keeps the "server is canonical" promise.

---

### Critical Files for Implementation

- D:\the-weave\src\index.ts
- D:\the-weave\src\server\tools.ts
- D:\the-weave\src\engine\git-analyzer.ts
- D:\the-weave\src\engine\pattern-detector.ts
- D:\the-weave\src\trust\consent-gate.ts
