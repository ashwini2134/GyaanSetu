import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import { executeLyzrWorkflow, checkLyzrHealth } from '../src/services/aiMentorService.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Lyzr Workflow Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('Workflow Execution with Mocked API', () => {
    it('should handle response with output field (Format 1)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          output: {
            explanation: 'Test explanation',
            example: 'def test(): pass',
          },
        }),
      });

      const result = await executeLyzrWorkflow({
        input: { query: 'test', context: 'test context' },
      });

      expect(result.success).toBe(true);
      expect(result.result).toEqual({
        explanation: 'Test explanation',
        example: 'def test(): pass',
      });
    });

    it('should handle response with result field (Format 2)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          result: {
            answer: 'Test answer',
            confidence: 0.95,
          },
        }),
      });

      const result = await executeLyzrWorkflow({
        input: { query: 'test', context: 'test context' },
      });

      expect(result.success).toBe(true);
      expect(result.result).toEqual({
        answer: 'Test answer',
        confidence: 0.95,
      });
    });

    it('should handle direct response object (Format 3)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          explanation: 'Direct response',
          key_concepts: ['concept1', 'concept2'],
        }),
      });

      const result = await executeLyzrWorkflow({
        input: { query: 'test', context: 'test context' },
      });

      expect(result.success).toBe(true);
      expect(result.result).toEqual({
        explanation: 'Direct response',
        key_concepts: ['concept1', 'concept2'],
      });
    });

    it('should handle empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      const result = await executeLyzrWorkflow({
        input: { query: 'test', context: 'test context' },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('no output');
      expect(result.errorType).toBe('upstream');
    });

    it('should handle null response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      });

      const result = await executeLyzrWorkflow({
        input: { query: 'test', context: 'test context' },
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('no output');
    });

    it('should handle 401 authentication error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      const result = await executeLyzrWorkflow({
        input: { query: 'test', context: 'test context' },
      });

      expect(result.error).toBeDefined();
      expect(result.errorType).toBe('auth');
      expect(result.error).toContain('authentication failed');
    });

    it('should handle 404 workflow not found error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: async () => 'Workflow not found',
      });

      const result = await executeLyzrWorkflow({
        input: { query: 'test', context: 'test context' },
      });

      expect(result.error).toBeDefined();
      expect(result.errorType).toBe('workflow_not_found');
      expect(result.error).toContain('workflow not found');
    });

    it('should handle 400 invalid input error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Invalid input schema',
      });

      const result = await executeLyzrWorkflow({
        input: { query: 'test', context: 'test context' },
      });

      expect(result.error).toBeDefined();
      expect(result.errorType).toBe('invalid_input');
      expect(result.error).toContain('Invalid input');
    });

    it('should handle 429 rate limit error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        text: async () => 'Rate limit exceeded',
      });

      const result = await executeLyzrWorkflow({
        input: { query: 'test', context: 'test context' },
      });

      expect(result.error).toBeDefined();
      expect(result.errorType).toBe('rate_limit');
      expect(result.error).toContain('rate limit');
    });

    it('should handle 500 server error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: async () => 'Internal server error',
      });

      const result = await executeLyzrWorkflow({
        input: { query: 'test', context: 'test context' },
      });

      expect(result.error).toBeDefined();
      expect(result.errorType).toBe('upstream');
      expect(result.error).toContain('server error');
    });

    it('should handle timeout', async () => {
      mockFetch.mockImplementationOnce(() => {
        return new Promise((_, reject) => {
          // Simulate AbortError immediately
          const error = new Error('AbortError');
          error.name = 'AbortError';
          reject(error);
        });
      });

      const result = await executeLyzrWorkflow({
        input: { query: 'test', context: 'test context' },
      });

      expect(result.error).toBeDefined();
      expect(result.errorType).toBe('timeout');
      expect(result.error).toContain('timed out');
    });

    it('should send correct request format to Lyzr API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ output: { result: 'success' } }),
      });

      await executeLyzrWorkflow({
        input: { query: 'test query', context: 'test context' },
      });

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const callArgs = mockFetch.mock.calls[0];
      expect(callArgs[0]).toContain('/workflows/');
      expect(callArgs[1]).toMatchObject({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      });
      expect(callArgs[1].body).toContain('input_data');
    });
  });

  describe('Error Message Safety', () => {
    it('should not expose API keys in error messages', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      const result = await executeLyzrWorkflow({
        input: { query: 'test', context: 'test context' },
      });

      if (result.error) {
        // Error should not contain the actual API key from config
        expect(result.error).not.toContain(process.env.LYZR_API_KEY || '');
      }
    });

    it('should provide user-friendly error messages', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      const result = await executeLyzrWorkflow({
        input: { query: 'test', context: 'test context' },
      });

      expect(result.error).toBeDefined();
      expect(result.error!.length).toBeGreaterThan(10);
    });
  });
});
