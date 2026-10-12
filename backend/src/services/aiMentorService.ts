import { QdrantClient } from '@qdrant/js-client-rest';
import { pipeline, env } from '@xenova/transformers';
import { config } from '../config.js';
import { prisma } from '../prisma.js';
import { extractAllCoursesContent, type ExtractedContent } from '../lib/courseContentExtractor.js';

// Configure transformers to use local cache
env.allowLocalModels = true;
env.allowRemoteModels = true;

// Vector dimensions for Xenova/all-MiniLM-L6-v2
const EMBEDDING_DIMENSIONS = 384;

// Lazy-load the embedding pipeline
let embeddingPipeline: any = null;

async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    try {
      console.log('[AI Mentor] Loading local embedding model (Xenova/all-MiniLM-L6-v2)...');
      embeddingPipeline = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      console.log('[AI Mentor] Embedding model loaded successfully');
    } catch (error) {
      console.error('[AI Mentor] Failed to load embedding model:', error);
      throw error;
    }
  }
  return embeddingPipeline;
}

/**
 * AI Mentor Service
 * Integrates Qdrant (vector DB), Lyzr (AI agents), and Omi (voice/conversations)
 * for the GyanSetu AI Learning Assistant feature.
 */

// ============================================================================
// QDRANT CLIENT
// ============================================================================

let qdrantClient: QdrantClient | null = null;

function getQdrantClient(): QdrantClient | null {
  if (!config.aiMentor.qdrantUrl) {
    return null;
  }
  if (!qdrantClient) {
    const isHttps = config.aiMentor.qdrantUrl.startsWith('https://');
    qdrantClient = new QdrantClient({
      url: config.aiMentor.qdrantUrl,
      apiKey: config.aiMentor.qdrantApiKey || undefined,
      port: isHttps ? 443 : undefined,
    });
  }
  return qdrantClient;
}

/**
 * Check Qdrant connectivity
 * Returns connection status without exposing secrets
 */
export async function checkQdrantHealth(): Promise<{
  connected: boolean;
  error?: string;
  collectionExists?: boolean;
}> {
  try {
    const client = getQdrantClient();
    if (!client) {
      return { connected: false, error: 'QDRANT_URL not configured' };
    }

    const collections = await client.getCollections();
    console.log(`[AI Mentor Health] Available collections:`, collections.collections.map(c => c.name));
    const collectionExists = collections.collections.some(
      (c) => c.name === config.aiMentor.qdrantCollectionName
    );
    console.log(`[AI Mentor Health] Looking for collection: ${config.aiMentor.qdrantCollectionName}, exists: ${collectionExists}`);

    return { connected: true, collectionExists };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[AI Mentor Health] Error checking collections:`, message);
    return { connected: false, error: message };
  }
}

/**
 * Ensure userId payload index exists for filtering
 * Idempotent - safe to call multiple times
 */
export async function ensureUserIdIndex(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const client = getQdrantClient();
    if (!client) {
      return { success: false, error: 'Qdrant client not initialized' };
    }

    console.log(`[AI Mentor] Ensuring userId payload index exists for collection: ${config.aiMentor.qdrantCollectionName}`);
    
    await client.createPayloadIndex(config.aiMentor.qdrantCollectionName, {
      field_name: 'userId',
      field_schema: 'keyword',
    });
    
    console.log(`[AI Mentor] userId payload index created successfully`);
    return { success: true };
  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error);
    // Index might already exist - that's OK
    if (message.includes('already exists') || error?.status === 409 || error?.response?.status === 409) {
      console.log(`[AI Mentor] userId payload index already exists`);
      return { success: true };
    }
    console.error(`[AI Mentor] Failed to create userId index:`, message);
    return { success: false, error: `Failed to create userId index: ${message}` };
  }
}

/**
 * Create Qdrant collection for LMS learning memory
 * Uses user-scoped payloads to ensure privacy
 */
export async function createLearningMemoryCollection(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const client = getQdrantClient();
    if (!client) {
      return { success: false, error: 'Qdrant client not initialized' };
    }

    console.log(`[AI Mentor] Creating collection: ${config.aiMentor.qdrantCollectionName} with dimensions: ${EMBEDDING_DIMENSIONS}`);
    
    const collectionConfig = {
      vectors: {
        size: EMBEDDING_DIMENSIONS,
        distance: 'Cosine' as const,
      },
    };
    
    console.log(`[AI Mentor] Collection config:`, JSON.stringify(collectionConfig));
    
    await client.createCollection(config.aiMentor.qdrantCollectionName, collectionConfig);

    console.log(`[AI Mentor] Collection created successfully`);
    
    // Create userId payload index
    await ensureUserIdIndex();
    
    return { success: true };
  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[AI Mentor] Collection creation error:`, message);
    console.error(`[AI Mentor] Full error:`, JSON.stringify(error, null, 2));
    
    // Collection might already exist
    if (message.includes('already exists') || error?.status === 409 || error?.response?.status === 409) {
      console.log(`[AI Mentor] Collection already exists (409 Conflict), ensuring userId index exists`);
      
      // Ensure userId index exists on existing collection
      await ensureUserIdIndex();
      
      return { success: true };
    }
    return { success: false, error: `Failed to create collection: ${message}` };
  }
}

/**
 * Embed text using local model (Xenova/all-MiniLM-L6-v2)
 * Runs locally, no API key required
 */
export async function embedText(text: string): Promise<{
  vector?: number[];
  error?: string;
}> {
  try {
    console.log(`[AI Mentor] Loading embedding pipeline for text length: ${text.length}`);
    const pipeline = await getEmbeddingPipeline();
    
    console.log('[AI Mentor] Generating embedding for text...');
    const output = await pipeline(text, {
      pooling: 'mean',
      normalize: true,
    });
    
    // Convert tensor to array
    const vector = Array.from(output.data) as number[];
    
    console.log(`[AI Mentor] Embedding generated, dimensions: ${vector.length}`);
    
    if (vector.length !== EMBEDDING_DIMENSIONS) {
      throw new Error(`Embedding dimension mismatch: expected ${EMBEDDING_DIMENSIONS}, got ${vector.length}`);
    }
    
    console.log('[AI Mentor] Embedding generated successfully');
    return { vector };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[AI Mentor] Embedding generation failed:', message, error);
    return { error: message };
  }
}

