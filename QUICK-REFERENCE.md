# Weaver MCP Quick Reference Card

## 🎯 Core Principles (Keep Visible During Development)

### The Blue Angels Rules
✈️ **No Blame** - We're identifying improvements, not fault
✈️ **Every Flight** - Review everything, success or failure  
✈️ **Facts First** - What happened before why it happened
✈️ **Drive Out Fear** - Safety enables honesty

### The Army AAR Sequence
1. 🎯 What did we intend?
2. 📊 What actually happened?
3. 🔍 Why the difference?
4. 💡 What should we learn?
5. ⏭️ How do we improve?

### The Navy Lessons
⚓ **Rigorous Self-Assessment** - Don't accept problems, solve them
⚓ **Systematic Review** - Same process every time
⚓ **Transparency** - Hidden problems can't be fixed
⚓ **Culture Matters** - Individual mistakes often have system causes

### The 25% Promise
📈 Teams that debrief effectively improve performance by 25%

---

## 🚫 Anti-Patterns to Avoid

### ❌ The Blame Game
- "Why did you fail?" → ✅ "What made this difficult?"
- "You should have..." → ✅ "What information would have helped?"
- "This was wrong" → ✅ "This didn't work as expected"

### ❌ The Information Dump  
- 20 questions at once → ✅ One question, wait, next question
- Complex multi-part questions → ✅ Simple, focused questions
- Everything is important → ✅ Prioritize by impact

### ❌ The Surface Skim
- "Build failed" → ✅ "What made the build fail repeatedly?"
- "Took too long" → ✅ "What hidden complexity emerged?"
- "Didn't work" → ✅ "What assumption proved incorrect?"

---

## ✅ Success Patterns

### 🎯 The Depth Ladder
1. Surface: "The build failed"
2. Deeper: "Dependencies conflicted"
3. Deeper: "Documentation was incorrect"
4. Root: "No single source of truth for dependencies"
5. System: "Need dependency verification in CI"

### 🎯 The Safety Check
Before starting any review:
- "This is for learning, not judgment"
- "Every failure contains tomorrow's success"
- "Your honesty helps everyone improve"

### 🎯 The Time Investment
- Quick Huddle: 5 minutes, 3 questions
- Investigation: 15 minutes, specific pattern
- Full Review: 20-30 minutes, comprehensive
- Never: Rushed or overwhelming

---

## 📊 Quality Indicators

### Good Signs ✅
- Answers getting longer and richer
- User volunteering extra context
- "Aha" moments during conversation
- Specific constraints revealed
- System issues identified

### Warning Signs ⚠️
- Single sentence answers
- Defensive language
- High skip rate
- Only technical issues
- No actionable insights

---

## 🔄 The Learning Loop

```
Event → Capture → Review → Insight → Action → Improvement
  ↑                                                    ↓
  ←────────────── Next Project Benefits ←──────────────
```

---

## 💬 Magic Phrases

### To Establish Safety
- "What happened?" (not "What went wrong?")
- "What would have helped?" (not "What should you have done?")
- "What did you learn?" (not "What was your mistake?")

### To Go Deeper
- "What made that challenging?"
- "What constraint were you working within?"
- "When did you realize the approach wouldn't work?"
- "What would you tell someone starting this today?"

### To Find Systems Issues
- "Is this a pattern we've seen before?"
- "What in our process led to this?"
- "How could we prevent this systematically?"
- "What early warning sign did we miss?"

---

## 🎓 Remember

**From Research**: Well-conducted debriefs improve team effectiveness by 25%

**From Military**: Every after-action review makes the next mission better

**From Medicine**: Post-incident huddles save lives

**From Your Experience**: The "zealous liar" pattern could have been caught

**Our Goal**: Turn every project into learning that improves the next one

---

## 📝 During Testing, Track:

- [ ] Did questions feel safe, not accusatory?
- [ ] Did we uncover root causes, not just symptoms?
- [ ] Did the user have "aha" moments?
- [ ] Can we create specific improvements from this?
- [ ] Would the user do this again?

---

*"In flying, you debrief to live another day. In software, you debrief to build better tomorrow."*
