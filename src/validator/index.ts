/**
 * False Positive Filter Module
 * 
 * Filters out non-gambling domains that might be incorrectly flagged:
 * - News articles
 * - Wikipedia
 * - Forums
 * - Legal websites
 * - Research sites
 * - Blogs
 * - Media
 * - GitHub
 * - StackOverflow
 * - YouTube
 * - Educational sites
 */

import type { AIAnalysis, AIConfig, CrawledPage } from '../types';

export interface FilterResult {
  isFalsePositive: boolean;
  reason: string;
  category: string;
}

export interface FilterConfig {
  enabledDomains: string[];
  blockedPatterns: string[];
  contentPatterns: string[];
}

// Known false positive domains
const FALSE_POSITIVE_DOMAINS = [
  // News and media
  'news', 'media', 'press', 'journal', 'tribune', 'times', 'post',
  'cnn', 'bbc', 'reuters', 'ap', 'nytimes', 'washingtonpost',
  
  // Wikipedia and educational
  'wikipedia', 'wiki', 'edu', 'academic', 'scholar', 'research',
  'university', 'college', 'school', 'learning', 'course',
  
  // Forums and discussion
  'forum', 'community', 'discussion', 'reddit', 'quora', 'stackexchange',
  'stackoverflow', 'github', 'gitlab', 'bitbucket',
  
  // Legal and government
  'gov', 'legal', 'law', 'court', 'justice', 'regulation',
  
  // Technology and development
  'developer', 'docs', 'documentation', 'api', 'sdk', 'library',
  'npm', 'pypi', 'crates', 'maven',
  
  // Video and streaming
  'youtube', 'vimeo', 'dailymotion', 'twitch', 'streaming',
  
  // Social media
  'facebook', 'twitter', 'instagram', 'linkedin', 'tiktok',
  
  // E-commerce (non-gambling)
  'shop', 'store', 'market', 'amazon', 'ebay', 'etsy',
];

// Content patterns that indicate false positives
const FALSE_POSITIVE_CONTENT_PATTERNS = [
  // News and articles
  /\b(breaking news|latest news|news article|press release|news report)\b/i,
  /\b(published|published on|author|byline|editorial)\b/i,
  
  // Wikipedia
  /\b(wikipedia|from the free encyclopedia|article on|edit|history|talk)\b/i,
  
  // Forums
  /\b(forum post|discussion thread|reply|comment|thread|topic)\b/i,
  
  // Legal
  /\b(terms of service|privacy policy|legal notice|copyright|trademark)\b/i,
  /\b(government|official|regulatory|compliance|jurisdiction)\b/i,
  
  // Educational
  /\b(course|curriculum|syllabus|lecture|professor|student)\b/i,
  /\b(research paper|study|analysis|journal|publication)\b/i,
  
  // Technology
  /\b(documentation|api reference|code example|tutorial|guide)\b/i,
  /\b(install|setup|configuration|getting started)\b/i,
  
  // Non-gambling commercial
  /\b(product|service|pricing|subscription|plan|feature)\b/i,
  /\b(buy|purchase|order|cart|checkout|payment)\b/i,
];

export class FalsePositiveFilter {
  private config: FilterConfig;

  constructor(config: Partial<FilterConfig> = {}) {
    this.config = {
      enabledDomains: config.enabledDomains || [],
      blockedPatterns: config.blockedPatterns || FALSE_POSITIVE_DOMAINS,
      contentPatterns: config.contentPatterns || FALSE_POSITIVE_CONTENT_PATTERNS.map(p => p.source),
    };
  }

  filter(page: CrawledPage): FilterResult {
    // Check domain-based false positives
    const domainResult = this.checkDomainFalsePositive(page.domain);
    if (domainResult.isFalsePositive) {
      return domainResult;
    }

    // Check content-based false positives
    const contentResult = this.checkContentFalsePositive(page);
    if (contentResult.isFalsePositive) {
      return contentResult;
    }

    // Check URL-based false positives
    const urlResult = this.checkUrlFalsePositive(page.url);
    if (urlResult.isFalsePositive) {
      return urlResult;
    }

    return {
      isFalsePositive: false,
      reason: '',
      category: '',
    };
  }

