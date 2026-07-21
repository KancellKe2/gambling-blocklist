/**
 * Validator Module
 * 
 * Validates whether a website is gambling-related
 * using AI analysis via OmniRoute endpoint
 */

import type { CrawledPage, AIAnalysis, AIConfig } from '../types';

export interface ValidationResult {
  domain: string;
  url: string;
  analysis: AIAnalysis;
  timestamp: Date;
}

export class Validator {
  private config: AIConfig;

  constructor(config: Partial<AIConfig> = {}) {
    this.config = {
      endpoint: config.endpoint || '',
      apiKey: config.apiKey || '',
      model: config.model || 'gpt-3.5-turbo',
      maxTokens: config.maxTokens || 1000,
      temperature: config.temperature || 0.3,
      timeout: config.timeout || 30000,
    };
  }

  async validate(page: CrawledPage): Promise<ValidationResult> {
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