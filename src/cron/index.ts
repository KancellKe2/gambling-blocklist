/**
 * Cron Module
 * 
 * Handles scheduled tasks using Cloudflare Workers Cron
 * for automated gambling domain discovery and blocklist updates
 */

import type { ExecutionContext, KVNamespace, R2Bucket } from '@cloudflare/workers-types';
import { DiscoveryManager } from '../discovery';
import { Crawler } from '../crawler';
import { Validator } from '../validator';
import { Scorer } from '../score';
import { Storage } from '../storage';
import { Publisher } from '../publisher';

export interface CronEnv {
  BLOCKLIST_KV: KVNamespace;
  R2_BUCKET: R2Bucket;
  ASSETS?: { fetch: typeof fetch };
  ENVIRONMENT: string;
  OMNIROUTE_API_KEY: string;
  OMNIROUTE_ENDPOINT: string;
  FIRECRAWL_API_KEY?: string;
  FIRECRAWL_ENDPOINT?: string;
}

export interface CronConfig {
  schedule: string; // Cron expression
  enabled: boolean;
  maxRunTime: number; // Maximum run time in seconds
}

export class CronManager {
  private config: CronConfig;
  private env: any;

  constructor(env: any, config: Partial<CronConfig> = {}) {
    this.env = env;
    this.config = {
      schedule: config.schedule || '0 */6 * * *', // Every 6 hours
      enabled: config.enabled ?? true,
      maxRunTime: config.maxRunTime || 300, // 5 minutes
    };
  }