/**
 * Index course content into Qdrant
 * User-scoped: only the indexing user can retrieve their own data
 */
export async function indexContent(params: {
  userId: string;
  content: string;
  pointId?: number;
  metadata: {
    contentType: 'course' | 'lecture' | 'note' | 'conversation' | 'section' | 'block' | 'voice_memory';
    courseId?: string;
    lectureId?: string;
    title?: string;
    isGlobal?: boolean;
    [key: string]: any;
  };
}): Promise<{
  success: boolean;
  error?: string;
}> {
  const startTime = Date.now();
  console.log(`[STEP 1/4 - INDEX] Starting index for userId: ${params.userId.substring(0, 8)}...`);
  console.log(`[STEP 1/4 - INDEX] Content type: ${params.metadata.contentType}, length: ${params.content.length}`);
  
  try {
    const client = getQdrantClient();
    if (!client) {
      console.error(`[STEP 1/4 - INDEX] ❌ Qdrant client not initialized`);
      return { success: false, error: 'Qdrant client not initialized - check QDRANT_URL configuration' };
    }

    console.log(`[STEP 1/4 - INDEX] Generating embedding for content length: ${params.content.length}`);
    const { vector, error: embedError } = await embedText(params.content);
    if (embedError) {
      console.error(`[STEP 1/4 - INDEX] ❌ Embedding failed:`, embedError);
      return { success: false, error: `Embedding generation failed: ${embedError}` };
    }
    
    console.log(`[STEP 1/4 - INDEX] ✓ Embedding generated successfully, dimensions: ${vector?.length}`);
    
    // Validate vector
    if (!vector || vector.length !== EMBEDDING_DIMENSIONS) {
      console.error(`[STEP 1/4 - INDEX] ❌ Invalid vector dimensions: expected ${EMBEDDING_DIMENSIONS}, got ${vector?.length}`);
      return { success: false, error: `Invalid embedding dimensions: expected ${EMBEDDING_DIMENSIONS}, got ${vector?.length}` };
    }
    
    // Check for NaN or infinite values
    const hasInvalidValues = vector.some(v => !Number.isFinite(v));
    if (hasInvalidValues) {
      console.error(`[STEP 1/4 - INDEX] ❌ Vector contains invalid values (NaN or infinite)`);
      return { success: false, error: 'Embedding contains invalid values (NaN or infinite)' };
    }

    const pointId = params.pointId || Date.now();
    console.log(`[STEP 1/4 - INDEX] Upserting point ${pointId} to collection: ${config.aiMentor.qdrantCollectionName}`);
    
    const upsertPayload = {
      points: [
        {
          id: pointId,
          vector: vector,
          payload: {
            userId: params.userId,
            content: params.content,
            ...params.metadata,
            indexedAt: new Date().toISOString(),
          },
        },
      ],
    };
    
    try {
      const upsertUrl = `${config.aiMentor.qdrantUrl}/collections/${config.aiMentor.qdrantCollectionName}/points`;
      const upsertBody = {
        points: [
          {
            id: pointId,
            vector: vector,
            payload: {
              userId: params.userId,
              content: params.content,
              ...params.metadata,
              indexedAt: new Date().toISOString(),
            },
          },
        ],
      };
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (config.aiMentor.qdrantApiKey) {
        headers['api-key'] = config.aiMentor.qdrantApiKey;
      }
      
      console.log(`[STEP 1/4 - INDEX] Sending HTTP upsert to Qdrant`);
      const response = await fetch(upsertUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify(upsertBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[STEP 1/4 - INDEX] ❌ HTTP upsert failed:`, response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const duration = Date.now() - startTime;
      console.log(`[STEP 1/4 - INDEX] ✓ Upsert successful in ${duration}ms`);
    } catch (qdrantError: any) {
      console.error(`[STEP 1/4 - INDEX] ❌ Qdrant upsert error:`, JSON.stringify(qdrantError, null, 2));
      
      if (qdrantError?.message?.includes('not found') || qdrantError?.status === 404 || qdrantError?.response?.status === 404) {
        console.error(`[STEP 1/4 - INDEX] Collection does not exist, attempting to create it`);
        const createResult = await createLearningMemoryCollection();
        if (createResult.success) {
          console.log(`[STEP 1/4 - INDEX] Collection created, retrying upsert`);
          try {
            await client.upsert(config.aiMentor.qdrantCollectionName, upsertPayload);
            console.log(`[STEP 1/4 - INDEX] ✓ Retry upsert successful`);
            return { success: true };
          } catch (retryError: any) {
            console.error(`[STEP 1/4 - INDEX] ❌ Retry upsert failed:`, JSON.stringify(retryError, null, 2));
            const retryMessage = retryError instanceof Error ? retryError.message : String(retryError);
            return { success: false, error: `Qdrant upsert failed after collection creation: ${retryMessage}` };
          }
        } else {
          return { 
            success: false, 
            error: `Qdrant collection '${config.aiMentor.qdrantCollectionName}' does not exist and creation failed: ${createResult.error}` 
          };
        }
      }
      
      const qdrantMessage = qdrantError instanceof Error ? qdrantError.message : String(qdrantError);
      return { success: false, error: `Qdrant upsert failed: ${qdrantMessage}` };
    }

    const totalDuration = Date.now() - startTime;
    console.log(`[STEP 1/4 - INDEX] ✓ Index completed successfully in ${totalDuration}ms`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[STEP 1/4 - INDEX] ❌ Unexpected error:`, message, error);
    return { success: false, error: `Indexing failed: ${message}` };
  }
}

/**
 * Semantic search in learning memory
 * Retrieves content scoped to the requesting user and platform learning materials
 */
export async function searchLearningMemory(params: {
  userId: string;
  query: string;
  limit?: number;
  courseId?: string;
  contentType?: string;
}): Promise<{
  results?: Array<{
    content: string;
    metadata: any;
    score: number;
  }>;
  error?: string;
}> {
  const startTime = Date.now();
  console.log(`[STEP 2/4 - SEARCH] Starting search for userId: ${params.userId.substring(0, 8)}...`);
  console.log(`[STEP 2/4 - SEARCH] Query: "${params.query.substring(0, 50)}..."`);

  if (!params.query || !params.query.trim()) {
    return { results: [] };
  }
  
  try {
    const client = getQdrantClient();
    if (!client) {
      console.error(`[STEP 2/4 - SEARCH] ❌ Qdrant client not initialized`);
      return { error: 'Qdrant client not initialized' };
    }

    console.log(`[STEP 2/4 - SEARCH] Generating embedding for query`);
    const { vector, error: embedError } = await embedText(params.query);
    if (embedError) {
      console.error(`[STEP 2/4 - SEARCH] ❌ Embedding failed:`, embedError);
      return { error: embedError };
    }
    
    console.log(`[STEP 2/4 - SEARCH] ✓ Embedding generated, dimensions: ${vector?.length}`);
    
    // Validate vector
    if (!vector || vector.length !== EMBEDDING_DIMENSIONS) {
      console.error(`[STEP 2/4 - SEARCH] ❌ Invalid vector dimensions: expected ${EMBEDDING_DIMENSIONS}, got ${vector?.length}`);
      return { error: `Invalid embedding dimensions: expected ${EMBEDDING_DIMENSIONS}, got ${vector?.length}` };
    }
    
    // Check for NaN or infinite values
    const hasInvalidValues = vector.some(v => !Number.isFinite(v));
    if (hasInvalidValues) {
      console.error(`[STEP 2/4 - SEARCH] ❌ Vector contains invalid values (NaN or infinite)`);
      return { error: 'Embedding contains invalid values (NaN or infinite)' };
    }

    // Build filter: allow user's personal memories OR platform learning content
    const userOrGlobalConditions: any[] = [
      { key: 'userId', match: { value: params.userId } },
      { key: 'userId', match: { value: 'system' } },
      { key: 'userId', match: { value: 'global' } },
      { key: 'isGlobal', match: { value: true } },
    ];

    const filter: Record<string, any> = {
      should: userOrGlobalConditions,
    };

    const mustConditions: any[] = [];
    if (params.courseId) {
      mustConditions.push({ key: 'courseId', match: { value: params.courseId } });
    }
    if (params.contentType) {
      mustConditions.push({ key: 'contentType', match: { value: params.contentType } });
    }
    if (mustConditions.length > 0) {
      filter.must = mustConditions;
    }

    try {
      const searchUrl = `${config.aiMentor.qdrantUrl}/collections/${config.aiMentor.qdrantCollectionName}/points/search`;
      const searchBody = {
        vector: vector,
        limit: params.limit || 5,
        with_payload: true,
        filter,
      };
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (config.aiMentor.qdrantApiKey) {
        headers['api-key'] = config.aiMentor.qdrantApiKey;
      }
      
      console.log(`[STEP 2/4 - SEARCH] Sending HTTP search to Qdrant`);
      const response = await fetch(searchUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(searchBody),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[STEP 2/4 - SEARCH] ❌ HTTP search failed:`, response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const searchResult = await response.json();
      const resultCount = searchResult.result?.length || 0;
      console.log(`[STEP 2/4 - SEARCH] ✓ Search successful, found ${resultCount} results`);

      const results = (searchResult.result || []).map((result: any) => ({
        content: (result.payload?.content as string) || '',
        metadata: {
          contentType: result.payload?.contentType,
          courseId: result.payload?.courseId,
          lectureId: result.payload?.lectureId,
          title: result.payload?.title,
        },
        score: result.score || 0,
      }));

      const duration = Date.now() - startTime;
      console.log(`[STEP 2/4 - SEARCH] ✓ Search completed in ${duration}ms`);
      return { results };
    } catch (qdrantError: any) {
      console.error(`[STEP 2/4 - SEARCH] ❌ Qdrant search error:`, JSON.stringify(qdrantError, null, 2));
      
      if (qdrantError?.message?.includes('not found') || qdrantError?.status === 404 || qdrantError?.response?.status === 404) {
        return { 
          error: `Qdrant collection '${config.aiMentor.qdrantCollectionName}' does not exist. Index some content first to create it automatically.` 
        };
      }
      
      const qdrantMessage = qdrantError instanceof Error ? qdrantError.message : String(qdrantError);
      return { error: `Qdrant search failed: ${qdrantMessage}` };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[STEP 2/4 - SEARCH] ❌ Unexpected error:`, message, error);
    return { error: `Search failed: ${message}` };
  }
}

// ============================================================================
// LYZR AI AGENT ORCHESTRATION
// ============================================================================

/**
 * Check Lyzr configuration status
 * Does not expose secrets
 */
export function checkLyzrHealth(): {
  configured: boolean;
  workflowConfigured: boolean;
  agentConfigured: boolean;
  error?: string;
} {
  if (!config.aiMentor.lyzrApiKey) {
    return {
      configured: false,
      workflowConfigured: false,
      agentConfigured: false,
      error: 'LYZR_API_KEY not configured',
    };
  }

  const workflowConfigured = !!config.aiMentor.lyzrWorkflowId;
  const agentConfigured = !!config.aiMentor.lyzrAgentId;

  if (!workflowConfigured && !agentConfigured) {
    return {
      configured: true,
      workflowConfigured: false,
      agentConfigured: false,
      error: 'Neither LYZR_WORKFLOW_ID nor LYZR_AGENT_ID configured - requires manual setup in Lyzr Studio',
    };
  }

  return {
    configured: true,
    workflowConfigured,
    agentConfigured,
  };
}

/**
 * Execute Lyzr workflow
 * Requires LYZR_API_KEY and LYZR_WORKFLOW_ID to be configured
 * Based on official Lyzr documentation: POST /v3/workflows/{flow_id}/execute
 * API Docs: https://docs.lyzr.ai/agent-apis/orchestration/execute-workflow-endpoint
 */
export async function executeLyzrWorkflow(params: {
  input: Record<string, any>;
}): Promise<{
  success?: boolean;
  result?: any;
  error?: string;
  errorType?: 'config' | 'auth' | 'invalid_input' | 'workflow_not_found' | 'rate_limit' | 'timeout' | 'upstream';
  rawResponse?: any;
}> {
  const health = checkLyzrHealth();
  if (!health.configured) {
    return { error: health.error, errorType: 'config' };
  }
  if (!health.workflowConfigured) {
    return { error: 'LYZR_WORKFLOW_ID not configured', errorType: 'config' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const response = await fetch(
      `https://agent-prod.studio.lyzr.ai/v3/workflows/${config.aiMentor.lyzrWorkflowId}/execute`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.aiMentor.lyzrApiKey,
        },
        body: JSON.stringify({
          input_data: params.input,
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI Mentor Lyzr Workflow] HTTP error ${response.status}:`, errorText);
      
      // Categorize errors based on status code
      if (response.status === 401) {
        return { error: 'Lyzr API authentication failed. Check LYZR_API_KEY configuration.', errorType: 'auth' };
      }
      if (response.status === 404) {
        return { error: 'Lyzr workflow not found. Check LYZR_WORKFLOW_ID configuration.', errorType: 'workflow_not_found' };
      }
      if (response.status === 400) {
        return { error: `Invalid input to Lyzr workflow: ${errorText}`, errorType: 'invalid_input' };
      }
      if (response.status === 429) {
        return { error: 'Lyzr API rate limit exceeded. Please try again later.', errorType: 'rate_limit' };
      }
      if (response.status >= 500) {
        return { error: 'Lyzr API server error. Please try again later.', errorType: 'upstream' };
      }
      
      return { error: `Lyzr API error (${response.status}): ${errorText}`, errorType: 'upstream' };
    }

    const result = await response.json();
    console.log(`[AI Mentor Lyzr Workflow] Response structure:`, JSON.stringify({
      hasResult: !!result,
      hasOutput: !!result?.output,
      hasStatus: !!result?.status,
      keys: Object.keys(result || {}),
      topLevelKeys: Object.keys(result || {}).slice(0, 5),
    }));
    
    // Handle different Lyzr response formats
    // Format 1: { status: "success", output: {...} }
    // Format 2: { result: {...} }
    // Format 3: Direct response object
    let finalResult = result;
    
    if (result?.output) {
      finalResult = result.output;
    } else if (result?.result) {
      finalResult = result.result;
    }
    
    // Check if the result is empty or null
    if (!finalResult || (typeof finalResult === 'object' && Object.keys(finalResult).length === 0)) {
      console.warn('[AI Mentor Lyzr Workflow] Response is empty or null');
      return { 
        success: false, 
        error: 'Lyzr workflow executed but returned no output. Check workflow configuration.',
        errorType: 'upstream',
        rawResponse: result 
      };
    }
    
    return { success: true, result: finalResult };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { error: 'Lyzr workflow execution timed out after 30 seconds.', errorType: 'timeout' };
    }
    
    const message = error instanceof Error ? error.message : String(error);
    console.error('[AI Mentor Lyzr Workflow] Execution error:', message);
    
    // Don't expose detailed error messages that might contain API keys
    if (message.includes('fetch') || message.includes('network')) {
      return { error: 'Failed to connect to Lyzr API. Check network connectivity.', errorType: 'upstream' };
    }
    
    return { error: `Lyzr workflow execution failed: ${message}`, errorType: 'upstream' };
  }
}

/**
 * Execute Lyzr agent chat
 * Requires LYZR_API_KEY and LYZR_AGENT_ID to be configured
 * Based on hackathon PDF: POST /v3/inference/chat/
 * This is the agent chat API, different from the workflow execution API
 */
export async function executeLyzrAgentChat(params: {
  userId: string;
  sessionId: string;
  message: string; // Should contain CONTEXT and QUESTION
}): Promise<{
  success?: boolean;
  response?: string;
  error?: string;
  errorType?: 'config' | 'auth' | 'invalid_input' | 'agent_not_found' | 'rate_limit' | 'timeout' | 'upstream';
  rawResponse?: any;
}> {
  const startTime = Date.now();
  console.log(`[STEP 3/4 - LYZR] Calling agent chat API for user ${params.userId.substring(0, 8)}...`);
  console.log(`[STEP 3/4 - LYZR] Session: ${params.sessionId}`);
  console.log(`[STEP 3/4 - LYZR] Message length: ${params.message.length}`);
  
  const health = checkLyzrHealth();
  if (!health.configured) {
    console.error(`[STEP 3/4 - LYZR] ❌ Lyzr not configured`);
    return { error: health.error, errorType: 'config' };
  }
  if (!health.agentConfigured) {
    console.error(`[STEP 3/4 - LYZR] ❌ Agent ID not configured`);
    return { error: 'LYZR_AGENT_ID not configured', errorType: 'config' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout per PDF
    
    console.log(`[STEP 3/4 - LYZR] Sending request to Lyzr API`);
    
    const response = await fetch(
      'https://agent-prod.studio.lyzr.ai/v3/inference/chat/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': config.aiMentor.lyzrApiKey,
        },
        body: JSON.stringify({
          user_id: params.userId,
          agent_id: config.aiMentor.lyzrAgentId,
          session_id: params.sessionId,
          message: params.message,
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[STEP 3/4 - LYZR] ❌ HTTP error ${response.status}:`, errorText);
      
      if (response.status === 401) {
        return { error: 'Lyzr API authentication failed. Check LYZR_API_KEY configuration.', errorType: 'auth' };
      }
      if (response.status === 404) {
        return { error: 'Lyzr agent not found. Check LYZR_AGENT_ID configuration.', errorType: 'agent_not_found' };
      }
      if (response.status === 400) {
        return { error: `Invalid input to Lyzr agent: ${errorText}`, errorType: 'invalid_input' };
      }
      if (response.status === 429) {
        return { error: 'Lyzr API rate limit exceeded. Please try again later.', errorType: 'rate_limit' };
      }
      if (response.status >= 500) {
        return { error: 'Lyzr API server error. Please try again later.', errorType: 'upstream' };
      }
      
      return { error: `Lyzr API error (${response.status}): ${errorText}`, errorType: 'upstream' };
    }

    const result = await response.json();
    console.log(`[STEP 3/4 - LYZR] ✓ Response received from Lyzr`);
    console.log(`[STEP 3/4 - LYZR] Response structure:`, JSON.stringify({
      hasResponse: !!result?.response,
      keys: Object.keys(result || {}),
    }));
    
    if (!result?.response) {
      console.warn('[STEP 3/4 - LYZR] ⚠ Response missing "response" field');
      return { 
        success: false, 
        error: 'Lyzr agent response missing "response" field. Check agent configuration.',
        errorType: 'upstream',
        rawResponse: result 
      };
    }
    
    const duration = Date.now() - startTime;
    console.log(`[STEP 3/4 - LYZR] ✓ Agent chat completed in ${duration}ms`);
    console.log(`[STEP 3/4 - LYZR] Response length: ${result.response.length}`);
    
    return { success: true, response: result.response };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error(`[STEP 3/4 - LYZR] ❌ Request timed out after 60 seconds`);
      return { error: 'Lyzr agent chat timed out after 60 seconds.', errorType: 'timeout' };
    }
    
    const message = error instanceof Error ? error.message : String(error);
    console.error('[STEP 3/4 - LYZR] ❌ Execution error:', message);
    
    if (message.includes('fetch') || message.includes('network')) {
      return { error: 'Failed to connect to Lyzr API. Check network connectivity.', errorType: 'upstream' };
    }
    
    return { error: `Lyzr agent chat failed: ${message}`, errorType: 'upstream' };
  }
}

// ============================================================================
// OMI USER MAPPING
// ============================================================================

/**
 * Get userId from Omi uid using secure mapping
 * Returns null if no mapping exists or mapping is inactive
 */
export async function getUserIdFromOmiUid(omiUid: string): Promise<string | null> {
  try {
    console.log(`[Omi Mapping] Looking up userId for omiUid: ${omiUid.substring(0, 8)}...`);
    
    const mapping = await prisma.omiUserMapping.findUnique({
      where: { omiUid },
      select: { userId: true, isActive: true },
    });
    
    if (!mapping) {
      console.log(`[Omi Mapping] No mapping found for omiUid`);
      return null;
    }
    
    if (!mapping.isActive) {
      console.log(`[Omi Mapping] Mapping exists but is inactive for omiUid`);
      return null;
    }
    
    console.log(`[Omi Mapping] Found active mapping for userId: ${mapping.userId.substring(0, 8)}...`);
    return mapping.userId;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Omi Mapping] Error looking up mapping:', message);
    return null;
  }
}

/**
 * Link Omi uid to user account
 * Creates or updates the mapping
 */
export async function linkOmiUidToUser(params: {
  userId: string;
  omiUid: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log(`[Omi Mapping] Linking omiUid ${params.omiUid.substring(0, 8)}... to userId ${params.userId.substring(0, 8)}...`);
    
    await prisma.omiUserMapping.upsert({
      where: { omiUid: params.omiUid },
      update: {
        userId: params.userId,
        isActive: true,
        linkedAt: new Date(),
      },
      create: {
        userId: params.userId,
        omiUid: params.omiUid,
        isActive: true,
        linkedAt: new Date(),
      },
    });
    
    console.log(`[Omi Mapping] Successfully linked omiUid to userId`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Omi Mapping] Error linking omiUid:', message);
    return { success: false, error: `Failed to link Omi uid: ${message}` };
  }
}

/**
 * Unlink Omi uid from user account (deactivates mapping)
 */
export async function unlinkOmiUid(params: {
  userId: string;
  omiUid: string;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    console.log(`[Omi Mapping] Deactivating mapping for omiUid ${params.omiUid.substring(0, 8)}...`);
    
    const result = await prisma.omiUserMapping.updateMany({
      where: {
        omiUid: params.omiUid,
        userId: params.userId,
      },
      data: {
        isActive: false,
      },
    });
    
    if (result.count === 0) {
      return { success: false, error: 'No active mapping found' };
    }
    
    console.log(`[Omi Mapping] Successfully deactivated mapping`);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Omi Mapping] Error unlinking omiUid:', message);
    return { success: false, error: `Failed to unlink Omi uid: ${message}` };
  }
}

