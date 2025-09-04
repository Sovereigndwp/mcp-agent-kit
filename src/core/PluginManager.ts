import { logger } from '../utils/logger.js';
import { ToolDefinition, AgentDefinition } from '../router/TaskRouter.js';
import { EventBus } from './EventBus.js';
import fs from 'fs/promises';
import path from 'path';

export interface PluginMetadata {
  name: string;
  version: string;
  description: string;
  author?: string;
  dependencies?: string[];
  tags?: string[];
}

export interface Plugin {
  metadata: PluginMetadata;
  initialize(context: PluginContext): Promise<void>;
  getTools?(): ToolDefinition[];
  getAgents?(): AgentDefinition[];
  onLoad?(): Promise<void>;
  onUnload?(): Promise<void>;
  onReload?(): Promise<void>;
}

export interface PluginContext {
  eventBus: EventBus;
  logger: typeof logger;
  config: any;
  getSharedResource: (key: string) => any;
  setSharedResource: (key: string, value: any) => void;
}

export interface LoadedPlugin {
  plugin: Plugin;
  context: PluginContext;
  loadedAt: Date;
  filePath?: string;
  tools: Map<string, ToolDefinition>;
  agents: Map<string, AgentDefinition>;
}

export class PluginManager {
  private plugins: Map<string, LoadedPlugin> = new Map();
  private pluginDirectories: string[] = [];
  private watchers: Map<string, any> = new Map();
  private eventBus: EventBus;
  private sharedResources: Map<string, any> = new Map();

  constructor(eventBus: EventBus) {
    this.eventBus = eventBus;
    this.setupEventListeners();
  }

  /**
   * Add a directory to watch for plugins
   */
  addPluginDirectory(directory: string): void {
    if (!this.pluginDirectories.includes(directory)) {
      this.pluginDirectories.push(directory);
      logger.info(`Added plugin directory: ${directory}`);
    }
  }

