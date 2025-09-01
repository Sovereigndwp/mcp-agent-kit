#!/usr/bin/env tsx

// Automation Manager - Control course update automation
import 'dotenv/config';
import { CourseUpdateAutomation } from '../automation/CourseUpdater.js';
import { logger } from '../utils/logger.js';

async function main() {
  const command = process.argv[2];
  const automation = new CourseUpdateAutomation();

  console.log('🤖 Bitcoin Course Update Automation Manager');
  console.log('═'.repeat(50));

  switch (command) {
    case 'start':
      console.log('🚀 Starting daily automation...');
      automation.start();
      break;

    case 'status':
      console.log('📊 Automation Status:');
      const status = automation.getStatus();
      
      console.log(`   Enabled: ${status.enabled ? '✅' : '❌'}`);
      console.log(`   Schedule: ${status.schedule} (${status.timezone})`);
      console.log(`   Currently Running: ${status.is_running ? '🔄' : '⏸️'}`);
      console.log(`   Last Update: ${status.last_update ? new Date(status.last_update).toLocaleString() : 'Never'}`);
      console.log(`   Total Updates: ${status.total_updates}`);
      console.log(`   Successful: ${status.successful_updates}`);
      console.log(`   Failed: ${status.failed_updates}`);
      console.log(`   Next: ${status.next_scheduled}`);
      
      console.log('\n⚙️ Configuration:');
      console.log(`   Price threshold: ${status.config.update_threshold.price_change_percent}%`);
      console.log(`   Fee threshold: ${status.config.update_threshold.fee_change_multiplier}x`);
      console.log(`   Notifications: ${status.config.notifications.success ? 'On' : 'Off'}`);
      console.log(`   Backup retention: ${status.config.backup_retention_days} days`);
      break;

    case 'force-update':
      console.log('🔧 Forcing immediate course update...');
      await automation.forceUpdate();
      console.log('✅ Force update completed');
      break;

    case 'configure':
      console.log('⚙️ Configuration options:');
      console.log('   Available settings:');
      console.log('   - schedule: Cron format (e.g., "0 8 * * *" for daily 8 AM)');
      console.log('   - price_change_percent: Trigger threshold (default: 5%)');
      console.log('   - fee_change_multiplier: Fee change threshold (default: 2x)');
      console.log('   - enabled: true/false');
      console.log('\n   Example: npm run automation -- configure schedule "0 6,18 * * *" (6 AM & 6 PM daily)');
      
      const setting = process.argv[3];
      const value = process.argv[4];
      
      if (setting && value) {
        const configUpdate: any = {};
        
        if (setting === 'schedule') {
          configUpdate.schedule = value;
        } else if (setting === 'price_change_percent') {
          configUpdate.update_threshold = { price_change_percent: parseFloat(value) };
        } else if (setting === 'fee_change_multiplier') {
          configUpdate.update_threshold = { fee_change_multiplier: parseFloat(value) };
        } else if (setting === 'enabled') {
          configUpdate.enabled = value.toLowerCase() === 'true';
        }
        
        if (Object.keys(configUpdate).length > 0) {
          automation.updateConfig(configUpdate);
          console.log(`✅ Updated ${setting} to ${value}`);
        } else {
          console.log('❌ Unknown setting:', setting);
        }
      }
      break;

    case 'install-service':
      console.log('🔧 Installing as system service...');
      console.log('   This will create a system service to run automation continuously');
      console.log('   Service will start automatically on system boot');
      
      // Create systemd service file for Linux
      const serviceFile = `[Unit]
Description=Bitcoin Course Update Automation
After=network.target

[Service]
Type=simple
User=${process.env.USER || 'bitcoin-course'}
WorkingDirectory=${process.cwd()}
ExecStart=/usr/bin/node ${process.cwd()}/dist/automation/CourseUpdater.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target`;

      console.log('   Service file content:');
      console.log('   ─'.repeat(40));
      console.log(serviceFile);
      console.log('   ─'.repeat(40));
      console.log('\n   To install:');
      console.log('   1. Save this as /etc/systemd/system/bitcoin-course-automation.service');
      console.log('   2. Run: sudo systemctl enable bitcoin-course-automation');
      console.log('   3. Run: sudo systemctl start bitcoin-course-automation');
      console.log('   4. Check status: sudo systemctl status bitcoin-course-automation');
      break;

    case 'help':
    default:
      console.log('📖 Available Commands:');
      console.log('   start              Start the automation (runs continuously)');
      console.log('   status             Show current automation status');
      console.log('   force-update       Trigger immediate course update');
      console.log('   configure [setting] [value]  Update configuration');
      console.log('   install-service    Show system service installation instructions');
      console.log('   help               Show this help message');
      console.log('\n🎯 Examples:');
      console.log('   npm run automation start');
      console.log('   npm run automation status');
      console.log('   npm run automation force-update');
      console.log('   npm run automation configure schedule "0 6,18 * * *"');
      console.log('   npm run automation configure price_change_percent 3');
      console.log('   npm run automation configure enabled true');
      break;
  }

  logger.info('Automation manager command executed', { command });
}

main().catch(console.error);