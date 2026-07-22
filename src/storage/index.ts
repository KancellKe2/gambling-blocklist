/**
 * Storage Module
 * 
 * Handles data persistence using Cloudflare KV
 * for storing discovered domains, analysis results, and blocklists
 */

import type { AIAnalysis, Blocklist, Domain } from '../types';

export interface StorageConfig {
  kvNamespace: string;
  ttl: number; // Time to live in seconds
}

export interface StoredDomain {
  domain: string;
  url: string;
  discoveredAt: string;
  source: string;
  lastCrawled?: string;
  lastAnalyzed?: string;
  analysis?: AIAnalysis;
  score?: number;
}

export class Storage {
  private config: StorageConfig;
  private kv: any;

  constructor(kv: any, config?: Partial<StorageConfig>) {
    this.kv = kv;
    this.config = {
      kvNamespace: config?.kvNamespace || 'GAMBLING_BLOCKLIST',
      ttl: config?.ttl || 86400, // 24 hours default
    };
  }

  async saveDomain(domain: Domain): Promise<void> {
    const key = `domain:${domain.domain}`;
    const value: StoredDomain = {
      domain: domain.domain,
      url: domain.url,
      discoveredAt: domain.discoveredAt.toISOString(),
      source: domain.source,
    };

    await this.kv.put(key, JSON.stringify(value), {
      expirationTtl: this.config.ttl,
    });
  }

  async getDomain(domain: string): Promise<StoredDomain | null> {
    const key = `domain:${domain}`;
    const value = await this.kv.get(key);
    
    if (!value) {
      return null;
    }

    return JSON.parse(value);
  }

  async updateDomain(domain: string, updates: Partial<StoredDomain>): Promise<void> {
    const existing = await this.getDomain(domain);
    if (!existing) {
      throw new Error(`Domain ${domain} not found`);
    }

    const updated = { ...existing, ...updates };
    const key = `domain:${domain}`;
    
    await this.kv.put(key, JSON.stringify(updated), {
      expirationTtl: this.config.ttl,
    });
  }

  async listDomains(): Promise<StoredDomain[]> {
    const domains: StoredDomain[] = [];
    let cursor: string | undefined;
    
    do {
      const result = await this.kv.list({
        prefix: 'domain:',
        cursor,
        limit: 100,
      });

      for (const key of result.keys) {
        const value = await this.kv.get(key.name);
        if (value) {
          domains.push(JSON.parse(value));
        }
      }

      cursor = result.cursor;
    } while (cursor);

    return domains;
  }

  async saveBlocklist(blocklist: Blocklist): Promise<void> {
    const key = `blocklist:${blocklist.version}`;
    const value = {
      ...blocklist,
      lastUpdated: blocklist.lastUpdated.toISOString(),
    };

    await this.kv.put(key, JSON.stringify(value), {
      expirationTtl: this.config.ttl * 7, // Keep blocklists longer
    });

    // Also save as latest
    await this.kv.put('blocklist:latest', JSON.stringify(value), {
      expirationTtl: this.config.ttl * 7,
    });
  }

  async getBlocklist(version?: string): Promise<Blocklist | null> {
    const key = version ? `blocklist:${version}` : 'blocklist:latest';
    const value = await this.kv.get(key);
    
    if (!value) {
      return null;
    }

    const parsed = JSON.parse(value);
    return {
      ...parsed,
      lastUpdated: new Date(parsed.lastUpdated),
    };
  }

  async getRecentDomains(hours: number = 24): Promise<StoredDomain[]> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    const domains = await this.listDomains();
    
    return domains.filter(d => {
      const discoveredAt = new Date(d.discoveredAt);
      return discoveredAt >= cutoff;
    });
  }

  async deleteDomain(domain: string): Promise<void> {
    const key = `domain:${domain}`;
    await this.kv.delete(key);
  }

  async clearOldDomains(maxAgeDays: number = 30): Promise<number> {
    const cutoff = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
    const domains = await this.listDomains();
    let deletedCount = 0;

    for (const domain of domains) {
      const discoveredAt = new Date(domain.discoveredAt);
      if (discoveredAt < cutoff) {
        await this.deleteDomain(domain.domain);
        deletedCount++;
      }
    }

    return deletedCount;
  }
}

export function createStorage(env: any, config?: Partial<StorageConfig>): Storage {
  return new Storage(env, config);
}