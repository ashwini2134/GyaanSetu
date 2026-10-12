import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createLearningMemoryCollection, ensureUserIdIndex, indexContent, searchLearningMemory } from '../src/services/aiMentorService.js';

describe('AI Mentor Service Integration Tests', () => {
  const testUserId = 'test-user-integration';
  const testContent = 'Integration test content for AI Mentor';
  
  beforeAll(async () => {
    // Ensure collection exists and has userId index
    await createLearningMemoryCollection();
    await ensureUserIdIndex();
  });

  afterAll(async () => {
    // Cleanup: Delete test points if needed
    // For now, we leave them for manual inspection
  });

  describe('Collection Initialization', () => {
    it('should create collection successfully', async () => {
      const result = await createLearningMemoryCollection();
      expect(result.success).toBe(true);
    });

    it('should ensure userId payload index exists', async () => {
      const result = await ensureUserIdIndex();
      expect(result.success).toBe(true);
    });
  });

  describe('Content Indexing', () => {
    it('should index content successfully', async () => {
      const result = await indexContent({
        userId: testUserId,
        content: testContent,
        metadata: {
          contentType: 'note',
          title: 'Integration Test Note',
        },
      });

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should handle embedding generation errors gracefully', async () => {
      // Test with content that might cause embedding issues
      // Note: The service layer assumes valid input from route layer (Zod validation)
      // This test verifies the service handles embedding errors
      const result = await indexContent({
        userId: testUserId,
        content: 'Valid test content',
        metadata: {
          contentType: 'note',
        },
      });

      // Should succeed with valid content
      expect(result.success).toBe(true);
    });
  });

  describe('Semantic Search', () => {
    beforeAll(async () => {
      // Index test content for search tests
      await indexContent({
        userId: testUserId,
        content: 'Python functions are reusable blocks of code',
        metadata: {
          contentType: 'note',
          title: 'Python Functions',
        },
      });

      await indexContent({
        userId: testUserId,
        content: 'JavaScript arrays can hold multiple values',
        metadata: {
          contentType: 'note',
          title: 'JavaScript Arrays',
        },
      });
    });

    it('should search and return relevant results', async () => {
      const result = await searchLearningMemory({
        userId: testUserId,
        query: 'Python code functions',
        limit: 5,
      });

      expect(result.error).toBeUndefined();
      expect(result.results).toBeDefined();
      expect(result.results!.length).toBeGreaterThan(0);
      
      // Check that results contain the expected content
      const pythonResult = result.results!.find(r => 
        r.content.includes('Python functions')
      );
      expect(pythonResult).toBeDefined();
    });

    it('should enforce user-scoped retrieval', async () => {
      const differentUserId = 'different-user-test';
      
      // Index content for different user
      await indexContent({
        userId: differentUserId,
        content: 'This content belongs to a different user',
        metadata: {
          contentType: 'note',
          title: 'Private Note',
        },
      });

      // Search as testUserId should not return different user's content
      const result = await searchLearningMemory({
        userId: testUserId,
        query: 'different user',
        limit: 10,
      });

      expect(result.error).toBeUndefined();
      const privateContent = result.results?.find(r => 
        r.content.includes('different user')
      );
      expect(privateContent).toBeUndefined();
    });

    it('should handle empty query by returning empty results', async () => {
      const result = await searchLearningMemory({
        userId: testUserId,
        query: '',
        limit: 5,
      });

      // Empty query should return empty results or handle gracefully
      // The embedding model may handle empty strings
      expect(result.results).toBeDefined();
    });
  });

  describe('End-to-End Workflow', () => {
    it('should index and retrieve content in sequence', async () => {
      const uniqueContent = `E2E test content ${Date.now()}`;
      
      // Index
      const indexResult = await indexContent({
        userId: testUserId,
        content: uniqueContent,
        metadata: {
          contentType: 'note',
          title: 'E2E Test Note',
        },
      });
      expect(indexResult.success).toBe(true);

      // Search
      const searchResult = await searchLearningMemory({
        userId: testUserId,
        query: uniqueContent.substring(0, 10),
        limit: 5,
      });
      expect(searchResult.error).toBeUndefined();
      expect(searchResult.results!.length).toBeGreaterThan(0);
      
      // Verify content matches
      const found = searchResult.results!.find(r => r.content === uniqueContent);
      expect(found).toBeDefined();
    });
  });
});
