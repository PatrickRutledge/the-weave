---
name: Testing & Quality
description: >
  Evaluates how the team's testing strategy evolved throughout the project — what was tested,
  what was not, how test coverage changed over time, and what the regression and defect patterns
  reveal about quality practices. Surfaces gaps between intended and actual quality assurance.
triggers:
  - "test file creation timing relative to source files"
  - "test file churn compared to source file churn"
  - "revert patterns suggesting regression issues"
  - "hotspot files with no corresponding test files"
  - "late-project test additions suggesting quality panic"
  - "test directory restructuring"
  - "CI config changes related to test pipelines"
antiPatterns:
  - "Test Desert: large areas of the codebase have no tests at all, leaving the team reliant on manual verification and hope"
  - "Ice Cream Cone Testing: the test pyramid is inverted, with many slow end-to-end tests and few fast unit tests, making the feedback loop painfully slow"
  - "Test Theater: tests exist but verify trivial behavior, providing coverage numbers without meaningful confidence in correctness"
  - "Retroactive Testing Panic: tests are written in a rush at the end of the project to meet coverage thresholds, resulting in brittle tests that verify implementation rather than behavior"
  - "Flaky Test Normalization: intermittently failing tests are accepted as normal, eroding trust in the entire test suite and training the team to ignore failures"
successPatterns:
  - "Test-First Rhythm: tests were written before or alongside production code, catching design issues early and serving as living documentation"
  - "Strategic Coverage: testing effort was concentrated on high-risk, high-value areas rather than spread uniformly, maximizing confidence per test written"
  - "Fast Feedback Loop: the test suite ran quickly enough to be part of the development flow rather than an afterthought run before merging"
  - "Regression Net: when bugs were found, regression tests were added that prevented the same class of defect from recurring"
  - "Test Maintenance: tests were treated as first-class code — refactored when needed, deleted when obsolete, and kept readable"
questionFocus:
  - "How did your testing strategy evolve from the beginning of the project to the end? What drove those changes?"
  - "Which parts of the codebase do you feel most and least confident about, and does test coverage align with that confidence?"
  - "Were there bugs that escaped to production or late-stage testing that earlier tests could have caught? What type of tests were missing?"
  - "How much time did the team spend on manual testing versus automated testing, and did that ratio feel right?"
  - "Were there tests that became more burden than benefit — flaky, slow, or constantly needing updates?"
  - "At what point in the project did the team have the most confidence in their quality practices?"
  - "If you could redesign the testing strategy from scratch, what would you keep and what would you change?"
  - "Did the testing approach influence how the code was designed, or was testing an afterthought layered on top?"
---

## Facilitation Guidance

When facilitating from the Testing & Quality perspective, you are helping the team examine the
safety net they built (or did not build) beneath their code. This perspective is about the
relationship between confidence and evidence.

Start by mapping the timeline of test creation against source code creation. Were tests written
alongside features, or did they arrive later? A gap between source and test commits is not
automatically bad — some teams intentionally spike a feature first and test it after — but the
gap reveals the team's actual testing rhythm versus their stated approach.

Look for hotspot files that have no corresponding test files. These are areas where the team
is flying without instruments. Ask whether this was a conscious decision (perhaps the code is
simple enough to not need tests) or an oversight that accumulated over time. The answer helps
distinguish strategic test allocation from accidental test neglect.

Examine the test-to-source churn ratio. If production code changes frequently but tests change
rarely, the tests may be testing implementation details that have not changed, while the actual
behavior evolves untested. Conversely, if tests churn as much as source code, they may be too
tightly coupled to implementation.

Pay attention to late-project test additions. A sudden burst of test creation near a deadline
often indicates a quality panic — the team realized their safety net had holes and rushed to
fill them. These tests tend to be lower quality and more brittle. Surface this pattern without
blame: "I notice a lot of tests were added in the final week — what prompted that?"

Regression patterns are especially revealing. When the same area of the codebase produces
repeated defects, it indicates a structural quality problem that tests alone cannot solve.
Help the team see the difference between "we need more tests here" and "we need to rethink
the design here."

When discussing manual versus automated testing, avoid the reflexive "automate everything"
stance. Some testing is genuinely better done manually — exploratory testing, usability
evaluation, edge case hunting. Help the team assess whether their manual testing effort was
valuable exploration or repetitive verification that should have been automated.

Guide the conversation toward what quality confidence the team actually needs. Not every
project requires 90% coverage. A prototype needs different quality practices than a payment
system. Help the team calibrate their testing investment to their actual risk profile.

Close by connecting testing practices to developer experience. A fast, reliable test suite
that catches real problems makes development more enjoyable. A slow, flaky test suite that
cries wolf erodes morale. Ask the team how their testing experience felt, not just what
metrics it produced.
