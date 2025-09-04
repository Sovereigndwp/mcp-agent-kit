#!/usr/bin/env ts-node

import { Command } from 'commander';
import { BitcoinIntelligenceScout } from '../agents/BitcoinIntelligenceScout.js';
import { logger } from '../utils/logger.js';

const program = new Command();

program
  .name('bitcoin-intelligence')
  .description('Bitcoin Intelligence Scout - Monitor news, threats, and educational opportunities')
  .version('1.0.0');

program
  .command('gather')
  .description('Gather intelligence from all monitored sources')
  .option('-t, --timeframe <timeframe>', 'Time period to analyze', '24h')
  .action(async (options) => {
    try {
      logger.info('🕵️ Starting Bitcoin intelligence gathering...');
      console.log('🔍 Monitoring Sources:');
      console.log('   📰 News: CoinDesk, Bitcoin Magazine, Decrypt');
      console.log('   🛡️ Security: Chainalysis, Bitcoin Security Research');
      console.log('   📊 Economics: Federal Reserve, SEC releases');
      console.log('   🎓 Education: Learn Me A Bitcoin, Bitcoin Optech, MIT DCI');
      console.log('   ⚡ Technical: Bitcoin Core, GitHub releases');
      console.log('');
      console.log(`⏰ Timeframe: ${options.timeframe}`);
      console.log('');

      const scout = new BitcoinIntelligenceScout();
      const report = await scout.gatherIntelligence(options.timeframe as any);
      
      console.log('✅ Intelligence gathering completed!');
      console.log('');
      console.log('📊 Intelligence Summary:');
      console.log(`   Report ID: ${report.report_id}`);
      console.log(`   Total Alerts: ${report.total_alerts}`);
      console.log(`   Critical Alerts: ${report.critical_alerts.length}`);
      console.log(`   High Priority: ${report.high_alerts.length}`);
      console.log(`   Educational Opportunities: ${report.educational_opportunities.length}`);
      console.log('');
      
      if (report.critical_alerts.length > 0) {
        console.log('🚨 CRITICAL ALERTS:');
        report.critical_alerts.slice(0, 3).forEach((alert, index) => {
          console.log(`   ${index + 1}. ${alert.title}`);
          console.log(`      Source: ${alert.source}`);
          console.log(`      Impact: ${alert.educational_impact || 'Security/Threat Alert'}`);
        });
        console.log('');
      }
      
      if (report.educational_opportunities.length > 0) {
        console.log('🎓 EDUCATIONAL OPPORTUNITIES:');
        report.educational_opportunities.slice(0, 3).forEach((alert, index) => {
          console.log(`   ${index + 1}. ${alert.title}`);
          console.log(`      Relevance: ${alert.relevance_score}/100`);
          console.log(`      Impact: ${alert.educational_impact}`);
        });
        console.log('');
      }
      
      console.log('🎯 TOP RECOMMENDATIONS:');
      report.recommendations.slice(0, 5).forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
      console.log('');
      
      console.log('🛡️ THREAT LANDSCAPE:');
      report.threat_landscape.new_threats.slice(0, 3).forEach((threat, index) => {
        console.log(`   • ${threat}`);
      });
      console.log('');
      
      console.log(`📁 Full Report: data/intelligence/reports/${report.report_id}.json`);
      console.log('💡 Run "npm run intel:summary" to view latest summary anytime');

    } catch (error) {
      logger.error('Failed to gather intelligence:', error);
      console.error('❌ Intelligence gathering failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('summary')
  .description('Show latest intelligence summary')
  .action(async () => {
    try {
      const scout = new BitcoinIntelligenceScout();
      const summary = await scout.getCurrentIntelligenceSummary();
      
      if (summary.message) {
        console.log('ℹ️ ', summary.message);
        if (summary.recommendations) {
          console.log('💡 Next Steps:');
          summary.recommendations.forEach((rec: string) => console.log(`   • ${rec}`));
        }
        return;
      }
      
      console.log('📊 Latest Bitcoin Intelligence Summary');
      console.log('=====================================');
      console.log(`Last Updated: ${new Date(summary.last_updated).toLocaleString()}`);
      console.log(`Total Alerts: ${summary.total_alerts}`);
      console.log(`Critical: ${summary.critical_count} | High Priority: ${summary.high_count}`);
      console.log('');
      
      console.log('🎯 Key Recommendations:');
      summary.key_recommendations.forEach((rec: string, index: number) => {
        console.log(`   ${index + 1}. ${rec}`);
      });
      console.log('');
      
      console.log('⚠️ Top Threats:');
      summary.top_threats.forEach((threat: string) => {
        console.log(`   • ${threat}`);
      });
      console.log('');
      
      console.log('🎓 Education Opportunities:');
      summary.education_opportunities.forEach((opp: string) => {
        console.log(`   • ${opp}`);
      });
      
    } catch (error) {
      logger.error('Failed to get intelligence summary:', error);
      console.error('❌ Summary retrieval failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('monitor-education')
  .description('Monitor educational sites for improvements and new content')
  .action(async () => {
    try {
      console.log('🎓 Monitoring Educational Bitcoin Sites...');
      console.log('Sites: Learn Me A Bitcoin, Bitcoin Optech, Andreas Antonopoulos, MIT DCI');
      console.log('');
      
      const scout = new BitcoinIntelligenceScout();
      const alerts = await scout.monitorEducationalSites();
      
      console.log(`✅ Found ${alerts.length} educational insights!`);
      console.log('');
      
      if (alerts.length > 0) {
        console.log('🔍 Educational Intelligence:');
        alerts.forEach((alert, index) => {
          console.log(`\n${index + 1}. ${alert.title}`);
          console.log(`   Source: ${alert.source}`);
          console.log(`   Relevance: ${alert.relevance_score}/100`);
          console.log(`   Impact: ${alert.educational_impact}`);
          
          if (alert.action_items && alert.action_items.length > 0) {
            console.log('   Action Items:');
            alert.action_items.forEach(item => console.log(`     • ${item}`));
          }
        });
      }
      
    } catch (error) {
      logger.error('Failed to monitor educational sites:', error);
      console.error('❌ Educational monitoring failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  });

program
  .command('sources')
  .description('List all monitored intelligence sources')
  .action(() => {
    console.log('🕵️ Bitcoin Intelligence Sources');
    console.log('===============================');
    console.log('');
    
    console.log('📰 NEWS SOURCES:');
    console.log('   • CoinDesk Bitcoin (RSS) - High Priority, Hourly Updates');
    console.log('   • Bitcoin Magazine (RSS) - High Priority, Hourly Updates'); 
    console.log('   • Decrypt Bitcoin (RSS) - Medium Priority, Hourly Updates');
    console.log('');
    
    console.log('🛡️ SECURITY & THREATS:');
    console.log('   • Bitcoin Security Research (RSS) - High Priority, Daily Updates');
    console.log('   • Chainalysis Threat Intelligence (RSS) - High Priority, Daily Updates');
    console.log('');
    
    console.log('📊 ECONOMIC & REGULATORY:');
    console.log('   • Federal Reserve Economic Data (RSS) - Medium Priority, Daily Updates');
    console.log('   • SEC Cryptocurrency Releases (RSS) - High Priority, Daily Updates');
    console.log('');
    
    console.log('🎓 EDUCATIONAL RESOURCES:');
    console.log('   • Learn Me A Bitcoin (Educational Site) - High Priority, Weekly Analysis');
    console.log('   • Bitcoin Optech (RSS) - High Priority, Weekly Updates');
    console.log('   • Andreas Antonopoulos (RSS) - High Priority, Weekly Updates');
    console.log('   • MIT Digital Currency Research (RSS) - Medium Priority, Weekly Updates');
    console.log('');
    
    console.log('⚡ TECHNICAL DEVELOPMENT:');
    console.log('   • Bitcoin Core Development (GitHub RSS) - Medium Priority, Weekly Updates');
    console.log('');
    
    console.log('💡 Intelligence Focus Areas:');
    console.log('   🔍 Cybersecurity threats targeting Bitcoin users and educators');
    console.log('   📊 Global economic factors affecting Bitcoin adoption and education');
    console.log('   🏛️ Regulatory changes impacting Bitcoin educational content');
    console.log('   🎯 New educational tools, methods, and content opportunities');
    console.log('   🛠️ Technical developments requiring curriculum updates');
    console.log('   🌐 International jurisdiction changes affecting Bitcoin');
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}