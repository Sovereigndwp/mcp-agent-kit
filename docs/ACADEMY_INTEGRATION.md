# Academy Integration Guide

## Overview

The MCP Agent Kit now includes powerful features to bridge real-time Bitcoin data between your agent system and academy calculator sites. This integration enables:

- **Real-time Bitcoin data** in educational content
- **Live calculator updates** with current network conditions
- **Automated course content** with contextual Bitcoin information
- **Seamless sync** between agent kit and academy repositories

## New Features

### 1. AcademyDataBridge Agent

Location: `src/agents/AcademyDataBridge.ts`

Fetches real-time Bitcoin data and exports it to academy repositories.

**Capabilities:**
- Get current Bitcoin price from multiple sources
- Fetch mempool fee estimates (fast, normal, economy)
- Generate calculator-ready data exports
- Create educational context from live network conditions

**Usage:**
```typescript
import { AcademyDataBridge } from './agents/AcademyDataBridge';

const bridge = new AcademyDataBridge();

// Get current snapshot
const snapshot = await bridge.getCurrentSnapshot();
console.log(`BTC: $${snapshot.price.usd}`);

// Get calculator data
const calcData = await bridge.generateCalculatorData();

// Export to academies
await bridge.exportToAcademies({
  financialAcademyPath: '../financially-sovereign-academy',
  bitcoinAcademyPath: '../bitcoin-sovereign-academy'
});
```

### 2. Enhanced Course Building Pipeline

Location: `src/pipelines/course_build_enhanced.ts`

Builds course content with integrated live Bitcoin data.

**Features:**
- Dynamic lesson topics based on network conditions
- Real-time fee data in lesson content
- Live price information
- Context-aware educational content
- Auto-sync to calculator repositories

**Run:**
```bash
# Build course with live data and sync
npm run course:build:enhanced

# Build without live data
npm run course:build:enhanced -- --no-live-data

# Build without calculator sync
npm run course:build:enhanced -- --no-sync
```

### 3. Academy Sync Script

Location: `src/scripts/academy_sync.ts`

Syncs current Bitcoin data to academy calculator sites.

**Run:**
```bash
# Basic sync
npm run academy:sync

# Show help
npm run academy:sync -- --help

# Custom path
FINANCIAL_ACADEMY_PATH=/custom/path npm run academy:sync
```

## Setup

### 1. Environment Variables

Add to your `.env` file:

```bash
# Optional: Custom academy paths
FINANCIAL_ACADEMY_PATH=/path/to/financially-sovereign-academy
BITCOIN_ACADEMY_PATH=/path/to/bitcoin-sovereign-academy

# Bitcoin API endpoints (already configured)
MEMPOOL_API_URL=https://mempool.space/api
COINGECKO_API_URL=https://api.coingecko.com/api/v3
```

### 2. Directory Structure

The sync script creates the following structure in your academy repos:

```
financially-sovereign-academy/
└── data/
    └── bitcoin-live-data.json    # Calculator-ready data

bitcoin-sovereign-academy/
└── data/
    └── live-network-data.json    # Full network snapshot
```

### 3. Data Format

**Calculator Data** (`bitcoin-live-data.json`):
```json
{
  "btcPrice": 45000,
  "feeEstimates": {
    "fast": 25,
    "normal": 15,
    "slow": 5
  },
  "updatedAt": "2026-01-12T16:30:00.000Z"
}
```

**Network Snapshot** (`live-network-data.json`):
```json
{
  "timestamp": "2026-01-12T16:30:00.000Z",
  "price": {
    "usd": 45000,
    "source": "mempool.space"
  },
  "mempool": {
    "fastestFee": 25,
    "halfHourFee": 15,
    "hourFee": 5,
    "economyFee": 5
  },
  "network": {
    "blockHeight": 825000,
    "difficulty": 0
  }
}
```

## Integration with Calculators

### Update Your Calculators

Modify your calculator HTML/JS to fetch live data:

```javascript
// In your calculator JavaScript
async function loadLiveBitcoinData() {
  try {
    const response = await fetch('../data/bitcoin-live-data.json');
    const data = await response.json();
    
    // Update calculator with live data
    document.getElementById('btc-price').textContent = 
      `$${data.btcPrice.toLocaleString()}`;
    
    // Use fee estimates
    updateFeeOptions(data.feeEstimates);
    
    // Show last update time
    const updated = new Date(data.updatedAt).toLocaleString();
    document.getElementById('last-updated').textContent = updated;
    
  } catch (error) {
    console.log('Using default values - live data unavailable');
  }
}

// Load on page load
window.addEventListener('DOMContentLoaded', loadLiveBitcoinData);
```

### Example: Compound Growth Calculator Enhancement

