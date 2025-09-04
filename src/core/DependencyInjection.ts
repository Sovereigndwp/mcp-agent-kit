/**
 * Dependency Injection System
 * Provides proper IoC container for better modularity and testability
 */

import { logger } from '../utils/logger.js';
import { MCPProtocolHandler } from './MCPProtocol.js';
import { BaseAgent } from './BaseAgent.js';

type Constructor<T = {}> = new (...args: any[]) => T;
type ServiceKey = string | Constructor;

interface ServiceRegistration {
  factory: () => any;
  singleton: boolean;
  dependencies: ServiceKey[];
}

export class DIContainer {
  private services = new Map<ServiceKey, ServiceRegistration>();
  private instances = new Map<ServiceKey, any>();
  private registering = new Set<ServiceKey>();

  /**
   * Register a singleton service
   */
  registerSingleton<T>(key: ServiceKey, factory: () => T, dependencies: ServiceKey[] = []): void {
    this.services.set(key, {
      factory,
      singleton: true,
      dependencies
    });
    logger.debug('Registered singleton service', { key: this.keyToString(key) });
  }

  /**
   * Register a transient service (new instance each time)
   */
  registerTransient<T>(key: ServiceKey, factory: () => T, dependencies: ServiceKey[] = []): void {
    this.services.set(key, {
      factory,
      singleton: false,
      dependencies
    });
    logger.debug('Registered transient service', { key: this.keyToString(key) });
  }

  /**
   * Register a class constructor
   */
  registerClass<T>(constructor: Constructor<T>, dependencies: ServiceKey[] = []): void {
    this.registerSingleton(constructor, () => {
      const resolvedDeps = dependencies.map(dep => this.resolve(dep));
      return new constructor(...resolvedDeps);
    }, dependencies);
  }

  /**
   * Register a value as singleton
   */
  registerValue<T>(key: ServiceKey, value: T): void {
    this.instances.set(key, value);
    logger.debug('Registered value', { key: this.keyToString(key) });
  }

  /**
   * Resolve a service by key
   */
  resolve<T>(key: ServiceKey): T {
    // Check if we already have an instance (for singletons or values)
    if (this.instances.has(key)) {
      return this.instances.get(key);
    }

    // Check for circular dependencies
    if (this.registering.has(key)) {
      throw new Error(`Circular dependency detected for service: ${this.keyToString(key)}`);
    }

    const registration = this.services.get(key);
    if (!registration) {
      throw new Error(`Service not registered: ${this.keyToString(key)}`);
    }

    try {
      this.registering.add(key);

      // Resolve dependencies first
      const dependencies = registration.dependencies.map(dep => this.resolve(dep));
      
      // Create instance
      const instance = registration.factory();

      // Store singleton instances
      if (registration.singleton) {
        this.instances.set(key, instance);
      }

      logger.debug('Resolved service', { key: this.keyToString(key) });
      return instance;

    } finally {
      this.registering.delete(key);
    }
  }

  /**
   * Check if a service is registered
   */
  has(key: ServiceKey): boolean {
    return this.services.has(key) || this.instances.has(key);
  }

  /**
   * Get all registered service keys
   */
  getRegisteredServices(): string[] {
    return Array.from(this.services.keys()).map(key => this.keyToString(key));
  }

  /**
   * Clear all services (useful for testing)
   */
  clear(): void {
    this.services.clear();
    this.instances.clear();
    this.registering.clear();
    logger.debug('Cleared all services from container');
  }

  private keyToString(key: ServiceKey): string {
    return typeof key === 'string' ? key : key.name;
  }
}

// Service Keys (using strings for better readability)
export const ServiceKeys = {
  // Core services
  Logger: 'logger',
  MCPProtocol: 'mcp-protocol',
  Cache: 'cache',
  Config: 'config',

  // Tools
  BitcoinPriceService: 'bitcoin-price-service',
  FeeEstimationService: 'fee-estimation-service',
  NewsService: 'news-service',
  SentimentAnalysisService: 'sentiment-analysis-service',
  CanvaService: 'canva-service',

  // Agents
  SocraticTutor: 'socratic-tutor',
  TutorialBuilder: 'tutorial-builder',
  AssessmentGenerator: 'assessment-generator',
  ContentOrchestrator: 'content-orchestrator',
  CanvaDesignCoach: 'canva-design-coach',
  BitcoinIntelligenceScout: 'bitcoin-intelligence-scout',
  
  // Data providers
  BitcoinDataProvider: 'bitcoin-data-provider',
  EducationalContentProvider: 'educational-content-provider',
  DesignResourceProvider: 'design-resource-provider',
} as const;

