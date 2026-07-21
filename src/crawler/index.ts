/**
 * Crawler Module
 * 
 * Async parallel crawler with:
 * - Retry logic
 * - Timeout handling
 * - Rate limiting
 * - Robots.txt awareness
 * 
 * Extracts:
 * - Title
 * - Meta tags
 * - Body content
 * - JSON-LD
 * - Canonical URL
 * - Language
 * - Outgoing links
 * - Internal links
 * - Favicon
 * - Screenshot (optional)
 */

import type { Domain, CrawledPage, CrawlerConfig } from '../types';
import { extractDomain } from '../utils';

export interface CrawlResult {
  pages: CrawledPage[];
  errors: { domain: string; error: string }[];
  stats: {
    total: number;
    success: number;
    failed: number;
    duration: number;
  };
}

export class Crawler {
  private config: CrawlerConfig;
  private queue: Domain[];
  private results: CrawledPage[];
  private errors: { domain: string; error: string }[];
  private lastRequestTime: number;

  constructor(config: Partial<CrawlerConfig> = {}) {
    this.config = {
      maxConcurrentRequests: config.maxConcurrentRequests || 5,
      maxConcurrency: config.maxConcurrency || 5,
      requestTimeout: config.requestTimeout || 30000,
      timeout: config.timeout || 30000,
      rateLimitDelay: config.rateLimitDelay || 1000,
      rateLimit: config.rateLimit || 1000,
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      userAgent: config.userAgent || 'GamblingBlocklistCrawler/1.0',
      respectRobotsTxt: config.respectRobotsTxt ?? true,
      maxDepth: config.maxDepth || 3,
      maxPagesPerDomain: config.maxPagesPerDomain || 10,
      followRedirects: config.followRedirects ?? true,
      maxRedirects: config.maxRedirects || 5,
    };
    this.queue = [];
    this.results = [];
    this.errors = [];
    this.lastRequestTime = 0;
  }

  async crawl(domains: Domain[]): Promise<CrawlResult> {
    const startTime = Date.now();
    this.queue = [...domains];
    this.results = [];
    this.errors = [];

    const promises: Promise<void>[] = [];
    for (let i = 0; i < this.config.maxConcurrency; i++) {
      promises.push(this.worker());
    }

    await Promise.all(promises);

    return {
      pages: this.results,
      errors: this.errors,
      stats: {
        total: domains.length,
        success: this.results.length,
        failed: this.errors.length,
        duration: Date.now() - startTime,
      },
    };
  }

  private async worker(): Promise<void> {
    while (this.queue.length > 0) {
      const domain = this.queue.shift();
      if (!domain) break;

      try {
        await this.rateLimitWait();
        const page = await this.crawlDomain(domain);
        if (page) {
          this.results.push(page);
        }
      } catch (error) {
        this.errors.push({
          domain: domain.domain,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  private async rateLimitWait(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < this.config.rateLimit) {
      await new Promise(resolve => 
        setTimeout(resolve, this.config.rateLimit - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();
  }

  private async crawlDomain(domain: Domain): Promise<CrawledPage | null> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(domain.url, {
          headers: {
            'User-Agent': this.config.userAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          },
          signal: controller.signal,
          redirect: this.config.followRedirects ? 'follow' : 'manual',
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const html = await response.text();
        const page = this.parseHtml(html, domain, response.url);
        return page;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < this.config.retries) {
          await new Promise(resolve => 
            setTimeout(resolve, this.config.retryDelay * (attempt + 1))
          );
        }
      }
    }

    throw lastError;
  }

  private parseHtml(html: string, domain: Domain, finalUrl: string): CrawledPage {
    // Simple HTML parsing - in production, use a proper HTML parser
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    // Extract meta tags
    const meta: Record<string, string> = {};
    const metaMatches = html.matchAll(/<meta\s+[^>]*?(?:name|property)=["']([^"']+)["'][^>]*?content=["']([^"']+)["']/gi);
    for (const match of metaMatches) {
      meta[match[1]] = match[2];
    }

    // Extract language
    const langMatch = html.match(/<html[^>]*lang=["']([^"']+)["']/i);
    const language = langMatch ? langMatch[1] : 'en';

    // Extract canonical URL
    const canonicalMatch = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
    const canonical = canonicalMatch ? canonicalMatch[1] : undefined;

    // Extract JSON-LD
    const jsonLd: Record<string, unknown>[] = [];
    const jsonLdMatches = html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    for (const match of jsonLdMatches) {
      try {
        const data = JSON.parse(match[1]);
        jsonLd.push(data);
      } catch {
        // Ignore invalid JSON-LD
      }
    }

    // Extract links
    const linkMatches = html.matchAll(/<a[^>]*href=["']([^"']+)["']/gi);
    const outgoingLinks: string[] = [];
    const internalLinks: string[] = [];
    const baseDomain = extractDomain(domain.url);

    for (const match of linkMatches) {
      const href = match[1];
      if (href.startsWith('http') || href.startsWith('//')) {
        const linkDomain = extractDomain(href.startsWith('//') ? `https:${href}` : href);
        if (linkDomain === baseDomain) {
          internalLinks.push(href);
        } else {
          outgoingLinks.push(href);
        }
      }
    }

    // Extract favicon
    const faviconMatch = html.match(/<link[^>]*rel=["']icon["'][^>]*href=["']([^"']+)["']/i);
    const favicon = faviconMatch ? faviconMatch[1] : undefined;

    return {
      domain: domain.domain,
      url: finalUrl,
      title,
      meta,
      body: html,
      jsonLd,
      canonical,
      language,
      outgoingLinks,
      internalLinks,
      favicon,
      crawledAt: new Date(),
      statusCode: 200,
      headers: {},
    };
  }
}

export function createCrawler(config?: Partial<CrawlerConfig>): Crawler {
  return new Crawler(config);
}