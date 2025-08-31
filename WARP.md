# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Development Commands

### Core Development
- `npm run build` - Build TypeScript to JavaScript (outputs to `dist/`)
- `npm run dev` - Start development server with TypeScript compilation
- `npm run demo` - Build and run the main demo application
- `npm test` - Run Jest test suite (includes smoke tests)
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Check code quality with ESLint
- `npm run lint:fix` - Auto-fix linting issues

### Demo Scripts
The project includes numerous demo scripts that showcase different agents and use cases:
- `npm run canva:snippet` - Canva API integration demo
- `npm run design:coach` - Canva design coaching demo
- `npm run web` - Start web server interface
- `npm run tutorial:demo` - Tutorial builder demonstration
- `npm run assessment:demo` - Assessment generator demo
- `npm run orchestrator:demo` - Content orchestration demo
- `npm run complete:demo` - Complete system demonstration
- `npm run workflow` - Bitcoin Canva workflow demo

### Running Individual Tests
```bash
# Run specific test file
npx jest tests/smoke.spec.ts

# Run tests matching pattern
npx jest --testNamePattern="Bitcoin Price Tool"

# Run tests with coverage
npx jest --coverage
```

## Architecture Overview

### Core Architecture
This is a **Model Context Protocol (MCP) Agent Kit** designed for Bitcoin education. It follows a modular architecture with clear separation between tools, agents, and routing:

```
src/
├── index.ts              # Main MCP server entry point
├── router/TaskRouter.ts  # Central routing and registration system
├── tools/                # Individual API integration tools
├── agents/               # High-level AI agents that use tools
├── cases/                # Example use cases and demos
└── utils/                # Shared utilities (logging, caching, HTTP)
```

### Key Components

#### 1. MCP Server (`src/index.ts`)
- Entry point that creates and configures the MCP server
- Uses `@modelcontextprotocol/sdk` for standardized AI agent communication
- Handles graceful shutdown and error management
- Connects via stdio transport for MCP compatibility

#### 2. TaskRouter (`src/router/TaskRouter.ts`)
- Central registry that manages all tools and agents
- Maps tool names to implementations with proper schemas
- Handles MCP registration and routing
- Currently includes 8+ Bitcoin/crypto tools and 5+ specialized agents

#### 3. Tools Layer
Individual API integrations that provide raw data and functionality:
- **Bitcoin Price Tools**: CoinGecko API integration for real-time BTC pricing
- **Mempool Tools**: Mempool.space API for fee estimates and network stats
- **Canva Tools**: Full Canva API integration (8 tools) for design management
- **FX Rate Tools**: Currency conversion capabilities
- **GitHub Tools**: Repository release monitoring
- **RSS Tools**: News feed aggregation

#### 4. Agents Layer
High-level AI agents that combine multiple tools for complex workflows:
- **NewsScout**: Bitcoin news monitoring and sentiment analysis
- **SimulationBuilder**: Fee simulation and cost analysis scenarios
- **CanvaAgent**: Automated design management and Bitcoin content creation
- **DevRadar**: Development activity tracking
- **CustodyCoach**: Security best practices guidance
- **SocraticTutor**: Educational Q&A system

### Data Flow
1. MCP clients connect via stdio transport
2. TaskRouter routes requests to appropriate tools/agents
3. Tools make API calls and return structured data
4. Agents orchestrate multiple tools for complex tasks
5. Results flow back through MCP protocol to client

## Configuration

### Environment Setup
```bash
cp .env.example .env
# Required: CANVA_API_KEY for design integration
# Optional: Additional API keys for enhanced functionality
```

### Key Environment Variables
- `CANVA_API_KEY` - Required for Canva design management features
- `MEMPOOL_API_URL` - Mempool.space endpoint (defaults to public API)
- `COINGECKO_API_URL` - CoinGecko endpoint (defaults to free tier)
- `GITHUB_TOKEN` - For repository monitoring (optional)
- `NODE_ENV` - Set to 'test' for testing

## Important Technical Details

### TypeScript Configuration
- Uses ES2022 with Node20 module system
- ESM-only codebase (`.js` extensions in imports required)
- Strict type checking enabled
- Output goes to `dist/` directory

### Testing Setup
- Jest with TypeScript support via ts-jest
- ESM configuration for modern JavaScript
- 30-second timeout for API calls
- Coverage reporting configured
- Smoke tests verify all major tools and agents

### Bitcoin Integration Focus
This codebase is specifically designed for Bitcoin education and monitoring:
- Real-time price data with caching
- Fee estimation and mempool analysis
- Educational content generation via Canva
- News sentiment tracking
- Simulation tools for learning scenarios

### MCP Protocol Implementation
- Implements Model Context Protocol for AI agent communication
- Tools are registered with proper JSON schemas
- Agents provide high-level capabilities built on tool primitives
- Designed to work with MCP-compatible AI systems