// ============================================================================
// OMI WEBHOOK PROCESSING
// ============================================================================

/**
 * Process Omi completed conversation webhook
 * Stores transcript segments in Qdrant with metadata
 */
export async function processOmiConversationWebhook(params: {
  uid: string; // Omi user identifier
  payload: any; // Omi webhook payload
}): Promise<{
  success: boolean;
  error?: string;
  pointsStored?: number;
}> {
  try {
    console.log('[Omi Processing] Processing conversation webhook for uid:', params.uid);
    
    // Secure mapping: look up userId from Omi uid
    const userId = await getUserIdFromOmiUid(params.uid);
    
    if (!userId) {
      console.warn('[Omi Processing] No active mapping found for omiUid, skipping webhook');
      return { success: false, error: 'No active user mapping for this Omi uid. Please link your Omi account first.' };
    }
    
    console.log(`[Omi Processing] Resolved to userId: ${userId.substring(0, 8)}...`);
    
    // Extract transcript segments from payload
    // Based on PDF: transcript_segments array
    const transcriptSegments = params.payload?.transcript_segments || [];
    
    if (!Array.isArray(transcriptSegments) || transcriptSegments.length === 0) {
      console.warn('[Omi Processing] No transcript segments found in payload');
      return { success: false, error: 'No transcript segments found' };
    }
    
    console.log(`[Omi Processing] Found ${transcriptSegments.length} transcript segments`);
    
    // Combine all segments into a single transcript for embedding
    const fullTranscript = transcriptSegments
      .map((seg: any) => seg?.text || '')
      .filter(Boolean)
      .join(' ');
    
    if (!fullTranscript.trim()) {
      return { success: false, error: 'Empty transcript after combining segments' };
    }
    
    // Embed the transcript
    const embedResult = await embedText(fullTranscript);
    if (!embedResult.vector) {
      return { success: false, error: embedResult.error || 'Failed to embed transcript' };
    }
    
    // Store in Qdrant with metadata
    const pointId = Date.now();
    const metadata = {
      source: 'omi_conversation',
      omiUid: params.uid,
      timestamp: new Date().toISOString(),
      segmentCount: transcriptSegments.length,
      sessionId: params.payload?.session_id,
    };
    
    const indexResult = await indexContent({
      userId,
      content: fullTranscript,
      metadata: {
        ...metadata,
        contentType: 'voice_memory',
      },
    });
    
    if (!indexResult.success) {
      return { success: false, error: indexResult.error };
    }
    
    console.log(`[Omi Processing] Successfully stored conversation memory for uid ${params.uid}`);
    return { success: true, pointsStored: 1 };
    
  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Omi Processing] Error:', message);
    return { success: false, error: `Failed to process conversation webhook: ${message}` };
  }
}