  /**
   * Load a plugin from a file or module
   */
  async loadPlugin(pluginPath: string): Promise<void> {
    try {
      // Validate plugin path for security
      if (!pluginPath || typeof pluginPath !== 'string') {
        throw new Error('Plugin path must be a valid string');
      }
      
      // Restrict to safe plugin directories and extensions
      const normalizedPath = path.normalize(pluginPath);
      if (normalizedPath.includes('..') || normalizedPath.includes('~')) {
        throw new Error('Plugin path contains unsafe directory traversal');
      }
      
      // Only allow specific extensions
      const allowedExtensions = ['.js', '.mjs', '.ts'];
      const ext = path.extname(normalizedPath).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        throw new Error(`Plugin must have allowed extension: ${allowedExtensions.join(', ')}`);
      }
      
      logger.info(`Loading plugin from: ${pluginPath}`);

      // Dynamic import the plugin
      const pluginModule = await import(pluginPath);
      const PluginClass = pluginModule.default || pluginModule.Plugin;

      if (!PluginClass) {
        throw new Error(`Plugin at ${pluginPath} does not export a default class or Plugin`);
      }

      const plugin: Plugin = new PluginClass();
      
      // Validate plugin metadata
      if (!plugin.metadata?.name) {
        throw new Error(`Plugin at ${pluginPath} missing required metadata.name`);
      }

      // Check if plugin is already loaded
      if (this.plugins.has(plugin.metadata.name)) {
        await this.reloadPlugin(plugin.metadata.name);
        return;
      }

      // Create plugin context
      const context: PluginContext = {
        eventBus: this.eventBus,
        logger,
        config: {},
        getSharedResource: (key: string) => this.sharedResources.get(key),
        setSharedResource: (key: string, value: any) => this.sharedResources.set(key, value)
      };

      // Initialize plugin
      await plugin.initialize(context);

      // Get tools and agents
      const tools = new Map<string, ToolDefinition>();
      const agents = new Map<string, AgentDefinition>();

      if (plugin.getTools) {
        const pluginTools = plugin.getTools();
        pluginTools.forEach(tool => {
          tools.set(tool.name, tool);
          logger.debug(`Registered tool: ${tool.name} from plugin: ${plugin.metadata.name}`);
        });
      }

      if (plugin.getAgents) {
        const pluginAgents = plugin.getAgents();
        pluginAgents.forEach(agent => {
          agents.set(agent.name, agent);
          logger.debug(`Registered agent: ${agent.name} from plugin: ${plugin.metadata.name}`);
        });
      }

      // Store loaded plugin
      const loadedPlugin: LoadedPlugin = {
        plugin,
        context,
        loadedAt: new Date(),
        filePath: pluginPath,
        tools,
        agents
      };

      this.plugins.set(plugin.metadata.name, loadedPlugin);

      // Call onLoad hook
      if (plugin.onLoad) {
        await plugin.onLoad();
      }

      // Emit plugin loaded event
      this.eventBus.emit('plugin:loaded', {
        name: plugin.metadata.name,
        tools: Array.from(tools.keys()),
        agents: Array.from(agents.keys())
      });

      logger.info(`Plugin loaded successfully: ${plugin.metadata.name} v${plugin.metadata.version}`);
      
    } catch (error) {
      logger.error(`Failed to load plugin from ${pluginPath}:`, error);
      throw error;
    }
  }

  /**
   * Unload a plugin
   */
  async unloadPlugin(pluginName: string): Promise<void> {
    const loadedPlugin = this.plugins.get(pluginName);
    if (!loadedPlugin) {
      logger.warn(`Plugin not found: ${pluginName}`);
      return;
    }

    try {
      // Call onUnload hook
      if (loadedPlugin.plugin.onUnload) {
        await loadedPlugin.plugin.onUnload();
      }

      // Remove from registry
      this.plugins.delete(pluginName);

      // Emit plugin unloaded event
      this.eventBus.emit('plugin:unloaded', {
        name: pluginName,
        tools: Array.from(loadedPlugin.tools.keys()),
        agents: Array.from(loadedPlugin.agents.keys())
      });

      logger.info(`Plugin unloaded: ${pluginName}`);
      
    } catch (error) {
      logger.error(`Error unloading plugin ${pluginName}:`, error);
      throw error;
    }
  }

  /**
   * Reload a plugin
   */
  async reloadPlugin(pluginName: string): Promise<void> {
    const loadedPlugin = this.plugins.get(pluginName);
    if (!loadedPlugin?.filePath) {
      logger.warn(`Plugin not found or no file path: ${pluginName}`);
      return;
    }

    logger.info(`Reloading plugin: ${pluginName}`);

    try {
      // Call onReload hook if available
      if (loadedPlugin.plugin.onReload) {
        await loadedPlugin.plugin.onReload();
      }

      const filePath = loadedPlugin.filePath;
      
      // Unload current plugin
      await this.unloadPlugin(pluginName);
      
      // Clear module cache for hot reload
      delete require.cache[require.resolve(filePath)];
      
      // Reload plugin
      await this.loadPlugin(filePath);
      
    } catch (error) {
      logger.error(`Error reloading plugin ${pluginName}:`, error);
      throw error;
    }
  }

  /**
   * Load all plugins from configured directories
   */
  async loadAllPlugins(): Promise<void> {
    for (const directory of this.pluginDirectories) {
      await this.loadPluginsFromDirectory(directory);
    }
  }

  /**
   * Load plugins from a specific directory
   */
  async loadPluginsFromDirectory(directory: string): Promise<void> {
    try {
      const exists = await fs.access(directory).then(() => true).catch(() => false);
      if (!exists) {
        logger.warn(`Plugin directory does not exist: ${directory}`);
        return;
      }

      const files = await fs.readdir(directory);
      const pluginFiles = files.filter(file => 
        file.endsWith('.js') || file.endsWith('.ts')
      );

      for (const file of pluginFiles) {
        const filePath = path.join(directory, file);
        try {
          await this.loadPlugin(filePath);
        } catch (error) {
          logger.error(`Failed to load plugin ${file}:`, error);
        }
      }
    } catch (error) {
      logger.error(`Error loading plugins from directory ${directory}:`, error);
    }
  }

  /**
   * Enable hot reloading for a plugin directory
   */
  async enableHotReload(directory: string): Promise<void> {
    if (this.watchers.has(directory)) {
      return; // Already watching
    }

    try {
      const { watch } = await import('fs');
      
      const watcher = watch(directory, { recursive: true }, async (eventType, filename) => {
        if (!filename || (!filename.endsWith('.js') && !filename.endsWith('.ts'))) {
          return;
        }

        const filePath = path.join(directory, filename);
        
        if (eventType === 'change') {
          // Find plugin by file path and reload
          for (const [name, loadedPlugin] of this.plugins) {
            if (loadedPlugin.filePath === filePath) {
              logger.info(`Hot reloading plugin: ${name} (file changed: ${filename})`);
              try {
                await this.reloadPlugin(name);
              } catch (error) {
                logger.error(`Hot reload failed for ${name}:`, error);
              }
              break;
            }
          }
        }
      });

      this.watchers.set(directory, watcher);
      logger.info(`Hot reload enabled for directory: ${directory}`);
      
    } catch (error) {
      logger.error(`Failed to enable hot reload for ${directory}:`, error);
    }
  }

  /**
   * Get all loaded plugins
   */
  getLoadedPlugins(): LoadedPlugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get plugin by name
   */
  getPlugin(name: string): LoadedPlugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Get all tools from all loaded plugins
   */
  getAllTools(): Map<string, ToolDefinition> {
    const allTools = new Map<string, ToolDefinition>();
    
    for (const loadedPlugin of this.plugins.values()) {
      for (const [name, tool] of loadedPlugin.tools) {
        allTools.set(name, tool);
      }
    }
    
    return allTools;
  }

  /**
   * Get all agents from all loaded plugins
   */
  getAllAgents(): Map<string, AgentDefinition> {
    const allAgents = new Map<string, AgentDefinition>();
    
    for (const loadedPlugin of this.plugins.values()) {
      for (const [name, agent] of loadedPlugin.agents) {
        allAgents.set(name, agent);
      }
    }
    
    return allAgents;
  }

  /**
   * Get plugin statistics
   */
  getStats(): any {
    const stats = {
      totalPlugins: this.plugins.size,
      totalTools: 0,
      totalAgents: 0,
      plugins: [] as any[]
    };

    for (const [name, loadedPlugin] of this.plugins) {
      stats.totalTools += loadedPlugin.tools.size;
      stats.totalAgents += loadedPlugin.agents.size;
      
      stats.plugins.push({
        name,
        version: loadedPlugin.plugin.metadata.version,
        loadedAt: loadedPlugin.loadedAt,
        toolCount: loadedPlugin.tools.size,
        agentCount: loadedPlugin.agents.size,
        tools: Array.from(loadedPlugin.tools.keys()),
        agents: Array.from(loadedPlugin.agents.keys())
      });
    }

    return stats;
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    this.eventBus.subscribe('system:shutdown', async () => {
      logger.info('Shutting down plugin manager...');
      
      // Close all watchers
      for (const watcher of this.watchers.values()) {
        watcher.close();
      }
      
      // Unload all plugins
      const pluginNames = Array.from(this.plugins.keys());
      for (const name of pluginNames) {
        await this.unloadPlugin(name);
      }
    });
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    // Close all file watchers
    for (const watcher of this.watchers.values()) {
      watcher.close();
    }
    this.watchers.clear();

    // Unload all plugins
    const pluginNames = Array.from(this.plugins.keys());
    for (const name of pluginNames) {
      await this.unloadPlugin(name);
    }

    // Clear shared resources
    this.sharedResources.clear();
    
    logger.info('Plugin manager cleanup completed');
  }
}
