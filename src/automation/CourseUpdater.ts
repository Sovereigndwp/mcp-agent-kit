#!/usr/bin/env tsx

// Course Update Automation - Daily Bitcoin Education Content Updates
import 'dotenv/config';
import cron from 'node-cron';
import { canvaTools } from '../tools/canva_api.js';
import { getFeeEstimates } from '../tools/mempool_fee_estimates.js';
import { btc_price } from '../tools/btc_price.js';
import { SocraticTutor } from '../agents/SocraticTutor.js';
import { logger } from '../utils/logger.js';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';

interface AutomationConfig {
  enabled: boolean;
  schedule: string; // cron format
  timezone: string;
  update_threshold: {
    price_change_percent: number; // Trigger update if price changes by this %
    fee_change_multiplier: number; // Trigger if fees change by this multiplier
  };
  notifications: {
    success: boolean;
    errors: boolean;
    email?: string; // Future enhancement
  };
  backup_retention_days: number;
}

interface UpdateHistory {
  timestamp: string;
  bitcoin_data: any;
  updates_applied: number;
  updates_failed: number;
  trigger_reason: string;
  next_check: string;
}

class CourseUpdateAutomation {
  private config: AutomationConfig;
  private configPath = 'config/automation_config.json';
  private historyPath = 'exports/course_updates/automation_history.json';
  private isRunning = false;

  constructor() {
    this.config = this.loadConfig();
    this.ensureDirectories();
  }

  private loadConfig(): AutomationConfig {
    const defaultConfig: AutomationConfig = {
      enabled: true,
      schedule: '0 8 * * *', // Daily at 8 AM
      timezone: 'America/New_York',
      update_threshold: {
        price_change_percent: 5, // Update if price changes by 5%
        fee_change_multiplier: 2  // Update if fees double/halve
      },
      notifications: {
        success: true,
        errors: true
      },
      backup_retention_days: 30
    };

    try {
      if (existsSync(this.configPath)) {
        const configData = JSON.parse(readFileSync(this.configPath, 'utf-8'));
        return { ...defaultConfig, ...configData };
      }
    } catch (error) {
      logger.warn('Failed to load automation config, using defaults:', error);
    }

    return defaultConfig;
  }

  private saveConfig(): void {
    try {
      mkdirSync('config', { recursive: true });
      writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
      logger.info('Automation config saved');
    } catch (error) {
      logger.error('Failed to save automation config:', error);
    }
  }

  private ensureDirectories(): void {
    mkdirSync('exports/course_updates', { recursive: true });
    mkdirSync('logs', { recursive: true });
    mkdirSync('config', { recursive: true });
  }

  private getUpdateHistory(): UpdateHistory[] {
    try {
      if (existsSync(this.historyPath)) {
        return JSON.parse(readFileSync(this.historyPath, 'utf-8'));
      }
    } catch (error) {
      logger.warn('Failed to load update history:', error);
    }
    return [];
  }

  private saveUpdateHistory(history: UpdateHistory[]): void {
    try {
      writeFileSync(this.historyPath, JSON.stringify(history, null, 2));
    } catch (error) {
      logger.error('Failed to save update history:', error);
    }
  }

  private async shouldUpdate(): Promise<{ should: boolean; reason: string }> {
    try {
      const history = this.getUpdateHistory();
      if (history.length === 0) {
        return { should: true, reason: 'Initial run - no previous data' };
      }

      const lastUpdate = history[history.length - 1];
      const [currentFees, currentPrice] = await Promise.all([
        getFeeEstimates(),
        btc_price()
      ]);

      // Check price change
      const lastPrice = lastUpdate.bitcoin_data.price;
      const priceChangePercent = Math.abs((currentPrice.usd - lastPrice) / lastPrice * 100);
      
      if (priceChangePercent >= this.config.update_threshold.price_change_percent) {
        return { 
          should: true, 
          reason: `Price changed by ${priceChangePercent.toFixed(1)}% (${lastPrice.toLocaleString()} → ${currentPrice.usd.toLocaleString()})` 
        };
      }

      // Check fee changes
      const lastFees = lastUpdate.bitcoin_data.fees;
      const currentFast = currentFees.fastestFee;
      const lastFast = lastFees.fast;
      
      if (currentFast >= lastFast * this.config.update_threshold.fee_change_multiplier || 
          currentFast <= lastFast / this.config.update_threshold.fee_change_multiplier) {
        return { 
          should: true, 
          reason: `Fee changed significantly (${lastFast} → ${currentFast} sat/vB)` 
        };
      }

      // Check if it's been more than 24 hours (force update)
      const lastUpdateTime = new Date(lastUpdate.timestamp);
      const hoursSinceUpdate = (Date.now() - lastUpdateTime.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceUpdate >= 24) {
        return { should: true, reason: `Scheduled daily update (${hoursSinceUpdate.toFixed(1)}h since last update)` };
      }

      return { should: false, reason: 'No significant changes detected' };

    } catch (error) {
      logger.error('Error checking if update should run:', error);
      return { should: true, reason: 'Error checking conditions - running as fallback' };
    }
  }