/**
 * Process Omi realtime transcript webhook
 * Stores realtime transcript segments in Qdrant with metadata
 */
export async function processOmiRealtimeWebhook(params: {
  uid: string;
  sessionId?: string;
  payload: any;
}): Promise<{
  success: boolean;
  error?: string;
  pointsStored?: number;
}> {
  try {
    console.log('[Omi Processing] Processing realtime webhook for uid:', params.uid);
    
    // Secure mapping: look up userId from Omi uid
    const userId = await getUserIdFromOmiUid(params.uid);
    
    if (!userId) {
      console.warn('[Omi Processing] No active mapping found for omiUid, skipping webhook');
      return { success: false, error: 'No active user mapping for this Omi uid. Please link your Omi account first.' };
    }
    
    console.log(`[Omi Processing] Resolved to userId: ${userId.substring(0, 8)}...`);
    
    // Extract segments from payload
    // Based on PDF: list or segments
    const segments = params.payload?.segments || params.payload || [];
    const segmentsArray = Array.isArray(segments) ? segments : [segments];
    
    if (segmentsArray.length === 0) {
      console.warn('[Omi Processing] No segments found in realtime payload');
      return { success: false, error: 'No segments found' };
    }
    
    console.log(`[Omi Processing] Found ${segmentsArray.length} realtime segments`);
    
    // Combine segments
    const transcript = segmentsArray
      .map((seg: any) => typeof seg === 'string' ? seg : seg?.text || '')
      .filter(Boolean)
      .join(' ');
    
    if (!transcript.trim()) {
      return { success: false, error: 'Empty transcript' };
    }
    
    // Embed and store
    const embedResult = await embedText(transcript);
    if (!embedResult.vector) {
      return { success: false, error: embedResult.error || 'Failed to embed transcript' };
    }
    
    const pointId = Date.now();
    const metadata = {
      source: 'omi_realtime',
      omiUid: params.uid,
      sessionId: params.sessionId,
      timestamp: new Date().toISOString(),
    };
    
    const indexResult = await indexContent({
      userId,
      content: transcript,
      metadata: {
        ...metadata,
        contentType: 'voice_memory',
      },
    });
    
    if (!indexResult.success) {
      return { success: false, error: indexResult.error };
    }
    
    console.log(`[Omi Processing] Successfully stored realtime memory for uid ${params.uid}`);
    return { success: true, pointsStored: 1 };
    
  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Omi Processing] Error:', message);
    return { success: false, error: `Failed to process realtime webhook: ${message}` };
  }
}

