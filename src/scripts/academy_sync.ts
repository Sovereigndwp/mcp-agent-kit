#!/usr/bin/env ts-node

import { AcademyDataBridge } from '../agents/AcademyDataBridge';
import path from 'path';

/**
 * Academy Sync Script
 * 
 * Syncs real-time Bitcoin data to academy calculator sites
 * Run this periodically to keep calculators updated with live data
 */

async function syncAcademies() {
  console.log('🔄 Academy Data Sync Starting...\n');

  try {
    const dataBridge = new AcademyDataBridge();

    // Get current Bitcoin data
    console.log('📊 Fetching current Bitcoin network data...');
    const snapshot = await dataBridge.getCurrentSnapshot();
    
    console.log('\n✅ Current Data:');
    console.log(`   💰 BTC Price: $${snapshot.price.usd.toLocaleString()}`);
    console.log(`   ⚡ Fast Fee: ${snapshot.mempool.fastestFee} sat/vB`);
    console.log(`   🕐 Normal Fee: ${snapshot.mempool.halfHourFee} sat/vB`);
    console.log(`   🐢 Economy Fee: ${snapshot.mempool.economyFee} sat/vB`);
    console.log(`   📦 Block Height: ${snapshot.network.blockHeight.toLocaleString()}\n`);

    // Determine paths (can be overridden by environment variables)
    const financialPath = process.env.FINANCIAL_ACADEMY_PATH || 
                         path.join(process.cwd(), '..', 'financially-sovereign-academy');
    const bitcoinPath = process.env.BITCOIN_ACADEMY_PATH;

    console.log('📁 Target Repositories:');
    console.log(`   💵 Financial Academy: ${financialPath}`);
    if (bitcoinPath) {
      console.log(`   ₿  Bitcoin Academy: ${bitcoinPath}`);
    }
    console.log('');

    // Export data
    console.log('🚀 Exporting data to academies...');
    const result = await dataBridge.exportToAcademies({
      financialAcademyPath: financialPath,
      bitcoinAcademyPath: bitcoinPath
    });

    if (result.success) {
      console.log(`\n✅ Data successfully synced to: ${result.exported.join(', ')}`);
      console.log('\n📝 Files created/updated:');
      console.log(`   - ${financialPath}/data/bitcoin-live-data.json`);
      if (bitcoinPath) {
        console.log(`   - ${bitcoinPath}/data/live-network-data.json`);
      }

      console.log('\n💡 Next steps:');
      console.log('   - Check the data files in your academy repositories');
      console.log('   - Update calculators to fetch from these JSON files');
      console.log('   - Set up a cron job to run this script periodically');
      console.log('   - Example: */5 * * * * cd /path/to/mcp-agent-kit && npm run academy:sync');

    } else {
      console.error('\n❌ Sync failed. Check the logs above for details.');
      process.exit(1);
    }

    console.log('\n✨ Sync complete!');

  } catch (error: any) {
    console.error('\n❌ Academy Sync failed:', error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Ensure academy repositories exist at the specified paths');
    console.error('2. Check you have write permissions');
    console.error('3. Verify network connectivity for Bitcoin data APIs');
    console.error('4. Set FINANCIAL_ACADEMY_PATH env var if using custom location');
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Academy Data Sync Tool

Usage:
  npm run academy:sync              Sync data to default locations
  npm run academy:sync -- --help    Show this help message

Environment Variables:
  FINANCIAL_ACADEMY_PATH   Path to financially-sovereign-academy repo
  BITCOIN_ACADEMY_PATH     Path to bitcoin-sovereign-academy repo (optional)

Examples:
  # Basic sync
  npm run academy:sync

  # Custom path
  FINANCIAL_ACADEMY_PATH=/custom/path npm run academy:sync

  # Set up periodic sync (cron)
  */5 * * * * cd ~/projects/mcp-agent-kit && npm run academy:sync >> ~/academy-sync.log 2>&1
`);
  process.exit(0);
}

// Run sync
syncAcademies();
