import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { WeaverOrchestrator } from './weaver/orchestrator.js';
import { StateManager } from './weaver/state-manager.js';
import { DeploymentAnalyzer } from './tools/deployment-analyzer.js';
import { BranchChecker } from './tools/branch-checker.js';
import { GitPatternDetector } from './tools/git-pattern-detector.js';
import { WeaveLoader } from './resources/weave-loader.js';
import { AgentInstructions } from './resources/agent-instructions.js';

// Initialize the MCP server
const server = new Server(
  {
    name: 'microsoft-store-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      resources: {},
      tools: {},
    },
  }
);

// Initialize core components
const stateManager = new StateManager();
const weaverOrchestrator = new WeaverOrchestrator(stateManager);
const deploymentAnalyzer = new DeploymentAnalyzer();
const branchChecker = new BranchChecker();
const gitPatternDetector = new GitPatternDetector();
const weaveLoader = new WeaveLoader();
const agentInstructions = new AgentInstructions();

// BMAD-inspired activation sequence
async function activateAgent(agentType: 'review' | 'investigate') {
  // Step 1: Read agent instructions
  const instructions = await agentInstructions.load(agentType);
  
  // Step 2: Load project configuration
  const projectConfig = await weaveLoader.loadConfig();
  
  // Step 3: Initialize state
  stateManager.initializeAgent(agentType, instructions, projectConfig);
  
  // Step 4: Greet and halt
  return {
    status: 'activated',
    agent: agentType,
    message: `Weaver ${agentType} agent activated. Ready to begin ${agentType === 'review' ? 'retrospective analysis' : 'failure investigation'}.`,
    nextStep: 'await_command'
  };
}

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'weaver_review',
        description: 'Start Weaver retrospective review process',
        inputSchema: {
          type: 'object',
          properties: {
            mode: {
              type: 'string',
              enum: ['interactive', 'yolo'],
              description: 'Interactive: step-by-step with questions. YOLO: complete analysis at once.'
            }
          },
          required: ['mode']
        },
      },
      {
        name: 'weaver_investigate',
        description: 'Start Weaver investigation process for failure patterns',
        inputSchema: {
          type: 'object',
          properties: {
            pattern: {
              type: 'string',
              description: 'Specific pattern to investigate (e.g., "build_failures", "circular_commits")'
            }
          },
          required: ['pattern']
        },
      },
      {
        name: 'answer_question',
        description: 'Provide answer to Weaver question',
        inputSchema: {
          type: 'object',
          properties: {
            answer: {
              type: 'string',
              description: 'Your answer to the current question'
            }
          },
          required: ['answer']
        },
      },
      {
        name: 'skip_question',
        description: 'Skip current question and move to next',
        inputSchema: {
          type: 'object',
          properties: {}
        },
      },
      {
        name: 'check_deployment',
        description: 'Analyze current deployment status',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Path to the project repository'
            }
          },
          required: ['projectPath']
        },
      },
      {
        name: 'analyze_branches',
        description: 'Map branch purposes and deployment strategies',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Path to the project repository'
            }
          },
          required: ['projectPath']
        },
      },
      {
        name: 'detect_patterns',
        description: 'Find failure clusters and circular development',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Path to the project repository'
            }
          },
          required: ['projectPath']
        },
      },
    ],
  };
});

// List available resources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
  const weaveFiles = await weaveLoader.listWeaveFiles();
  const agentFiles = await agentInstructions.listAgents();
  
  return {
    resources: [
      ...weaveFiles.map(file => ({
        uri: `weave://${file}`,
        name: file,
        description: `Weave file: ${file}`,
        mimeType: file.endsWith('.yaml') ? 'application/yaml' : 'text/markdown',
      })),
      ...agentFiles.map(file => ({
        uri: `agent://${file}`,
        name: file,
        description: `Agent instructions: ${file}`,
        mimeType: 'text/markdown',
      })),
      {
        uri: 'state://current',
        name: 'Current State',
        description: 'Current Weaver session state',
        mimeType: 'application/json',
      },
    ],
  };
});