// Default container instance
export const container = new DIContainer();

// Decorator for dependency injection
export function Injectable(dependencies: ServiceKey[] = []) {
  return function <T extends Constructor>(constructor: T) {
    container.registerClass(constructor, dependencies);
    return constructor;
  };
}

// Decorator for service injection
export function Inject(serviceKey: ServiceKey) {
  return function (target: any, propertyKey: string | symbol) {
    // This is a simple implementation - in a real app you might want more sophisticated handling
    Object.defineProperty(target, propertyKey, {
      get() {
        return container.resolve(serviceKey);
      },
      enumerable: true,
      configurable: true
    });
  };
}

// Service factory functions
export class ServiceFactory {
  static createMCPProtocolHandler(): MCPProtocolHandler {
    return new MCPProtocolHandler({
      resources: { subscribe: true, listChanged: true },
      tools: { listChanged: true },
      prompts: { listChanged: true },
      logging: {},
      experimental: {
        bitcoinEducation: true
      }
    });
  }

  static createConfig(): Record<string, any> {
    return {
      bitcoin: {
        priceApiUrl: process.env.BITCOIN_PRICE_API_URL || 'https://api.coingecko.com/api/v3',
        mempoolApiUrl: process.env.MEMPOOL_API_URL || 'https://mempool.space/api',
      },
      canva: {
        apiKey: process.env.CANVA_API_KEY,
        apiUrl: process.env.CANVA_API_URL || 'https://api.canva.com/rest/v1'
      },
      cache: {
        defaultTtl: 30 * 60 * 1000, // 30 minutes
        maxSize: 1000
      },
      logging: {
        level: process.env.LOG_LEVEL || 'info'
      }
    };
  }
}

// Setup function to register common services
export function setupDefaultServices(): void {
  // Register core services
  container.registerValue(ServiceKeys.Config, ServiceFactory.createConfig());
  container.registerSingleton(ServiceKeys.MCPProtocol, ServiceFactory.createMCPProtocolHandler);
  
  // Register tool services (these would be implemented separately)
  container.registerSingleton(ServiceKeys.BitcoinPriceService, () => {
    const config = container.resolve<any>(ServiceKeys.Config);
    // Return actual Bitcoin price service implementation
    return {
      async getCurrentPrice() {
        // Implementation would go here
        return { price: 108000, currency: 'USD', timestamp: Date.now() };
      }
    };
  }, [ServiceKeys.Config]);

  container.registerSingleton(ServiceKeys.FeeEstimationService, () => {
    const config = container.resolve<any>(ServiceKeys.Config);
    return {
      async getCurrentFees() {
        // Implementation would go here
        return { fast: 10, medium: 5, slow: 2, timestamp: Date.now() };
      }
    };
  }, [ServiceKeys.Config]);

  logger.info('Default services registered in DI container');
}

// Enhanced BaseAgent that uses dependency injection
export abstract class DIBaseAgent extends BaseAgent {
  protected mcpProtocol: MCPProtocolHandler;
  protected config: Record<string, any>;

  constructor(agentConfig: any, diContainer: DIContainer = container) {
    super(agentConfig);
    this.mcpProtocol = diContainer.resolve(ServiceKeys.MCPProtocol);
    this.config = diContainer.resolve(ServiceKeys.Config);
  }

  protected async setupMCPResources(): Promise<void> {
    // Register agent-specific resources, tools, and prompts
    await this.registerResources();
    await this.registerTools();
    await this.registerPrompts();
  }

  protected abstract registerResources(): Promise<void>;
  protected abstract registerTools(): Promise<void>;
  protected abstract registerPrompts(): Promise<void>;
}
