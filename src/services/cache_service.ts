export class CacheService {
  private cache: Map<string, any>;
  private enabled: boolean;

  constructor(enabled: boolean = true) {
    this.cache = new Map();
    this.enabled = enabled;
  }

  get<T>(key: string): T | undefined {
    if (!this.enabled) return undefined;
    return this.cache.get(key);
  }

  set<T>(key: string, value: T): void {
    if (this.enabled) {
      this.cache.set(key, value);
    }
  }

  has(key: string): boolean {
    return this.enabled && this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  generateKey(...parts: string[]): string {
    return parts.join(':');
  }
}

