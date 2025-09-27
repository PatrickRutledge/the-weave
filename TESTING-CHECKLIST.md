# MCP Server Testing Checklist

## Pre-Test Setup

### Repository Preparation
- [ ] Create test repository with known patterns:
  - [ ] At least 5 build failures in same area
  - [ ] At least 3 reverted commits
  - [ ] One abandoned branch (30+ days old)
  - [ ] Circular development pattern (add/remove/add)
  - [ ] Time sink feature (10+ commits for "simple" task)

### Test User Briefing
- [ ] Explain this is for learning, not judgment
- [ ] Confirm psychological safety
- [ ] Set expectation: 20-30 minute conversation
- [ ] Provide permission to skip questions
- [ ] Emphasize honesty over completeness

## Test Phase 1: Activation & Safety

### Test 1.1: Non-Blame Language
**Run**: Start review on repository with obvious mistakes

**Check**:
- [ ] No accusatory language in first question
- [ ] Uses "what happened" not "what went wrong"  
- [ ] Focuses on situation, not person
- [ ] Includes safety statement

**Pass Criteria**: User feels comfortable discussing failures

**Actual Result**: ________________________________

### Test 1.2: Ground Truth First
**Run**: Observe first 3 questions

**Check**:
- [ ] Establishes what was intended first
- [ ] Confirms what actually happened second
- [ ] Only then asks about causes
- [ ] Verifies timeline before interpretation

**Pass Criteria**: Facts established before asking "why"

**Actual Result**: ________________________________

## Test Phase 2: Question Quality

### Test 2.1: One at a Time
**Run**: Complete interactive mode session

**Check**:
- [ ] Only one question presented
- [ ] Waits for answer before proceeding
- [ ] Acknowledges answer before next question
- [ ] Never overwhelming

**Pass Criteria**: User never sees multiple questions

**Actual Result**: ________________________________

### Test 2.2: Depth Achievement  
**Run**: Answer questions about failure pattern

**Check**:
- [ ] Gets past surface symptoms
- [ ] Uncovers hidden constraints
- [ ] Reveals undocumented requirements
- [ ] Identifies systemic issues

**Pass Criteria**: Root cause identified, not just symptoms

**Actual Result**: ________________________________

### Test 2.3: Skip Handling
**Run**: Skip 2 questions during review

**Check**:
- [ ] Gracefully moves to next question
- [ ] No judgment about skipping
- [ ] Still generates useful report
- [ ] Marks skipped areas appropriately

**Pass Criteria**: Review continues smoothly after skips

**Actual Result**: ________________________________

## Test Phase 3: Pattern Detection

### Test 3.1: Build Failure Clusters
**Run**: Repository with 10+ build failures

**Check**:
- [ ] Detects cluster pattern
- [ ] Asks about root cause
- [ ] Doesn't list every failure
- [ ] Focuses on pattern not instances

**Pass Criteria**: Single question about pattern, not 10 about failures

**Actual Result**: ________________________________

### Test 3.2: Circular Development
**Run**: Repository with code added/removed/re-added

**Check**:
- [ ] Identifies circular pattern
- [ ] Asks about changing constraints
- [ ] Explores decision points
- [ ] Captures learning from iterations

**Pass Criteria**: Understands why approach changed

**Actual Result**: ________________________________

### Test 3.3: Time Sinks
**Run**: Repository with excessive commits for simple feature

**Check**:
- [ ] Recognizes disproportionate effort
- [ ] Asks about hidden complexity
- [ ] Explores external pressures
- [ ] Identifies knowledge gaps

**Pass Criteria**: Uncovers why "simple" wasn't simple

**Actual Result**: ________________________________

## Test Phase 4: Investigation Mode

### Test 4.1: Failure Investigation
**Run**: Trigger investigation on build_failures

**Check**:
- [ ] Provides specific evidence
- [ ] Asks targeted question
- [ ] Waits for answer
- [ ] Captures lesson learned

**Pass Criteria**: Focused investigation, not general review

**Actual Result**: ________________________________

### Test 4.2: Abandoned Work
**Run**: Investigate abandoned branches

**Check**:
- [ ] Finds old branches
- [ ] Asks about decision to abandon
- [ ] Captures learning from attempt
- [ ] No judgment about "waste"

**Pass Criteria**: Treats abandoned work as learning opportunity

