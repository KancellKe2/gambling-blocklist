/**
 * AI Module
 * 
 * Handles AI analysis using OmniRoute endpoint
 * for gambling detection and classification
 */

import type { AIAnalysis, AIConfig } from '../types';

export interface AIRequest {
  content: string;
  context?: string;
}

export interface AIResponse {
  analysis: AIAnalysis;
  rawResponse: string;
  processingTime: number;
}

export class AIAnalyzer {
  private config: AIConfig;
  private requestCount: number = 0;
  private lastRequestTime: number = 0;

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

  async analyze(request: AIRequest): Promise<AIResponse> {
    const startTime = Date.now();
    
    await this.rateLimit();
    
    const prompt = this.createPrompt(request);
    const rawResponse = await this.callAPI(prompt);
    const analysis = this.parseResponse(rawResponse);
    
    this.requestCount++;
    this.lastRequestTime = Date.now();

    return {
      analysis,
      rawResponse,
      processingTime: Date.now() - startTime,
    };
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    // Basic rate limiting: 1 request per second
    if (timeSinceLastRequest < 1000) {
      await new Promise(resolve => 
        setTimeout(resolve, 1000 - timeSinceLastRequest)
      );
    }
  }

  private createPrompt(request: AIRequest): string {
    const systemPrompt = `You are an expert at analyzing websites to determine if they are gambling-related. 
Analyze the provided content and return a JSON response with gambling detection results.

Focus on:
1. Is this a gambling website? (online casino, sportsbook, poker, lottery, etc.)
2. What gambling categories does it belong to?
3. What is your confidence level?
4. What risk level does it pose?
5. What language is the content in?
6. Provide a clear reason for your analysis.`;

    const userPrompt = `
Content to analyze:
${request.content}

${request.context ? `Additional context: ${request.context}` : ''}

Analyze this content and return a JSON response with this exact structure:
{
  "is_gambling": boolean,
  "confidence": number (0-1),
  "reason": "string explaining your analysis",
  "language": "detected language code (e.g., en, id, zh)",
  "categories": ["array of gambling categories"],
  "risk": "low|medium|high|critical"
}

Gambling categories: online-casino, sportsbook, poker, lottery, bingo, slots, live-casino, esports-betting, virtual-sports, fantasy-sports, betting-exchange, other.

Return ONLY the JSON object, no additional text.`;

    return `${systemPrompt}\n\n${userPrompt}`;
  }

  private async callAPI(prompt: string): Promise<string> {
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
              content: 'You are an expert at analyzing websites to determine if they are gambling-related.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: this.config.maxTokens,
          temperature: this.config.temperature,
        }),
        signal: AbortSignal.timeout(this.config.timeout),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error) {
      console.error('AI API call failed:', error);
      throw error;
    }
  }

  private parseResponse(response: string): AIAnalysis {
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
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }

    // Fallback to default analysis
    return {
      isGambling: false,
      confidence: 0,
      reason: 'Failed to parse AI response',
      language: 'en',
      categories: [],
      risk: 'low',
      analyzedAt: new Date(),
    };
  }

  getStats(): { requestCount: number; lastRequestTime: number } {
    return {
      requestCount: this.requestCount,
      lastRequestTime: this.lastRequestTime,
    };
  }
}

export function createAIAnalyzer(config?: Partial<AIConfig>): AIAnalyzer {
  return new AIAnalyzer(config);
}