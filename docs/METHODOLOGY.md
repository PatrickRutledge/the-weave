# The Weaver Facilitation Methodology

## Foundations

The Weaver's facilitation methodology draws from three of the most effective debrief traditions in the world: military aviation, Army after-action reviews, and Navy lessons-learned systems. These organizations operate in high-stakes environments where learning from experience is not optional -- it is survival. We adapt their principles for software development, where the stakes are different but the learning dynamics are the same.

## The 25% Promise

Research consistently shows that teams which debrief effectively improve their performance by 25%. Not 2%. Not 5%. Twenty-five percent.

This is not a marginal gain. This is the difference between a team that repeats mistakes and a team that compounds learning. The catch is the word "effectively." Most retrospectives are not effective. They are shallow, rushed, blame-laden, or performative. The Weaver exists to close that gap -- to make effective debriefs the default, not the exception.

## The Blue Angels Debrief Rules

The Blue Angels -- the US Navy's flight demonstration squadron -- fly six jets in formation at 400 mph with 18 inches of separation. After every flight, they debrief. Every single one. Here are their rules:

### No Blame

The debrief is not about finding fault. It is about finding improvement. When something goes wrong, the question is never "whose fault was this?" but "what can we change so this does not happen again?"

In The Weaver, this means:
- Questions focus on circumstances, not individuals
- "What made this difficult?" instead of "Why did you fail?"
- "What information would have helped?" instead of "What should you have done?"
- The system never assigns blame, even implicitly

### Every Flight

The Blue Angels do not debrief only when something goes wrong. They debrief after every flight -- the perfect ones and the imperfect ones alike. There are lessons in success just as there are lessons in failure.

In The Weaver, this means:
- Retrospectives are not reserved for disasters
- Successful projects get reviewed too: "What went right and why? Can we replicate it?"
- The habit of reflection matters more than any single session

### Facts First

Before anyone interprets, explains, or theorizes, the Blue Angels establish what actually happened. Sequence of events. Observable facts. Objective data.

In The Weaver, this means:
- Start with artifacts: git history, commit patterns, branch timelines, file changes
- Establish the timeline before exploring causes
- Let the data speak before the narratives form
- "What happened?" always comes before "Why did it happen?"

### Drive Out Fear

If people are afraid to speak honestly, the debrief is theater. The Blue Angels create an environment where the most junior pilot can critique the most senior officer's flying. Rank disappears in the debrief room.

In The Weaver, this means:
- Psychological safety is a prerequisite, not a nice-to-have
- The system checks comfort levels before going deeper
- Safe words and exit ramps are always available
- Privacy guarantees are absolute

## The Army After-Action Review (AAR) Sequence

The US Army developed the After-Action Review as a structured way to extract learning from any operation. It follows five steps, and the order matters:

### Step 1: What Did We Intend?

Before examining what happened, establish what was supposed to happen. What were the goals? What was the plan? What did success look like going in?

This step matters because you cannot evaluate an outcome without knowing what you were aiming for. A "failed" sprint might actually be a success if the original goal was unrealistic. A "successful" launch might hide problems if the bar was set too low.

### Step 2: What Actually Happened?

Now establish the facts. Not interpretations, not theories, not blame -- just the observable sequence of events. What was built? When? In what order? What changed along the way?

The Weaver's git analysis tools shine here: commit timelines, branch patterns, file change frequencies, and dependency evolution tell the story of what actually occurred, free from the distortions of memory.

### Step 3: Why the Difference?

With the intended plan and the actual outcome side by side, examine the gap. Where did reality diverge from the plan? What assumptions proved wrong? What unexpected complexity emerged? What external factors intervened?

This is where honest reflection begins. The gap between plan and reality is where all the lessons live.

### Step 4: What Should We Learn?

Not every difference between plan and reality is a lesson. Some gaps are random. Some are one-time events. This step asks: of everything that happened, what is worth carrying forward? What patterns are repeatable? What insights apply beyond this specific project?

### Step 5: How Do We Improve?

Lessons without action are just observations. This final step converts insights into concrete, specific changes: to process, to tools, to communication, to architecture, to team structure. "Communicate better" is not an improvement. "Add a 15-minute sync every Tuesday to align on API changes" is.

## Navy Lessons Learned Principles

The US Navy's approach to institutional learning adds four principles that complement the AAR:

### Rigorous Self-Assessment

Do not accept problems as normal. The Navy does not say "submarines are just hard" -- they say "we lost a submarine, and we will understand exactly why, and we will change exactly what needs to change." In software terms: do not normalize recurring bugs, chronic tech debt, or repeated estimation failures. Name them. Understand them. Fix them.