  private async performCourseUpdate(): Promise<UpdateHistory> {
    logger.info('Starting automated course update');

    try {
      // Import the course update logic
      const { generateCourseUpdates, applyCourseUpdates } = await import('../cases/edit_canva_course.js');
      
      // Generate and apply updates
      const updateData = await generateCourseUpdates();
      const results = await applyCourseUpdates(updateData);

      const updateRecord: UpdateHistory = {
        timestamp: new Date().toISOString(),
        bitcoin_data: updateData.bitcoin_context,
        updates_applied: results.filter((r: any) => r.status === 'success').length,
        updates_failed: results.filter((r: any) => r.status === 'failed').length,
        trigger_reason: 'Automated update',
        next_check: new Date(Date.now() + 60 * 60 * 1000).toISOString() // Next hour
      };

      // Save detailed update report
      const reportPath = `exports/course_updates/auto_update_${Date.now()}.json`;
      const detailedReport = {
        ...updateRecord,
        detailed_results: results,
        educational_content: updateData.educational_content,
        automation_config: this.config
      };
      writeFileSync(reportPath, JSON.stringify(detailedReport, null, 2));

      logger.info('Automated course update completed', {
        applied: updateRecord.updates_applied,
        failed: updateRecord.updates_failed
      });

      return updateRecord;

    } catch (error) {
      logger.error('Automated course update failed:', error);
      
      return {
        timestamp: new Date().toISOString(),
        bitcoin_data: null,
        updates_applied: 0,
        updates_failed: 1,
        trigger_reason: 'Automation error',
        next_check: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      };
    }
  }

  private cleanOldBackups(): void {
    try {
      const history = this.getUpdateHistory();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - this.config.backup_retention_days);

      const recentHistory = history.filter(h => new Date(h.timestamp) > cutoffDate);
      
      if (recentHistory.length !== history.length) {
        this.saveUpdateHistory(recentHistory);
        logger.info(`Cleaned ${history.length - recentHistory.length} old backup records`);
      }
    } catch (error) {
      logger.error('Failed to clean old backups:', error);
    }
  }

  private async runUpdateCheck(): Promise<void> {
    if (this.isRunning) {
      logger.warn('Update check already running, skipping');
      return;
    }

    this.isRunning = true;

    try {
      const { should, reason } = await this.shouldUpdate();
      
      if (should) {
        console.log(`🤖 Automated Update Triggered: ${reason}`);
        const updateRecord = await this.performCourseUpdate();
        
        // Update history
        const history = this.getUpdateHistory();
        history.push(updateRecord);
        this.saveUpdateHistory(history);
        
        // Clean old backups
        this.cleanOldBackups();

        if (this.config.notifications.success && updateRecord.updates_applied > 0) {
          console.log(`✅ Course updated successfully: ${updateRecord.updates_applied} designs updated`);
        }
        
        if (this.config.notifications.errors && updateRecord.updates_failed > 0) {
          console.log(`⚠️ Some updates failed: ${updateRecord.updates_failed} failures`);
        }
      } else {
        console.log(`⏰ No update needed: ${reason}`);
      }
    } catch (error) {
      logger.error('Update check failed:', error);
      if (this.config.notifications.errors) {
        console.log('❌ Automated update check failed:', error);
      }
    } finally {
      this.isRunning = false;
    }
  }

  public start(): void {
    if (!this.config.enabled) {
      console.log('⏸️ Course automation is disabled');
      return;
    }

    console.log('🚀 Starting Bitcoin Course Update Automation');
    console.log(`⏰ Schedule: ${this.config.schedule} (${this.config.timezone})`);
    console.log(`📊 Update triggers: ${this.config.update_threshold.price_change_percent}% price change, ${this.config.update_threshold.fee_change_multiplier}x fee change`);

    // Schedule the cron job
    cron.schedule(this.config.schedule, () => {
      this.runUpdateCheck();
    }, {
      scheduled: true,
      timezone: this.config.timezone
    });

    // Run an initial check
    console.log('🔍 Running initial update check...');
    this.runUpdateCheck();

    // Save current config
    this.saveConfig();

    logger.info('Course update automation started', { 
      schedule: this.config.schedule,
      timezone: this.config.timezone 
    });
  }

  public stop(): void {
    cron.destroy();
    console.log('⏹️ Course automation stopped');
    logger.info('Course update automation stopped');
  }

  public getStatus(): any {
    const history = this.getUpdateHistory();
    const lastUpdate = history[history.length - 1];
    
    return {
      enabled: this.config.enabled,
      schedule: this.config.schedule,
      timezone: this.config.timezone,
      is_running: this.isRunning,
      last_update: lastUpdate?.timestamp,
      total_updates: history.length,
      successful_updates: history.filter(h => h.updates_applied > 0).length,
      failed_updates: history.filter(h => h.updates_failed > 0).length,
      next_scheduled: cron.getTasks().size > 0 ? 'Scheduled' : 'Not scheduled',
      config: this.config
    };
  }

  public forceUpdate(): Promise<void> {
    console.log('🔧 Force updating course...');
    return this.runUpdateCheck();
  }

  public updateConfig(newConfig: Partial<AutomationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
    console.log('⚙️ Automation config updated');
    logger.info('Automation config updated', newConfig);
  }
}

export { CourseUpdateAutomation };

// If run directly, start the automation  
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith('CourseUpdater.ts')) {
  const automation = new CourseUpdateAutomation();
  automation.start();

  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down automation...');
    automation.stop();
    process.exit(0);
  });

  // Keep the process running
  console.log('✅ Automation is running. Press Ctrl+C to stop.');
}