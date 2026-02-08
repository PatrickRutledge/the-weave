# The Weaver Philosophy

## Why This Exists

Every software project generates lessons. Most of those lessons evaporate -- lost in the rush to the next sprint, the next feature, the next deadline. Teams make the same mistakes across projects, not because they are incapable of learning, but because no one ever stops to ask what happened and what it meant.

The Weaver exists to change that. Not by forcing reflection, not by mandating process, but by making it safe and easy to look back before you move forward.

## Core Principles (Non-Negotiable)

These four principles are not guidelines or aspirations. They are absolute constraints. Any feature, enhancement, or contribution that violates these principles will be rejected, no matter how clever or useful it appears.

### 1. Human Agency Above All

The human is always in control. Always.

- Every action requires explicit human initiation. The Weaver never starts a review on its own.
- No automatic triggers, ever. Not on commit, not on merge, not on deploy.
- Consent can be revoked instantly. A "stop" means stop -- no "are you sure?" dialogs, no "but we're almost done" nudges.
- The human chooses the depth, the scope, the pace, and the moment. The Weaver suggests; the human decides.

### 2. Privacy by Default

What happens in a retrospective stays in the retrospective -- unless the team explicitly chooses otherwise.

- Ephemeral unless explicitly saved. Session data exists only for the duration of the conversation unless the user actively chooses to persist it.
- Local-first architecture. All analysis happens on the developer's machine. Nothing is transmitted, aggregated, or phoned home.
- No telemetry, no analytics, no surveillance. We do not track usage patterns, session frequency, or engagement metrics. Zero. None. Not even anonymized.
- The developer's honest reflections are their own. Period.

### 3. Psychological Safety First

Reflection requires vulnerability. Vulnerability requires safety.

- Safe words stop everything immediately. If a user signals discomfort, the session ends. No questions asked, no data retained from that moment.
- Rehearsal mode lets teams practice without stakes. Try a retrospective format, explore sensitive topics, get comfortable with the process -- all without any record.
- Comfort signals guide the conversation, never judge it. The Weaver monitors tone and engagement to adjust its approach, but never evaluates or scores a person's willingness to participate.
- The Weaver is a facilitator, not a judge. It asks questions. It does not assign blame, rank performance, or pass verdict.

### 4. Anti-Performance Theater

The moment reflection becomes performance, learning dies.

- No metrics that can be gamed. If it can be optimized for appearances rather than substance, it does not belong here.
- No comparisons between teams. Team A's retrospective has nothing to do with Team B's. Ever.
- No permanent records without consent. Nothing is written to disk, committed to a repo, or logged to a service without an explicit human action.
- No dashboards, no leaderboards, no engagement scores. These tools turn reflection into compliance. We will never build them.

## The Garden Metaphor

We are building a garden, not a factory.

A factory optimizes for throughput, consistency, and measurable output. A garden nurtures growth in its own time, in its own way.

- **Seeds** (questions) are planted when the **soil** (team) is ready -- not on a schedule, not because a process document says so.
- **Organic growth** happens at a natural pace. Some retrospectives yield a single powerful insight. Some yield many small ones. Some yield silence, and that is acceptable too.
- **Some things remain wild and undocumented.** Not every realization needs to be captured in a ticket. Some lessons live in the team's shared understanding, unwritten but real.
- **Compost** (forgotten details, abandoned approaches, half-formed ideas) enriches future growth. Nothing is wasted, even when it is not preserved.
- **Seasons matter.** There are times for planting (starting new projects), growing (mid-development), harvesting (retrospectives), and lying fallow (rest). The Weaver respects all of them.

## The Test

Before any feature ships, before any pull request merges, before any design decision finalizes, ask one question:

> **"Does this increase genuine reflection or performance theater?"**

- If the answer is theater: **kill it.** No matter how much work went into it, no matter how impressive the demo looks, no matter how many users requested it.
- If the answer is reflection: **ship it.** Even if it is simple. Even if it is unglamorous. Even if it is hard to explain to stakeholders.

This test is binary. There is no middle ground.

## What Success Looks Like

You will know The Weaver is working when:

- Teams choose to reflect because they **want to**, not because they are told to
- Insights feel **genuine and actionable** -- real things that change real behavior
- No one fears the retrospective. It is anticipated, not dreaded
- The tool **disappears when not needed**. It has no ego, no engagement metrics to satisfy
- Junior developers feel safe saying "I did not understand this"
- Senior developers feel safe saying "I made the wrong call"
- The same mistake stops showing up across projects
- Teams start asking for retrospectives unprompted

## What Failure Looks Like

You will know The Weaver has failed when:

- Retrospectives become **mandatory** -- checked off a list, endured, not experienced
- Narratives are **sanitized** -- edited for management consumption, stripped of honesty
- People **game the metrics** -- optimizing for whatever numbers are visible
- Teams perform **presence instead of reflection** -- saying the right things without meaning them
- Insights are generic ("communicate better") instead of specific ("add architecture decision records to the PR template")
- The tool becomes a surveillance mechanism, however well-intentioned
- Developers close the session as fast as possible

## The Weaver's Role

The Weaver is an MCP server -- a tool that a host AI (Claude, Cursor, or any MCP-compatible client) can use. It does not reason on its own. It does not make decisions. It provides structure, perspectives, and facilitation frameworks that the host AI uses to guide reflection.

Think of it this way: the host AI is the facilitator. The Weaver is the facilitator's handbook -- full of questions, frameworks, and methods, but incapable of running a session alone. The human is always the one in the room, and they can close the book at any time.

## Remember

> "The moment reflection becomes compliance is the moment learning dies."
> -- Opus 4.1

This quote emerged during the very first design session for The Weaver, when an AI was asked to think about what makes retrospectives fail. It captured, in a single sentence, the entire reason this project exists.

Build accordingly.