// ============================================================================
// MEMORY DELETION (User-scoped)
// ============================================================================

/**
 * Delete a specific memory point from Qdrant
 * Verifies user ownership before deletion
 */
export async function deleteMemoryPoint(params: {
  userId: string;
  pointId: number;
}): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const client = getQdrantClient();
    if (!client) {
      return { success: false, error: 'Qdrant client not initialized' };
    }
    
    // First, verify the point belongs to the user
    const retrieveUrl = `${config.aiMentor.qdrantUrl}/collections/${config.aiMentor.qdrantCollectionName}/points`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (config.aiMentor.qdrantApiKey) {
      headers['api-key'] = config.aiMentor.qdrantApiKey;
    }
    
    const response = await fetch(retrieveUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ids: [params.pointId], with_payload: true }),
    });
    
    if (!response.ok) {
      return { success: false, error: 'Failed to retrieve memory point' };
    }
    
    const result = await response.json();
    if (!result.result || result.result.length === 0) {
      return { success: false, error: 'Memory point not found' };
    }
    
    const point = result.result[0];
    const pointUserId = point.payload?.userId;
    
    if (pointUserId !== params.userId) {
      console.warn(`[Memory Deletion] User ${params.userId} attempted to delete point belonging to ${pointUserId}`);
      return { success: false, error: 'Unauthorized: memory point belongs to another user' };
    }
    
    // Delete the point
    const deleteUrl = `${config.aiMentor.qdrantUrl}/collections/${config.aiMentor.qdrantCollectionName}/points/delete`;
    await fetch(deleteUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ points: [params.pointId] }),
    });
    
    console.log(`[Memory Deletion] Successfully deleted point ${params.pointId} for user ${params.userId}`);
    return { success: true };
    
  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Memory Deletion] Error:', message);
    return { success: false, error: `Failed to delete memory point: ${message}` };
  }
}

