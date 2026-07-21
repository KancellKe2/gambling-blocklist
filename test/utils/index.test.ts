import { describe, expect, it } from 'vitest';
import {
  calculateSimilarity,
  chunkArray,
  extractDomain,
  extractKeywords,
  formatDate,
  generateId,
  isExternalLink,
  isSameDomain,
  isValidDomain,
  isValidUrl,
  normalizeUrl,
  sanitizeFilename,
} from '../../src/utils';

describe('Utility Functions', () => {
  describe('extractDomain', () => {
    it('should extract domain from URL', () => {
      expect(extractDomain('https://example.com/path')).toBe('example.com');
      expect(extractDomain('http://sub.example.com')).toBe('sub.example.com');
      expect(extractDomain('https://example.com:8080')).toBe('example.com');
    });

    it('should handle invalid URLs', () => {
      expect(extractDomain('invalid-url')).toBe('invalid-url');
      expect(extractDomain('example.com')).toBe('example.com');
    });
  });

  describe('isSameDomain', () => {
    it('should return true for same domains', () => {
      expect(isSameDomain('https://example.com', 'https://example.com/path')).toBe(true);
      expect(isSameDomain('http://example.com', 'https://example.com')).toBe(true);
    });

    it('should return false for different domains', () => {
      expect(isSameDomain('https://example.com', 'https://other.com')).toBe(false);
    });
  });

  describe('normalizeUrl', () => {
    it('should normalize URLs', () => {
      expect(normalizeUrl('https://example.com/path/')).toBe('https://example.com/path');
      expect(normalizeUrl('https://example.com')).toBe('https://example.com');
    });
  });

  describe('isExternalLink', () => {
    it('should identify external links', () => {
      expect(isExternalLink('https://other.com', 'https://example.com')).toBe(true);
      expect(isExternalLink('https://example.com/path', 'https://example.com')).toBe(false);
    });

    it('should respect internal domains', () => {
      expect(
        isExternalLink('https://cdn.example.com', 'https://example.com', ['example.com'])
      ).toBe(false);
    });
  });

  describe('calculateSimilarity', () => {
    it('should calculate similarity between texts', () => {
      const text1 = 'hello world foo bar';
      const text2 = 'hello world baz qux';
      const similarity = calculateSimilarity(text1, text2);
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThan(1);
    });

    it('should return 0 for empty texts', () => {
      expect(calculateSimilarity('', '')).toBe(0);
    });
  });

  describe('extractKeywords', () => {
    it('should extract keywords from text', () => {
      const text = 'This is a sample text for keyword extraction';
      const keywords = extractKeywords(text);
      expect(keywords.length).toBeGreaterThan(0);
      expect(keywords).toContain('sample');
      expect(keywords).toContain('text');
    });
  });

  describe('chunkArray', () => {
    it('should chunk arrays', () => {
      const array = [1, 2, 3, 4, 5, 6, 7];
      const chunks = chunkArray(array, 3);
      expect(chunks).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });
  });

  describe('formatDate', () => {
    it('should format dates', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      expect(formatDate(date)).toBe('2024-01-15');
    });
  });

  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(id1.length).toBeGreaterThan(0);
    });
  });

  describe('isValidDomain', () => {
    it('should validate domains', () => {
      expect(isValidDomain('example.com')).toBe(true);
      expect(isValidDomain('sub.example.com')).toBe(true);
      expect(isValidDomain('invalid-domain')).toBe(false);
      expect(isValidDomain('example')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('should validate URLs', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://example.com/path')).toBe(true);
      expect(isValidUrl('invalid-url')).toBe(false);
    });
  });

  describe('sanitizeFilename', () => {
    it('should sanitize filenames', () => {
      expect(sanitizeFilename('Hello World!')).toBe('hello-world');
      expect(sanitizeFilename('file-name_123.txt')).toBe('file-name-123-txt');
    });
  });
});