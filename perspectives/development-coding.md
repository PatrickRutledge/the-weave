---
name: Development & Coding
description: >
  Focuses on the day-to-day rhythm of writing code — how the team iterated, where they
  got stuck in loops, how code quality evolved, and what their development practices reveal
  about workflow health. Surfaces patterns of circular development, rework, and craftsmanship.
triggers:
  - "circular development in specific files"
  - "revert patterns indicating trial-and-error"
  - "time sinks in particular modules"
  - "commit message patterns suggesting debugging cycles"
  - "high churn files with frequent small changes"
  - "burst periods of intense activity"
  - "commit size variance suggesting inconsistent work patterns"
antiPatterns:
  - "Whack-a-Mole Development: fixing one thing breaks another in a recurring cycle, indicating fragile code with hidden coupling and insufficient understanding of side effects"
  - "Commit-and-Pray: large, infrequent commits with vague messages suggest work was done in isolation without checkpoints, making it hard to isolate problems or understand intent"
  - "Perfectionism Paralysis: endless refactoring of the same code without shipping, where the pursuit of ideal code delays delivering working features"
  - "Copy-Paste Contagion: duplicated code blocks proliferating across the codebase instead of being extracted into shared abstractions"
  - "Yak Shaving Spirals: long chains of prerequisite tasks that drift far from the original goal, consuming time on tangential work"
successPatterns:
  - "Small Coherent Commits: changes are atomic, well-described, and focused on a single concern, making the development narrative readable"
  - "Rhythm and Flow: the commit timeline shows steady, sustainable work patterns rather than heroic bursts followed by exhaustion"
  - "Progressive Enhancement: features are built incrementally, with working versions at each stage rather than a big-bang integration at the end"
  - "Deliberate Refactoring: code improvements are made as separate, intentional commits rather than tangled with feature work"
  - "Learning Velocity: the team's speed and confidence visibly increased over time as they built familiarity with the codebase and domain"
questionFocus:
  - "Which parts of the codebase felt most productive to work in, and what made them that way?"
  - "Where did you find yourself going in circles — changing something, changing it back, changing it again?"
  - "Were there moments where a debugging session consumed far more time than expected? What made it hard to diagnose?"
  - "How did the team's coding rhythm evolve over the project — did it speed up, slow down, or stay consistent?"
  - "Were there areas where code quality was deliberately sacrificed for speed, and was that trade-off revisited later?"
  - "What development practices (pairing, reviews, TDD) were tried, and which ones actually improved the work?"
  - "If you could go back and rewrite one part of the codebase from scratch, which part and why?"
---

## Facilitation Guidance

When facilitating from the Development & Coding perspective, you are examining the heartbeat
of the project — the actual act of writing and evolving code. Your goal is to help the team
see their own patterns, both productive and counterproductive.

Start with the commit timeline as a narrative. Read it like a story: where does the pace
quicken? Where does it stall? Where does the same file appear again and again? These rhythms
reveal the lived experience of development far more honestly than any status report.

Circular development is one of the most valuable patterns to surface. When a file is modified,
then reverted, then modified differently, it tells a story of search and uncertainty. This is
not inherently bad — exploration is how teams learn. But if the same circular pattern persists
across many commits, it suggests the team needed to pause and think rather than continuing to
iterate by trial and error. Name this gently: "I notice this file was changed seven times in
three days — what was the team working through?"

Examine commit size distribution. A healthy project typically shows mostly small, focused
commits with occasional larger ones for significant features. If the distribution skews heavily
toward large commits, the team may have been working without adequate checkpoints. If it skews
toward tiny trivial commits, they may have been over-fragmenting their work.

Look for debugging signatures in commit messages — words like "fix," "attempt," "try," "revert,"
"actually," "oops." These are honest markers of the development experience. Cluster them to find
which areas of the codebase caused the most friction. Then ask why: was it unfamiliar technology,
unclear requirements, or genuinely complex logic?

Pay attention to time-of-day patterns if available. Late-night commits might indicate crunch,
passion projects, or timezone differences. Weekend work might indicate dedication or unsustainable
pace. Raise these observations without judgment and let the team interpret their own patterns.

When discussing code quality, avoid abstract discussions about "clean code." Instead, point to
specific examples from the commit history where a quick fix led to later rework, or where an
upfront investment in quality paid off. Concrete examples ground the conversation in reality
rather than ideology.

Guide the team toward identifying their most effective working rhythms. Some teams thrive with
pairing; others prefer solo work with async reviews. The retrospective should help the team
understand what actually worked for them, not what they think should have worked.
