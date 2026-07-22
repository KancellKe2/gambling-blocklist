/**
 * Example Configuration File
 * 
 * This file shows how to configure the gambling blocklist system.
 * Copy this file and modify the values according to your setup.
 */

import type { Config } from '../src/config';

export const exampleConfig: Config = {
  // OmniRoute configuration for AI analysis
  ai: {
    endpoint: 'https://api.omniroute.com/v1',
    apiKey: 'your_omniroute_api_key',
    model: 'gpt-3.5-turbo',
    temperature: 0.1,
    maxTokens: 1000,
  },

  // Firecrawl configuration (optional, for enhanced crawling)
  firecrawl: {
    enabled: false,
    endpoint: 'https://api.firecrawl.dev/v1',
    apiKey: 'your_firecrawl_api_key',
  },

  // Crawler configuration
  crawler: {
    maxConcurrentRequests: 10,
    requestTimeout: 30000,
    rateLimitDelay: 1000,
    userAgent: 'GamblingBlocklistBot/1.0',
    retryAttempts: 3,
  },

  // Discovery sources
  discovery: {
    sources: [
      'public-blocklists',
      'github',
      'search-engine',
      'common-crawl',
      'threat-feeds',
    ],
    maxDomainsPerSource: 1000,
  },

  // Scoring configuration
  scoring: {
    minConfidenceThreshold: 0.7,
    highConfidenceThreshold: 0.9,
    weights: {
      aiScore: 0.4,
      keywordScore: 0.2,
      linkScore: 0.15,
      domainReputation: 0.1,
      pageSimilarity: 0.1,
      historical: 0.05,
    },
  },

  // Blocklist generation
  blocklist: {
    formats: ['adguard', 'hosts', 'dnsmasq', 'plain', 'abp'],
    maxDomains: 10000,
    updateInterval: 6 * 60 * 60 * 1000, // 6 hours in milliseconds
  },

  // Storage configuration
  storage: {
    kv: {
      binding: 'BLOCKLIST_KV',
    },
    r2: {
      binding: 'R2_BUCKET',
      enabled: true,
    },
  },

  // False positive filtering
  falsePositive: {
    enabled: true,
    blockedDomains: [
      'wikipedia.org',
      'github.com',
      'stackoverflow.com',
      'reddit.com',
      'youtube.com',
      'facebook.com',
      'twitter.com',
    ],
    blockedPatterns: [
      'news',
      'media',
      'press',
      'journal',
      'forum',
      'community',
      'discussion',
    ],
  },

  // Logging
  logging: {
    level: 'info',
    format: 'json',
  },
};

export default exampleConfig;