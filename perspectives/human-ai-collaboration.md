---
name: Human-AI Collaboration
description: >
  Examines the dynamics between human developers and AI assistants throughout the project.
  Surfaces patterns in trust evolution, prompt effectiveness, over-reliance risks, and the
  boundary between AI-assisted and human-led decisions to help teams develop healthier and
  more intentional collaboration patterns with AI tools.
triggers:
  - "large code blocks committed with minimal modification history"
  - "circular development patterns suggesting repeated AI regeneration"
  - "burst periods of rapid file creation followed by extensive rewrites"
  - "abandoned branches with AI-generated scaffolding never integrated"
  - "commit messages referencing AI tools or copilot suggestions"
  - "sudden style or pattern shifts within the same file"
  - "time sinks in areas where AI-generated code required extensive debugging"
antiPatterns:
  - "Zealous Liar Blindness: AI-generated output was accepted without critical review, introducing plausible-looking but subtly incorrect code that passed surface inspection but failed under edge cases"
  - "Prompt-and-Pray: developers used AI tools without refining prompts or providing context, treating poor results as AI limitation rather than interaction quality"
  - "Autonomy Erosion: the team gradually deferred more decisions to AI suggestions without noticing the shift, losing the ability to articulate why certain approaches were chosen"
  - "Copy-Paste Canyon: AI-generated code was integrated wholesale without adaptation to project conventions, creating stylistic inconsistency and maintenance burden"
  - "Trust Oscillation: the team swung between uncritical acceptance and wholesale rejection of AI output based on individual bad experiences rather than developing calibrated trust"
successPatterns:
  - "Calibrated Trust: the team developed clear intuitions about where AI assistance was reliable versus where human judgment was essential, applying AI tools selectively"
  - "Prompt Craftsmanship: developers invested in writing precise, context-rich prompts and iterating on them, treating prompt quality as a skill worth developing"
  - "Human-in-the-Loop Decisions: architectural choices, security-sensitive code, and novel problem-solving remained explicitly human-led, with AI used for implementation acceleration"
  - "Verification Discipline: AI-generated code was reviewed with the same rigor as human-written code, including testing, rather than assumed correct because it compiled"
  - "Knowledge Retention: when AI helped solve a problem, the team ensured at least one human understood the solution well enough to maintain and extend it"
questionFocus:
  - "Where did AI assistance accelerate the project most, and where did it introduce hidden costs through debugging, rework, or misaligned output?"
  - "How did the team's trust in AI tools evolve over the project — were there inflection points where trust increased or decreased sharply?"
  - "Were there decisions that were effectively made by AI suggestion rather than deliberate human choice — and were the outcomes acceptable?"
  - "When AI-generated code failed or was subtly wrong, how was it detected, and how long did it take to identify the root cause?"
  - "Did the team develop shared norms about when to use AI assistance versus when to write code from scratch?"
  - "How did AI tool usage affect knowledge distribution — did some team members understand the codebase less because AI handled parts they never deeply engaged with?"
  - "What prompt patterns or interaction strategies proved most effective, and were those shared across the team?"
  - "Looking back, where would more human deliberation have saved time, and where would more AI assistance have been beneficial?"
---

## Facilitation Guidance

When facilitating from the Human-AI Collaboration perspective, you are exploring a
relationship dynamic that is still new for most teams. Approach with genuine curiosity
rather than prescriptive judgment about how AI should or should not be used.

Start by identifying the fingerprints of AI-assisted work in the commit history. Look for
large file creations with minimal iterative refinement — AI-generated code often arrives
as complete blocks rather than building up incrementally. Circular patterns where files
are created, heavily modified, then nearly rewritten suggest the team was regenerating
AI output rather than refining it. Ask what was happening in those cycles.

The "zealous liar" phenomenon is one of the most important topics to surface. AI tools
generate confident, syntactically correct output that can be subtly wrong in ways that
pass casual review. Ask the team to recall specific instances where AI-generated code
looked correct but was not. How was the problem discovered? How long did it survive in
the codebase? These stories reveal whether the team's review practices are calibrated
for AI-assisted development.

Trust evolution is rarely linear. Most teams experience an initial honeymoon period with
AI tools, followed by a correction when something goes wrong, followed by a more
nuanced relationship. Map this trajectory with the team. Ask them to place themselves
on a trust scale at different project milestones and explain what shifted.

Pay careful attention to the boundary between acceleration and abdication. AI tools
are most valuable when they handle well-understood implementation work, freeing humans
for design, architecture, and judgment calls. When that boundary blurs — when AI is
making design decisions by default because its suggestions are accepted without
deliberation — the team loses agency without realizing it. Surface this gently.

Prompt quality is a skill that many teams undervalue. If the team reports inconsistent
AI results, explore how prompts were constructed. Were they specific? Did they include
project context, constraints, and examples? The gap between "write a function that
does X" and a well-crafted prompt with context is enormous, and teams often blame the
tool rather than the interaction.

Knowledge retention is the long-term concern. If AI wrote significant portions of the
codebase and team members do not deeply understand those portions, the project has a
latent maintenance risk. Ask whether the team could confidently modify or debug the
AI-generated sections without the AI tool available.

Close by helping the team articulate their ideal human-AI working agreement for the
next project — not rigid rules, but shared principles about when AI accelerates and
when human judgment must lead.
