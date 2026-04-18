# Quality Metrics

Concrete rubrics for judging whether The Weaver is actually doing what the README claims. Each metric has a **pass bar** (minimum to not be misleading) and a **good bar** (what genuine value looks like).

Used as the scoring sheet when running the validation harness against a target repo.

---

## Goal 1 — ANALYZES commit history, branches, dependencies, file changes

**What the README implies**: The tool observes the repo and reports what it sees, accurately and in enough detail to fuel reflection.

| Metric | Pass | Good |
|--------|------|------|
| Commit count accuracy | Within ±1% of `git rev-list --all --count` | Exact match |
| Branch detection | Lists every branch reachable from HEAD | Also flags stale branches with dates |
| Revert detection | Finds every commit message starting with `Revert "` | Also finds logical reverts (commit X then commit Y that undoes X's diff) |
| Hotspot identification | Top 5 files by churn are real files that exist | Top 5 match what a human reviewer would intuit as "the hot files" |
| Dependency awareness | Correctly names the framework/runtime from package.json | Also flags dependency churn (packages added then removed) |
| File-change data | Records path + change count + line delta | Also classifies by file type (src/test/config/docs) |

**Failure modes to watch for**:
- Hallucinating branches that don't exist
- Counting merge commits as regular commits, inflating totals
- Missing reverts that don't use the conventional message format
- Hotspots dominated by package-lock.json or other noise

---

## Goal 2 — IDENTIFIES patterns from 11 SDLC perspectives

**What the README implies**: The 11 perspectives each contribute a distinct lens and surface findings that feel earned, not generic.

| Metric | Pass | Good |
|--------|------|------|
| Findings cite evidence | Each finding names a specific commit, file, or date range | Each finding names multiple pieces of corroborating evidence |
| Perspective diversity | At least 4 of 11 perspectives produce findings | All 11 either produce findings or explicitly report "no signal" |
| Specificity over template | <20% of findings use boilerplate language that could apply to any repo | Every finding could be recognized as belonging to *this specific* repo by a developer who worked on it |
| Severity is calibrated | High-severity findings map to things a human reviewer would also flag | Severity distribution roughly matches human intuition on the repo |
| No blame language | Zero findings use "you should have" / "mistake" / "wrong" / "failed to" | Findings frame as observations + questions, never as judgments |
| Actionable questions | Each finding produces a question that can be answered in one sentence | Questions build on observed evidence, e.g. "On 2026-02-08 you rewrote…, what triggered that?" |

**Failure modes to watch for**:
- Every perspective producing variants of "consider better testing"
- Findings that could be copy-pasted between any two repos without changing a word
- High-severity on trivial findings (status theater)
- Missing the obvious story (e.g., not flagging a total rewrite)

---

## Goal 3 — FACILITATES one-question-at-a-time dialogue

**What the README implies**: A real conversation, not a survey. The one-question-at-a-time rule is inherited from BMAD / military AARs for a reason — it forces engagement.

| Metric | Pass | Good |
|--------|------|------|
| One question per turn | The dialogue tool returns exactly one question, never a list | Questions are specific enough that the answer is obvious to the person who did the work |
| Progress visible | Each turn shows progress (e.g., "Finding 3 of 12") | Also shows estimated time remaining and captured lesson count |
| Safe words honored instantly | Typing STOP/PAUSE/BREAK/EXIT ends/pauses the session on the same turn | Also offers to save progress-so-far when STOPPING mid-session |
| Skip/reorder works | `manage_lesson_list` actions behave as documented | State survives across tool calls; no lost findings after reorder |
| Response informs lesson | The user's typed response becomes the lesson text | The lesson also references the finding's evidence so it reads standalone later |
| Fatigue awareness | Comfort meter surfaces when the user is overloaded | Session auto-suggests a PAUSE before the user hits it |

**Failure modes to watch for**:
- Questions that are actually 3 questions rolled into one
- Safe words only checked at session start
- Lesson text = raw user response, no framing (unreadable in a month)

---

## Goal 4 — CAPTURES lessons as actionable insights

**What the README implies**: A lesson from today is still useful 6 months from now, on a new project.

| Metric | Pass | Good |
|--------|------|------|
| Lessons stored with context | Each saved lesson includes perspective, finding title, user response | Also includes commit hashes, dates, files referenced |
| Actionable phrasing | Each lesson has a "what to do next time" clause | Also has a "what pattern to watch for" clause that works on a different repo |
| No secrets leaked | Lessons never contain file paths that reveal private structure, API keys, auth tokens | Lessons are review-ready to paste into a public retrospective |
| Idempotent writes | Re-running save_lesson doesn't duplicate | De-duplicates on content hash, not just filename |
| Rehearsal mode enforced | Saves are blocked in rehearsal mode, with clear feedback | Practice lessons can be exported without being committed |
| Cross-project reuse | `cross_project_patterns` can find recurring themes across N repos | Recurring themes are named and linked to the source lessons |

**Failure modes to watch for**:
- Lessons = literal raw user response, undigestible later
- "Actionable" section is templated filler
- Duplicate lessons across re-runs

---

## Goal 5 — GENERATES evolution log / narrative

**What the README implies**: The final artifact tells the story of the project, not a list of bullet points.

| Metric | Pass | Good |
|--------|------|------|
| Narrative has arc | Has a beginning (what existed), middle (what changed), end (what was learned) | The arc mirrors the repo's actual timeline — someone who knows the project recognizes it |
| Evidence is cited | Each claim in the narrative is traceable to a finding or commit | Citations are inline, not footnoted as a dump |
| Quick-scan differs from full | Quick-scan is ≤300 words, full is ≤2000 | Quick-scan reads as an abstract for the full |
| No hallucinated history | Every event mentioned happened (verifiable from git log) | Narrative surfaces events the author had forgotten but can verify |
| Reusable by readers | A new contributor reading the narrative gains project context | The narrative is the thing you paste into a new hire's onboarding doc |
| Doesn't blame | Same "no blame" bar as findings | Framing is growth-oriented without being saccharine |

**Failure modes to watch for**:
- Generic "this project has had many commits…" openings
- Bullet-point dump labeled as "narrative"
- Factually wrong claims (hallucinated reverts, wrong dates)

---

## Philosophy Tenets — non-negotiable properties

These are binary. If any fails, it's a bug.

| Tenet | Check |
|-------|-------|
| No blame | Zero findings + lessons + narratives contain blame language (regex check: `you (should|failed|missed)`, `mistake`, `wrong`, `bad code`) |
| Facts first | Every finding leads with observation, not interpretation |
| Safety first | STOP/PAUSE/BREAK/EXIT all tested and work in every session type (retrospective, quick-scan, investigate, debate) |
| Privacy by default | `.weave/` is only written when user explicitly calls `save_lesson`/`save=true`. No auto-save anywhere. Nothing leaves the machine. |
| Anti-performance theater | No metric is surfaced to the user as a score. No gamifiable numbers. Progress is shown as progress, not as performance. |

---

## Scoring

For each validation run:

```
Overall: __ / 50 (10 per goal, 5 goals)
Philosophy: PASS / FAIL (binary — any tenet failure blocks publish)
```

A run must score ≥35/50 **and** PASS on philosophy before we'd consider the tool ready for npm publish or Marketplace release.

---

## The Niche — where this tool earns its place

If the output from a run makes a developer say:

1. "Huh, I forgot about that" — it's surfacing things they missed
2. "That's the pattern, yes" — it's naming what they already felt
3. "I didn't realize I did that 4 times" — it's showing longitudinal truth

…then it's delivering on the human-side-of-development claim. If instead the output makes a developer say:

1. "That's a standard lint complaint" — it's redundant with existing tools
2. "That could apply to any repo" — it's generic
3. "That's not what happened" — it's wrong

…then the value is negative and we iterate the server before shipping anywhere.