// Read resources
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const uri = request.params.uri;
  const url = new URL(uri);
  
  switch (url.protocol) {
    case 'weave:':
      const weaveContent = await weaveLoader.loadFile(url.pathname.slice(2));
      return {
        contents: [
          {
            uri,
            mimeType: url.pathname.endsWith('.yaml') ? 'application/yaml' : 'text/markdown',
            text: weaveContent,
          },
        ],
      };
      
    case 'agent:':
      const agentContent = await agentInstructions.loadRaw(url.pathname.slice(2));
      return {
        contents: [
          {
            uri,
            mimeType: 'text/markdown',
            text: agentContent,
          },
        ],
      };
      
    case 'state:':
      return {
        contents: [
          {
            uri,
            mimeType: 'application/json',
            text: JSON.stringify(stateManager.getState(), null, 2),
          },
        ],
      };
      
    default:
      throw new Error(`Unknown resource protocol: ${url.protocol}`);
  }
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  switch (name) {
    case 'weaver_review': {
      const { mode } = args as { mode: 'interactive' | 'yolo' };
      
      // Activate review agent
      await activateAgent('review');
      
      // Start review process
      const result = await weaverOrchestrator.startReview(mode);
      
      // CRITICAL: In interactive mode, return ONLY the first question
      if (mode === 'interactive' && result.nextQuestion) {
        return {
          content: [
            {
              type: 'text',
              text: `## Weaver Review Started\n\n${result.initialAnalysis}\n\n### Question 1 of ${result.totalQuestions}:\n${result.nextQuestion}\n\nPlease use the 'answer_question' tool to respond.`,
            },
          ],
        };
      }
      
      // In YOLO mode, return complete analysis
      return {
        content: [
          {
            type: 'text',
            text: result.completeAnalysis || 'Analysis complete',
          },
        ],
      };
    }
    
    case 'weaver_investigate': {
      const { pattern } = args as { pattern: string };
      
      // Activate investigation agent
      await activateAgent('investigate');
      
      // Start investigation
      const result = await weaverOrchestrator.startInvestigation(pattern);
      
      return {
        content: [
          {
            type: 'text',
            text: `## Investigation Started: ${pattern}\n\n${result.finding}\n\n### Question:\n${result.question}\n\nPlease use the 'answer_question' tool to respond.`,
          },
        ],
      };
    }
    
    case 'answer_question': {
      const { answer } = args as { answer: string };
      
      // Process answer and get next question
      const result = await weaverOrchestrator.processAnswer(answer);
      
      if (result.nextQuestion) {
        return {
          content: [
            {
              type: 'text',
              text: `### Captured:\n${result.captured}\n\n### Question ${result.currentQuestion} of ${result.totalQuestions}:\n${result.nextQuestion}\n\nUse 'answer_question' to respond or 'skip_question' to skip.`,
            },
          ],
        };
      }
      
      // All questions answered, generate report
      return {
        content: [
          {
            type: 'text',
            text: `## Review Complete\n\n${result.finalReport}`,
          },
        ],
      };
    }
    
    case 'skip_question': {
      const result = await weaverOrchestrator.skipQuestion();
      
      if (result.nextQuestion) {
        return {
          content: [
            {
              type: 'text',
              text: `### Skipped question ${result.skipped}\n\n### Question ${result.currentQuestion} of ${result.totalQuestions}:\n${result.nextQuestion}`,
            },
          ],
        };
      }
      
      return {
        content: [
          {
            type: 'text',
            text: `## Review Complete\n\n${result.finalReport}`,
          },
        ],
      };
    }
    
    case 'check_deployment': {
      const { projectPath } = args as { projectPath: string };
      const analysis = await deploymentAnalyzer.analyze(projectPath);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(analysis, null, 2),
          },
        ],
      };
    }
    
    case 'analyze_branches': {
      const { projectPath } = args as { projectPath: string };
      const branches = await branchChecker.analyzeBranches(projectPath);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(branches, null, 2),
          },
        ],
      };
    }
    
    case 'detect_patterns': {
      const { projectPath } = args as { projectPath: string };
      const patterns = await gitPatternDetector.detectPatterns(projectPath);
      
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(patterns, null, 2),
          },
        ],
      };
    }
    
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Microsoft Store MCP server started');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});
