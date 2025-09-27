#!/bin/bash

# Initialize Weave in a project
echo "🕸️ Initializing Weave Framework..."

# Create .weave directory
mkdir -p .weave

# Create config.yaml
cat > .weave/config.yaml << 'EOF'
weave:
  version: 1.0.0
  project:
    name: ""
    started: "$(date -I)"
    completed: ""
  settings:
    auto_capture: true
    review_on_completion: true
    investigate_failures: true
  tracking:
    - connection_patterns
    - failure_cycles  
    - iteration_waste
    - breakthrough_moments
EOF

# Create connections.yaml
cat > .weave/connections.yaml << 'EOF'
# Human-AI Collaboration Log
# Add entries as you notice interesting collaboration moments

connections:
  - date: $(date -I)
    context: "Project initialization"
    human: "Setting up Weave framework"
    ai: "Providing structure and guidance"
    outcome: "Weave framework initialized"
    lesson: "Start capturing lessons from day one"

# Example entry format:
# - date: YYYY-MM-DD
#   context: "What you were trying to solve"
#   human: "Your insight or concern"  
#   ai: "What the AI suggested"
#   outcome: "What actually worked"
#   lesson: "What to remember"
EOF

# Create initial evolution log
cat > .weave/evolution-log.md << 'EOF'
# Evolution Log

Project started: $(date -I)

## Patterns Identified
*To be filled during retrospective review*

## Insights
*Captured during project development*

## Framework Improvements
*Generated after project completion*

---
*Use `weaver_review` tool for comprehensive analysis*
EOF

echo "✅ Weave framework initialized!"
echo ""
echo "📁 Created files:"
echo "  - .weave/config.yaml"
echo "  - .weave/connections.yaml"
echo "  - .weave/evolution-log.md"
echo ""
echo "💡 Next steps:"
echo "  1. Update project name in config.yaml"
echo "  2. Add collaboration moments to connections.yaml as they occur"
echo "  3. Run 'weaver_review' at project completion for full analysis"
echo ""
echo "🎯 Remember: The goal is learning, not perfection!"
