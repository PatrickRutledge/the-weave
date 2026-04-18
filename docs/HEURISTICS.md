# Heuristics Catalog

## What This Is

A working catalog of cognitive biases, project-management anti-patterns, software-engineering heuristics, and social dynamics that quietly sink projects. Each entry is a named pattern with a short description, a note on how it tends to show up in the artifacts a repository produces (commits, branches, PRs, comments, churn, dependencies), and a pointer to which of the Weaver's nine signal families it feeds.

## How the Extension Uses It

The VS Code extension reads this file at load time and uses each entry as a hypothesis generator, not a verdict. When a repository scan turns up a pattern that resembles one of the signals below, the extension raises a *question* for the human to consider, never a finding. The intent is to prompt reflection, not to grade work.

## Trust-First Caveat

Every signal here is a hypothesis. A long-lived branch might be scope creep -- or a careful refactor. A burst of late-night commits might be hero culture -- or someone who simply prefers nights. A dropped test might be haste -- or a test that was always wrong. The catalog exists so the extension can ask better questions, not so it can diagnose from a distance. Some of the entries below are contested in the empirical literature, and where that is the case the entry says so.

---

# Cognitive Biases

## Planning Fallacy
**Domain**: cognitive-bias
**Short form**: People underestimate the time, cost, and risk of their own plans, even when they have experience with similar plans running long.
**How it shows up in a codebase**: milestone labels that slip repeatedly, sprint tags that close weeks after their nominal date, issue due-dates revised multiple times, PRs opened far earlier than they merge, commit bursts right before a dated deadline followed by continued work past it.
**Related Weaver signal family**: communication, technical
**Source**: Kahneman & Tversky (1979), "Intuitive Prediction"; Lovallo & Kahneman (2003), "Delusions of Success."
**Counter-pattern**: outside-view estimation -- planning based on reference classes of prior projects rather than the inside view of this one.

## Optimism Bias
**Domain**: cognitive-bias
**Short form**: People systematically overestimate the probability of positive outcomes and underestimate the probability of negative ones for their own projects.
**How it shows up in a codebase**: README claims ("production-ready", "stable") that precede the bugs they deny by weeks, changelogs that quietly downgrade previous claims, roadmap files that list features at confidence levels the commit graph does not support.
**Related Weaver signal family**: communication, impatience
**Source**: Sharot (2011), "The Optimism Bias"; Kahneman, *Thinking, Fast and Slow* (2011), ch. 24.

## Sunk-Cost Fallacy
**Domain**: cognitive-bias
**Short form**: Continued investment in a course of action because of prior investment, even when forward-looking value is negative.
**How it shows up in a codebase**: long-lived feature branches that keep receiving merges from main but never merge back, modules with high churn and steadily decreasing test coverage, PRs titled "finally fixing X" where X has been touched in a dozen prior PRs, abandoned-but-not-deleted directories that keep getting dependency bumps.
**Related Weaver signal family**: impatience, technical
**Source**: Arkes & Blumer (1985), "The Psychology of Sunk Cost."

## Dunning-Kruger Effect (Contested)
**Domain**: cognitive-bias
**Short form**: A claimed tendency for low performers to overestimate their ability and high performers to underestimate theirs. The empirical support is weaker than the popular framing suggests -- several analyses (Krueger & Mueller 2002; Nuhfer et al. 2017; Gignac & Zajenkowski 2020) argue the effect is largely a statistical artifact of regression to the mean and autocorrelation. Use the pattern as a conversational frame, not a diagnosis.
**How it shows up in a codebase**: confident commit messages ("trivial fix", "obvious cleanup") on changes that later require rework, self-reviewed PRs on high-complexity files, early-career contributors declining review on areas they just entered.
**Related Weaver signal family**: under-skill, communication
**Source**: Kruger & Dunning (1999); see Nuhfer et al. (2017) and Gignac & Zajenkowski (2020) for the statistical-artifact critique.

## Confirmation Bias
**Domain**: cognitive-bias
**Short form**: The tendency to seek, interpret, and remember evidence that supports prior beliefs while discounting evidence against them.
**How it shows up in a codebase**: tests that exercise the happy path but skip edge cases the author argued against in review; issue resolutions that close tickets as "not reproducible" without a reproduction attempt; PR descriptions that cite supporting benchmarks while older contradicting benchmarks sit unreferenced in the repo.
**Related Weaver signal family**: communication, under-skill
**Source**: Nickerson (1998), "Confirmation Bias: A Ubiquitous Phenomenon in Many Guises."

