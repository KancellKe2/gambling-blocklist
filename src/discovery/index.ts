/**
 * Discovery Module
 * 
 * Finds gambling domains through various sources:
 * - Search engines (using free APIs)
 * - Public blocklists
 * - Common Crawl
 * - GitHub
 * - Threat feeds
 * - Website indices
 * - Blogs, forums, directories
 * - Paste sites (legal)
 * - RSS feeds
 * - Sitemaps
 * - Recursive discovery
 */

import type { DiscoverySource, Domain } from '../types';
import { extractDomain, retry, rateLimit } from '../utils';

export interface DiscoveryResult {
  domains: Domain[];
  source: DiscoverySource;
  timestamp: Date;
  count: number;
}

export interface DiscoveryConfig {
  maxDomainsPerSource: number;
  timeout: number;
  retries: number;
  rateLimitDelay: number;
}

// Known public blocklist URLs for gambling domains
const PUBLIC_BLOCKLIST_URLS = [
  'https://raw.githubusercontent.com/StevenBlack/hosts/master/hosts',
  'https://raw.githubusercontent.com/notracking/hosts-blocklists/master/hostnames.txt',
  'https://raw.githubusercontent.com/AdguardTeam/AdguardFilters/master/SpywareFilter/hosts.txt',
  'https://raw.githubusercontent.com/AdguardTeam/AdguardFilters/master/TrackersFilter/hosts.txt',
];

// Known gambling-related GitHub repositories
const GAMBLING_GITHUB_REPOS = [
  'StevenBlack/hosts',
  'notracking/hosts-blocklists',
  'AdguardTeam/AdguardFilters',
];

// Gambling-related search queries
const GAMBLING_SEARCH_QUERIES = [
  'online casino',
  'sportsbook betting',
  'poker online',
  'slot machine',
  'lottery online',
  'gambling website',
  'betting site',
  'live casino',
];

export class DiscoveryManager {
  private sources: DiscoverySource[];
  private config: DiscoveryConfig;

  constructor(
    sources: DiscoverySource[] = ['public-blocklists', 'github'],
    config: Partial<DiscoveryConfig> = {}
  ) {
    this.sources = sources;
    this.config = {
      maxDomainsPerSource: config.maxDomainsPerSource || 1000,
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      rateLimitDelay: config.rateLimitDelay || 1000,
    };
  }

  async discoverAll(): Promise<DiscoveryResult[]> {
    const results: DiscoveryResult[] = [];

    for (const source of this.sources) {
      try {
        const result = await this.discoverFromSource(source);
        results.push(result);
      } catch (error) {
        console.error(`Discovery failed for source ${source}:`, error);
      }
    }

    return results;
  }

  private async discoverFromSource(source: DiscoverySource): Promise<DiscoveryResult> {
    const domains: Domain[] = [];
    const timestamp = new Date();

    switch (source) {
      case 'public-blocklists':
        await this.discoverFromPublicBlocklists(domains);
        break;
      case 'github':
        await this.discoverFromGitHub(domains);
        break;
      case 'search-engine':
        await this.discoverFromSearchEngine(domains);
        break;
      case 'common-crawl':
        await this.discoverFromCommonCrawl(domains);
        break;
      case 'threat-feeds':
        await this.discoverFromThreatFeeds(domains);
        break;
      default:
        console.log(`Source ${source} not implemented yet`);
    }

    return {
      domains: domains.slice(0, this.config.maxDomainsPerSource),
      source,
      timestamp,
      count: Math.min(domains.length, this.config.maxDomainsPerSource),
    };
  }

  private async discoverFromPublicBlocklists(domains: Domain[]): Promise<void> {
    for (const url of PUBLIC_BLOCKLIST_URLS) {
      try {
        const content = await this.fetchWithRetry(url);
        const extractedDomains = this.extractDomainsFromHosts(content);
        
        for (const domain of extractedDomains) {
          if (this.isGamblingRelated(domain)) {
            domains.push({
              domain,
              url: `https://${domain}`,
              discoveredAt: new Date(),
              source: 'public-blocklists',
            });
          }
        }
      } catch (error) {
        console.error(`Failed to fetch blocklist from ${url}:`, error);
      }
    }
  }

  private async discoverFromGitHub(domains: Domain[]): Promise<void> {
    for (const repo of GAMBLING_GITHUB_REPOS) {
      try {
        const url = `https://raw.githubusercontent.com/${repo}/master/hosts`;
        const content = await this.fetchWithRetry(url);
        const extractedDomains = this.extractDomainsFromHosts(content);
        
        for (const domain of extractedDomains) {
          if (this.isGamblingRelated(domain)) {
            domains.push({
              domain,
              url: `https://${domain}`,
              discoveredAt: new Date(),
              source: 'github',
            });
          }
        }
      } catch (error) {
        console.error(`Failed to fetch from GitHub repo ${repo}:`, error);
      }
    }
  }

