# The Weave MCP: Actionable Implementation Roadmap

## Immediate Actions (This Week)

### Day 1-2: Core Philosophy Lock-in
- [ ] Add `PHILOSOPHY.md` to repo with non-negotiable principles
- [ ] Create `CONSENT.md` with team consent protocols
- [ ] Add panic button spec to requirements
- [ ] Document "Never Automatic" principle

### Day 3-4: CLI Modification
Based on GPT-5's technical spec with Opus's constraints:

```bash
# Current (wrong)
weave review --auto --on-merge

# New (correct)  
weave review --consent-token ABC123 --visibility private --human-initiated
```

Changes needed:
- [ ] Remove all automatic triggers
- [ ] Add consent token validation
- [ ] Implement visibility modes
- [ ] Add 24-hour cooling period check

### Day 5: Safety Mechanisms
```typescript
// Add to src/weaver/safety.ts
export class SafetyProtocols {
  static COOLING_PERIOD_HOURS = 24;
  static DEFAULT_VISIBILITY = 'private';
  static AUTO_EXPIRY_DAYS = 90;
  
  async checkReadiness(team: string): Promise<ReadinessResult> {
    // Check cooling period
    // Verify consent tokens
    // Assess psychological safety indicators
  }
  
  async panicButton(userId: string): Promise<void> {
    // Immediate session termination
    // No records kept
    // Team notification
  }
}
```

## Week 2: GitHub Integration (Modified)

### Remove Automatic Triggers
From GPT-5's workflow, remove:
```yaml
# DELETE THIS
on:
  pull_request:
    types: [closed]
```

Keep only:
```yaml
on:
  workflow_dispatch:  # Manual only
    inputs:
      consent_token:
        required: true
      visibility:
        type: choice
        options: ['private', 'protected']
```

### Add Consent UI
Create `.github/RETROSPECTIVE_CONSENT.md`:
```markdown
# Team Retrospective Consent

By initiating a retrospective, all participants confirm:
- [ ] Voluntary participation
- [ ] Understanding data will be [visibility level]
- [ ] Right to stop at any time
- [ ] No performance evaluation connection

Consent Token: [Generated per session]
```

## Week 3: VS Code Extension (Minimal)

### Essential Commands Only
```json
{
  "commands": [
    {
      "command": "weave.checkReadiness",
      "title": "Check Team Readiness for Retrospective"
    },
    {
      "command": "weave.requestConsent", 
      "title": "Request Team Consent for Review"
    },
    {
      "command": "weave.panicButton",
      "title": "🛑 Emergency Stop Retrospective"
    }
  ]
}
```

### No Automation Features
- No auto-triggers
- No background analysis
- No persistent monitoring
- Only human-initiated actions

## Week 4: Testing with Real Team

### Find Volunteer Team with:
- [ ] 6+ months working together
- [ ] No recent reorgs
- [ ] Expressed interest in retrospectives
- [ ] No performance pressure

### Test Protocol
1. **Consent Phase** (15 min)
   - Explain system
   - Get written consent
   - Generate session token
   - Choose visibility level

2. **Retrospective Phase** (20-30 min)
   - Human initiates
   - One question at a time
   - Can stop anytime
   - Private mode only

3. **Debrief Phase** (15 min)
   - What felt safe?
   - What felt threatening?
   - Would you do again?
   - What should change?

## Month 2: Gradual Expansion

### Week 5-6: Refine Based on Feedback
Priority fixes from test team:
- [ ] Adjust question phrasing
- [ ] Modify consent flow
- [ ] Improve panic button
- [ ] Address any safety concerns

### Week 7-8: Second Team Pilot
Requirements for Team 2:
- Different department/culture
- Still meets safety criteria
- Voluntary participation
- Compare experiences

## Month 3: Decision Point

### Assess Against Opus's Warnings

**Check for Corruption**:
- [ ] Is it becoming compliance theater?
- [ ] Are teams gaming the system?
- [ ] Is psychological safety decreasing?
- [ ] Are insights genuine or manufactured?

**Check for Value**:
- [ ] Do teams request more retrospectives?
- [ ] Are insights actionable?
- [ ] Is learning happening?
- [ ] Do teams feel safer?

### Three Possible Paths

#### Path A: Continue with Expansion
If both teams positive and no corruption detected:
- Add protected mode option
- Pilot with 5 more teams
- Begin VS Code integration
- Keep everything optional

#### Path B: Refine and Retry
If mixed results:
- Address specific concerns
- Simplify further
- Reduce features
- Test with one more team

#### Path C: Honorable Termination
If Opus's warnings materialized:
- Document why it didn't work
- Share learnings publicly
- Archive codebase
- Celebrate the attempt

## Continuous Monitoring

### Weekly Check-ins
Every Friday, ask:
1. Are we honoring the philosophy?
2. Is this helping or harming?
3. What would Opus say?
4. What would users say?

### Red Flags to Watch
- [ ] Mandatory language creeping in
- [ ] Automation pressure building
- [ ] Metrics becoming goals
- [ ] Safety decreasing
- [ ] Gaming behaviors emerging

### Green Flags to Celebrate
- [ ] Teams asking for retrospectives
- [ ] Rich insights emerging
- [ ] System improvements identified
- [ ] Psychological safety increasing
- [ ] Voluntary adoption spreading

## Communication Plan

### For Leadership
"This is an experiment in team learning, not a compliance tool"

Key messages:
- Voluntary only
- No performance connection
- Team-owned data
- Can stop anytime

### For Teams
"This is your tool, you control it completely"

Key messages:
- You choose when
- You choose visibility
- You own the data
- You can stop anytime

### For Skeptics
"Try it once, privately, and see"

Key messages:
- Private mode available
- No permanent records
- Delete anytime
- Your feedback shapes it

## Budget and Resources

### Minimal Investment
- 1 developer part-time (25%)
- No infrastructure costs initially
- Use existing GitHub/VS Code
- No additional tools needed

### Success Metrics (Soft)
- Team satisfaction scores
- Voluntary adoption rate
- Quality of insights
- Stories of improvement

### No Success Metrics (Hard)
- No KPIs
- No mandatory targets
- No performance metrics
- No comparison between teams

## The Implementation Principles

### Always Remember:
1. **Consent before code** - Every feature needs permission
2. **Human before automation** - People initiate, machines assist
3. **Safety before efficiency** - Slow and safe beats fast and harmful
4. **Learning before metrics** - Insights matter more than numbers
5. **Choice before compliance** - Voluntary always

### Never Allow:
1. Automatic triggers without consent
2. Mandatory participation
3. Performance evaluation connection
4. Public shaming possibilities
5. Irrevocable records

## Final Checkpoint

Before each release, ask:

**Would GPT-5 say**: "Is it technically sound?"
**Would Opus say**: "Is it philosophically pure?"
**Would users say**: "Does it help us?"
**Would we say**: "Are we proud of this?"

All four must be "yes" to proceed.

---

*"Build tools that augment human wisdom, not replace human judgment"*