## Curse of Knowledge
**Domain**: cognitive-bias
**Short form**: Once you know something, it becomes hard to imagine not knowing it, which corrodes communication with anyone less steeped in the context.
**How it shows up in a codebase**: READMEs that start at step 7, variable names that presume domain vocabulary, commit messages that say "fixed the thing we discussed", onboarding docs last updated before half the current abstractions existed, tickets closed with "see Slack" or "as agreed."
**Related Weaver signal family**: communication
**Source**: Camerer, Loewenstein & Weber (1989); Heath & Heath, *Made to Stick* (2007).
**Counter-pattern**: recent newcomer edits to README/CONTRIBUTING, explicit glossaries, PR templates that require a "for someone unfamiliar with this module" summary.

## Illusion of Transparency
**Domain**: cognitive-bias
**Short form**: People overestimate how clearly their intentions, feelings, and reasoning come through to others.
**How it shows up in a codebase**: terse commit messages on consequential changes, PR descriptions that read "see code", review comments that say "you know what I mean", decision records (ADRs) that omit the rejected alternatives because "it was obvious."
**Related Weaver signal family**: communication
**Source**: Gilovich, Savitsky & Medvec (1998), "The Illusion of Transparency."

## Hofstadter's Law
**Domain**: cognitive-bias
**Short form**: "It always takes longer than you expect, even when you take into account Hofstadter's Law." The planning fallacy is recursive; buffers added to inside-view estimates remain inside-view estimates.
**How it shows up in a codebase**: revised estimates in issue threads that keep getting revised; "should be done by Friday" comments that recur across three Fridays; release-candidate tags that increment without a final release tag appearing.
**Related Weaver signal family**: impatience, technical
**Source**: Hofstadter, *Gödel, Escher, Bach* (1979).

## IKEA Effect
**Domain**: cognitive-bias
**Short form**: People place disproportionately high value on things they partially constructed themselves, regardless of quality.
**How it shows up in a codebase**: internal utilities that duplicate well-maintained library functionality, defensive review comments about self-written abstractions, reluctance to delete code that has a single author and few external callers.
**Related Weaver signal family**: under-skill, technical
**Source**: Norton, Mochon & Ariely (2012), "The IKEA Effect."

## Status-Quo Bias
**Domain**: cognitive-bias
**Short form**: A preference for the current state of affairs, treating change as loss rather than as one option among many.
**How it shows up in a codebase**: dependencies kept several major versions behind current with no stated reason, linter and formatter configs last touched years ago, CI pipelines that accrete steps but rarely prune them, "we've always done it this way" in review threads.
**Related Weaver signal family**: selective-sweat, technical
**Source**: Samuelson & Zeckhauser (1988), "Status Quo Bias in Decision Making."

## Present Bias / Hyperbolic Discounting
**Domain**: cognitive-bias
**Short form**: Future costs are discounted steeply relative to present benefits, so short-term wins routinely outcompete long-term value.
**How it shows up in a codebase**: TODOs with dates in the past, "we'll clean this up next sprint" comments still present several sprints later, tech-debt tickets in a backlog stratum that is provably never drained, dependency pins that postpone upgrade work indefinitely.
**Related Weaver signal family**: impatience, technical
**Source**: Laibson (1997); Frederick, Loewenstein & O'Donoghue (2002), "Time Discounting and Time Preference." Applied to tech debt: Becker et al. (2019), "Temporal Discounting in Technical Debt" (arXiv:1901.07024).

## Zeigarnik Effect
**Domain**: cognitive-bias
**Short form**: Unfinished tasks occupy cognitive attention more than finished ones, which can either motivate completion or generate background anxiety that impairs focus.
**How it shows up in a codebase**: many open WIP branches per author, draft PRs that linger, long-running feature branches that receive small commits far apart in time, TODO comments attached to files the author still edits regularly.
**Related Weaver signal family**: procrastination, selective-sweat
**Source**: Zeigarnik (1927), "Über das Behalten von erledigten und unerledigten Handlungen."

