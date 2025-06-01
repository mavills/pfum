# Remote Configuration Vision

## Overview

This document outlines the future vision for loading JSON node configurations from remote sources with local caching capabilities. This will transform the current static configuration system into a dynamic, updateable system.

## Current State vs Future Vision

### Current Implementation (Phase 1)
- ✅ Configurations stored in memory
- ✅ Loaded at application startup via `initializeDefaultConfigurations()`
- ✅ 3 example configurations: String to Datetime, String Concatenation, Math Addition
- ✅ Full JSON-based dynamic node system working
- ✅ Type-based handle system with connection validation

### Future Vision (Phases 2-4)

#### Phase 2: Local File Loading
- Load configurations from local JSON files in a `/configs` directory
- File watching for hot reloading during development
- Validation and error handling for malformed files
- Support for configuration directories and organization

#### Phase 3: Remote API Integration
- Fetch configurations from remote API endpoints
- Local caching with configurable strategies (localStorage, IndexedDB)
- Offline fallback to cached configurations
- Configuration versioning and update detection

#### Phase 4: Real-time Updates
- WebSocket or Server-Sent Events for real-time configuration updates
- Hot reloading of configurations without page refresh
- Configuration dependency management
- A/B testing support for different configuration versions

## Technical Architecture

### Remote Configuration Service

```typescript
interface RemoteConfigService {
  // Core loading methods
  loadFromUrl(url: string): Promise<NodeConfiguration[]>;
  loadFromApi(endpoint: string, options?: RequestOptions): Promise<NodeConfiguration[]>;
  
  // Caching methods
  cacheConfigurations(configs: NodeConfiguration[]): Promise<void>;
  getCachedConfigurations(): Promise<NodeConfiguration[]>;
  clearCache(): Promise<void>;
  
  // Update methods
  checkForUpdates(): Promise<ConfigurationUpdate[]>;
  applyUpdates(updates: ConfigurationUpdate[]): Promise<void>;
  
  // Event handling
  onConfigurationUpdate(callback: (configs: NodeConfiguration[]) => void): void;
  onError(callback: (error: Error) => void): void;
}
```

### Configuration Sources

```typescript
interface ConfigurationSource {
  type: 'file' | 'url' | 'api' | 'websocket';
  location: string;
  options?: {
    headers?: Record<string, string>;
    authentication?: AuthConfig;
    polling?: {
      interval: number;
      enabled: boolean;
    };
    cache?: {
      strategy: 'memory' | 'localStorage' | 'indexedDB';
      ttl: number; // Time to live in milliseconds
    };
  };
}
```

### Configuration Management

```typescript
class ConfigurationManager {
  private sources: ConfigurationSource[] = [];
  private cache: ConfigurationCache;
  private eventEmitter: EventEmitter;
  
  async addSource(source: ConfigurationSource): Promise<void> {
    this.sources.push(source);
    await this.loadFromSource(source);
  }
  
  async loadAllConfigurations(): Promise<NodeConfiguration[]> {
    const allConfigs: NodeConfiguration[] = [];
    
    for (const source of this.sources) {
      try {
        const configs = await this.loadFromSource(source);
        allConfigs.push(...configs);
      } catch (error) {
        console.warn(`Failed to load from source ${source.location}:`, error);
        // Fallback to cache if available
        const cached = await this.cache.get(source.location);
        if (cached) {
          allConfigs.push(...cached);
        }
      }
    }
    
    return allConfigs;
  }
  
  async startPolling(): Promise<void> {
    // Implementation for periodic updates
  }
  
  async enableRealTimeUpdates(): Promise<void> {
    // Implementation for WebSocket/SSE updates
  }
}
```

## Implementation Phases

### Phase 2: Local File System

```typescript
// File-based configuration loading
export async function loadConfigurationsFromDirectory(
  directory: string
): Promise<NodeConfiguration[]> {
  const configFiles = await fs.readdir(directory);
  const jsonFiles = configFiles.filter(file => file.endsWith('.json'));
  
  const configurations: NodeConfiguration[] = [];
  
  for (const file of jsonFiles) {
    try {
      const content = await fs.readFile(path.join(directory, file), 'utf-8');
      const config = JSON.parse(content);
      
      if (isValidNodeConfiguration(config)) {
        configurations.push(config);
      } else {
        console.warn(`Invalid configuration in ${file}`);
      }
    } catch (error) {
      console.error(`Failed to load configuration from ${file}:`, error);
    }
  }
  
  return configurations;
}

// File watching for development
export function watchConfigurationDirectory(
  directory: string,
  onUpdate: (configs: NodeConfiguration[]) => void
): void {
  const watcher = fs.watch(directory, { recursive: true });
  
  watcher.on('change', async (eventType, filename) => {
    if (filename?.endsWith('.json')) {
      const configs = await loadConfigurationsFromDirectory(directory);
      onUpdate(configs);
    }
  });
}
```

### Phase 3: Remote API Integration

