import { describe, expect, it } from 'vitest';
import type {
  AIAnalysis,
  Blocklist,
  BlocklistEntry,
  ConfidenceScore,
  CrawledPage,
  DiscoverySource,
  Domain,
  GamblingCategory,
  RiskLevel,
} from '../../src/types';

describe('Type Definitions', () => {
  describe('Domain', () => {
    it('should have correct structure', () => {
      const domain: Domain = {
        domain: 'example.com',
        url: 'https://example.com',
        discoveredAt: new Date(),
        source: 'search-engine',
      };
      
      expect(domain).toBeDefined();
      expect(domain.domain).toBe('example.com');
      expect(domain.url).toBe('https://example.com');
      expect(domain.discoveredAt).toBeInstanceOf(Date);
      expect(domain.source).toBe('search-engine');
    });
  });

  describe('CrawledPage', () => {
    it('should have correct structure', () => {
      const page: CrawledPage = {
        domain: 'example.com',
        url: 'https://example.com',
        title: 'Example Page',
        meta: { description: 'An example page' },
        body: '<p>Hello World</p>',
        jsonLd: [],
        language: 'en',
        outgoingLinks: [],
        internalLinks: [],
        crawledAt: new Date(),
        statusCode: 200,
        headers: { 'content-type': 'text/html' },
      };
      
      expect(page).toBeDefined();
      expect(page.domain).toBe('example.com');
      expect(page.url).toBe('https://example.com');
      expect(page.title).toBe('Example Page');
      expect(page.meta).toEqual({ description: 'An example page' });
      expect(page.body).toBe('<p>Hello World</p>');
      expect(page.jsonLd).toEqual([]);
      expect(page.language).toBe('en');
      expect(page.outgoingLinks).toEqual([]);
      expect(page.internalLinks).toEqual([]);
      expect(page.crawledAt).toBeInstanceOf(Date);
      expect(page.statusCode).toBe(200);
      expect(page.headers).toEqual({ 'content-type': 'text/html' });
    });
  });

  describe('AIAnalysis', () => {
    it('should have correct structure', () => {
      const analysis: AIAnalysis = {
        isGambling: true,
        confidence: 0.95,
        reason: 'Website offers online casino games',
        language: 'en',
        categories: ['online-casino', 'slots'],
        risk: 'high',
        analyzedAt: new Date(),
      };
      
      expect(analysis).toBeDefined();
      expect(analysis.isGambling).toBe(true);
      expect(analysis.confidence).toBe(0.95);
      expect(analysis.reason).toBe('Website offers online casino games');
      expect(analysis.language).toBe('en');
      expect(analysis.categories).toContain('online-casino');
      expect(analysis.categories).toContain('slots');
      expect(analysis.risk).toBe('high');
      expect(analysis.analyzedAt).toBeInstanceOf(Date);
    });
  });

  describe('GamblingCategory', () => {
    it('should have all required categories', () => {
      const categories: GamblingCategory[] = [
        'online-casino',
        'sportsbook',
        'poker',
        'lottery',
        'bingo',
        'slots',
        'live-casino',
        'esports-betting',
        'virtual-sports',
        'fantasy-sports',
        'betting-exchange',
        'other',
      ];
      
      expect(categories).toHaveLength(12);
    });
  });

  describe('RiskLevel', () => {
    it('should have all risk levels', () => {
      const riskLevels: RiskLevel[] = ['low', 'medium', 'high', 'critical'];
      expect(riskLevels).toHaveLength(4);
    });
  });

  describe('ConfidenceScore', () => {
    it('should have correct structure', () => {
      const score: ConfidenceScore = {
        domain: 'example.com',
        aiScore: 0.9,
        keywordScore: 0.8,
        linkScore: 0.7,
        domainReputation: 0.6,
        pageSimilarity: 0.5,
        historicalObservation: 0.4,
        semanticSimilarity: 0.3,
        finalScore: 0.85,
        scoredAt: new Date(),
      };
      
      expect(score).toBeDefined();
      expect(score.domain).toBe('example.com');
      expect(score.aiScore).toBe(0.9);
      expect(score.keywordScore).toBe(0.8);
      expect(score.linkScore).toBe(0.7);
      expect(score.domainReputation).toBe(0.6);
      expect(score.pageSimilarity).toBe(0.5);
      expect(score.historicalObservation).toBe(0.4);
      expect(score.semanticSimilarity).toBe(0.3);
      expect(score.finalScore).toBe(0.85);
      expect(score.scoredAt).toBeInstanceOf(Date);
    });
  });

  describe('BlocklistEntry', () => {
    it('should have correct structure', () => {
      const entry: BlocklistEntry = {
        domain: 'example.com',
        confidence: 0.95,
        addedAt: new Date(),
        lastVerified: new Date(),
        sources: ['search-engine'],
        categories: ['online-casino'],
        risk: 'high',
      };
      
      expect(entry).toBeDefined();
      expect(entry.domain).toBe('example.com');
      expect(entry.confidence).toBe(0.95);
      expect(entry.addedAt).toBeInstanceOf(Date);
      expect(entry.lastVerified).toBeInstanceOf(Date);
      expect(entry.sources).toContain('search-engine');
      expect(entry.categories).toContain('online-casino');
      expect(entry.risk).toBe('high');
    });
  });

  describe('Blocklist', () => {
    it('should have correct structure', () => {
      const blocklist: Blocklist = {
        version: '1.0.0',
        lastUpdated: new Date(),
        domains: [],
        stats: {
          totalDomains: 0,
          highRiskDomains: 0,
          mediumRiskDomains: 0,
          lowRiskDomains: 0,
          domainsByCategory: {
            'online-casino': 0,
            sportsbook: 0,
            poker: 0,
            lottery: 0,
            bingo: 0,
            slots: 0,
            'live-casino': 0,
            'esports-betting': 0,
            'virtual-sports': 0,
            'fantasy-sports': 0,
            'betting-exchange': 0,
            other: 0,
          },
        },
        formats: {
          adguard: '',
          hosts: '',
          dnsmasq: '',
          plainDomains: '',
          abp: '',
        },
      };
      
      expect(blocklist).toBeDefined();
      expect(blocklist.version).toBe('1.0.0');
      expect(blocklist.lastUpdated).toBeInstanceOf(Date);
      expect(blocklist.domains).toEqual([]);
      expect(blocklist.stats).toBeDefined();
      expect(blocklist.formats).toBeDefined();
    });
  });

  describe('DiscoverySource', () => {
    it('should have all required sources', () => {
      const sources: DiscoverySource[] = [
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
      ];
      
      expect(sources).toHaveLength(13);
    });
  });
});