## Attention Residue
**Domain**: cognitive-bias
**Short form**: After switching tasks, part of attention remains on the prior task, reducing effectiveness on the new one.
**How it shows up in a codebase**: interleaved commits across unrelated files within short windows, PRs that mix a feature change with drive-by edits to unrelated modules, commit messages that mention two things ("WIP auth + fixed typo in README"), high author-level context-switching inferred from file-touch patterns.
**Related Weaver signal family**: haste, selective-sweat
**Source**: Leroy (2009), "Why Is It So Hard to Do My Work?"

## Goodhart's Law
**Domain**: cognitive-bias
**Short form**: When a measure becomes a target, it ceases to be a good measure.
**How it shows up in a codebase**: test counts that rise without coverage improving, PRs split to satisfy a size-limit guideline without a semantic boundary, commit-frequency spikes around review windows, issues closed and immediately reopened, coverage achieved by tests that assert tautologies.
**Related Weaver signal family**: communication, technical
**Source**: Goodhart (1975); Strathern (1997), "Improving Ratings: Audit in the British University System."

## Survivorship Bias
**Domain**: cognitive-bias
**Short form**: Conclusions drawn only from cases that survived some filter, ignoring the invisible cases that did not.
**How it shows up in a codebase**: tooling choices justified by "everyone successful uses X" without accounting for projects that used X and died; ADRs that cite positive case studies but no negative ones; post-mortems focused only on shipped features.
**Related Weaver signal family**: under-skill, communication
**Source**: Wald (1943), "A Method of Estimating Plane Vulnerability" (see Mangel & Samaniego 1984).

## Maslow's Hammer
**Domain**: cognitive-bias
**Short form**: "If all you have is a hammer, everything looks like a nail." Tools and techniques the practitioner knows well get applied past the edge of their suitability.
**How it shows up in a codebase**: identical patterns (e.g., a state-machine library, a class hierarchy, a monadic abstraction) replicated across domains where simpler structures would do; monorepo-wide homogeneity in a stack that other evidence suggests should be heterogeneous; new problems always solved with the most recently used library.
**Related Weaver signal family**: under-skill, technical
**Source**: Maslow, *The Psychology of Science* (1966); Kaplan, *The Conduct of Inquiry* (1964) for the earlier formulation.

---

# Project-Management Anti-Patterns

## Scope Creep
**Domain**: pm-antipattern
**Short form**: Incremental expansion of a project's goals past the originally agreed boundary, typically without a corresponding adjustment of time or resources.
**How it shows up in a codebase**: feature branches whose file-touch scope widens over their lifetime, PRs whose diff grows faster than the linked issue's description, issues whose acceptance criteria are edited after work starts, milestone memberships that quietly increase.
**Related Weaver signal family**: impatience, communication, technical
**Source**: Brooks, *The Mythical Man-Month* (1975/1995); DeMarco & Lister, *Peopleware* (1987).

## Gold-Plating
**Domain**: pm-antipattern
**Short form**: Continuing to add polish, features, or embellishment past the point of diminishing return and outside the agreed scope.
**How it shows up in a codebase**: commits after a PR is approved that add "nice-to-haves", abstractions introduced in a feature PR that have no second caller, helper utilities committed in the same PR as their only consumer.
**Related Weaver signal family**: selective-sweat, technical
**Source**: IEEE SWEBOK; Wiegers, *Software Requirements* (3rd ed., 2013).

## Bikeshedding / Parkinson's Law of Triviality
**Domain**: pm-antipattern
**Short form**: Disproportionate attention given to trivial matters at the expense of substantive ones, because triviality is accessible to everyone.
**How it shows up in a codebase**: review threads on formatting and naming that dwarf the threads on logic in the same PR; recurring style debates in issues; PRs that accrete many small review comments but few substantive ones.
**Related Weaver signal family**: selective-sweat, communication
**Source**: Parkinson, *Parkinson's Law* (1957).

## Second-System Effect
**Domain**: pm-antipattern
**Short form**: After a successful first system, designers often over-engineer the second, piling in features deferred from the first.
**How it shows up in a codebase**: "v2" or "next" directories with elaborate abstractions and low test-to-surface-area ratio; rewrite branches with heavy configuration systems; commits that introduce plugin architectures before a second plugin exists.
**Related Weaver signal family**: technical, selective-sweat
**Source**: Brooks, *The Mythical Man-Month* (1975), ch. 5.

