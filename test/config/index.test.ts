import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  defaultAIConfig,
  defaultCacheConfig,
  defaultCrawlerConfig,
  defaultDiscoveryConfig,
  defaultPublisherConfig,
  defaultRateLimitConfig,
  defaultRetryConfig,
  defaultScoringConfig,
  defaultStorageConfig,
  getConfig,
} from '../../src/config';

describe('Configuration', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  describe('defaultCrawlerConfig', () => {
    it('should have correct default values', () => {
      expect(defaultCrawlerConfig.maxConcurrentRequests).toBe(10);
      expect(defaultCrawlerConfig.requestTimeout).toBe(30000);
      expect(defaultCrawlerConfig.rateLimitDelay).toBe(1000);
      expect(defaultCrawlerConfig.userAgent).toBe('GamblingBlocklistBot/1.0');
      expect(defaultCrawlerConfig.respectRobotsTxt).toBe(true);
      expect(defaultCrawlerConfig.maxDepth).toBe(3);
      expect(defaultCrawlerConfig.maxPagesPerDomain).toBe(50);
    });
  });

  describe('defaultAIConfig', () => {
    it('should have correct default values', () => {
      expect(defaultAIConfig.model).toBe('gpt-3.5-turbo');
      expect(defaultAIConfig.temperature).toBe(0.1);
      expect(defaultAIConfig.maxTokens).toBe(1000);
      expect(defaultAIConfig.apiKey).toBe('');
      expect(defaultAIConfig.endpoint).toBe('https://api.omniroute.com/v1');
    });
  });

  describe('defaultScoringConfig', () => {
    it('should have correct default values', () => {
      expect(defaultScoringConfig.minConfidenceThreshold).toBe(0.7);
      expect(defaultScoringConfig.highConfidenceThreshold).toBe(0.9);
      expect(defaultScoringConfig.weights.aiScore).toBe(0.4);
      expect(defaultScoringConfig.weights.keywordScore).toBe(0.15);
      expect(defaultScoringConfig.weights.linkScore).toBe(0.1);
      expect(defaultScoringConfig.weights.domainReputation).toBe(0.1);
      expect(defaultScoringConfig.weights.pageSimilarity).toBe(0.1);
      expect(defaultScoringConfig.weights.historicalObservation).toBe(0.1);
      expect(defaultScoringConfig.weights.semanticSimilarity).toBe(0.05);
    });

    it('should have weights that sum to 1', () => {
      const weights = defaultScoringConfig.weights;
      const sum = 
        weights.aiScore +
        weights.keywordScore +
        weights.linkScore +
        weights.domainReputation +
        weights.pageSimilarity +
        weights.historicalObservation +
        weights.semanticSimilarity;
      
      expect(sum).toBeCloseTo(1.0);
    });
  });

  describe('defaultStorageConfig', () => {
    it('should have correct default values', () => {
      expect(defaultStorageConfig.kvNamespace).toBe('BLOCKLIST_KV');
      expect(defaultStorageConfig.r2Bucket).toBe('gambling-blocklist-data');
      expect(defaultStorageConfig.ttl).toBe(24 * 60 * 60);
    });
  });

  describe('defaultPublisherConfig', () => {
    it('should have correct default values', () => {
      expect(defaultPublisherConfig.formats).toContain('adguard');
      expect(defaultPublisherConfig.formats).toContain('hosts');
      expect(defaultPublisherConfig.formats).toContain('dnsmasq');
      expect(defaultPublisherConfig.formats).toContain('plain-domains');
      expect(defaultPublisherConfig.formats).toContain('abp');
      expect(defaultPublisherConfig.outputDirectory).toBe('dist/blocklists');
      expect(defaultPublisherConfig.compressionEnabled).toBe(true);
    });
  });

  describe('defaultDiscoveryConfig', () => {
    it('should have correct default values', () => {
      expect(defaultDiscoveryConfig.sources).toContain('search-engine');
      expect(defaultDiscoveryConfig.sources).toContain('common-crawl');
      expect(defaultDiscoveryConfig.sources).toContain('github');
      expect(defaultDiscoveryConfig.sources).toContain('public-blocklists');
      expect(defaultDiscoveryConfig.sources).toContain('threat-feeds');
      expect(defaultDiscoveryConfig.sources).toContain('website-index');
      expect(defaultDiscoveryConfig.sources).toContain('blogs');
      expect(defaultDiscoveryConfig.sources).toContain('forums');
      expect(defaultDiscoveryConfig.sources).toContain('directories');
      expect(defaultDiscoveryConfig.sources).toContain('paste-sites');
      expect(defaultDiscoveryConfig.sources).toContain('rss');
      expect(defaultDiscoveryConfig.sources).toContain('sitemaps');
      expect(defaultDiscoveryConfig.sources).toContain('recursive');
      expect(defaultDiscoveryConfig.maxDomainsPerSource).toBe(1000);
    });
  });

  describe('defaultRetryConfig', () => {
    it('should have correct default values', () => {
      expect(defaultRetryConfig.maxRetries).toBe(3);
      expect(defaultRetryConfig.retryDelay).toBe(1000);
      expect(defaultRetryConfig.backoffMultiplier).toBe(2);
    });
  });

  describe('defaultRateLimitConfig', () => {
    it('should have correct default values', () => {
      expect(defaultRateLimitConfig.requestsPerSecond).toBe(1);
      expect(defaultRateLimitConfig.burstSize).toBe(5);
      expect(defaultRateLimitConfig.windowSize).toBe(60);
    });
  });

  describe('defaultCacheConfig', () => {
    it('should have correct default values', () => {
      expect(defaultCacheConfig.ttl).toBe(60 * 60);
      expect(defaultCacheConfig.maxEntries).toBe(10000);
    });
  });

  describe('getConfig', () => {
    it('should return all configuration objects', () => {
      const config = getConfig();
      
      expect(config.crawler).toBeDefined();
      expect(config.ai).toBeDefined();
      expect(config.scoring).toBeDefined();
      expect(config.storage).toBeDefined();
      expect(config.publisher).toBeDefined();
      expect(config.discovery).toBeDefined();
      expect(config.retry).toBeDefined();
      expect(config.rateLimit).toBeDefined();
      expect(config.cache).toBeDefined();
    });

    it('should return default configurations', () => {
      const config = getConfig();
      
      expect(config.crawler).toEqual(defaultCrawlerConfig);
      expect(config.ai).toEqual(defaultAIConfig);
      expect(config.scoring).toEqual(defaultScoringConfig);
      expect(config.storage).toEqual(defaultStorageConfig);
      expect(config.publisher).toEqual(defaultPublisherConfig);
      expect(config.discovery).toEqual(defaultDiscoveryConfig);
      expect(config.retry).toEqual(defaultRetryConfig);
      expect(config.rateLimit).toEqual(defaultRateLimitConfig);
      expect(config.cache).toEqual(defaultCacheConfig);
    });
  });
});