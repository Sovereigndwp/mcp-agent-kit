# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Build and Development
```bash
# Build the project
npm run build

# Type checking without build
npm run typecheck

# Development server with hot reload
npm run dev

# Start production server
npm start

# Run tests
npm test
npm run test:watch

# Linting
npm run lint
npm run lint:fix
```

### Course Generation System
```bash
# Generate a sample Bitcoin course
npm run course:sample

# Create custom course with specific parameters
npm run course:create

# View available agents for course creation
npm run course:agents
```

### Bitcoin Intelligence Monitoring
```bash
# Gather latest Bitcoin intelligence from all sources
npm run intel:gather

# View intelligence summary
npm run intel:summary

# Monitor educational sites specifically
npm run intel:education

# List all monitored intelligence sources
npm run intel:sources
```

### Content Integration
```bash
# Import content from various sources
npm run import:content      # Import all content
npm run import:canva        # Import Canva designs
npm run import:notion       # Import Notion workspace
npm run import:gpts         # Import ChatGPT data

# Analyze imported content
npm run analyze:all-content
```

### Agent Demonstrations
```bash
# Core system demos
npm run tutorial:demo       # Tutorial builder demo
npm run assessment:demo     # Assessment generator demo
npm run orchestrator:demo   # Content orchestrator demo
npm run complete:demo       # Complete system demo

# Canva integration demos
npm run canva:snippet       # Basic Canva integration
npm run canva:enhanced      # Enhanced Canva features
npm run canva:design        # Auto-design generation
npm run canva:create        # Create real Canva designs

# Specialized demos
npm run automation          # Automation manager demo
npm run workflow           # Bitcoin Canva workflow
```

### Running Single Tests
```bash
# Run specific agent tests
npm run test -- --testNamePattern="NewsScout"
npm run test -- src/tests/agents/CanvaAgent.test.js

# Run tests for specific directory
npm run test -- src/tests/tools/
```

## Architecture Overview

### Core System Structure
This is a Model Context Protocol (MCP) Agent Kit designed for Bitcoin education with three main architectural layers:

**1. MCP Server Layer** (`src/index.ts`, `src/core/MCPAgentServer.ts`)
- Main MCP server implementation using `@modelcontextprotocol/sdk`
- Handles agent registration, message routing, and communication protocols
- Manages security, caching, and event-driven coordination

**2. Task Routing Layer** (`src/router/`)
- `TaskRouter.ts` - Core routing logic for tools and agents
- `EnhancedTaskRouter.ts` - Advanced routing with plugins and caching
- Routes between MCP protocol messages and internal agent implementations

**3. Agent Orchestration Layer** (`src/agents/`, `src/tools/`)
- 30+ specialized agents for Bitcoin education and content creation
- Tool implementations for Bitcoin data (price, fees, mempool stats)
- Integration agents for Canva, Notion, and ChatGPT content

### Key Agent Categories

**Educational Agents:**
- `SocraticTutor` - Generates questioning sequences for discovery learning
- `TutorialBuilder` - Creates structured learning modules
- `AssessmentGenerator` - Designs contextual evaluations
- `ContentOrchestrator` - Manages multi-agent educational workflows

**Content Intelligence:**
- `ContentPhilosophyAnalyzer` - Analyzes learning approaches
- `NotionContentAnalyzer` - Extracts insights from Notion workspaces  
- `CanvaContentAnalyzer` - Analyzes design patterns from Canva
- `ChatGPTContentAnalyzer` - Processes existing educational content

**Bitcoin-Specific Agents:**
- `BitcoinIntelligenceScout` - Monitors Bitcoin ecosystem threats/opportunities
- `BitcoinNewsAnalyzer` - Analyzes news sentiment for educational opportunities
- `SimulationBuilder` - Creates Bitcoin transaction simulations
- `CustodyCoach` - Bitcoin security and self-custody education

**Visual & Design:**
- `BrandIdentitySystem` - Maintains consistent visual identity
- `CanvaDesignCoach` - Generates visual learning materials
- `UXDesignAgent` - User experience optimization

### Data Flow Architecture
1. **Content Ingestion**: Multiple sources (Notion, Canva, RSS, Bitcoin APIs)
2. **Agent Processing**: Specialized agents analyze and transform content
3. **Orchestration**: `ContentOrchestrator` coordinates multi-agent workflows
4. **Output Generation**: Structured courses, visual materials, assessments
5. **Intelligence Monitoring**: Continuous monitoring of Bitcoin ecosystem

### Integration Points
- **Canva API**: Automated design generation and bulk CSV imports
- **Notion API**: Workspace setup and progress tracking
- **Bitcoin APIs**: Live network data (mempool.space, CoinGecko)
- **RSS Feeds**: News monitoring and sentiment analysis
- **MCP Protocol**: Standard interface for AI agent communication

### File Organization
- `src/agents/` - Individual agent implementations (30+ files)
- `src/tools/` - Bitcoin data tools and API integrations
- `src/core/` - Core MCP server infrastructure and coordination
- `src/router/` - Message routing and task distribution
- `src/cases/` - Example use cases and demonstration scripts
- `src/automation/` - Automated course updating and maintenance
- `exports/` - Generated course content, CSVs, and HTML outputs
- `docs/` - Setup guides for Canva, Notion, and deployment

## Environment Requirements

### Required Environment Variables
```bash
# Bitcoin Data APIs (optional but recommended)
MEMPOOL_API_URL=https://mempool.space/api
COINGECKO_API_URL=https://api.coingecko.com/api/v3

# Integration APIs (optional)
CANVA_API_KEY=your_canva_api_key
NOTION_TOKEN=your_notion_token
OPENAI_API_KEY=your_openai_key

# Development
LOG_LEVEL=info
NODE_ENV=development
```

### Node.js Version
Requires Node.js >= 18.0.0 (specified in package.json engines)

## Testing Strategy

### Test Structure
- Unit tests for individual agents in `src/tests/agents/`
- Integration tests for MCP server functionality
- Tool tests for Bitcoin API integrations
- Demo scripts that serve as functional tests

### Running Focused Tests
The project uses Jest with TypeScript support. Test files follow the pattern `*.test.ts` and are located alongside source files or in dedicated test directories.

## Deployment Notes

### Production Build
```bash
# Build for deployment
npm run build:deploy

# Start production server
npm run start:deploy
```

The project includes Docker support with a `Dockerfile` for containerized deployment.