  private async discoverFromSearchEngine(domains: Domain[]): Promise<void> {
    // Using DuckDuckGo Lite (no API key required)
    for (const query of GAMBLING_SEARCH_QUERIES) {
      try {
        const searchUrl = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(query)}`;
        const content = await this.fetchWithRetry(searchUrl);
        const extractedDomains = this.extractDomainsFromHtml(content);
        
        for (const domain of extractedDomains) {
          if (this.isGamblingRelated(domain)) {
            domains.push({
              domain,
              url: `https://${domain}`,
              discoveredAt: new Date(),
              source: 'search-engine',
            });
          }
        }
        
        await rateLimit(this.config.rateLimitDelay);
      } catch (error) {
        console.error(`Search failed for query "${query}":`, error);
      }
    }
  }

  private async discoverFromCommonCrawl(domains: Domain[]): Promise<void> {
    // Common Crawl Index API (free but rate-limited)
    try {
      const indexUrl = 'https://index.commoncrawl.org/CC-MAIN-2024-10-index';
      const response = await fetch(indexUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `url=gambling*&output=json&limit=100`,
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (response.ok) {
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.url) {
              const domain = extractDomain(data.url);
              if (this.isGamblingRelated(domain)) {
                domains.push({
                  domain,
                  url: data.url,
                  discoveredAt: new Date(),
                  source: 'common-crawl',
                });
              }
            }
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    } catch (error) {
      console.error('Common Crawl discovery failed:', error);
    }
  }

  private async discoverFromThreatFeeds(domains: Domain[]): Promise<void> {
    // Using free threat intelligence feeds
    const threatFeedUrls = [
      'https://hole.cert.pl/domains/domains.txt',
      'https://raw.githubusercontent.com/stamparm/ipsum/master/ipsum.txt',
    ];

    for (const url of threatFeedUrls) {
      try {
        const content = await this.fetchWithRetry(url);
        const extractedDomains = this.extractDomainsFromText(content);
        
        for (const domain of extractedDomains) {
          if (this.isGamblingRelated(domain)) {
            domains.push({
              domain,
              url: `https://${domain}`,
              discoveredAt: new Date(),
              source: 'threat-feeds',
            });
          }
        }
      } catch (error) {
        console.error(`Failed to fetch threat feed from ${url}:`, error);
      }
    }
  }

  private async fetchWithRetry(url: string): Promise<string> {
    return retry(async () => {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'GamblingBlocklistDiscovery/1.0',
        },
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.text();
    }, {
      maxRetries: this.config.retries,
      retryDelay: 1000,
      backoffMultiplier: 2,
    });
  }

  private extractDomainsFromHosts(content: string): string[] {
    const domains: string[] = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      // Skip comments and empty lines
      if (line.startsWith('#') || line.trim() === '') continue;
      
      // Extract domain from hosts file format (0.0.0.0 domain.com)
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        const domain = parts[1].trim().toLowerCase();
        if (this.isValidDomain(domain)) {
          domains.push(domain);
        }
      }
    }
    
    return [...new Set(domains)]; // Remove duplicates
  }

  private extractDomainsFromHtml(content: string): string[] {
    const domains: string[] = [];
    
    // Extract domains from links
    const linkMatches = content.matchAll(/href=["']https?:\/\/([^/"']+)/gi);
    for (const match of linkMatches) {
      const domain = match[1].toLowerCase();
      if (this.isValidDomain(domain)) {
        domains.push(domain);
      }
    }
    
    // Extract domains from text
    const domainMatches = content.matchAll(/\b([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}\b/gi);
    for (const match of domainMatches) {
      const domain = match[0].toLowerCase();
      if (this.isValidDomain(domain)) {
        domains.push(domain);
      }
    }
    
    return [...new Set(domains)]; // Remove duplicates
  }

  private extractDomainsFromText(content: string): string[] {
    const domains: string[] = [];
    const domainMatches = content.matchAll(/\b([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}\b/gi);
    
    for (const match of domainMatches) {
      const domain = match[0].toLowerCase();
      if (this.isValidDomain(domain)) {
        domains.push(domain);
      }
    }
    
    return [...new Set(domains)]; // Remove duplicates
  }

  private isValidDomain(domain: string): boolean {
    // Basic domain validation
    const domainRegex = /^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+(-[a-z0-9]+)*)+\.[a-z]{2,}$/;
    return domainRegex.test(domain) && domain.length <= 253;
  }

  private isGamblingRelated(domain: string): boolean {
    const gamblingKeywords = [
      'casino', 'poker', 'slots', 'roulette', 'blackjack', 'gambling',
      'bet', 'betting', 'wager', 'jackpot', 'lottery', 'bingo',
      'sportsbook', 'live-casino', 'online-casino', 'slot', 'jackpot',
    ];

    const lowerDomain = domain.toLowerCase();
    return gamblingKeywords.some(keyword => lowerDomain.includes(keyword));
  }
}

export function createDiscoveryManager(
  sources?: DiscoverySource[],
  config?: Partial<DiscoveryConfig>
): DiscoveryManager {
  return new DiscoveryManager(sources, config);
}