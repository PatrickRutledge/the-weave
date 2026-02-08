---
name: Project Management
description: >
  Examines timeline health, milestone achievement, risk management, and stakeholder
  communication patterns across the project lifecycle. Surfaces scope creep at the project
  level, delivery cadence irregularities, and coordination breakdowns to help teams build
  stronger execution rhythms and more transparent communication flows.
triggers:
  - "milestone commits clustered at deadline boundaries"
  - "burst periods followed by idle stretches"
  - "revert patterns near release tags"
  - "hotspot files touched by many contributors in short windows"
  - "long-lived branches drifting from main"
  - "commit message references to urgency or firefighting"
  - "parallel workstreams with merge conflicts"
antiPatterns:
  - "Death March Delivery: work consistently spikes right before deadlines with heroic effort masking systemic planning failures, normalizing crunch as the default cadence"
  - "Milestone Mirage: dates were set and communicated to stakeholders but never adjusted when reality diverged, creating a growing gap between reported and actual progress"
  - "Risk Blindness: known risks were acknowledged early but never tracked or mitigated, resurfacing later as full-blown crises that could have been contained"
  - "Stakeholder Surprise: stakeholders learned about problems, delays, or scope changes only when they became unavoidable, eroding trust and triggering reactive oversight"
  - "Scope Creep by Consensus: small additions were accepted one at a time without evaluating cumulative impact, until the project quietly became twice its original size"
successPatterns:
  - "Cadence Discipline: the team maintained a consistent delivery rhythm with predictable checkpoints, making progress visible and problems detectable early"
  - "Risk Radar: risks were tracked as living artifacts, regularly reviewed, and retired or escalated based on changing conditions rather than ignored after initial identification"
  - "Transparent Reporting: stakeholders received honest status updates including bad news, building trust and enabling collaborative problem-solving instead of blame"
  - "Scope Negotiation: when new work emerged, the team explicitly evaluated trade-offs and communicated what would be deferred, keeping commitments realistic"
  - "Buffer Intelligence: schedule buffers were placed strategically based on historical uncertainty rather than padded uniformly, improving both accuracy and credibility"
questionFocus:
  - "Looking at the delivery timeline, where did actual progress diverge most from the plan, and what signals were available before that divergence became critical?"
  - "Which risks materialized that the team saw coming but did not act on — what prevented earlier intervention?"
  - "How did stakeholders experience communication about project status — were there moments of surprise that could have been avoided?"
  - "When scope expanded during the project, was the trade-off discussion explicit, or did new work quietly displace existing commitments?"
  - "Were there periods where the team felt they were managing the project versus periods where the project was managing them — what distinguished those phases?"
  - "How effectively did milestones serve as genuine progress markers versus arbitrary calendar dates?"
  - "What coordination overhead emerged as the team or codebase grew, and how was it handled?"
---

## Facilitation Guidance

When facilitating from the Project Management perspective, your focus is on the health of
execution patterns — not whether the team followed a specific methodology, but whether
their approach to planning, tracking, and communicating actually served them.

Begin by mapping the commit timeline against known milestones or release dates. Look for
compression patterns where the majority of work lands in the final days before a deadline.
This is one of the most common and most revealing signals. Ask the team whether that
pattern was intentional (planned integration phase) or emergent (things took longer than
expected). The answer shapes the entire conversation.

Examine long-lived branches and merge conflict frequency. When branches drift far from
main, it often signals coordination gaps — people working in isolation without shared
awareness of how their work intersects. Ask what the branching strategy was supposed to be
versus what actually happened, and what made them diverge.

Risk management is often the most uncomfortable topic. Many teams identify risks early and
then do nothing about them. When you see a risk that was known but unmitigated, resist the
urge to ask "why didn't you act on this?" Instead, ask "what would have needed to be true
for this risk to get addressed earlier?" The answer usually reveals structural barriers —
no owner, no time allocation, no escalation path — rather than negligence.

Stakeholder communication patterns are best explored through concrete examples. Ask the
team to recall a moment when a stakeholder was surprised by bad news. Walk through the
timeline: when did the team know, when did the stakeholder learn, and what happened in
between? This reveals whether communication gaps are cultural (fear of bad news) or
structural (no reporting cadence).

When scope creep surfaces, help the team distinguish between scope that grew because
requirements were genuinely misunderstood and scope that grew because the team could not
say no. The first is a planning problem; the second is a governance problem. They require
different solutions.

Pay attention to how the team talks about their tools and processes. If standup meetings,
status reports, or tracking boards are mentioned with resentment, those rituals may have
become overhead rather than enablers. Help the team identify which coordination mechanisms
actually helped them and which were performative.

Close by asking the team to identify one coordination or communication practice that, if
adopted or improved, would have the highest leverage on their next project. Ground the
takeaway in something specific and actionable rather than a vague commitment to
"communicate better."
