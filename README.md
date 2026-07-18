# MCP Agent Kit for Bitcoin Education

Simple agents, clear tools, real data. Use this as a base for your app.

## Overview

This MCP (Model Context Protocol) Agent Kit provides a comprehensive set of tools and agents for Bitcoin education and monitoring. It includes real-time data feeds, analysis tools, and specialized agents for various use cases.

## Features

### 🛠️ Tools
- **Bitcoin Price Tools**: Real-time BTC price from multiple sources
- **FX Rate Tools**: Currency conversion rates
- **Mempool Tools**: Fee estimates and block monitoring
- **GitHub Integration**: Latest release monitoring
- **RSS Feed Tools**: News aggregation and monitoring
- **Page Monitoring**: Website change detection
- **Bitcoin Core RPC**: Direct node interaction
- **Lightning Network**: LND REST API integration

### 🤖 Agents
- **NewsScout**: Bitcoin news monitoring and analysis
- **DevRadar**: Development activity tracking
- **LawWatchColombia**: Legal and regulatory monitoring
- **CustodyCoach**: Custody best practices guidance
- **SimulationBuilder**: Fee simulation scenarios
- **SocraticTutor**: Educational Q&A system
- **DataAnalyst**: Data analysis and insights
- **OutreachWriter**: Content creation assistance

## Quick Start

1. **Clone and Setup**
   ```bash
   git clone <your-repo-url>
   cd mcp-agent-kit
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and configuration
   ```

4. **Run Demo**
   ```bash
   npm run demo
   ```

## Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build TypeScript to JavaScript
- `npm run test` - Run test suite
- `npm run lint` - Check code quality
- `npm run lint:fix` - Auto-fix linting issues

### Project Structure
```
src/
├── index.ts              # Main entry point
├── router/               # MCP router implementation
├── registry/             # Tool and agent registries
├── utils/                # Shared utilities
├── tools/                # Individual tool implementations
├── agents/               # Agent implementations
└── cases/                # Example use cases
```

## Configuration

### Environment Variables
- `MEMPOOL_API_URL` - Mempool.space API endpoint
- `COINGECKO_API_URL` - CoinGecko API endpoint
- `GITHUB_TOKEN` - GitHub API token
- `RSS_FEEDS` - Comma-separated RSS feed URLs
- `BITCOIND_RPC_*` - Bitcoin Core RPC configuration
- `LND_REST_*` - Lightning Network Daemon configuration

### API Keys
You'll need to obtain API keys for:
- GitHub (for release monitoring)
- Optional: CoinGecko Pro (for higher rate limits)

## Usage Examples

### Basic Tool Usage
```typescript
import { getBitcoinPrice } from './src/tools/btc_price';

const price = await getBitcoinPrice();
console.log(`Current BTC price: $${price}`);
```

### Agent Interaction
```typescript
import { NewsScout } from './src/agents/NewsScout';

const newsAgent = new NewsScout();
const headlines = await newsAgent.getLatestHeadlines();
```

### Fee Simulation
```typescript
import { SimulationBuilder } from './src/agents/SimulationBuilder';

const simulator = new SimulationBuilder();
const scenario = await simulator.createScenario({
  transactionSize: 250,
  targetConfirmationTime: 10
});
```

## Current Status

### ✅ Implemented
- **Core Infrastructure**: MCP server setup, routing, logging, caching
- **Bitcoin Price Tool**: Real-time price fetching with caching
- **Mempool Fee Estimates**: Fee calculation and mempool monitoring
- **FX Rate Tool**: Currency conversion
- **GitHub Release Tool**: Repository release monitoring
- **NewsScout Agent**: RSS feed monitoring and sentiment analysis
- **SimulationBuilder Agent**: Fee simulation and cost analysis
- **Demo Application**: Working fee simulation demo
- **Test Suite**: Comprehensive smoke tests

### 🚧 In Progress
- **DevRadar Agent**: GitHub activity monitoring
- **CustodyCoach Agent**: Security best practices
- **Additional Tools**: RSS fetching, page monitoring, RPC calls

### 📋 Planned
- **SocraticTutor Agent**: Educational Q&A system
- **DataAnalyst Agent**: Advanced analytics
- **OutreachWriter Agent**: Content creation
- **LawWatchColombia Agent**: Regulatory monitoring

## Testing

Run the test suite to verify functionality:

```bash
npm test
```

Or run a quick demo:

```bash
node demo.js
```

## Security

This repository takes secret hygiene seriously — and it also deliberately contains **fake, deterministic Bitcoin key material for teaching**, so the boundary is documented rather than assumed.

- **Credential scanning:** [gitleaks](https://github.com/gitleaks/gitleaks) runs over history and worktree; all default rules are active. Only the two documented educational simulator constants are allowlisted (by exact value) in [`.gitleaks.toml`](.gitleaks.toml). A pre-commit hook ([`.pre-commit-config.yaml`](.pre-commit-config.yaml)) scans every commit — run `pre-commit install` after cloning.
- **Secrets policy:** what may never be committed, and what educational mock values are allowed: [`docs/security/SECRETS_POLICY.md`](docs/security/SECRETS_POLICY.md).
- **Responsible disclosure:** report vulnerabilities privately per [`SECURITY.md`](SECURITY.md) — GitHub private vulnerability reporting or dalia@thesovereign.academy.
- **History:** the 2026-07-18 credential remediation (revocation + history rewrite + fresh-clone verification) is recorded in [`docs/security/2026-07-18-credential-remediation.md`](docs/security/2026-07-18-credential-remediation.md). The simulated Bitcoin keys are intentional teaching artifacts, never used for real funds.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For questions and support:
- Open an issue on GitHub
- Check the documentation in `/docs`
- Review example cases in `/src/cases`
