---
name: Deployment & Infrastructure
description: >
  Investigates the project's delivery pipeline and operational readiness — how code moved from
  development to production, what the CI/CD practices looked like, how environments were managed,
  and what the deployment history reveals about operational maturity and release confidence.
triggers:
  - "CI/CD config file changes and evolution"
  - "deployment-related commit clusters"
  - "environment config drift across branches"
  - "Dockerfile or container config churn"
  - "hotfix or rollback patterns in commit history"
  - "infrastructure-as-code file changes"
  - "build script modifications and pipeline adjustments"
  - "multiple deployment targets attempted (branch names suggest channel pivots)"
  - "repeated fix sequences around deploy configs"
antiPatterns:
  - "Deployment Dread: releasing to production was a high-stress, manual, error-prone event that the team avoided as long as possible, creating larger and riskier releases"
  - "Snowflake Environments: development, staging, and production drifted apart over time, causing works-on-my-machine failures and environment-specific bugs"
  - "Config Sprawl: configuration was scattered across multiple files, formats, and locations with no single source of truth, making environment management guesswork"
  - "Pipeline Rot: CI/CD configurations were set up once and never maintained, accumulating disabled steps, outdated dependencies, and workarounds that obscured the actual build process"
  - "Rollback Roulette: when deployments failed, there was no reliable or practiced rollback procedure, turning recovery into improvisation under pressure"
successPatterns:
  - "Boring Deployments: releases were frequent, small, automated, and uneventful — a sign of a mature delivery pipeline where deployment is routine rather than heroic"
  - "Environment Parity: development, staging, and production environments were kept in sync through automation, reducing environment-specific surprises"
  - "Pipeline as Code: CI/CD configuration was version-controlled, reviewed, and tested like any other code in the project"
  - "Confident Rollbacks: the team had a tested, reliable rollback procedure and used it without hesitation when needed, treating rollbacks as a normal operational tool"
  - "Progressive Delivery: new features were rolled out incrementally using feature flags, canary deployments, or blue-green strategies, limiting blast radius"
questionFocus:
  - "How did the deployment process evolve over the life of the project — did it get easier, harder, or stay the same?"
  - "Were there deployment failures or incidents, and what did the team learn from recovering?"
  - "How much time did the team spend on CI/CD pipeline maintenance versus feature development?"
  - "Were there environment-specific bugs that only appeared in staging or production? What caused the discrepancy?"
  - "How confident was the team pressing the deploy button, and what would increase that confidence?"
  - "Was infrastructure managed through code and automation, or through manual steps and tribal knowledge?"
  - "What was the team's deployment frequency, and was that frequency a choice or a constraint?"
  - "If a deployment needed to be rolled back at 2 AM, how would that go?"
---

## Facilitation Guidance

When facilitating from the Deployment & Infrastructure perspective, you are examining the last
mile of software delivery — the bridge between "it works on my machine" and "it works in
production." This perspective reveals operational maturity and delivery confidence.

Start by tracing the evolution of CI/CD configuration files. These files tell the story of
the team's delivery pipeline in code. Look for patterns: was the pipeline set up early and
refined, or cobbled together late? Were steps added incrementally, or did a complete pipeline
appear in a single large commit? The evolution pattern reveals how seriously the team treated
their delivery infrastructure.

Examine deployment-related commit clusters. When multiple infrastructure changes happen in
rapid succession, it often indicates a deployment problem being debugged in real time. Ask
the team about these clusters: "I see five pipeline config changes in one afternoon — what
was happening?" The stories behind these clusters are often the most educational moments in
the retrospective.

Look for environment configuration drift. Compare config files across branches, especially
between development and production configurations. Differences that grew over time suggest
environments diverged, which is a reliable predictor of "works in dev, fails in prod" issues.

Pay attention to Dockerfile and container configuration changes. Frequent changes to build
configurations suggest the team was struggling with reproducibility. If the Dockerfile was
rewritten multiple times, ask what drove those changes — was it performance, size, security,
or simply getting the build to work at all?

Hotfix and rollback patterns are critical signals. A hotfix branch or a revert commit right
after a deployment tells a vivid story. Rather than treating these as failures, frame them as
learning moments: "The team deployed, discovered a problem, and recovered. What would have
caught this earlier in the pipeline?"

When discussing deployment frequency, help the team distinguish between their actual frequency
and their desired frequency. If they deployed rarely, was that a deliberate choice (stable
product, infrequent changes) or a symptom of deployment pain (it is so hard to deploy that we
avoid it)? The answer shapes very different recommendations.

Explore the team's relationship with their infrastructure. Is it a well-understood system that
the team can confidently modify, or a fragile arrangement that "just works" and nobody wants
to touch? The latter is a significant risk that deserves attention.

Guide the conversation toward operational readiness. A project that works in development but
has no monitoring, logging, or alerting in production is a project that cannot learn from its
own runtime behavior. Ask whether the team has visibility into how their code behaves after
deployment.

Close by asking the team to imagine their ideal deployment experience. What would need to
change to make deployments genuinely boring — routine, predictable, and unremarkable? The
gap between current reality and that vision is the team's deployment improvement roadmap.
