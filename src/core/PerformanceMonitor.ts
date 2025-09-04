import { logger } from '../utils/logger.js';
import { EventEmitter } from 'events';

export interface PerformanceMetrics {
  agent_id: string;
  operation: string;
  start_time: number;
  end_time?: number;
  duration_ms?: number;
  memory_usage_mb: number;
  cpu_usage_percent?: number;
  status: 'running' | 'completed' | 'failed' | 'timeout';
  error_message?: string;
  metadata?: Record<string, any>;
}

export interface SystemMetrics {
  total_agents_active: number;
  total_operations_running: number;
  average_response_time_ms: number;
  memory_usage_mb: number;
  error_rate_percent: number;
  last_updated: string;
}

export interface AlertThreshold {
  metric: keyof PerformanceMetrics | keyof SystemMetrics;
  threshold_value: number;
  condition: 'above' | 'below';
  alert_message: string;
}

export class PerformanceMonitor extends EventEmitter {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private systemMetrics: SystemMetrics;
  private alertThresholds: AlertThreshold[] = [];
  private monitoringInterval?: NodeJS.Timeout;

  constructor() {
    super();
    this.systemMetrics = {
      total_agents_active: 0,
      total_operations_running: 0,
      average_response_time_ms: 0,
      memory_usage_mb: 0,
      error_rate_percent: 0,
      last_updated: new Date().toISOString()
    };
    
    this.startSystemMonitoring();
    logger.info('PerformanceMonitor initialized');
  }

  /**
   * Start tracking an operation
   */
  startOperation(agentId: string, operation: string, metadata?: Record<string, any>): string {
    const operationId = `${agentId}_${operation}_${Date.now()}`;
    
    const metrics: PerformanceMetrics = {
      agent_id: agentId,
      operation,
      start_time: Date.now(),
      memory_usage_mb: this.getMemoryUsage(),
      status: 'running',
      metadata
    };

    this.metrics.set(operationId, metrics);
    this.updateSystemMetrics();
    
    this.emit('operation_started', { operation_id: operationId, metrics });
    logger.debug(`Started tracking operation: ${operationId}`);
    
    return operationId;
  }

  /**
   * Complete an operation
   */
  completeOperation(operationId: string, success: boolean = true, errorMessage?: string): void {
    const metrics = this.metrics.get(operationId);
    if (!metrics) {
      logger.warn(`Operation not found: ${operationId}`);
      return;
    }

    const endTime = Date.now();
    metrics.end_time = endTime;
    metrics.duration_ms = endTime - metrics.start_time;
    metrics.status = success ? 'completed' : 'failed';
    metrics.error_message = errorMessage;
    metrics.memory_usage_mb = this.getMemoryUsage();

    this.metrics.set(operationId, metrics);
    this.updateSystemMetrics();
    
    this.emit('operation_completed', { operation_id: operationId, metrics });
    logger.debug(`Completed operation: ${operationId} (${metrics.duration_ms}ms)`);

    // Check alerts
    this.checkAlerts(metrics);
  }

  /**
   * Get metrics for a specific operation
   */
  getOperationMetrics(operationId: string): PerformanceMetrics | undefined {
    return this.metrics.get(operationId);
  }

  /**
   * Get system-wide performance metrics
   */
  getSystemMetrics(): SystemMetrics {
    return { ...this.systemMetrics };
  }

  /**
   * Get performance summary for an agent
   */
  getAgentPerformanceSummary(agentId: string): {
    total_operations: number;
    average_duration_ms: number;
    success_rate: number;
    error_count: number;
    recent_operations: PerformanceMetrics[];
  } {
    const agentMetrics = Array.from(this.metrics.values())
      .filter(m => m.agent_id === agentId);

    const completedOps = agentMetrics.filter(m => m.status === 'completed');
    const failedOps = agentMetrics.filter(m => m.status === 'failed');
    
    const totalOps = completedOps.length + failedOps.length;
    const avgDuration = totalOps > 0 
      ? completedOps.reduce((sum, m) => sum + (m.duration_ms || 0), 0) / completedOps.length 
      : 0;

    return {
      total_operations: totalOps,
      average_duration_ms: Math.round(avgDuration),
      success_rate: totalOps > 0 ? (completedOps.length / totalOps) * 100 : 0,
      error_count: failedOps.length,
      recent_operations: agentMetrics
        .sort((a, b) => b.start_time - a.start_time)
        .slice(0, 10)
    };
  }

  /**
   * Add performance alert threshold
   */
  addAlertThreshold(threshold: AlertThreshold): void {
    this.alertThresholds.push(threshold);
    logger.info(`Added alert threshold: ${threshold.metric} ${threshold.condition} ${threshold.threshold_value}`);
  }

  /**
   * Clear old metrics to prevent memory leaks
   */
  clearOldMetrics(olderThanMs: number = 3600000): void { // 1 hour default
    const cutoffTime = Date.now() - olderThanMs;
    let cleared = 0;

    for (const [id, metrics] of this.metrics.entries()) {
      if (metrics.start_time < cutoffTime && metrics.status !== 'running') {
        this.metrics.delete(id);
        cleared++;
      }
    }

    logger.info(`Cleared ${cleared} old performance metrics`);
  }

