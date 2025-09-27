# Microsoft Store MCP Server with Weaver Integration

An MCP (Model Context Protocol) server for Microsoft Store submissions that includes the Weaver retrospective learning system. This server enforces step-by-step agent interactions inspired by BMAD patterns to prevent "information dumping" and ensure thoughtful dialogue.

## Key Features

### 🎯 Core Capabilities
- **Step-by-step enforcement**: Agents ask ONE question at a time, wait for answers
- **Weaver Review**: Retrospective analysis of project patterns and lessons
- **Weaver Investigation**: Deep dive into failure patterns and time sinks
- **Deployment Analysis**: Check current deployment status and strategies
- **Branch Analysis**: Map branch purposes and deployment methods
- **Pattern Detection**: Find failure clusters and circular development

### 🧠 BMAD-Inspired Patterns
- **Activation Sequence**: Agents follow startup protocol (read instructions → load config → greet → halt)
- **Mandatory Interaction**: Interactive mode requires user responses between questions
- **Violation Detection**: Prevents agents from dumping everything at once
- **Mode Selection**: Choose between interactive (step-by-step) or YOLO (all at once)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd microsoft-store-mcp

# Install dependencies
npm install

# Build the TypeScript
npm run build

# Run in development mode
npm run dev
```

## Usage

### Starting a Weaver Review

```typescript
// Interactive mode - asks questions one at a time
{
  "tool": "weaver_review",
  "arguments": {
    "mode": "interactive"
  }
}

// YOLO mode - complete analysis without interaction
{
  "tool": "weaver_review", 
  "arguments": {
    "mode": "yolo"
  }
}
```

### Starting an Investigation

```typescript
{
  "tool": "weaver_investigate",
  "arguments": {
    "pattern": "build_failures"  // or "circular_commits", "time_sinks", "abandoned_work"
  }
}
```

### Answering Questions

```typescript
{
  "tool": "answer_question",
  "arguments": {
    "answer": "The build kept failing because we didn't understand the MSIX packaging requirements..."
  }
}
```

## Project Structure

```
microsoft-store-mcp/
├── src/
│   ├── index.ts                          # Main MCP server
│   ├── weaver/
│   │   ├── orchestrator.ts               # Enforces step-by-step flow
│   │   ├── review-orchestrator.ts        # Retrospective analysis
│   │   ├── investigation-orchestrator.ts # Failure pattern investigation
│   │   └── state-manager.ts              # Tracks conversation state
│   ├── tools/
│   │   ├── deployment-analyzer.ts        # Analyzes deployments
│   │   ├── branch-checker.ts             # Maps branches
│   │   └── git-pattern-detector.ts       # Finds patterns
│   └── resources/
│       ├── weave-loader.ts               # Loads .weave files
│       └── agent-instructions.ts         # Loads agent configs
├── .weave/                                # Weaver configuration (in projects)
│   ├── config.yaml                       # Project settings
│   ├── connections.yaml                  # Human-AI collaboration log
│   └── evolution-log.md                  # Lessons learned
├── agents/                                # Agent instruction files
│   ├── weaver-review.md                  # Review agent spec
│   └── weaver-investigate.md             # Investigation agent spec
└── README.md                              # This file
```

## How It Works

### 1. Interactive Review Mode

When started in interactive mode, the Weaver Review agent:

1. **Deep Analysis Phase** (5-10 minutes)
   - Reads all `.weave/` files
   - Analyzes git history for patterns
   - Applies multiple professional perspectives
   - Synthesizes findings

2. **Question Generation**
   - Questions emerge from actual analysis (not scripted)
   - Prioritized by impact
   - Limited to 10-15 for reasonable dialogue

3. **Step-by-Step Dialogue**
   - Presents ONE question
   - Waits for answer via `answer_question` tool
   - Records answer
   - Presents next question
   - Continues until complete

4. **Report Generation**
   - Creates evolution-log.md
   - Documents patterns and lessons
   - Generates framework improvements

### 2. Investigation Mode

The Investigation agent focuses on undocumented problems:

1. **Pattern Detection**
   - Build failure clusters (5+ failures in same module)
   - Circular commits (code added, removed, re-added)
   - Time sinks (features taking 3x expected time)
   - Abandoned branches (work started but never merged)

2. **Targeted Questions**
   - "What really happened here?"
   - "What caused this back-and-forth?"
   - "What was the hidden complexity?"

3. **Lesson Extraction**
   - Documents the real constraints
   - Captures undocumented requirements
   - Identifies process improvements

## Key Differences from Traditional Agents

### ❌ Traditional Agent Behavior
- Analyzes everything
- Asks 20 questions at once
- User overwhelmed
- Important insights lost
- No enforcement of interaction

### ✅ This MCP Server
- Analyzes thoughtfully
- Asks ONE question at a time
- User engaged in dialogue
- Insights captured properly
- Enforced step-by-step process

## Integration with Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "microsoft-store": {
      "command": "node",
      "args": ["path/to/microsoft-store-mcp/dist/index.js"],
      "env": {}
    }
  }
}
```

## Philosophy

This MCP server embodies key lessons learned:

1. **"Zealous Liar" Prevention**: Agents must verify before claiming
2. **3-Failure Stop Rule**: Prevent exhaustion spirals
3. **One Question At A Time**: Deep dialogue over information dumping
4. **Retrospective Learning**: Turn mistakes into system improvements
5. **Investigation Mode**: Uncover undocumented problems

## The Weaver Philosophy

The Weaver component is not about perfection during development. It's about:
- Learning from imperfection
- Turning mistakes into system improvements
- Sharing lessons to help others
- Evolving human-AI collaboration

## Example Session

```
User: Start a weaver review in interactive mode

MCP: ## Weaver Review Started

I've analyzed your repository and found several interesting patterns...

### Question 1 of 12:
I noticed 23 commits related to MSIX packaging over 3 days. What was the root cause that led to this pattern?

User: The documentation said one thing but the actual requirements were different. We kept trying what the docs said.

MCP: ### Captured:
Answer recorded: The documentation said one thing but...

### Question 2 of 12:
There's a circular pattern where you switched between Electron and PWA approaches 4 times. What constraint or misunderstanding caused this back-and-forth?

User: We didn't realize PWABuilder.com could handle everything. We thought we needed Electron for Store submissions.

[... continues one question at a time ...]

MCP: ## Review Complete

Evolution log generated with 12 insights captured.
Key learnings documented for future projects.
```

## Benefits

1. **Better Learning Capture**: Thoughtful questions lead to meaningful answers
2. **Reduced Cognitive Load**: One question at a time prevents overwhelm
3. **Actionable Insights**: Lessons turn into concrete improvements
4. **Pattern Recognition**: Identifies systemic issues not just symptoms
5. **Knowledge Preservation**: Captures why decisions were made

## Future Enhancements

- [ ] Integration with GitHub Issues for automatic improvement tracking
- [ ] Support for multiple project types beyond Microsoft Store
- [ ] Machine learning on captured patterns across projects
- [ ] Team collaboration features for shared learning
- [ ] Automated pattern detection from CI/CD logs

## Contributing

The Weaver system is designed to evolve based on captured lessons. Contributions welcome:

1. Share your evolution logs (sanitized)
2. Contribute new investigation patterns
3. Improve question generation algorithms
4. Add new professional perspectives

## License

MIT

## Acknowledgments

- BMAD Method for enforcement patterns
- The "zealous liar" pattern that started it all
- Every failed build that taught us something
