/**
 * Scoring Module
 * 
 * Multi-factor confidence scoring system combining:
 * - AI score
 * - Keyword score
 * - Link score
 * - Domain reputation
 * - Page similarity
 * - Historical observation
 * - Semantic similarity
 */

import type { 
  AIAnalysis, 
  CrawledPage, 
  ConfidenceScore, 
  ScoringConfig 
} from '../types';

export interface ScoringFactors {
  aiScore: number;
  keywordScore: number;
  linkScore: number;
  domainReputation: number;
  pageSimilarity: number;
  historicalObservation: number;
  semanticSimilarity: number;
}

export class Scorer {
  private config: ScoringConfig;
  private domainHistory: Map<string, number[]> = new Map();

  constructor(config: Partial<ScoringConfig> = {}) {
    this.config = {
      minConfidenceThreshold: config.minConfidenceThreshold || 0.3,
      highConfidenceThreshold: config.highConfidenceThreshold || 0.8,
      weights: config.weights || {
        ai: 0.4,
        keyword: 0.2,
        link: 0.15,
        domainReputation: 0.1,
        pageSimilarity: 0.05,
        historical: 0.05,
        semantic: 0.05,
        aiScore: 0.4,
        keywordScore: 0.2,
        linkScore: 0.15,
        historicalObservation: 0.05,
        semanticSimilarity: 0.05,
      },
      thresholds: config.thresholds || {
        high: 0.8,
        medium: 0.5,
        low: 0.3,
      },
    };
  }

  calculateScore(
    domain: string,
    analysis: AIAnalysis,
    page: CrawledPage,
    similarPages: CrawledPage[] = []
  ): ConfidenceScore {
    const factors = this.calculateFactors(analysis, page, similarPages);
    const finalScore = this.weightedScore(factors);
    
    // Update domain history
    this.updateDomainHistory(domain, finalScore);

    return {
      domain,
      aiScore: factors.aiScore,
      keywordScore: factors.keywordScore,
      linkScore: factors.linkScore,
      domainReputation: factors.domainReputation,
      pageSimilarity: factors.pageSimilarity,
      historicalObservation: factors.historicalObservation,
      semanticSimilarity: factors.semanticSimilarity,
      finalScore,
      scoredAt: new Date(),
    };
  }

  private calculateFactors(
    analysis: AIAnalysis,
    page: CrawledPage,
    similarPages: CrawledPage[]
  ): ScoringFactors {
    return {
      aiScore: this.calculateAIScore(analysis),
      keywordScore: this.calculateKeywordScore(page),
      linkScore: this.calculateLinkScore(page),
      domainReputation: this.calculateDomainReputation(page.domain),
      pageSimilarity: this.calculatePageSimilarity(page, similarPages),
      historicalObservation: this.calculateHistoricalScore(page.domain),
      semanticSimilarity: this.calculateSemanticSimilarity(page, similarPages),
    };
  }

  private calculateAIScore(analysis: AIAnalysis): number {
    if (!analysis.isGambling) {
      return 0;
    }
    return analysis.confidence;
  }

  private calculateKeywordScore(page: CrawledPage): number {
    const gamblingKeywords = [
      'casino', 'poker', 'slots', 'roulette', 'blackjack', 'gambling',
      'bet', 'betting', 'wager', 'jackpot', 'lottery', 'bingo',
      'sportsbook', 'live casino', 'online casino', 'deposit', 'withdraw',
      'bonus', 'free spins', 'no deposit', 'real money', 'play for real',
    ];

    const text = `${page.title} ${page.body} ${Object.values(page.meta).join(' ')}`.toLowerCase();
    
    let matchCount = 0;
    for (const keyword of gamblingKeywords) {
      if (text.includes(keyword.toLowerCase())) {
        matchCount++;
      }
    }

    return Math.min(1, matchCount / 5);
  }

  private calculateLinkScore(page: CrawledPage): number {
    const totalLinks = page.outgoingLinks.length + page.internalLinks.length;
    if (totalLinks === 0) {
      return 0;
    }

    // Higher score for more gambling-related outgoing links
    const gamblingLinkPatterns = [
      'casino', 'poker', 'slots', 'bet', 'gambling', 'jackpot',
      'lottery', 'bingo', 'sportsbook', 'live-casino',
    ];

    let gamblingLinks = 0;
    for (const link of page.outgoingLinks) {
      for (const pattern of gamblingLinkPatterns) {
        if (link.toLowerCase().includes(pattern)) {
          gamblingLinks++;
          break;
        }
      }
    }

    return Math.min(1, gamblingLinks / Math.max(1, page.outgoingLinks.length));
  }

  private calculateDomainReputation(domain: string): number {
    // Simple reputation calculation based on domain characteristics
    const suspiciousPatterns = [
      'casino', 'bet', 'gambling', 'poker', 'slots', 'jackpot',
      'lottery', 'bingo', 'sportsbook',
    ];

    let score = 0;
    for (const pattern of suspiciousPatterns) {
      if (domain.toLowerCase().includes(pattern)) {
        score += 0.2;
      }
    }

    return Math.min(1, score);
  }

  private calculatePageSimilarity(
    page: CrawledPage,
    similarPages: CrawledPage[]
  ): number {
    if (similarPages.length === 0) {
      return 0;
    }

    let similaritySum = 0;
    for (const similarPage of similarPages) {
      const similarity = this.calculateTextSimilarity(page.body, similarPage.body);
      similaritySum += similarity;
    }

    return similaritySum / similarPages.length;
  }

  private calculateHistoricalScore(domain: string): number {
    const history = this.domainHistory.get(domain) || [];
    if (history.length === 0) {
      return 0;
    }

    // Calculate average historical score
    const avgScore = history.reduce((a, b) => a + b, 0) / history.length;
    return avgScore;
  }

  private calculateSemanticSimilarity(
    page: CrawledPage,
    similarPages: CrawledPage[]
  ): number {
    if (similarPages.length === 0) {
      return 0;
    }

    // Simple semantic similarity based on title and meta description
    const pageText = `${page.title} ${page.meta.description || ''}`.toLowerCase();
    
    let similaritySum = 0;
    for (const similarPage of similarPages) {
      const similarText = `${similarPage.title} ${similarPage.meta.description || ''}`.toLowerCase();
      const similarity = this.calculateTextSimilarity(pageText, similarText);
      similaritySum += similarity;
    }

    return similaritySum / similarPages.length;
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    // Simple Jaccard similarity
    const words1 = new Set(text1.split(/\s+/));
    const words2 = new Set(text2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  private weightedScore(factors: ScoringFactors): number {
    const weights = this.config.weights;
    
    return (
      factors.aiScore * weights.ai +
      factors.keywordScore * weights.keyword +
      factors.linkScore * weights.link +
      factors.domainReputation * weights.domainReputation +
      factors.pageSimilarity * weights.pageSimilarity +
      factors.historicalObservation * weights.historical +
      factors.semanticSimilarity * weights.semantic
    );
  }

  private updateDomainHistory(domain: string, score: number): void {
    const history = this.domainHistory.get(domain) || [];
    history.push(score);
    
    // Keep only last 10 observations
    if (history.length > 10) {
      history.shift();
    }
    
    this.domainHistory.set(domain, history);
  }

  getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= this.config.thresholds.high) {
      return 'critical';
    } else if (score >= this.config.thresholds.medium) {
      return 'high';
    } else if (score >= this.config.thresholds.low) {
      return 'medium';
    }
    return 'low';
  }
}

export function createScorer(config?: Partial<ScoringConfig>): Scorer {
  return new Scorer(config);
}