  /**
   * Export performance report
   */
  exportPerformanceReport(): {
    system_overview: SystemMetrics;
    agent_summaries: Record<string, any>;
    top_slow_operations: PerformanceMetrics[];
    error_analysis: {
      total_errors: number;
      error_breakdown: Record<string, number>;
      common_errors: string[];
    };
    recommendations: string[];
  } {
    const allMetrics = Array.from(this.metrics.values());
    const agents = [...new Set(allMetrics.map(m => m.agent_id))];
    
    // Agent summaries
    const agentSummaries = agents.reduce((acc, agentId) => {
      acc[agentId] = this.getAgentPerformanceSummary(agentId);
      return acc;
    }, {} as Record<string, any>);

    // Top slow operations
    const slowOps = allMetrics
      .filter(m => m.duration_ms && m.duration_ms > 0)
      .sort((a, b) => (b.duration_ms || 0) - (a.duration_ms || 0))
      .slice(0, 10);

    // Error analysis
    const errors = allMetrics.filter(m => m.status === 'failed');
    const errorBreakdown = errors.reduce((acc, m) => {
      const error = m.error_message || 'Unknown error';
      acc[error] = (acc[error] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recommendations
    const recommendations = this.generateRecommendations(allMetrics, this.systemMetrics);

    return {
      system_overview: this.systemMetrics,
      agent_summaries: agentSummaries,
      top_slow_operations: slowOps,
      error_analysis: {
        total_errors: errors.length,
        error_breakdown: errorBreakdown,
        common_errors: Object.entries(errorBreakdown)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([error]) => error)
      },
      recommendations
    };
  }

  private updateSystemMetrics(): void {
    const allMetrics = Array.from(this.metrics.values());
    const runningOps = allMetrics.filter(m => m.status === 'running');
    const completedOps = allMetrics.filter(m => m.status === 'completed' && m.duration_ms);
    const failedOps = allMetrics.filter(m => m.status === 'failed');
    
    const avgResponseTime = completedOps.length > 0
      ? completedOps.reduce((sum, m) => sum + (m.duration_ms || 0), 0) / completedOps.length
      : 0;

    const totalOps = completedOps.length + failedOps.length;
    const errorRate = totalOps > 0 ? (failedOps.length / totalOps) * 100 : 0;

    this.systemMetrics = {
      total_agents_active: new Set(allMetrics.map(m => m.agent_id)).size,
      total_operations_running: runningOps.length,
      average_response_time_ms: Math.round(avgResponseTime),
      memory_usage_mb: this.getMemoryUsage(),
      error_rate_percent: Math.round(errorRate * 100) / 100,
      last_updated: new Date().toISOString()
    };
  }

  private checkAlerts(metrics: PerformanceMetrics): void {
    this.alertThresholds.forEach(threshold => {
      let value: number;
      
      if (threshold.metric in metrics) {
        value = metrics[threshold.metric as keyof PerformanceMetrics] as number;
      } else {
        value = this.systemMetrics[threshold.metric as keyof SystemMetrics] as number;
      }

      const shouldAlert = threshold.condition === 'above' 
        ? value > threshold.threshold_value
        : value < threshold.threshold_value;

      if (shouldAlert) {
        this.emit('performance_alert', {
          threshold,
          actual_value: value,
          metrics,
          timestamp: new Date().toISOString()
        });
        
        logger.warn(`Performance Alert: ${threshold.alert_message} (${value} ${threshold.condition} ${threshold.threshold_value})`);
      }
    });
  }

  private getMemoryUsage(): number {
    const memUsage = process.memoryUsage();
    return Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100;
  }

  private startSystemMonitoring(): void {
    this.monitoringInterval = setInterval(() => {
      this.updateSystemMetrics();
      this.clearOldMetrics();
      
      // Emit system health update
      this.emit('system_health_update', this.systemMetrics);
    }, 30000); // Update every 30 seconds
  }

  private generateRecommendations(metrics: PerformanceMetrics[], systemMetrics: SystemMetrics): string[] {
    const recommendations: string[] = [];

    // High error rate
    if (systemMetrics.error_rate_percent > 10) {
      recommendations.push('High error rate detected. Review failed operations and implement better error handling.');
    }

    // Slow operations
    const slowOps = metrics.filter(m => m.duration_ms && m.duration_ms > 10000);
    if (slowOps.length > 5) {
      recommendations.push('Multiple slow operations detected. Consider optimizing agent workflows or adding timeout handling.');
    }

    // Memory usage
    if (systemMetrics.memory_usage_mb > 512) {
      recommendations.push('High memory usage. Implement periodic cleanup of cached data and old metrics.');
    }

    // Too many concurrent operations
    if (systemMetrics.total_operations_running > 20) {
      recommendations.push('High number of concurrent operations. Consider implementing operation queuing to prevent resource exhaustion.');
    }

    return recommendations;
  }

  destroy(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    this.metrics.clear();
    this.removeAllListeners();
    logger.info('PerformanceMonitor destroyed');
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Add default alert thresholds
performanceMonitor.addAlertThreshold({
  metric: 'duration_ms',
  threshold_value: 30000, // 30 seconds
  condition: 'above',
  alert_message: 'Operation taking too long'
});

performanceMonitor.addAlertThreshold({
  metric: 'error_rate_percent',
  threshold_value: 15,
  condition: 'above',
  alert_message: 'High system error rate'
});

performanceMonitor.addAlertThreshold({
  metric: 'memory_usage_mb',
  threshold_value: 1024, // 1GB
  condition: 'above',
  alert_message: 'High memory usage'
});