  private checkDomainFalsePositive(domain: string): FilterResult {
    const lowerDomain = domain.toLowerCase();
    
    for (const pattern of this.config.blockedPatterns) {
      if (lowerDomain.includes(pattern.toLowerCase())) {
        return {
          isFalsePositive: true,
          reason: `Domain contains false positive pattern: ${pattern}`,
          category: 'domain-pattern',
        };
      }
    }

    // Check for specific TLDs that are often false positives
    const falsePositiveTlds = ['.edu', '.gov', '.org', '.ac', '.academic'];
    for (const tld of falsePositiveTlds) {
      if (lowerDomain.endsWith(tld)) {
        return {
          isFalsePositive: true,
          reason: `Domain has false positive TLD: ${tld}`,
          category: 'tld',
        };
      }
    }

    return {
      isFalsePositive: false,
      reason: '',
      category: '',
    };
  }

  private checkContentFalsePositive(page: CrawledPage): FilterResult {
    const content = `${page.title} ${page.body} ${Object.values(page.meta).join(' ')}`.toLowerCase();
    
    for (const patternStr of this.config.contentPatterns) {
      try {
        const pattern = new RegExp(patternStr, 'i');
        if (pattern.test(content)) {
          return {
            isFalsePositive: true,
            reason: `Content matches false positive pattern: ${patternStr}`,
            category: 'content-pattern',
          };
        }
      } catch {
        // Skip invalid regex patterns
      }
    }

    // Check for high text-to-link ratio (indicative of articles/news)
    const linkCount = page.outgoingLinks.length + page.internalLinks.length;
    const textLength = page.body.length;
    if (linkCount > 0 && textLength / linkCount > 1000) {
      return {
        isFalsePositive: true,
        reason: 'High text-to-link ratio indicates article/news content',
        category: 'content-ratio',
      };
    }

    return {
      isFalsePositive: false,
      reason: '',
      category: '',
    };
  }

  private checkUrlFalsePositive(url: string): FilterResult {
    const lowerUrl = url.toLowerCase();
    
    // Check for common false positive URL patterns
    const falsePositiveUrlPatterns = [
      '/wiki/', '/article/', '/news/', '/blog/', '/post/',
      '/forum/', '/discussion/', '/thread/', '/topic/',
      '/docs/', '/documentation/', '/api/', '/sdk/',
      '/course/', '/lecture/', '/tutorial/', '/guide/',
      '/research/', '/paper/', '/study/', '/analysis/',
      '/legal/', '/terms/', '/privacy/', '/policy/',
      '/about/', '/contact/', '/support/', '/help/',
    ];

    for (const pattern of falsePositiveUrlPatterns) {
      if (lowerUrl.includes(pattern)) {
        return {
          isFalsePositive: true,
          reason: `URL contains false positive pattern: ${pattern}`,
          category: 'url-pattern',
        };
      }
    }

    return {
      isFalsePositive: false,
      reason: '',
      category: '',
    };
  }

  // Add custom patterns
  addBlockedDomain(pattern: string): void {
    this.config.blockedPatterns.push(pattern);
  }

  addContentPattern(pattern: string): void {
    this.config.contentPatterns.push(pattern);
  }

  // Remove patterns
  removeBlockedDomain(pattern: string): void {
    this.config.blockedPatterns = this.config.blockedPatterns.filter(p => p !== pattern);
  }

  removeContentPattern(pattern: string): void {
    this.config.contentPatterns = this.config.contentPatterns.filter(p => p !== pattern);
  }
}

export function createFalsePositiveFilter(
  config?: Partial<FilterConfig>
): FalsePositiveFilter {
  return new FalsePositiveFilter(config);
}

/**
 * Validator Module
 * 
 * Validates whether a website is gambling-related
 * using AI analysis via OmniRoute endpoint
 */

export interface ValidationResult {
  domain: string;
  url: string;
  analysis: AIAnalysis;
  timestamp: Date;
}

export class Validator {
  private config: AIConfig;
  private falsePositiveFilter: FalsePositiveFilter;

  constructor(config: Partial<AIConfig> = {}) {
    this.config = {
      endpoint: config.endpoint || '',
      apiKey: config.apiKey || '',
      model: config.model || 'gpt-3.5-turbo',
      maxTokens: config.maxTokens || 1000,
      temperature: config.temperature || 0.3,
      timeout: config.timeout || 30000,
    };
    this.falsePositiveFilter = new FalsePositiveFilter();
  }