/**
 * Delete memories by content/metadata filters (user-friendly "forget this")
 * Allows users to delete memories matching specific criteria
 */
export async function deleteMemoriesByFilter(params: {
  userId: string;
  contentType?: string;
  courseId?: string;
  lectureId?: string;
  source?: string;
  contentContains?: string; // Delete memories containing this text
}): Promise<{
  success: boolean;
  error?: string;
  deletedCount?: number;
}> {
  try {
    const client = getQdrantClient();
    if (!client) {
      return { success: false, error: 'Qdrant client not initialized' };
    }
    
    console.log(`[Memory Deletion] Filtering memories for user ${params.userId.substring(0, 8)}...`);
    
    // Build filter conditions
    const mustConditions: any[] = [
      { key: 'userId', match: { value: params.userId } },
    ];
    
    if (params.contentType) {
      mustConditions.push({ key: 'contentType', match: { value: params.contentType } });
    }
    
    if (params.courseId) {
      mustConditions.push({ key: 'courseId', match: { value: params.courseId } });
    }
    
    if (params.lectureId) {
      mustConditions.push({ key: 'lectureId', match: { value: params.lectureId } });
    }
    
    if (params.source) {
      mustConditions.push({ key: 'source', match: { value: params.source } });
    }
    
    // First, search for matching points to count them
    const searchUrl = `${config.aiMentor.qdrantUrl}/collections/${config.aiMentor.qdrantCollectionName}/points/scroll`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (config.aiMentor.qdrantApiKey) {
      headers['api-key'] = config.aiMentor.qdrantApiKey;
    }
    
    const scrollBody = {
      filter: { must: mustConditions },
      limit: 100, // Batch size
      with_payload: true,
    };
    
    const scrollResponse = await fetch(searchUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(scrollBody),
    });
    
    if (!scrollResponse.ok) {
      return { success: false, error: 'Failed to search for matching memories' };
    }
    
    const scrollResult = await scrollResponse.json();
    const points = scrollResult.result?.points || [];
    
    // Filter by contentContains if provided
    let pointsToDelete = points;
    if (params.contentContains) {
      pointsToDelete = points.filter((p: any) => 
        p.payload?.content?.toLowerCase().includes(params.contentContains!.toLowerCase())
      );
    }
    
    if (pointsToDelete.length === 0) {
      return { success: true, deletedCount: 0 };
    }
    
    const pointIds = pointsToDelete.map((p: any) => p.id);
    console.log(`[Memory Deletion] Found ${pointIds.length} matching memories to delete`);
    
    // Delete the points
    const deleteUrl = `${config.aiMentor.qdrantUrl}/collections/${config.aiMentor.qdrantCollectionName}/points/delete`;
    await fetch(deleteUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ points: pointIds }),
    });
    
    console.log(`[Memory Deletion] Successfully deleted ${pointIds.length} memories for user ${params.userId}`);
    return { success: true, deletedCount: pointIds.length };
    
  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[Memory Deletion] Error:', message);
    return { success: false, error: `Failed to delete memories: ${message}` };
  }
}