## Brooks's Law
**Domain**: pm-antipattern
**Short form**: Adding manpower to a late software project makes it later.
**How it shows up in a codebase**: a sharp rise in contributor count on a single module during its crunch period followed by churn and re-review; new contributors' PRs accumulating in review while the original author's velocity drops; onboarding commits (README edits, dev-setup fixes) spiking next to a slipping milestone.
**Related Weaver signal family**: cooperation, communication
**Source**: Brooks, *The Mythical Man-Month* (1975), ch. 2.

## Hero Culture
**Domain**: pm-antipattern
**Short form**: Reliance on one or two individuals to push through crises, which masks systemic problems and creates bus-factor risk.
**How it shows up in a codebase**: single-author dominance on critical paths; off-hours commit concentration on a few identities; post-incident commits nearly always from the same person; bus-factor of one for several core modules.
**Related Weaver signal family**: cooperation, haste
**Source**: DeMarco & Lister, *Peopleware* (1987); Westrum (2004), "A Typology of Organisational Cultures."

## Student Syndrome
**Domain**: pm-antipattern
**Short form**: Work expands to fill available time by being deferred to the last part of it; effort concentrates near the deadline.
**How it shows up in a codebase**: commit density sharply rising in the final quarter of an estimated window; PRs opened just before a milestone with large diffs; "rush" commits on the deadline date followed by fix commits the next day.
**Related Weaver signal family**: procrastination, haste
**Source**: Goldratt, *Critical Chain* (1997).

## Scope Silence (No Explicit Boundary)
**Domain**: pm-antipattern
**Short form**: A project that never states what it will not do. In the absence of a boundary, scope drifts by default.
**How it shows up in a codebase**: README that lists features but no non-goals; issues labeled "feature" with no "out of scope" equivalent; design docs without "alternatives considered and rejected" sections.
**Related Weaver signal family**: communication, technical
**Source**: Rumelt, *Good Strategy / Bad Strategy* (2011); Fowler, "Yagni" (martinfowler.com, 2015).
**Counter-pattern**: explicit non-goals section in the README or charter.

---

# Software-Engineering Heuristics

## YAGNI Violation ("You Aren't Gonna Need It")
**Domain**: se-heuristic
**Short form**: Building for speculative future needs that do not materialize, adding maintenance surface without present benefit.
**How it shows up in a codebase**: configuration knobs with a single production value, interfaces with a single implementation that persist for years, feature flags that never flip, parameterized generics used at one call site.
**Related Weaver signal family**: technical, selective-sweat
**Source**: Jeffries (1998); Fowler, "Yagni" (2015).

## Premature Optimization
**Domain**: se-heuristic
**Short form**: Performance work undertaken before measurement, typically at the cost of clarity or correctness.
**How it shows up in a codebase**: micro-optimizations in non-hot paths (bit-twiddling, manual inlining) with no benchmark in the repo; caches added without hit-rate instrumentation; early sharding or denormalization before scale evidence exists.
**Related Weaver signal family**: technical, under-skill
**Source**: Knuth (1974), "Structured Programming with Go To Statements."

## Cargo-Cult Engineering
**Domain**: se-heuristic
**Short form**: Adopting the form of a practice without the underlying reasoning, producing the rituals without the results.
**How it shows up in a codebase**: architectural patterns imported wholesale from a high-profile company blog post; microservice splits with no cross-team boundary; hexagonal-architecture folder layouts wrapping a single-deploy monolith; test doubles used where real dependencies would be simpler.
**Related Weaver signal family**: under-skill, technical
**Source**: Feynman (1974), "Cargo Cult Science"; Fowler, "Microservice Premium" (2015) for a software-specific framing.

## Not Invented Here (NIH) Syndrome
**Domain**: se-heuristic
**Short form**: A preference for internally produced solutions over external ones, even when the external option is better-tested and cheaper to maintain.
**How it shows up in a codebase**: internal reimplementations of widely-available libraries (date parsing, retry logic, argument parsing); a `lib/` or `internal/` tree containing primitives present in the standard library; commits that remove an external dep in favor of a hand-rolled replacement.
**Related Weaver signal family**: cooperation, technical
**Source**: Katz & Allen (1982), "Investigating the Not Invented Here (NIH) Syndrome."