**Actual Result**: ________________________________

## Test Phase 5: Output Quality

### Test 5.1: Evolution Log
**Run**: Complete full review and check output

**Check**:
- [ ] Clear structure and formatting
- [ ] Patterns properly categorized
- [ ] Insights linked to evidence
- [ ] Actionable improvements listed
- [ ] No project-specific information

**Pass Criteria**: Another team could use this document

**Actual Result**: ________________________________

### Test 5.2: Framework Improvements
**Run**: Review generated improvements

**Check**:
- [ ] Specific and actionable
- [ ] Address root causes
- [ ] Prioritized appropriately
- [ ] Include success metrics

**Pass Criteria**: Could create GitHub issues from these

**Actual Result**: ________________________________

## Test Phase 6: User Experience

### Test 6.1: Time to Complete
**Run**: Track full session time

**Check**:
- [ ] Under 30 minutes for interactive mode
- [ ] Under 10 minutes for investigation mode
- [ ] Natural pacing (not rushed)
- [ ] User doesn't feel fatigued

**Target**: 20-25 minutes average

**Actual Time**: ________________________________

### Test 6.2: Engagement Level
**Run**: Analyze answer quality

**Check**:
- [ ] Average answer length >50 words
- [ ] Increasing depth over time
- [ ] User provides examples
- [ ] User volunteers additional context

**Pass Criteria**: Rich, detailed responses

**Actual Result**: ________________________________

### Test 6.3: Psychological Safety
**Run**: Post-session interview

**Ask User**:
- [ ] Did you feel judged? (Should be No)
- [ ] Did you feel safe discussing mistakes? (Should be Yes)
- [ ] Would you do this again? (Should be Yes)
- [ ] Did you learn something? (Should be Yes)

**Pass Criteria**: All safety indicators positive

**Actual Result**: ________________________________

## Test Phase 7: Edge Cases

### Test 7.1: Minimal History
**Run**: Repository with <50 commits

**Check**:
- [ ] Adapts question count
- [ ] Still finds patterns
- [ ] Doesn't force issues
- [ ] Appropriate depth

**Pass Criteria**: Useful review even with limited data

**Actual Result**: ________________________________

### Test 7.2: Perfect Project
**Run**: Repository with no apparent issues

**Check**:
- [ ] Focuses on what worked well
- [ ] Captures success patterns
- [ ] Identifies best practices
- [ ] Still valuable output

**Pass Criteria**: Learns from success, not just failure

**Actual Result**: ________________________________

### Test 7.3: Hostile User
**Run**: User defensive about mistakes

**Check**:
- [ ] Maintains non-judgmental stance
- [ ] Offers to skip sensitive questions
- [ ] Still captures some learning
- [ ] Ends gracefully if needed

**Pass Criteria**: Never escalates, always professional

**Actual Result**: ________________________________

## Post-Test Analysis

### Quantitative Metrics
- [ ] Questions asked: ______
- [ ] Questions answered: ______
- [ ] Questions skipped: ______
- [ ] Average answer length: ______ words
- [ ] Time to complete: ______ minutes
- [ ] Insights captured: ______
- [ ] Improvements generated: ______

### Qualitative Assessment
- [ ] User satisfaction (1-10): ______
- [ ] Insight depth (1-10): ______
- [ ] Report usefulness (1-10): ______
- [ ] Likelihood to use again (1-10): ______

### Key Findings
**What Worked Well**:
1. ________________________________
2. ________________________________
3. ________________________________

**What Needs Improvement**:
1. ________________________________
2. ________________________________
3. ________________________________

**Surprising Discoveries**:
1. ________________________________
2. ________________________________

## Refinement Actions

Based on test results, prioritize fixes:

### Critical (Must Fix Before Release)
- [ ] ________________________________
- [ ] ________________________________

### Important (Should Fix Soon)
- [ ] ________________________________
- [ ] ________________________________

### Nice to Have (Future Enhancement)
- [ ] ________________________________
- [ ] ________________________________

## Sign-Off

**Tester**: _______________________ **Date**: _______

**Ready for Release**: [ ] Yes [ ] No

**If No, Blocking Issues**:
1. ________________________________
2. ________________________________

---

## Notes Section
(Record observations, user quotes, unexpected behaviors)

________________________________
________________________________
________________________________
________________________________
________________________________