  async validate(page: CrawledPage): Promise<ValidationResult> {
    // First, check for false positives
    const filterResult = this.falsePositiveFilter.filter(page);
    if (filterResult.isFalsePositive) {
      return {
        domain: page.domain,
        url: page.url,
        analysis: {
          isGambling: false,
          confidence: 0,
          reason: `False positive filtered: ${filterResult.reason}`,
          language: page.language,
          categories: [],
          risk: 'low',
          analyzedAt: new Date(),
        },
        timestamp: new Date(),
      };
    }

    const analysis = await this.analyzeWithAI(page);
    
    return {
      domain: page.domain,
      url: page.url,
      analysis,
      timestamp: new Date(),
    };
  }

  private async analyzeWithAI(page: CrawledPage): Promise<AIAnalysis> {
    const prompt = this.createAnalysisPrompt(page);
    
    try {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert at analyzing websites to determine if they are gambling-related. Analyze the provided website content and return a JSON response with the specified structure.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in AI response');
      }

      return this.parseAIResponse(content);
    } catch (error) {
      // Fallback to keyword-based analysis
      return this.keywordBasedAnalysis(page);
    }
  }

  private createAnalysisPrompt(page: CrawledPage): string {
    const content = `
Title: ${page.title}
Language: ${page.language}
Meta Description: ${page.meta.description || 'N/A'}
Body Text: ${page.body.substring(0, 2000)}...

Analyze this website and determine if it is gambling-related. Consider:
1. Is it an online casino, sportsbook, poker, lottery, or other gambling site?
2. Does it offer gambling games, betting, or wagering?
3. Does it have deposit/withdrawal functionality?
4. Does it mention gambling-related terms like slots, roulette, blackjack, etc.?
5. Is it a legitimate gambling site or a scam?

Return a JSON response with this structure:
{
  "is_gambling": boolean,
  "confidence": number (0-1),
  "reason": "string explaining your analysis",
  "language": "detected language code",
  "categories": ["array of gambling categories"],
  "risk": "low|medium|high|critical"
}

Categories can include: online-casino, sportsbook, poker, lottery, bingo, slots, live-casino, esports-betting, virtual-sports, fantasy-sports, betting-exchange, other.
`;

    return content;
  }

  private parseAIResponse(response: string): AIAnalysis {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          isGambling: parsed.is_gambling || false,
          confidence: Math.min(1, Math.max(0, parsed.confidence || 0)),
          reason: parsed.reason || 'No reason provided',
          language: parsed.language || 'en',
          categories: parsed.categories || [],
          risk: parsed.risk || 'low',
          analyzedAt: new Date(),
        };
      }
    } catch {
      // Fall through to keyword analysis
    }

    // Fallback to keyword-based analysis
    return this.keywordBasedAnalysis({
      domain: '',
      url: '',
      title: response,
      meta: {},
      body: response,
      jsonLd: [],
      language: 'en',
      outgoingLinks: [],
      internalLinks: [],
      crawledAt: new Date(),
      statusCode: 200,
      headers: {},
    });
  }

  private keywordBasedAnalysis(page: CrawledPage): AIAnalysis {
    const gamblingKeywords = [
      'casino', 'poker', 'slots', 'roulette', 'blackjack', 'gambling',
      'bet', 'betting', 'wager', 'jackpot', 'lottery', 'bingo',
      'sportsbook', 'live casino', 'online casino', 'deposit', 'withdraw',
      'bonus', 'free spins', 'no deposit', 'real money', 'play for real',
    ];

    const text = `${page.title} ${page.body} ${Object.values(page.meta).join(' ')}`.toLowerCase();
    
    let matchCount = 0;
    const matchedKeywords: string[] = [];

    for (const keyword of gamblingKeywords) {
      if (text.includes(keyword.toLowerCase())) {
        matchCount++;
        matchedKeywords.push(keyword);
      }
    }

    const confidence = Math.min(1, matchCount / 5); // Normalize to 0-1
    const isGambling = confidence > 0.3;

    return {
      isGambling,
      confidence,
      reason: isGambling 
        ? `Found gambling keywords: ${matchedKeywords.join(', ')}`
        : 'No significant gambling indicators found',
      language: page.language,
      categories: isGambling ? ['other'] : [],
      risk: confidence > 0.7 ? 'high' : confidence > 0.4 ? 'medium' : 'low',
      analyzedAt: new Date(),
    };
  }
}

export function createValidator(config?: Partial<AIConfig>): Validator {
  return new Validator(config);
}