```typescript
// Remote API configuration loading
export class RemoteConfigurationLoader {
  private cache: Map<string, CachedConfiguration> = new Map();
  
  async loadFromApi(
    apiUrl: string,
    options: {
      cacheStrategy?: 'memory' | 'localStorage' | 'indexedDB';
      cacheTTL?: number;
      fallbackToCache?: boolean;
    } = {}
  ): Promise<NodeConfiguration[]> {
    const cacheKey = this.getCacheKey(apiUrl);
    
    try {
      // Try to load from remote
      const response = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const configurations: NodeConfiguration[] = await response.json();
      
      // Validate configurations
      const validConfigs = configurations.filter(config => {
        if (isValidNodeConfiguration(config)) {
          return true;
        } else {
          console.warn(`Invalid configuration: ${config.name || 'unknown'}`);
          return false;
        }
      });
      
      // Cache the configurations
      await this.cacheConfigurations(cacheKey, validConfigs, options);
      
      return validConfigs;
      
    } catch (error) {
      console.error('Failed to load remote configurations:', error);
      
      // Fallback to cache if enabled
      if (options.fallbackToCache) {
        const cached = await this.getCachedConfigurations(cacheKey);
        if (cached) {
          console.log('Using cached configurations as fallback');
          return cached;
        }
      }
      
      throw error;
    }
  }
  
  private async cacheConfigurations(
    key: string,
    configs: NodeConfiguration[],
    options: any
  ): Promise<void> {
    const cacheData = {
      configurations: configs,
      timestamp: Date.now(),
      ttl: options.cacheTTL || 3600000 // 1 hour default
    };
    
    switch (options.cacheStrategy) {
      case 'localStorage':
        localStorage.setItem(key, JSON.stringify(cacheData));
        break;
      case 'indexedDB':
        // Implementation for IndexedDB
        break;
      default:
        this.cache.set(key, cacheData);
    }
  }
  
  private async getCachedConfigurations(key: string): Promise<NodeConfiguration[] | null> {
    // Implementation for cache retrieval
    return null;
  }
  
  private getCacheKey(url: string): string {
    return `node-configs-${btoa(url)}`;
  }
}
```

### Phase 4: Real-time Updates

```typescript
// WebSocket-based real-time updates
export class RealTimeConfigurationUpdater {
  private websocket: WebSocket | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();
  
  connect(websocketUrl: string): void {
    this.websocket = new WebSocket(websocketUrl);
    
    this.websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };
    
    this.websocket.onopen = () => {
      console.log('Connected to configuration update service');
    };
    
    this.websocket.onclose = () => {
      console.log('Disconnected from configuration update service');
      // Implement reconnection logic
    };
  }
  
  private handleMessage(message: any): void {
    switch (message.type) {
      case 'configuration_update':
        this.emit('configurationUpdate', message.configurations);
        break;
      case 'configuration_delete':
        this.emit('configurationDelete', message.configurationIds);
        break;
      case 'configuration_add':
        this.emit('configurationAdd', message.configurations);
        break;
    }
  }
  
  on(event: string, handler: Function): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(handler);
  }
  
  private emit(event: string, data: any): void {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => handler(data));
  }
}
```

## Configuration Format Extensions

### Versioning Support

```json
{
  "version": "1.2.0",
  "name": "Advanced String Operations",
  "description": "Enhanced string manipulation node",
  "compatibility": {
    "minAppVersion": "1.0.0",
    "maxAppVersion": "2.0.0"
  },
  "dependencies": ["string-utils@1.0.0"],
  "inputs": [...],
  "outputs": [...],
  "operations": [...]
}
```

### Remote References

```json
{
  "name": "Complex Data Processor",
  "description": "Processes complex data structures",
  "extends": "https://api.example.com/configs/base-processor.json",
  "overrides": {
    "inputs": [
      {
        "name": "Custom Input",
        "type": "custom_type",
        "description": "Custom input field"
      }
    ]
  }
}
```

## Integration with Current System

The remote configuration system will be designed to be fully backward compatible with the current implementation:

1. **Graceful Fallback**: If remote loading fails, fall back to built-in configurations
2. **Progressive Enhancement**: Start with local configurations, then enhance with remote ones
3. **Hot Swapping**: Replace configurations without breaking existing nodes
4. **Migration Path**: Provide tools to migrate from local to remote configurations

## Security Considerations

- **Configuration Validation**: Strict validation of remote configurations
- **Content Security Policy**: Ensure remote sources are trusted
- **Authentication**: Support for API keys and OAuth for protected configuration sources
- **Sandboxing**: Isolate configuration execution to prevent malicious code
- **Integrity Checks**: Verify configuration integrity with checksums or signatures

## Performance Considerations

- **Lazy Loading**: Load configurations only when needed
- **Compression**: Use gzip/brotli compression for remote configurations
- **CDN Support**: Cache configurations on CDN for global distribution
- **Incremental Updates**: Only download changed configurations
- **Background Loading**: Load updates in background without blocking UI

## Monitoring and Analytics

- **Configuration Usage**: Track which configurations are most used
- **Performance Metrics**: Monitor loading times and cache hit rates
- **Error Tracking**: Log and monitor configuration loading errors
- **A/B Testing**: Support for testing different configuration versions

This vision provides a roadmap for evolving the current static configuration system into a dynamic, scalable, and maintainable solution that can grow with the application's needs. 