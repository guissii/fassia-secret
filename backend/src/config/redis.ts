import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// In-memory fallback cache when Redis is not available
class MemoryCache {
  private cache = new Map<string, { value: string; expiresAt: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    this.cache.set(key, { value, expiresAt: Date.now() + seconds * 1000 });
  }

  async del(keys: string | string[]): Promise<void> {
    const keyList = Array.isArray(keys) ? keys : [keys];
    for (const key of keyList) {
      this.cache.delete(key);
    }
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    return Array.from(this.cache.keys()).filter(k => regex.test(k));
  }
}

// Redis-compatible interface
interface CacheInterface {
  get(key: string): Promise<string | null>;
  setex(key: string, seconds: number, value: string): Promise<any>;
  del(keys: string | string[]): Promise<any>;
  keys(pattern: string): Promise<string[]>;
}

let cacheInstance: CacheInterface;

try {
  const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: false,
    retryStrategy(times: number) {
      if (times > 3) {
        console.warn('⚠️ Redis unavailable — switching to in-memory cache');
        return null; // Stop retrying
      }
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  // Try to connect
  redis.connect().catch(() => {
    console.warn('⚠️ Redis connection failed — using in-memory cache fallback');
    cacheInstance = new MemoryCache() as CacheInterface;
  });

  redis.on('error', (err) => {
    if (!cacheInstance || cacheInstance === redis) {
      console.warn('⚠️ Redis error — switching to in-memory cache:', err.message);
      cacheInstance = new MemoryCache() as CacheInterface;
    }
  });

  redis.on('connect', () => {
    console.log('✅ Connected to Redis');
    cacheInstance = redis as unknown as CacheInterface;
  });

  cacheInstance = redis as unknown as CacheInterface;
} catch {
  console.warn('⚠️ Redis not available — using in-memory cache');
  cacheInstance = new MemoryCache() as CacheInterface;
}

// Export a proxy that always delegates to the current cacheInstance
const cache: CacheInterface = {
  get: (key) => cacheInstance.get(key),
  setex: (key, seconds, value) => cacheInstance.setex(key, seconds, value),
  del: (keys) => cacheInstance.del(keys),
  keys: (pattern) => cacheInstance.keys(pattern),
};

export default cache;
