---
name: Learning & Growth
description: >
  Examines how the team and its individual members developed skills, filled knowledge gaps,
  and built expertise throughout the project. Surfaces learning patterns, mentoring dynamics,
  growing pains, and the relationship between challenge and capability to help teams
  become more intentional about professional development within project work.
triggers:
  - "commit complexity increasing over time for individual contributors"
  - "hotspot files shifting between contributors suggesting knowledge transfer"
  - "time sinks in unfamiliar technology areas"
  - "abandoned branches representing learning experiments"
  - "revert patterns concentrated in specific contributors or domains"
  - "burst periods of activity in previously untouched areas of the codebase"
  - "circular development patterns suggesting trial-and-error learning"
antiPatterns:
  - "Sink or Swim: team members were assigned unfamiliar work without support, mentoring, or ramp-up time, turning learning opportunities into stressful ordeals"
  - "Knowledge Silos: expertise remained concentrated in individuals who never had the opportunity or incentive to share it, creating fragile single points of failure"
  - "Expertise Ceiling: the team stopped challenging themselves once the project reached a comfortable state, missing opportunities to deepen skills or explore new approaches"
  - "Learning Guilt: team members felt they could not spend time learning during work hours because all time had to be visibly productive, driving skill development underground or off-hours"
  - "Repetition Without Reflection: the team repeated similar tasks across projects without extracting generalizable lessons, rebuilding the same understanding from scratch each time"
successPatterns:
  - "Deliberate Stretching: work assignments intentionally placed team members at the edge of their capability with appropriate support, turning project work into growth opportunities"
  - "Knowledge Sharing Rituals: the team had regular practices — pairing sessions, tech talks, code reviews with teaching intent — that distributed expertise across members"
  - "Safe Failure Space: the team culture allowed members to attempt unfamiliar work, make mistakes, and learn without judgment, accelerating skill development"
  - "Growth Visibility: individual and team skill development was acknowledged and celebrated, reinforcing the value of learning alongside delivery"
  - "Lessons Harvested: the team regularly extracted reusable insights from project work and preserved them in accessible forms — documentation, patterns, shared tooling"
questionFocus:
  - "What skills or knowledge did team members develop during this project that they did not have at the start?"
  - "Were there areas where the team's lack of experience caused visible friction — and how was that gap addressed in the moment?"
  - "How did knowledge transfer happen on this project — was it deliberate or accidental, and was it sufficient?"
  - "Were there team members who carried disproportionate expertise in critical areas, and what was the impact of that concentration?"
  - "Did the project create space for learning, or did delivery pressure crowd out skill development?"
  - "What would each team member say was their biggest personal growth moment during this project?"
  - "Looking at the team's collective capability now versus the project start, where did the most growth occur and where are the remaining gaps?"
  - "Were there mentoring relationships — formal or informal — that made a meaningful difference?"
---

## Facilitation Guidance

When facilitating from the Learning & Growth perspective, you are creating space for a
conversation that project retrospectives rarely prioritize. Most retros focus on process
and delivery outcomes. This perspective asks the deeper question: how did this project
change the people who worked on it?

Start by examining the commit history for individual growth trajectories. Look at how
individual contributors' work evolved over time — did the complexity and scope of their
contributions increase? Did they start touching new areas of the codebase? Did their
commit frequency and size patterns change in ways that suggest growing confidence?
These are indirect signals, but they tell a story about capability development.

Look for knowledge transfer signals in the repository. When a hotspot file's primary
contributor changes over time, that may indicate deliberate handoff or organic knowledge
spreading. When a file is only ever touched by one person, that signals a potential
silo. Surface these patterns without judgment — silos form for many reasons, and the
goal is awareness, not blame.

The emotional dimension of learning is important to acknowledge. Learning new technology
or tackling unfamiliar problems is inherently uncomfortable. Ask the team about moments
where they felt out of their depth. How did they handle that discomfort? Was the team
environment supportive of visible not-knowing, or did people feel pressure to appear
competent at all times? The answer reveals a lot about psychological safety.

Explore the tension between delivery pressure and learning investment. Most teams
experience this as a zero-sum trade-off — time spent learning is time not spent
shipping. Help the team see where learning and delivery were complementary (a new
skill unlocked faster implementation) and where they genuinely competed (learning
time delayed a feature). Both exist, and honesty about the trade-off is more useful
than pretending learning is always free.

Pay attention to how mistakes were handled. In growth-oriented teams, mistakes become
learning moments. In fear-driven teams, mistakes become hidden liabilities. Ask about
specific errors that occurred during the project and follow the thread: was the mistake
discussed openly? Did the team extract a lesson? Did anything change as a result? The
answers reveal whether the team has a learning culture or a blame culture.

Mentoring dynamics deserve explicit attention. Ask whether more experienced team members
consciously invested in developing less experienced ones. This investment often goes
unrecognized and unrewarded despite being one of the highest-leverage activities a
senior contributor can perform. Making it visible honors the effort and encourages its
continuation.

Close by asking each team member to name one thing they learned during this project
that they will carry forward. This personal reflection anchors the growth perspective
in individual experience and creates a moment of recognition that project work is not
just about the deliverable — it is about the people who built it and who they became
in the process.
