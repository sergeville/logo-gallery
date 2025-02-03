# Real-time Data Synchronization System

## Overview

The Logo Gallery implements a WebSocket and Redis-based real-time synchronization system to ensure consistent data display across all pages and users. This document provides technical details about the system's architecture, implementation, and best practices.

## Architecture

### Components

1. **WebSocket Server**
   - Handles real-time client connections
   - Manages channel subscriptions
   - Broadcasts updates to connected clients

2. **Redis Pub/Sub**
   - Enables horizontal scaling
   - Handles cross-server communication
   - Manages event distribution

3. **Caching Layer**
   - In-memory cache for frequent access
   - Redis-based distributed cache
   - Automatic cache invalidation

4. **Authentication Layer**
   - JWT-based connection validation
   - Channel-level access control
   - Rate limiting implementation

## Implementation Details

### Core Classes

#### 1. LogoSyncClient

```typescript
class LogoSyncClient {
  private socket: WebSocket;
  private store: Map<string, any>;
  private subscriptions: Map<string, Set<(data: any) => void>>;

  constructor(config: SyncConfig) {
    this.socket = new WebSocket(process.env.NEXT_PUBLIC_WS_URL);
    this.store = new Map();
    this.subscriptions = new Map();
    this.initializeSocket();
  }

  // Subscribe to channel updates
  subscribe<T>(channel: string, callback: (data: T) => void) {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel)?.add(callback);
    return () => this.unsubscribe(channel, callback);
  }

  // Handle incoming updates
  private handleUpdate(channel: string, type: string, data: any) {
    this.updateStore(channel, data);
    this.notifySubscribers(channel, data);
  }
}
```

#### 2. LogoSyncServer

```typescript
class LogoSyncServer {
  private wss: Server;
  private redis: Redis;
  private channels: Map<string, Set<WebSocket>>;

  constructor() {
    this.wss = new Server({ port: 8080 });
    this.redis = new Redis();
    this.channels = new Map();
    this.initialize();
  }

  // Handle new WebSocket connections
  private handleConnection(ws: WebSocket) {
    // Implement connection handling
  }

  // Broadcast updates to clients
  private broadcast(channel: string, type: string, data: any) {
    const clients = this.channels.get(channel) || new Set();
    const message = JSON.stringify({ channel, type, data });
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }
}
```

#### 3. SyncCache

```typescript
class SyncCache {
  private redis: Redis;
  private memoryCache: Map<string, { data: any; expires: number }>;

  constructor() {
    this.redis = new Redis();
    this.memoryCache = new Map();
  }

  // Get data with multi-level caching
  async get<T>(key: string): Promise<T | null> {
    // Check memory cache
    const memCached = this.memoryCache.get(key);
    if (memCached?.expires > Date.now()) {
      return memCached.data as T;
    }

    // Check Redis cache
    const cached = await this.redis.get(key);
    if (cached) {
      const data = JSON.parse(cached);
      this.setMemoryCache(key, data);
      return data as T;
    }

    return null;
  }
}
```

### React Integration

#### 1. useSync Hook

```typescript
function useSync<T>(
  channel: string,
  id?: string,
  options: SyncOptions = {}
): SyncResult<T> {
  const [data, setData] = useState<T | undefined>(options.initialData);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const client = getSyncClient();
    const unsubscribe = client.subscribe<T>(
      id ? `${channel}.${id}` : channel,
      (newData) => {
        setData(newData);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [channel, id]);

  return { data, error };
}
```

## Usage Examples

### 1. Logo Card with Real-time Updates

```typescript
function LogoCard({ logo }: { logo: Logo }) {
  const { data: updatedLogo } = useSync<Logo>('logos', logo._id, {
    initialData: logo,
    revalidateOnFocus: true,
  });

  const { data: voteCount } = useSync<number>(
    `logos.${logo._id}.votes`,
    undefined,
    {
      fallbackData: logo.totalVotes,
      refreshInterval: 1000,
    }
  );

  return (
    <div className="logo-card">
      <h2>{updatedLogo.title}</h2>
      <span>{voteCount} votes</span>
    </div>
  );
}
```

### 2. Vote Page with Real-time Updates

```typescript
function VotePage() {
  const { data: logos } = useSync<Logo[]>('logos', undefined, {
    revalidateOnMount: true,
  });

  const { data: deadline } = useSync<string>('voting.deadline');

  return (
    <div>
      <h1>Vote for Your Favorite Logo</h1>
      <p>Voting ends: {deadline}</p>
      <div className="logo-grid">
        {logos?.map(logo => (
          <LogoCard key={logo._id} logo={logo} />
        ))}
      </div>
    </div>
  );
}
```

## Best Practices

1. **Error Handling**
   - Implement retry mechanisms for failed connections
   - Provide fallback UI for sync failures
   - Log sync errors for debugging

2. **Performance**
   - Use selective updates to minimize data transfer
   - Implement proper cache invalidation
   - Optimize WebSocket message size

3. **Security**
   - Validate all incoming messages
   - Implement rate limiting
   - Use secure WebSocket connections (WSS)

4. **Scalability**
   - Use Redis for cross-server communication
   - Implement proper connection pooling
   - Monitor system resources

## Configuration

### Environment Variables

```env
# WebSocket Configuration
NEXT_PUBLIC_WS_URL=wss://your-domain.com/sync
WS_PORT=8080

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# Security
JWT_SECRET=your-jwt-secret
SYNC_RATE_LIMIT=100
```

### TypeScript Types

```typescript
interface SyncConfig {
  channels: {
    [key: string]: {
      events: string[];
      model: any;
    };
  };
  caching: {
    strategy: 'stale-while-revalidate' | 'cache-first';
    ttl: number;
  };
}

interface SyncOptions {
  initialData?: T;
  revalidateOnMount?: boolean;
  revalidateOnFocus?: boolean;
  refreshInterval?: number;
  fallbackData?: T;
}

interface SyncResult<T> {
  data?: T;
  error: Error | null;
}
```

## Monitoring and Debugging

1. **WebSocket Monitoring**
   - Track connection status
   - Monitor message flow
   - Debug connection issues

2. **Redis Monitoring**
   - Monitor cache hit rates
   - Track pub/sub performance
   - Debug cache issues

3. **Performance Metrics**
   - Message latency
   - Cache efficiency
   - Connection count

## Troubleshooting

Common issues and their solutions:

1. **Connection Issues**
   - Check WebSocket URL configuration
   - Verify SSL certificates
   - Check firewall settings

2. **Sync Delays**
   - Monitor Redis performance
   - Check network latency
   - Verify message queue size

3. **Cache Problems**
   - Check Redis connection
   - Verify cache TTL settings
   - Monitor memory usage 