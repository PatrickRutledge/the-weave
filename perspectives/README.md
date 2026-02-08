# Perspective Files

Perspectives are the heart of The Weaver's analysis. Each perspective is a markdown file that teaches the system to examine a project from a specific professional viewpoint -- a Skeptic who questions assumptions, a Deployer who scrutinizes infrastructure decisions, a Trust Monitor who tracks collaboration breakdowns, and so on.

**No TypeScript required.** To add a new perspective, drop a `.md` file in this directory. The Weaver loads it at runtime.

## How Perspectives Work

When The Weaver analyzes a repository, it:

1. Reads every `.md` file in this directory (excluding this README)
2. Parses the YAML frontmatter to understand what the perspective cares about
3. Matches `triggers` against analysis data (git patterns, file changes, branch history)
4. For each triggered perspective, uses `questionFocus` to generate targeted questions
5. Filters findings through `antiPatterns` and `successPatterns` to classify what it sees

Perspectives do not contain logic. They contain *knowledge* -- what to look for, what questions to ask, and how to interpret what the data shows.

## File Format

Every perspective file has two sections: YAML frontmatter and a markdown body.

### YAML Frontmatter

The frontmatter is fenced by `---` lines at the top of the file. All fields are required unless noted.

```yaml
---
name: "The Skeptic"
description: "Questions assumptions baked into early decisions"

triggers:
  - commit_clusters
  - reverted_commits
  - abandoned_branches

questionFocus:
  - "What assumptions were made before this work began?"
  - "Were those assumptions validated or just accepted?"
  - "What would have changed if the assumption was wrong from the start?"

antiPatterns:
  - name: "Assumption Cascade"
    description: "Building on unverified assumptions until the whole stack collapses"
    signals:
      - "Multiple reverts in the same module"
      - "Feature branch restarted from scratch"
  - name: "Zealous Liar"
    description: "Following instructions precisely without understanding the goal"
    signals:
      - "Commits that implement then immediately undo a change"
      - "Comments like 'trying again' or 'still broken'"

successPatterns:
  - name: "Early Validation"
    description: "Checking assumptions before building on them"
    signals:
      - "Spike or POC branch before main implementation"
      - "Small exploratory commits before large feature work"
---
```

#### Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Display name shown in findings list (e.g., `[Skeptic] Unvalidated assumption...`) |
| `description` | string | One-line summary of what this perspective examines |
| `triggers` | string[] | Analysis data keywords that activate this perspective (see Trigger Keywords below) |
| `questionFocus` | string[] | Template questions this perspective asks the developer |
| `antiPatterns` | object[] | Negative patterns this perspective watches for |
| `antiPatterns[].name` | string | Short name for the pattern |
| `antiPatterns[].description` | string | What this pattern looks like and why it matters |
| `antiPatterns[].signals` | string[] | Observable evidence in git history or project artifacts |
| `successPatterns` | object[] | Positive patterns this perspective celebrates |
| `successPatterns[].name` | string | Short name for the pattern |
| `successPatterns[].description` | string | What good practice this represents |
| `successPatterns[].signals` | string[] | Observable evidence that this pattern is present |

### Body Section

Everything below the closing `---` of the frontmatter is the perspective's body. This is free-form markdown that provides deeper context for the analysis engine. Structure it however makes sense, but the following sections are conventional:

- **Context** -- When and why this perspective matters
- **What to Look For** -- Detailed guidance beyond what fits in `signals`
- **Example Findings** -- Concrete examples of what this perspective surfaces
- **Interaction Notes** -- How this perspective relates to or builds on other perspectives

The body is provided to the host AI as context during analysis, so write it as if you are briefing an analyst.

## Trigger Keywords

Triggers connect perspectives to the data The Weaver extracts from a repository. A perspective activates when *any* of its triggers match available data.

| Keyword | What It Maps To |
|---------|-----------------|
| `commit_clusters` | Bursts of many commits in a short time window |
| `reverted_commits` | Commits that revert previous work |
| `abandoned_branches` | Branches with no activity for 30+ days |
| `build_failures` | Commits with messages indicating build/CI failures |
| `circular_commits` | Code added, removed, then re-added |
| `time_sinks` | Features with disproportionately many commits |
| `file_churn` | Files modified in a high percentage of commits |
| `tool_configs` | Changes to package.json, tsconfig, CI configs, Dockerfiles |
| `dependency_changes` | Additions, removals, or major version bumps in dependencies |
| `branch_complexity` | Unusual branch structures, long-lived branches, merge conflicts |
| `commit_messages` | Patterns in commit message tone or content (frustration, uncertainty) |
| `collaboration_signals` | Co-authored commits, AI-generated code markers, pair programming signs |

New triggers can be added as the analysis engine grows. If your perspective needs data that no existing trigger provides, note it in the body and open an issue.

## Contributing a New Perspective

1. Create a new `.md` file in this directory. Name it after the perspective in kebab-case (e.g., `the-skeptic.md`, `dependency-archaeologist.md`).
2. Add the YAML frontmatter with all required fields.
3. Write a body section that gives the analysis engine enough context to apply the perspective well.
4. Test by running The Weaver against a repository and checking that your perspective appears in the findings when its triggers match.
5. Open a pull request. The PR description should explain what gap this perspective fills that existing ones do not.

Guidelines:

- **One concern per perspective.** A perspective that tries to cover everything covers nothing. If you find yourself listing more than 4-5 triggers, consider splitting into two perspectives.
- **Concrete signals.** Vague signals like "code seems messy" are not actionable. Prefer observable evidence: "More than 3 reverts in the same module within a week."
- **Questions, not judgments.** `questionFocus` items should open dialogue, not deliver verdicts. "What led to this pattern?" not "Why did you make this mistake?"
- **Name collisions.** Check existing files before choosing a name. Two perspectives named "The Analyzer" helps nobody.

## Example Perspective File

```markdown
---
name: "The Tool Selector"
description: "Evaluates whether the right tools were chosen for the job"

triggers:
  - tool_configs
  - dependency_changes
  - time_sinks

questionFocus:
  - "What drove the decision to use this tool or framework?"
  - "Were alternatives evaluated, or was this the first option tried?"
  - "Did the tool's limitations become apparent only after significant investment?"

antiPatterns:
  - name: "Tool Obsession"
    description: "Forcing a tool to do something it was not designed for"
    signals:
      - "Multiple workaround commits for a single library"
      - "Switching between 3+ tools for the same task"
  - name: "Resume-Driven Development"
    description: "Choosing tools based on novelty rather than fitness"
    signals:
      - "Complex framework for a simple problem"
      - "Dependencies added then never used"

successPatterns:
  - name: "Quick Pivot"
    description: "Recognizing a wrong tool choice early and switching"
    signals:
      - "Tool replaced within first few commits of a feature"
      - "Spike branch used to evaluate before committing"
---

## Context

Tool selection is one of the highest-leverage decisions in a project. A good
choice disappears into the background; a bad choice generates noise across
every subsequent commit.

## What to Look For

Examine `package.json` changes, framework config files (tsconfig, webpack,
vite, etc.), and Dockerfiles. Look for:

- Tools added and removed in quick succession
- Workaround patterns (custom scripts to patch tool limitations)
- Multiple tools serving the same purpose simultaneously

## Example Findings

- "Electron was chosen for desktop packaging without evaluating PWABuilder,
  leading to 3 days of configuration struggles."
- "Three different CSS frameworks appear in the dependency history. Only the
  last one shipped."

## Interaction Notes

Works closely with **The Skeptic** (were tool assumptions validated?) and
**The Efficiency Analyst** (how much time did wrong tool choices cost?).
```