```javascript
// Add Bitcoin DCA comparison with live price
const btcPrice = await fetch('../data/bitcoin-live-data.json')
  .then(r => r.json())
  .then(d => d.btcPrice);

// Calculate Bitcoin accumulation
const monthlyBtcPurchase = monthlyContribution / btcPrice;
const totalBtcAccumulated = monthlyBtcPurchase * months;
const btcValueToday = totalBtcAccumulated * btcPrice;
```

## Automation

### Set Up Periodic Sync

**Option 1: Cron Job**

Add to your crontab (`crontab -e`):

```bash
# Sync every 5 minutes
*/5 * * * * cd /Users/dalia/projects/mcp-agent-kit && npm run academy:sync >> ~/academy-sync.log 2>&1

# Sync every hour
0 * * * * cd /Users/dalia/projects/mcp-agent-kit && npm run academy:sync
```

**Option 2: Node Cron (within your app)**

```typescript
import cron from 'node-cron';
import { AcademyDataBridge } from './agents/AcademyDataBridge';

// Run every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Running academy sync...');
  const bridge = new AcademyDataBridge();
  await bridge.exportToAcademies({
    financialAcademyPath: '../financially-sovereign-academy'
  });
});
```

**Option 3: GitHub Actions**

Create `.github/workflows/academy-sync.yml` in your academy repos:

```yaml
name: Update Bitcoin Data

on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:        # Manual trigger

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          repository: Sovereigndwp/mcp-agent-kit
          path: mcp-agent-kit
      
      - uses: actions/checkout@v3
        with:
          path: financially-sovereign-academy
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd mcp-agent-kit && npm install
      
      - name: Sync data
        run: |
          cd mcp-agent-kit
          FINANCIAL_ACADEMY_PATH=../financially-sovereign-academy npm run academy:sync
      
      - name: Commit and push
        run: |
          cd financially-sovereign-academy
          git config user.name "Academy Bot"
          git config user.email "bot@sovereign.academy"
          git add data/bitcoin-live-data.json
          git commit -m "Update Bitcoin data [automated]" || exit 0
          git push
```

## Enhanced Course Building

### Generate Lessons with Live Data

```bash
# Build a lesson with real-time Bitcoin context
npm run course:build:enhanced

# The pipeline will:
# 1. Fetch current Bitcoin network data
# 2. Generate contextual lesson topic
# 3. Include live fee estimates in content
# 4. Create simulations with real network conditions
# 5. Sync data to academy calculators
```

### Customize Lesson Generation

```typescript
import { runEnhancedCourseBuild } from './pipelines/course_build_enhanced';

await runEnhancedCourseBuild({
  includeLiveData: true,
  syncToCalculators: true,
  academyPaths: {
    financial: '../financially-sovereign-academy',
    bitcoin: '../bitcoin-sovereign-academy'
  }
});
```

## Workflow Examples

### Daily Course Update Workflow

1. **Morning**: Sync Bitcoin data to calculators
```bash
npm run academy:sync
```

2. **Review network conditions**: Check if fees are interesting
```bash
npm run intel:gather
```

3. **Generate contextual lesson**: If conditions are notable
```bash
npm run course:build:enhanced
```

4. **Evaluate quality**:
```bash
npm run eval:run
```

5. **Publish**: Commit to academies

### Real-Time Calculator Integration

1. **Initial sync**:
```bash
npm run academy:sync
```

2. **Deploy academies** with data fetch in calculators

3. **Set up automation** (cron or GitHub Actions)

4. **Monitor**: Calculators now show live Bitcoin data

## Troubleshooting

### Data not syncing

```bash
# Check paths are correct
ls ../financially-sovereign-academy

# Verify permissions
npm run academy:sync -- --help

# Test manually
FINANCIAL_ACADEMY_PATH=./test npm run academy:sync
```

### API rate limits

The agent kit uses free Bitcoin APIs with reasonable rate limits:
- mempool.space: No API key required
- CoinGecko: 50 calls/minute free tier

If needed, add API keys to `.env`:
```bash
COINGECKO_API_KEY=your_key_here
```

### Stale data

If data seems old:
1. Check last sync time in JSON file
2. Verify cron job is running: `crontab -l`
3. Check logs: `tail -f ~/academy-sync.log`

## Next Steps

- [ ] Add more Bitcoin data sources (difficulty, hash rate)
- [ ] Create dashboard showing sync status
- [ ] Build calculator widget that embeds in courses
- [ ] Add Lightning Network data integration
- [ ] Create alert system for interesting network conditions

## Support

For issues or questions:
- Check logs in `workspace/` directory
- Review API responses in debug mode
- Open issue in mcp-agent-kit repository
