---
name: Documentation
description: >
  Examines the state, evolution, and gaps in project documentation across all forms —
  README files, inline comments, architectural decision records, API docs, and tribal
  knowledge. Surfaces what was documented, what should have been, and how documentation
  quality affected onboarding, debugging, and long-term maintainability.
triggers:
  - "README churn concentrated in early or late project phases"
  - "code files with high complexity but minimal inline comments"
  - "hotspot files lacking corresponding documentation updates"
  - "abandoned branches with no documented rationale for abandonment"
  - "configuration files with unexplained magic values"
  - "commit messages that serve as the only record of design decisions"
  - "dependency count increases without corresponding docs updates"
antiPatterns:
  - "Write-Only Documentation: docs were created once at project start and never updated, becoming actively misleading as the codebase evolved past them"
  - "Tribal Knowledge Dependency: critical context lived only in specific team members' heads, creating bus-factor risks and onboarding bottlenecks"
  - "Comment Noise: inline comments restated what the code did rather than explaining why, adding visual clutter without value and rotting as code changed"
  - "Documentation Debt Spiral: documentation was perpetually deferred as lower priority than features, until the gap became so large that catching up felt impossible"
  - "README Theater: the README looked polished for external consumption but did not reflect actual setup steps, known issues, or operational reality"
successPatterns:
  - "Living Documentation: docs were updated alongside code changes in the same commits, keeping them synchronized with reality rather than aspirational"
  - "Decision Records: significant architectural or technology choices were documented with context, alternatives considered, and rationale, preserving the 'why' alongside the 'what'"
  - "Strategic Comments: inline comments focused on non-obvious reasoning, edge case explanations, and links to relevant context rather than narrating code"
  - "Onboarding Litmus Test: documentation quality was validated by how effectively a new team member could become productive, with gaps addressed as they were discovered"
  - "Documentation as Dialogue: docs were treated as living conversation artifacts — updated, questioned, and refined — rather than static deliverables"
questionFocus:
  - "If a new developer joined the project tomorrow, what would they struggle most to understand, and where would they look for answers?"
  - "Which design decisions were made during the project that have no written record — and which of those would be hardest to reconstruct from code alone?"
  - "Were there debugging sessions where better documentation would have saved significant time?"
  - "How did documentation responsibilities get distributed — was it everyone's job, one person's job, or nobody's job?"
  - "What documentation existed at the start of the project versus the end — did it grow, shrink, or just age?"
  - "Were there moments where outdated documentation actively caused confusion or incorrect assumptions?"
  - "Which parts of the codebase have the highest gap between complexity and documentation coverage?"
---

## Facilitation Guidance

When facilitating from the Documentation perspective, remember that documentation
conversations often carry guilt. Most developers know they "should document more" and
feel bad about not doing so. Your job is not to reinforce that guilt but to help the
team understand the actual costs of documentation gaps and make intentional choices
about where documentation investment has the highest return.

Start by surveying what documentation actually exists. Look at README files, inline
comments, doc directories, wiki links, and even well-written commit messages. Many
teams have more documentation than they realize — it is just scattered and inconsistent.
Mapping what exists before discussing what is missing gives the conversation a
constructive foundation.

Examine the timeline of documentation changes. Documentation that was written once and
never updated is a specific signal — it means the docs diverged from reality at a
specific point. Ask what changed in the project at that point. Often, documentation
stops being maintained when the team enters a high-pressure phase and never resumes.

The most valuable documentation discussion centers on the "why" behind decisions.
Code can tell you what was built and how. Documentation's unique value is preserving
why a particular approach was chosen, what alternatives were rejected, and what
constraints were in play. When these are lost, future developers (including the
original authors) waste time re-deriving context or making changes that inadvertently
violate forgotten constraints.

Inline comment quality is worth examining specifically. Ask the team to look at a few
representative files and evaluate whether the comments add genuine insight. Comments
that restate code ("increment counter by one") are noise. Comments that explain
non-obvious behavior ("we retry here because the upstream API has a known race
condition during deployments") are invaluable. Help the team see the difference.

Configuration files are a frequent documentation blind spot. Look for environment
variables, magic numbers, timeout values, or feature flags that have no explanation.
These are often the source of production incidents when someone changes a value
without understanding its purpose.

Pay attention to whether the team has any documentation about documentation — shared
norms about what to document, where to put it, and how to maintain it. The absence
of such norms usually means documentation happens only when individuals feel
motivated, leading to inconsistent coverage.

Close by asking the team to identify the single highest-value piece of documentation
that does not exist yet — the one document that would save the most time, prevent
the most confusion, or reduce the most risk. Encourage them to create that one
artifact rather than committing to a sweeping documentation overhaul they will not
sustain.