  async run(_ctx: ExecutionContext): Promise<void> {
    if (!this.config.enabled) {
      console.log('Cron job is disabled');
      return;
    }

    const startTime = Date.now();
    console.log(`Starting cron job at ${new Date().toISOString()}`);

    try {
      // Initialize modules
      const storage = new Storage(this.env);
      const publisher = new Publisher();
      const scorer = new Scorer();
      const discovery = new DiscoveryManager();
      const crawler = new Crawler();
      const validator = new Validator();

      // Phase 1: Discovery
      console.log('Phase 1: Discovering new domains...');
      const discoveryResults = await discovery.discoverAll();
      const allDomains = discoveryResults.flatMap(result => result.domains);
      console.log(`Discovered ${allDomains.length} domains`);

      // Phase 2: Crawling
      console.log('Phase 2: Crawling domains...');
      const crawlResults = await crawler.crawl(allDomains);
      console.log(`Crawled ${crawlResults.stats.success} pages successfully`);

      // Phase 3: Validation
      console.log('Phase 3: Validating domains...');
      const validatedDomains = [];
      for (const page of crawlResults.pages) {
        try {
          const validation = await validator.validate(page);
          if (validation.analysis.isGambling) {
            validatedDomains.push({
              domain: page.domain,
              page,
              analysis: validation.analysis,
            });
          }
        } catch (error) {
          console.error(`Validation failed for ${page.domain}:`, error);
        }
      }
      console.log(`Validated ${validatedDomains.length} gambling domains`);

      // Phase 4: Scoring
      console.log('Phase 4: Scoring domains...');
      const scoredDomains = [];
      for (const { domain, page, analysis } of validatedDomains) {
        const score = scorer.calculateScore(domain, analysis, page);
        if (score.finalScore > 0.3) { // Minimum threshold
          scoredDomains.push({
            domain,
            score,
            analysis,
          });
        }
      }
      console.log(`Scored ${scoredDomains.length} domains above threshold`);

      // Phase 5: Storage
      console.log('Phase 5: Storing results...');
      for (const { domain, score, analysis } of scoredDomains) {
        await storage.saveDomain({
          domain,
          url: `https://${domain}`,
          discoveredAt: new Date(),
          source: 'cron',
        });
        await storage.updateDomain(domain, {
          lastCrawled: new Date().toISOString(),
          lastAnalyzed: new Date().toISOString(),
          analysis,
          score: score.finalScore,
        });
      }

      // Phase 6: Blocklist Generation
      console.log('Phase 6: Generating blocklist...');
      const domains = await storage.listDomains();
      const blocklist = {
        version: '1.0.0',
        lastUpdated: new Date(),
        domains: domains.map(d => ({
          domain: d.domain,
          confidence: d.score || 0,
          addedAt: new Date(d.discoveredAt),
          lastVerified: d.lastCrawled ? new Date(d.lastCrawled) : new Date(),
          sources: [d.source as any],
          categories: d.analysis?.categories || [],
          risk: d.analysis?.risk || 'low',
        })),
        stats: {
          totalDomains: domains.length,
          highRiskDomains: domains.filter(d => d.analysis?.risk === 'high' || d.analysis?.risk === 'critical').length,
          mediumRiskDomains: domains.filter(d => d.analysis?.risk === 'medium').length,
          lowRiskDomains: domains.filter(d => d.analysis?.risk === 'low').length,
          domainsByCategory: {
            'online-casino': domains.filter(d => d.analysis?.categories?.includes('online-casino')).length,
            sportsbook: domains.filter(d => d.analysis?.categories?.includes('sportsbook')).length,
            poker: domains.filter(d => d.analysis?.categories?.includes('poker')).length,
            lottery: domains.filter(d => d.analysis?.categories?.includes('lottery')).length,
            bingo: domains.filter(d => d.analysis?.categories?.includes('bingo')).length,
            slots: domains.filter(d => d.analysis?.categories?.includes('slots')).length,
            'live-casino': domains.filter(d => d.analysis?.categories?.includes('live-casino')).length,
            'esports-betting': domains.filter(d => d.analysis?.categories?.includes('esports-betting')).length,
            'virtual-sports': domains.filter(d => d.analysis?.categories?.includes('virtual-sports')).length,
            'fantasy-sports': domains.filter(d => d.analysis?.categories?.includes('fantasy-sports')).length,
            'betting-exchange': domains.filter(d => d.analysis?.categories?.includes('betting-exchange')).length,
            other: domains.filter(d => d.analysis?.categories?.includes('other')).length,
          },
        },
        formats: publisher.generateFormats({
          version: '1.0.0',
          lastUpdated: new Date(),
          domains: [],
          stats: {
            totalDomains: 0,
            highRiskDomains: 0,
            mediumRiskDomains: 0,
            lowRiskDomains: 0,
            domainsByCategory: {} as any,
          },
          formats: {} as any,
        }),
      };

      await storage.saveBlocklist(blocklist);

      // Phase 7: Publishing
      console.log('Phase 7: Publishing blocklist...');
      const formats = publisher.generateFormats(blocklist);
      
      // Store each format in KV
      const kv = this.env.BLOCKLIST_KV;
      if (kv) {
        await kv.put('blocklist:adguard', formats.adguard);
        await kv.put('blocklist:hosts', formats.hosts);
        await kv.put('blocklist:dnsmasq', formats.dnsmasq);
        await kv.put('blocklist:plain', formats.plainDomains);
        await kv.put('blocklist:abp', formats.abp);
      }

      const duration = Date.now() - startTime;
      console.log(`Cron job completed in ${duration}ms`);

      // Store run statistics
      if (kv) {
        await kv.put('cron:lastRun', JSON.stringify({
          timestamp: new Date().toISOString(),
          duration,
          domainsDiscovered: allDomains.length,
          domainsCrawled: crawlResults.stats.success,
          domainsValidated: validatedDomains.length,
          domainsScored: scoredDomains.length,
          blocklistSize: blocklist.domains.length,
        }));
      }

    } catch (error) {
      console.error('Cron job failed:', error);
      throw error;
    }
  }

  getConfig(): CronConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<CronConfig>): void {
    this.config = { ...this.config, ...updates };
  }
}

export function createCronManager(env: CronEnv, config?: Partial<CronConfig>): CronManager {
  return new CronManager(env, config);
}