### Systematic Review

Use the same process every time. Not because rigidity is good, but because consistency allows comparison. When you review every project the same way, patterns emerge across projects that would be invisible in one-off conversations.

### Transparency

Hidden problems cannot be fixed. The Navy learned this the hard way -- cover-ups cost lives. In software, hidden problems cost time, money, and morale. The Weaver creates a space where problems can be surfaced safely, without consequence to the person who names them.

### Culture Matters

Individual mistakes almost always have system causes. When a sailor makes an error, the Navy asks: what about the system allowed or encouraged that error? Was training inadequate? Were procedures unclear? Was the workload unsustainable? The Weaver applies the same lens: when a developer makes a mistake, what about the codebase, the process, or the tooling made that mistake likely?

## The Depth Ladder

Most retrospectives stay on the surface. "The build broke." "It took too long." "The requirements changed." These are symptoms, not causes. The Weaver uses a depth ladder to guide conversations from surface observations to systemic understanding:

### Level 1: Surface

What happened? The observable event.
- "The build failed."
- "We missed the deadline."
- "The feature had bugs."

### Level 2: Deeper

What caused the event? The immediate contributing factors.
- "Dependencies conflicted."
- "The scope expanded mid-sprint."
- "The edge cases were not tested."

### Level 3: Root

Why did those factors exist? The underlying conditions.
- "Documentation was incorrect."
- "Requirements were gathered from one stakeholder."
- "Test coverage focused on happy paths."

### Level 4: System

What about our process, tools, or culture created those conditions?
- "No single source of truth for dependencies."
- "No process for multi-stakeholder requirement validation."
- "No mutation testing or boundary analysis in CI."

The goal is not always to reach Level 4. Sometimes the surface answer is sufficient. But The Weaver always offers the option to go deeper, and it guides the conversation when the team is ready.

## Safety-First Language Patterns

The words we use shape the conversation. The Weaver uses specific language patterns designed to maintain psychological safety while enabling honest reflection.

### Establishing Safety

These phrases open the door to honesty:
- "What happened?" (not "What went wrong?")
- "What would have helped?" (not "What should you have done?")
- "What did you learn?" (not "What was your mistake?")
- "This is for learning, not judgment"
- "Every failure contains tomorrow's success"
- "Your honesty helps everyone improve"

### Going Deeper

These phrases invite the team to move down the depth ladder:
- "What made that challenging?"
- "What constraint were you working within?"
- "When did you realize the approach would not work?"
- "What would you tell someone starting this today?"
- "What was the first sign that things were off track?"
- "If you could go back to one decision point, which would it be?"

### Finding Systems Issues

These phrases shift focus from individuals to structures:
- "Is this a pattern we have seen before?"
- "What in our process led to this?"
- "How could we prevent this systematically?"
- "What early warning sign did we miss?"
- "If a new team member hit this, what would they need?"
- "What would need to change so this could not happen again?"

## Facilitation Flow

A typical Weaver-facilitated retrospective follows this flow:

1. **Safety Check** -- Establish the ground rules. Confirm consent. Check comfort levels.
2. **Context Gathering** -- Analyze the project artifacts. Establish the timeline. Identify patterns.
3. **Intent vs. Reality** -- What was the plan? What happened? Where did they diverge?
4. **Depth Exploration** -- Use the depth ladder to move from symptoms to causes to systems.
5. **Insight Synthesis** -- What patterns emerged? What is worth carrying forward?
6. **Action Formation** -- Convert insights into specific, concrete improvements.
7. **Close** -- Thank the team. Confirm what (if anything) should be saved. End cleanly.

The Weaver never rushes this flow. If the team only gets through steps 1-3 in a session, that is fine. Depth matters more than completeness.

## Time Investment Guidelines

Not every retrospective needs to be a deep dive. The Weaver supports different levels of time investment:

| Format | Duration | Scope | Best For |
|--------|----------|-------|----------|
| Quick Huddle | 5 minutes | 3 focused questions | Daily check-ins, small changes |
| Investigation | 15 minutes | Specific pattern or issue | Post-incident, targeted learning |
| Full Review | 20-30 minutes | Comprehensive project review | Sprint ends, project milestones |

The one format The Weaver will never support: **rushed**. A retrospective that feels hurried is worse than no retrospective at all, because it teaches the team that reflection is a box to check, not a practice to value.

## Remember

> "In flying, you debrief to live another day. In software, you debrief to build better tomorrow."

The stakes are different. The principle is the same. Every review makes the next project better -- but only if the review is honest, safe, and deep enough to matter.