/**
 * Check Omi configuration status
 * Based on official Omi Developer API documentation
 */
export function checkOmiHealth(): {
  configured: boolean;
  error?: string;
} {
  if (!config.aiMentor.omiApiKey) {
    return {
      configured: false,
      error: 'OMI_API_KEY not configured',
    };
  }

  return {
    configured: true,
  };
}

/**
 * Retrieve conversations from Omi Developer API
 * Based on official docs: GET /v1/dev/user/conversations
 * Uses Bearer token authentication (not Firebase ID token for this endpoint)
 */
export async function getOmiConversations(params: {
  limit?: number;
  includeTranscript?: boolean;
}): Promise<{
  conversations?: any[];
  error?: string;
}> {
  const health = checkOmiHealth();
  if (!health.configured) {
    return { error: health.error };
  }

  try {
    const url = new URL('https://api.omi.me/v1/dev/user/conversations');
    if (params.limit) url.searchParams.set('limit', params.limit.toString());
    if (params.includeTranscript) {
      url.searchParams.set('include_transcript', 'true');
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${config.aiMentor.omiApiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      return { error: `Omi API error: ${error}` };
    }

    const data = await response.json();
    return { conversations: data.conversations || [] };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: message };
  }
}

/**
 * Create a conversation in Omi from transcript text
 * Based on official docs: POST /v1/dev/user/conversations
 */
