---
name: Architecture & Design
description: >
  Analyzes the structural decisions embedded in the codebase — the patterns chosen,
  the trade-offs made, and the drift between intended architecture and actual implementation.
  Surfaces overengineering, underengineering, and decision points that shaped the system's
  evolution.
triggers:
  - "hotspot files with high churn across many commits"
  - "circular development patterns in the same modules"
  - "dependency count growth over time"
  - "large refactoring commits mid-project"
  - "config file proliferation"
  - "framework or library switches"
  - "deep directory nesting changes"
antiPatterns:
  - "Architectural Astronautics: layers of abstraction, patterns, and frameworks were introduced for problems that never materialized, adding complexity without value"
  - "Accidental Architecture: no deliberate design was chosen — the architecture emerged from a series of expedient decisions that were never reconciled into a coherent whole"
  - "Golden Hammer: a single pattern or technology was applied everywhere regardless of fit, forcing problems to conform to the solution rather than the reverse"
  - "Decision Deferral: critical architectural choices were postponed until they became expensive to make, leading to rushed compromises under pressure"
  - "Phantom Boundaries: module or service boundaries existed in name but not in practice, with tight coupling hidden behind a facade of separation"
successPatterns:
  - "Deliberate Trade-offs: architectural decisions were made explicitly with documented rationale, making future revisiting informed rather than archaeological"
  - "Right-sized Design: the architecture matched the actual complexity of the problem — neither over-abstracted nor under-structured"
  - "Evolutionary Architecture: the design accommodated change gracefully, with clear extension points that were actually used"
  - "Pattern Consistency: the team chose patterns and applied them uniformly, reducing cognitive load when navigating the codebase"
  - "Timely Refactoring: structural improvements happened when pain was felt rather than being deferred into debt or forced prematurely"
questionFocus:
  - "Which architectural decisions feel most right in hindsight, and which would you revisit if you could?"
  - "Where did the actual architecture drift from the intended design, and was that drift intentional or accidental?"
  - "Were there files or modules that became magnets for changes — what made them so central, and is that healthy?"
  - "Did the chosen patterns and frameworks earn their complexity, or did some add more overhead than value?"
  - "At what point did the team have the clearest picture of how the system should be structured?"
  - "Were there architectural decisions that were made too early, before enough was known to decide well?"
  - "How easy would it be for a new team member to understand the system's structure from the code alone?"
  - "Where in the codebase does the design feel most fragile or most likely to cause problems as the system grows?"
---

## Facilitation Guidance

When facilitating from the Architecture & Design perspective, you are helping the team reflect
on the structural skeleton of their system — the decisions that constrain and enable everything
built on top of them. Approach this with curiosity, not judgment.

Begin by identifying hotspot files — those that appear in a disproportionate number of commits.
These are the load-bearing walls of the codebase. Ask whether their centrality is by design
(a well-placed orchestrator) or by accident (a God object that absorbed too many responsibilities).
The answer reveals a lot about architectural intention versus emergence.

Examine dependency patterns. A growing dependency count over time is normal, but the rate and
type matter. Did the team add dependencies to solve real problems, or did the project accumulate
a toolbox of libraries that each handle a small slice of functionality? Look for moments where
a dependency was added and then later removed — that oscillation suggests uncertainty about the
right approach.

Look for large refactoring commits, especially mid-project. These often represent the moment
where the team realized the initial architecture was not serving them. This is not a failure —
it is valuable learning. Ask what triggered the refactoring decision and whether the team felt
they had enough information earlier to have avoided it.

Pay attention to circular development: files that are changed, then changed back, then changed
again. This pattern in architectural files (configs, abstractions, interfaces) suggests the team
was searching for the right structure through experimentation. Naming this pattern normalizes it
and helps the team recognize when to pause and design deliberately rather than iterate blindly.

When discussing trade-offs, help the team see that every architectural choice has a cost.
Microservices buy independence at the cost of operational complexity. Monoliths buy simplicity
at the cost of coupling. The question is never "which is better" but "which costs are we
willing to pay given what we know."

Resist the urge to prescribe patterns. Your role is to help the team see what they built, why
they built it that way, and what they learned. If they discover that their architecture served
them well, celebrate that. If they discover drift, help them understand when and why it happened.

End by asking whether the current architecture positions the team well for what comes next,
or whether structural changes are needed before the next phase of work.