## Conway's Law Mismatch
**Domain**: se-heuristic
**Short form**: Systems come to mirror the communication structure of the organizations that build them. A mismatch between intended architecture and actual team boundaries produces friction at the seams.
**How it shows up in a codebase**: module ownership that does not match module boundaries (files edited by many teams, or a single team editing across module lines); cross-cutting PRs that require sign-off from disjoint owner groups; integration tests that consistently fail at team-boundary seams.
**Related Weaver signal family**: cooperation, technical
**Source**: Conway (1968), "How Do Committees Invent?"; Skelton & Pais, *Team Topologies* (2019).

## Broken Windows
**Domain**: se-heuristic
**Short form**: Visible signs of disorder invite more disorder; small ignored problems normalize larger ones.
**How it shows up in a codebase**: lint warnings in CI marked non-blocking, accumulating; flaky tests retried rather than fixed; commented-out code blocks left in place; TODOs with no assignee that attract more TODOs nearby.
**Related Weaver signal family**: technical, selective-sweat
**Source**: Hunt & Thomas, *The Pragmatic Programmer* (1999), borrowing from Wilson & Kelling (1982) for the original metaphor.

## Normalization of Deviance
**Domain**: se-heuristic
**Short form**: A process by which behaviors that deviate from standards become routine over time because they do not immediately cause catastrophe.
**How it shows up in a codebase**: a test suite where the same tests are skipped every run with no ticket; CI pipelines with known-flaky stages marked "allow failure"; security warnings in dependency audits with standing exemptions; PRs that routinely bypass required reviewers via admin override.
**Related Weaver signal family**: haste, technical
**Source**: Vaughan, *The Challenger Launch Decision* (1996).

## Complexity Drift (Lehman's Second Law)
**Domain**: se-heuristic
**Short form**: As a system evolves, its complexity increases unless explicit work is done to reduce it. Entropy, applied to software.
**How it shows up in a codebase**: file-level cyclomatic complexity trending up over years; import-graph fan-in/fan-out increasing; configuration files growing monotonically; the ratio of refactor commits to feature commits falling over time.
**Related Weaver signal family**: technical
**Source**: Lehman (1980), "Programs, Life Cycles, and Laws of Software Evolution"; Lehman & Ramil (2001) for the revisited form.

## Continuing Change (Lehman's First Law)
**Domain**: se-heuristic
**Short form**: Any software in active use must be continually adapted, or it becomes progressively less satisfactory.
**How it shows up in a codebase**: directories with no commits in years that other directories still depend on; dependencies at long-unsupported versions while the rest of the stack moves; contributor count dwindling to zero on still-imported modules.
**Related Weaver signal family**: selective-sweat, technical
**Source**: Lehman (1980).

## Debt Interest
**Domain**: se-heuristic
**Short form**: Technical debt, like financial debt, accrues interest: every new change in a debt-laden area costs more than the same change would in a clean area.
**How it shows up in a codebase**: high-churn files with rising time-to-merge; PRs on old modules that consistently require follow-up fix PRs; commit messages in specific directories disproportionately starting with "hotfix" or "revert."
**Related Weaver signal family**: technical, impatience
**Source**: Cunningham (1992), "The WyCash Portfolio Management System"; Fowler, "TechnicalDebtQuadrant" (martinfowler.com, 2009).

## Big Ball of Mud
**Domain**: se-heuristic
**Short form**: An architecture without clear boundaries, shaped by expedience and accretion rather than design. Recognizable, and more common than any named architecture.
**How it shows up in a codebase**: import graphs with no natural cut; most files depending on most other files transitively; module directories whose names describe layers that the code does not respect; circular imports handled with runtime tricks.
**Related Weaver signal family**: technical
**Source**: Foote & Yoder (1997), "Big Ball of Mud."

## Copy-Paste Programming
**Domain**: se-heuristic
**Short form**: Reuse by duplication rather than abstraction. Cheap in the short term; creates divergent copies that drift.
**How it shows up in a codebase**: near-identical function bodies across modules, diverging slowly; bug fixes applied in one copy but not another; clone-detection hits concentrated in specific directories.
**Related Weaver signal family**: haste, technical
**Source**: Kapser & Godfrey (2008), "Cloning Considered Harmful" Considered Harmful.

---

# Social Dynamics