export async function createOmiConversation(params: {
  text: string;
  textSource?: 'audio_transcript' | 'message' | 'other_text';
  language?: string;
}): Promise<{
  conversationId?: string;
  error?: string;
}> {
  const health = checkOmiHealth();
  if (!health.configured) {
    return { error: health.error };
  }

  try {
    const response = await fetch('https://api.omi.me/v1/dev/user/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.aiMentor.omiApiKey}`,
      },
      body: JSON.stringify({
        text: params.text,
        text_source: params.textSource || 'other_text',
        language: params.language || 'en',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return { error: `Omi API error: ${error}` };
    }

    const data = await response.json();
    return { conversationId: data.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { error: message };
  }
}

// ============================================================================
// STUDENT LEARNING WORKFLOW: Question → Retrieval → Lyzr Agent → Memory
// ============================================================================

/**
 * Primary student question-answer workflow
 * 1. Semantic search in Qdrant (retrieves real course materials + student memories)
 * 2. Builds context-grounded message for Lyzr agent
 * 3. Executes Lyzr Agent Chat
 * 4. Securely persists conversation to memory scoped to student
 */
export async function executeStudentAskWorkflow(params: {
  userId: string;
  query?: string;
  message?: string;
  sessionId?: string;
  courseId?: string;
  lectureId?: string;
}): Promise<{
  success: boolean;
  answer?: string;
  context: Array<{
    content: string;
    metadata: any;
    score: number;
  }>;
  retrievalStatus: {
    foundContent: boolean;
    count: number;
  };
  sessionId: string;
  error?: string;
}> {
  const startTime = Date.now();
  const sessionId = params.sessionId || `session-${Date.now()}`;
  const userQuery = (params.query || params.message || '').trim();
  console.log(`[AI Student Loop] Starting for user ${params.userId.substring(0, 8)}... Query: "${userQuery.substring(0, 40)}"`);

  // Step 1: Semantic search in Qdrant (retrieves course content + user memories)
  let contextSnippets: Array<{ content: string; metadata: any; score: number }> = [];
  try {
    const searchResult = await searchLearningMemory({
      userId: params.userId,
      query: userQuery,
      limit: 4,
      courseId: params.courseId,
    });
    if (searchResult.results && searchResult.results.length > 0) {
      // Relevance score threshold: keep only relevant matches
      contextSnippets = searchResult.results.filter(r => r.score >= 0.35);
    }
  } catch (searchErr) {
    console.warn('[AI Student Loop] Retrieval search warning:', searchErr);
  }

  const hasContext = contextSnippets.length > 0;
  console.log(`[AI Student Loop] Retrieved ${contextSnippets.length} relevant learning snippets (hasContext: ${hasContext})`);

  // Step 2: Build prompt with contextual grounding
  let messagePrompt = '';
  if (hasContext) {
    const contextText = contextSnippets
      .map((s, idx) => `[Source ${idx + 1} - ${s.metadata?.title || s.metadata?.contentType || 'Material'}]:\n${s.content}`)
      .join('\n\n');
    messagePrompt = `RELEVANT COURSE MATERIAL:\n${contextText}\n\nSTUDENT QUESTION: ${userQuery}\n\nPlease answer the student clearly using the course material above when helpful. If the material does not cover the question, provide an accurate educational explanation. Use clean Markdown formatting with headings and code examples where appropriate.`;
  } else {
    messagePrompt = `STUDENT QUESTION: ${userQuery}\n\nPlease answer the student clearly and supportively. Use clean Markdown formatting with headings and code examples where appropriate.`;
  }

  // Step 3: Call configured Lyzr agent
  const lyzrResult = await executeLyzrAgentChat({
    userId: params.userId,
    sessionId,
    message: messagePrompt,
  });

  if (lyzrResult.error || !lyzrResult.response) {
    return {
      success: false,
      error: lyzrResult.error || 'Failed to receive response from AI agent',
      context: contextSnippets,
      retrievalStatus: { foundContent: hasContext, count: contextSnippets.length },
      sessionId,
    };
  }

  // Step 4: Securely persist conversation memory in Qdrant for this student
  try {
    await indexContent({
      userId: params.userId,
      content: `Q: ${userQuery}\nA: ${lyzrResult.response.substring(0, 300)}...`,
      metadata: {
        contentType: 'conversation',
        courseId: params.courseId,
        lectureId: params.lectureId,
        title: `Question: ${userQuery.substring(0, 50)}`,
      },
    });
  } catch (persistErr) {
    console.warn('[AI Student Loop] Note: conversation memory persistence warning:', persistErr);
  }

  console.log(`[AI Student Loop] Completed in ${Date.now() - startTime}ms`);
  return {
    success: true,
    answer: lyzrResult.response,
    context: contextSnippets,
    retrievalStatus: {
      foundContent: hasContext,
      count: contextSnippets.length,
    },
    sessionId,
  };
}

/**
 * Execute end-to-end AI Mentor workflow
 * Reuses the robust student ask pipeline with memory persistence
 */
export async function executeAiMentorWorkflow(params: {
  userId: string;
  conversationText: string;
  conversationId?: string;
  metadata?: {
    courseId?: string;
    lectureId?: string;
    contentType?: 'conversation' | 'note';
  };
}): Promise<{
  success: boolean;
  response?: string;
  memories?: Array<{
    content: string;
    metadata: any;
    score: number;
  }>;
  error?: string;
  warnings?: string[];
  stepsCompleted: string[];
}> {
  const stepsCompleted: string[] = [];

  // Step 1: Store conversation in Omi (if configured)
  if (params.conversationText && config.aiMentor.omiApiKey) {
    try {
      const omiResult = await createOmiConversation({
        text: params.conversationText,
        textSource: 'message',
        language: 'en',
      });
      if (omiResult.conversationId) {
        stepsCompleted.push('omi_conversation_stored');
      }
    } catch (error) {
      console.warn('[AI Workflow] Omi storage warning:', error);
    }
  }

  // Step 2 & 3: Run the core student ask workflow with Qdrant retrieval + Lyzr agent
  const result = await executeStudentAskWorkflow({
    userId: params.userId,
    query: params.conversationText,
    sessionId: params.conversationId,
    courseId: params.metadata?.courseId,
    lectureId: params.metadata?.lectureId,
  });

  if (result.retrievalStatus.foundContent) {
    stepsCompleted.push('qdrant_retrieval');
  }
  if (result.success) {
    stepsCompleted.push('lyzr_agent_processing');
    stepsCompleted.push('conversation_memory_persisted');
  }

  return {
    success: result.success,
    response: result.answer,
    memories: result.context,
    error: result.error,
    stepsCompleted,
  };
}

// ============================================================================
// COMPREHENSIVE HEALTH CHECK
// ============================================================================

export async function getAiMentorHealth(): Promise<{
  qdrant: Awaited<ReturnType<typeof checkQdrantHealth>>;
  lyzr: ReturnType<typeof checkLyzrHealth>;
  omi: ReturnType<typeof checkOmiHealth>;
  openaiConfigured: boolean;
}> {
  const [qdrant] = await Promise.all([checkQdrantHealth()]);

  return {
    qdrant,
    lyzr: checkLyzrHealth(),
    omi: checkOmiHealth(),
    openaiConfigured: !!config.aiMentor.openaiApiKey,
  };
}

// ============================================================================
// SAFE COURSE CONTENT INDEXING
// ============================================================================

/**
 * Generate a deterministic positive integer ID for course content blocks
 * Prevents duplicates when re-indexing
 */
export function getDeterministicCoursePointId(item: ExtractedContent): number {
  const key = `course_${item.courseId}_${item.lectureId}_${item.sectionId || 'main'}_${item.contentType}`;
  let hash = 5381;
  for (let i = 0; i < key.length; i++) {
    hash = ((hash << 5) + hash) + key.charCodeAt(i);
    hash = hash & 0x7fffffff; // Positive 31-bit integer
  }
  return hash;
}

/**
 * Safely index all course learning materials into Qdrant
 * Indexes with userId: 'system' and isGlobal: true so all students can search
 * Does not delete existing collections or private student memories
 */
export async function indexCourseCatalog(options?: {
  onProgress?: (indexed: number, total: number, title: string) => void;
}): Promise<{
  success: boolean;
  total: number;
  indexed: number;
  failed: number;
  error?: string;
}> {
  console.log('[AI Mentor] Starting safe course catalog indexing into Qdrant...');
  try {
    // Ensure collection exists
    await createLearningMemoryCollection();
    await ensureUserIdIndex();

    const items = extractAllCoursesContent();
    console.log(`[AI Mentor] Extracted ${items.length} course content blocks`);

    if (items.length === 0) {
      return { success: false, total: 0, indexed: 0, failed: 0, error: 'No course content blocks found to index' };
    }

    let indexedCount = 0;
    let failedCount = 0;

    for (const item of items) {
      const pointId = getDeterministicCoursePointId(item);
      const title = item.lectureTitle ? `${item.courseTitle} - ${item.lectureTitle}` : item.courseTitle;

      const result = await indexContent({
        userId: 'system',
        content: item.content,
        pointId,
        metadata: {
          contentType: item.contentType,
          courseId: item.courseId,
          lectureId: item.lectureId,
          sectionId: item.sectionId,
          sectionLabel: item.sectionLabel,
          title,
          courseTitle: item.courseTitle,
          isGlobal: true,
        },
      });

      if (result.success) {
        indexedCount++;
        options?.onProgress?.(indexedCount, items.length, title);
      } else {
        failedCount++;
        console.warn(`[AI Mentor] Failed to index ${title}:`, result.error);
      }
    }

    console.log(`[AI Mentor] Course catalog indexing complete: ${indexedCount}/${items.length} succeeded, ${failedCount} failed`);
    return {
      success: indexedCount > 0,
      total: items.length,
      indexed: indexedCount,
      failed: failedCount,
    };
  } catch (err: any) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[AI Mentor] Course catalog indexing error:', message);
    return {
      success: false,
      total: 0,
      indexed: 0,
      failed: 0,
      error: message,
    };
  }
}

