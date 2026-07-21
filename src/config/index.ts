import type {
  AIConfig,
  CacheConfig,
  CrawlerConfig,
  DiscoveryConfig,
  PublisherConfig,
  RateLimitConfig,
  RetryConfig,
  ScoringConfig,
  StorageConfig,
} from '../types';

export const defaultCrawlerConfig: CrawlerConfig = {
  maxConcurrentRequests: parseInt(process.env.MAX_CONCURRENT_REQUESTS || '10'),
  requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
  rateLimitDelay: parseInt(process.env.RATE_LIMIT_DELAY || '1000'),
  userAgent: process.env.USER_AGENT || 'GamblingBlocklistBot/1.0',
  respectRobotsTxt: true,
  maxDepth: 3,
  maxPagesPerDomain: 50,
};

export const defaultAIConfig: AIConfig = {
  model: process.env.AI_MODEL || 'gpt-3.5-turbo',
  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.1'),
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000'),
  apiKey: process.env.OMNIROUTE_API_KEY || '',
  endpoint: process.env.OMNIROUTE_ENDPOINT || 'https://api.omniroute.com/v1',
};

export const defaultScoringConfig: ScoringConfig = {
  minConfidenceThreshold: parseFloat(process.env.MIN_CONFIDENCE_THRESHOLD || '0.7'),
  highConfidenceThreshold: parseFloat(process.env.HIGH_CONFIDENCE_THRESHOLD || '0.9'),
  weights: {
    aiScore: 0.4,
    keywordScore: 0.15,
    linkScore: 0.1,
    domainReputation: 0.1,
    pageSimilarity: 0.1,
    historicalObservation: 0.1,
    semanticSimilarity: 0.05,
  },
};

export const defaultStorageConfig: StorageConfig = {
  kvNamespace: process.env.BLOCKLIST_KV_ID || 'BLOCKLIST_KV',
  r2Bucket: process.env.R2_BUCKET_NAME || 'gambling-blocklist-data',
  ttl: 24 * 60 * 60, // 24 hours
};

export const defaultPublisherConfig: PublisherConfig = {
  formats: ['adguard', 'hosts', 'dnsmasq', 'plain-domains', 'abp'],
  outputDirectory: 'dist/blocklists',
  compressionEnabled: true,
};

export const defaultDiscoveryConfig: DiscoveryConfig = {
  sources: [
    'search-engine',
    'common-crawl',
    'github',
    'public-blocklists',
    'threat-feeds',
    'website-index',
    'blogs',
    'forums',
    'directories',
    'paste-sites',
    'rss',
    'sitemaps',
    'recursive',
  ],
  maxDomainsPerSource: 1000,
  firecrawlEnabled: !!process.env.FIRECRAWL_API_KEY,
  firecrawlApiKey: process.env.FIRECRAWL_API_KEY,
  firecrawlEndpoint: process.env.FIRECRAWL_ENDPOINT,
};

export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  backoffMultiplier: 2,
};

export const defaultRateLimitConfig: RateLimitConfig = {
  requestsPerSecond: 1,
  burstSize: 5,
  windowSize: 60,
};

export const defaultCacheConfig: CacheConfig = {
  ttl: 60 * 60, // 1 hour
  maxEntries: 10000,
};

export function getConfig() {
  return {
    crawler: defaultCrawlerConfig,
    ai: defaultAIConfig,
    scoring: defaultScoringConfig,
    storage: defaultStorageConfig,
    publisher: defaultPublisherConfig,
    discovery: defaultDiscoveryConfig,
    retry: defaultRetryConfig,
    rateLimit: defaultRateLimitConfig,
    cache: defaultCacheConfig,
  };
}