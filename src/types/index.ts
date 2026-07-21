// Core types for the gambling blocklist system

export interface Domain {
  domain: string;
  url: string;
  discoveredAt: Date;
  source: string;
  sourceUrl?: string;
}

export interface CrawledPage {
  domain: string;
  url: string;
  title: string;
  meta: Record<string, string>;
  body: string;
  jsonLd: Record<string, unknown>[];
  canonical?: string;
  language: string;
  outgoingLinks: string[];
  internalLinks: string[];
  favicon?: string;
  screenshot?: string;
  crawledAt: Date;
  statusCode: number;
  headers: Record<string, string>;
}

export interface AIAnalysis {
  isGambling: boolean;
  confidence: number;
  reason: string;
  language: string;
  categories: GamblingCategory[];
  risk: RiskLevel;
  analyzedAt: Date;
}

export type GamblingCategory = 
  | 'online-casino'
  | 'sportsbook'
  | 'poker'
  | 'lottery'
  | 'bingo'
  | 'slots'
  | 'live-casino'
  | 'esports-betting'
  | 'virtual-sports'
  | 'fantasy-sports'
  | 'betting-exchange'
  | 'other';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ConfidenceScore {
  domain: string;
  aiScore: number;
  keywordScore: number;
  linkScore: number;
  domainReputation: number;
  pageSimilarity: number;
  historicalObservation: number;
  semanticSimilarity: number;
  finalScore: number;
  scoredAt: Date;
}

export interface BlocklistEntry {
  domain: string;
  confidence: number;
  addedAt: Date;
  lastVerified: Date;
  sources: string[];
  categories: GamblingCategory[];
  risk: RiskLevel;
}

export interface Blocklist {
  version: string;
  lastUpdated: Date;
  domains: BlocklistEntry[];
  stats: BlocklistStats;
  formats: BlocklistFormats;
}

export interface BlocklistStats {
  totalDomains: number;
  highRiskDomains: number;
  mediumRiskDomains: number;
  lowRiskDomains: number;
  domainsByCategory: Record<GamblingCategory, number>;
}

export interface BlocklistFormats {
  adguard: string;
  hosts: string;
  dnsmasq: string;
  plainDomains: string;
  abp: string;
  rpz?: string;
}

export interface CrawlerConfig {
  maxConcurrentRequests: number;
  requestTimeout: number;
  rateLimitDelay: number;
  userAgent: string;
  respectRobotsTxt: boolean;
  maxDepth: number;
  maxPagesPerDomain: number;
}

export interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey: string;
  endpoint: string;
}

export interface ScoringConfig {
  minConfidenceThreshold: number;
  highConfidenceThreshold: number;
  weights: ScoringWeights;
}

export interface ScoringWeights {
  aiScore: number;
  keywordScore: number;
  linkScore: number;
  domainReputation: number;
  pageSimilarity: number;
  historicalObservation: number;
  semanticSimilarity: number;
}

export interface StorageConfig {
  kvNamespace: string;
  r2Bucket: string;
  ttl: number;
}

export interface PublisherConfig {
  formats: string[];
  outputDirectory: string;
  compressionEnabled: boolean;
}

export interface DiscoveryConfig {
  sources: DiscoverySource[];
  maxDomainsPerSource: number;
  firecrawlEnabled: boolean;
  firecrawlApiKey?: string;
  firecrawlEndpoint?: string;
}

export type DiscoverySource = 
  | 'search-engine'
  | 'common-crawl'
  | 'github'
  | 'public-blocklists'
  | 'threat-feeds'
  | 'website-index'
  | 'blogs'
  | 'forums'
  | 'directories'
  | 'paste-sites'
  | 'rss'
  | 'sitemaps'
  | 'recursive';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface ThreatFeed {
  name: string;
  url: string;
  format: 'csv' | 'json' | 'txt' | 'xml';
  lastUpdated: Date;
}

export interface ErrorWithCode extends Error {
  code: string;
  statusCode?: number;
}

export interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

export interface RateLimitConfig {
  requestsPerSecond: number;
  burstSize: number;
  windowSize: number;
}

export interface CacheConfig {
  ttl: number;
  maxEntries: number;
}