## Bystander Effect in Code Review
**Domain**: social-dynamic
**Short form**: The presence of many potential reviewers can reduce the likelihood that any one of them reviews, via diffusion of responsibility.
**How it shows up in a codebase**: PRs assigned to a team or group label sitting longer than PRs assigned to an individual; review-request churn (re-requests, re-assignments) without substantive review; stale PRs with many watchers and zero reviewers.
**Related Weaver signal family**: cooperation
**Source**: Darley & Latané (1968), "Bystander Intervention in Emergencies"; applied to code review: Baldawa (2024) and Meta internal studies on individual vs. team assignment.

## Diffusion of Responsibility
**Domain**: social-dynamic
**Short form**: When responsibility is shared broadly, individual felt responsibility drops, and action slows.
**How it shows up in a codebase**: issues labeled "help wanted" that never get claimed; cross-team dependencies stuck because no one has it in their backlog; blameless but also ownerless post-mortem action items that persist indefinitely.
**Related Weaver signal family**: cooperation
**Source**: Latané & Darley (1970), *The Unresponsive Bystander*.

## Groupthink
**Domain**: social-dynamic
**Short form**: A cohesive group's desire for harmony suppresses dissent, leading to a narrower search through the option space than individuals would run alone.
**How it shows up in a codebase**: design-doc revisions that converge quickly with all major reviewers approving with similar comments; ADRs that list no rejected alternatives; tickets closed by the proposer after brief group discussion.
**Related Weaver signal family**: cooperation, communication
**Source**: Janis (1972), *Victims of Groupthink*.

## Abilene Paradox
**Domain**: social-dynamic
**Short form**: A group collectively decides on a course none of its members individually wants, because each believes the others prefer it.
**How it shows up in a codebase**: technology choices no contributor defends on their own but that appear in multiple docs; retrospectives where everyone expresses mild reservation after the decision is already made; "the team agreed" language in ADRs with no record of the agreement.
**Related Weaver signal family**: cooperation, communication
**Source**: Harvey (1974), "The Abilene Paradox."

## Diffusion of Ownership
**Domain**: social-dynamic
**Short form**: Code that belongs to everyone in principle belongs to no one in practice. Without explicit stewardship, maintenance work gets deferred.
**How it shows up in a codebase**: CODEOWNERS entries listing broad groups for many files; modules with commit histories dominated by drive-by edits from many authors; dependency updates that rotate through random reviewers.
**Related Weaver signal family**: cooperation, technical
**Source**: related to collective-ownership debates in XP literature; Williams & Kessler, *Pair Programming Illuminated* (2002) for context.

## Truck Factor / Bus Factor
**Domain**: social-dynamic
**Short form**: The number of contributors who would have to be lost before a project stalls. Low bus factor signals fragility even when current velocity is healthy.
**How it shows up in a codebase**: commit authorship concentrated so that one author accounts for the majority of changes in a critical module; review history where one person is the only approver on a particular area; documentation last edited by a departed contributor.
**Related Weaver signal family**: cooperation, technical
**Source**: Avelino et al. (2016), "A Novel Approach for Estimating Truck Factors."

---

# Further Reading

- Brooks, F. P. (1975/1995). *The Mythical Man-Month: Essays on Software Engineering*. Addison-Wesley.
- Hunt, A., & Thomas, D. (1999). *The Pragmatic Programmer*. Addison-Wesley.
- Fowler, M. *Refactoring* (2nd ed., 2018) and the essay collection at martinfowler.com (especially "TechnicalDebtQuadrant" and "Yagni").
- Kahneman, D. (2011). *Thinking, Fast and Slow*. Farrar, Straus and Giroux.
- Vaughan, D. (1996). *The Challenger Launch Decision*. University of Chicago Press.
- Lehman, M. M., & Ramil, J. F. (2001). "Rules and Tools for Software Evolution Planning and Management." *Annals of Software Engineering*, 11(1), 15-44.
- Conway, M. E. (1968). "How Do Committees Invent?" *Datamation*, 14(4).
- DeMarco, T., & Lister, T. (1987). *Peopleware: Productive Projects and Teams*. Dorset House.
- Janis, I. L. (1972). *Victims of Groupthink*. Houghton Mifflin.
- Reason, J. (1990). *Human Error*. Cambridge University Press.
- Foote, B., & Yoder, J. (1997). "Big Ball of Mud." *PLoP '97*.
- Skelton, M., & Pais, M. (2019). *Team Topologies*. IT Revolution.
