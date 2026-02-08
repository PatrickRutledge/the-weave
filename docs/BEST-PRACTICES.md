# The Weaver Best Practices

A quick reference for facilitating effective retrospectives with The Weaver.

## Anti-Patterns to Avoid

### The Blame Game

Blame kills honesty. The moment someone feels accused, they stop reflecting and start defending.

| Instead of... | Try... |
|---|---|
| "Why did you fail?" | "What made this difficult?" |
| "You should have..." | "What information would have helped?" |
| "This was wrong" | "This didn't work as expected" |
| "Who broke this?" | "What sequence of events led here?" |
| "That was a bad decision" | "What were you optimizing for when you chose that?" |

### The Information Dump

Overwhelming a team with data and questions destroys focus. Retrospectives are conversations, not interrogations.

| Instead of... | Try... |
|---|---|
| 20 questions at once | One question, wait for the answer, then the next |
| Complex multi-part questions | Simple, focused questions |
| Everything is equally important | Prioritize by impact |
| Presenting all the data up front | Reveal data as context for specific questions |
| "Let me list everything I found..." | "I noticed one pattern -- can we talk about it?" |

### The Surface Skim

Accepting the first answer as the whole answer. Surface-level retrospectives produce surface-level insights.

| Instead of... | Try... |
|---|---|
| "Build failed" (and move on) | "What made the build fail repeatedly?" |
| "Took too long" (and move on) | "What hidden complexity emerged?" |
| "Didn't work" (and move on) | "What assumption proved incorrect?" |
| "Requirements changed" (and move on) | "When and why did they change?" |
| "It was a communication issue" (and move on) | "What specific information gap caused the problem?" |

## Success Patterns

### The Depth Ladder

Always be ready to go one level deeper. The best insights live below the surface.

```
Level 1 - Surface:  "The build failed"
Level 2 - Deeper:   "Dependencies conflicted"
Level 3 - Root:     "Documentation was incorrect"
Level 4 - System:   "No single source of truth for dependencies"
Level 5 - Action:   "Add dependency verification to CI pipeline"
```

Not every conversation needs to reach Level 4. But always offer the path.

### The Safety Check

Before starting any review, establish the ground rules:

- "This is for learning, not judgment"
- "Every failure contains tomorrow's success"
- "Your honesty helps everyone improve"
- "You can stop or skip any question at any time"

These are not just pleasantries. They are the foundation. Skip them and the rest of the session suffers.

### The Time Investment

Match the depth to the time available. Rushed retrospectives are worse than none.

| Format | Duration | Questions | Best For |
|---|---|---|---|
| Quick Huddle | 5 min | 3 focused | Daily check-ins, small changes |
| Investigation | 15 min | Targeted | Post-incident, specific pattern |
| Full Review | 20-30 min | Comprehensive | Sprint end, project milestone |

Never: Rushed, squeezed into the last 5 minutes of a meeting, or done because someone said you have to.

### The Fact-First Approach

Start with observable data before forming narratives:

1. Look at the git history, commit patterns, branch timelines
2. Establish what actually happened in what order
3. Only then ask why
4. Let the data challenge assumptions

## Quality Indicators

### Good Signs

These indicate the retrospective is working:

- Answers are getting longer and more detailed
- The person is volunteering extra context unprompted
- "Oh, now that I think about it..." moments appear
- Specific constraints and tradeoffs are being revealed
- The conversation shifts from "what" to "why" naturally
- System-level issues are being identified
- The person asks to explore a topic further
- Concrete actions emerge from the discussion

### Warning Signs

These indicate something needs to change:

- Single-sentence answers with no elaboration
- Defensive language ("well, it wasn't my fault that...")
- High skip rate on questions
- Only technical issues surface (no process, no communication, no decision-making)
- No actionable insights after 10+ minutes
- Responses feel rehearsed or sanitized
- The person is watching the clock
- Generic conclusions ("we need to communicate better")

When you see warning signs: slow down, check in on comfort, consider switching topics or ending the session. Pushing through resistance damages trust.

## Magic Phrases

### For Safety

Use these to create and maintain psychological safety:

- "What happened?" (not "What went wrong?")
- "What would have helped?" (not "What should you have done?")
- "What did you learn?" (not "What was your mistake?")
- "That sounds like it was frustrating"
- "It makes sense that you chose that given what you knew"
- "There is no wrong answer here"

### For Depth

Use these to guide the conversation deeper:

- "What made that challenging?"
- "What constraint were you working within?"
- "When did you realize the approach would not work?"
- "What would you tell someone starting this today?"
- "What was the first sign things were not going as planned?"
- "If you could change one decision, which would it be and why?"
- "What did you know then versus what you know now?"

### For Systemic Thinking

Use these to shift from individual to system:

- "Is this a pattern we have seen before?"
- "What in our process led to this?"
- "How could we prevent this systematically?"
- "What early warning sign did we miss?"
- "If a new team member hit this, what would they need?"
- "What would need to change so this could not happen again?"
- "Is this a people problem or a tools/process problem?"

## The Learning Loop

Every retrospective feeds into the next project:

```
Event --> Capture --> Review --> Insight --> Action --> Improvement
  ^                                                        |
  +----------------- Next Project Benefits <---------------+
```

The goal is not a perfect retrospective. The goal is a team that gets better at building software, one honest conversation at a time.

## Quick Checklist

After any retrospective session, ask yourself:

- [ ] Did questions feel safe, not accusatory?
- [ ] Did we uncover root causes, not just symptoms?
- [ ] Did the person have any "aha" moments?
- [ ] Can we create specific improvements from this session?
- [ ] Would the person do this again voluntarily?

If you cannot answer "yes" to most of these, the session format needs adjustment -- not the person.
