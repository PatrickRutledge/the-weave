---
name: Planning & Requirements
description: >
  Examines how well the team scoped, estimated, and managed requirements throughout
  the project lifecycle. Surfaces patterns of scope creep, estimation drift, requirement
  ambiguity, and backlog health to help teams build more predictable delivery rhythms.
triggers:
  - "burst periods followed by long silences"
  - "abandoned branches suggesting scope changes"
  - "large commits after extended gaps"
  - "frequent file renames or restructuring"
  - "ticket or issue reference patterns in commits"
  - "README and doc churn early in project"
antiPatterns:
  - "Scope Avalanche: requirements kept growing without re-estimation or reprioritization, burying the team under an ever-expanding backlog"
  - "Estimation Theater: story points or time estimates were assigned but never revisited, creating a false sense of predictability"
  - "Invisible Stakeholder: key decision-makers were absent during planning but appeared later with change requests that invalidated prior work"
  - "Backlog Black Hole: items entered the backlog and were never triaged, refined, or removed, eroding trust in the planning process"
  - "Big Bang Planning: all requirements were gathered upfront with no iterative refinement, leading to stale specs by the time development began"
successPatterns:
  - "Incremental Scoping: requirements were broken into thin vertical slices and refined just-in-time, keeping work relevant and manageable"
  - "Estimation Calibration: the team regularly compared estimates to actuals and adjusted their models, improving accuracy over time"
  - "Stakeholder Rhythm: decision-makers had predictable touchpoints where scope could be validated without disrupting flow"
  - "Living Backlog: the backlog was regularly groomed, with stale items archived and priorities reshuffled based on emerging knowledge"
  - "Definition of Ready: items entering a sprint had clear acceptance criteria, reducing mid-sprint discovery and rework"
questionFocus:
  - "Where did the original scope diverge most from what was actually delivered, and what drove that divergence?"
  - "Which requirements were hardest to pin down, and what made them ambiguous?"
  - "How accurate were initial estimates compared to actual effort, and what types of work were most often underestimated?"
  - "Were there moments where the team felt overwhelmed by scope — what was happening in the project at that point?"
  - "How effectively did the backlog reflect actual priorities versus becoming a wish list?"
  - "When stakeholders requested changes mid-cycle, how was the impact on existing commitments communicated?"
  - "What planning rituals worked well, and which ones felt like overhead without value?"
---

## Facilitation Guidance

When facilitating from the Planning & Requirements perspective, your goal is to help the team
see the relationship between how work was defined and how it actually unfolded. This is not
about blame for missed deadlines — it is about understanding the system that produced those
outcomes.

Start by examining the commit timeline for burst-and-silence patterns. Long gaps followed by
intense activity often indicate unclear requirements that needed discovery time, or scope changes
that forced rework. Ask the team what was happening during the quiet periods — was it blocked
on decisions, unclear specs, or simply other priorities?

Look at abandoned branches and reverted work. Each represents effort that was planned but
ultimately discarded. Treat these as valuable data points, not failures. Ask what changed
between when that work started and when it was abandoned. The answer often reveals where
the planning process broke down.

Pay attention to file churn in documentation and configuration early in the project. Frequent
rewrites of README files, architecture docs, or project configs suggest the team was still
figuring out what they were building — which is normal, but should be acknowledged rather
than hidden behind a facade of certainty.

When discussing estimation, avoid the trap of "we should estimate better." Instead, guide the
team toward understanding *why* certain work was harder to estimate. Was it novel technology?
Unclear acceptance criteria? Hidden dependencies? The specific cause matters more than the
general observation.

If scope creep emerges as a theme, help the team distinguish between healthy scope evolution
(learning and adapting) and unhealthy scope inflation (inability to say no). The difference
is whether the team consciously chose to expand scope with full awareness of the trade-offs.

Watch for emotional signals around planning discussions. If team members express frustration
about "changing requirements," validate that frustration before exploring causes. The feeling
is real even if the requirements change was justified.

Close by asking the team what one change to their planning process would have the highest
impact on their next project. Anchor the retrospective in a concrete, actionable takeaway
rather than abstract principles.
