import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { z } from 'zod';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { prisma } from '../prisma.js';
import {
  checkQdrantHealth,
  createLearningMemoryCollection,
  ensureUserIdIndex,
  indexContent,
  searchLearningMemory,
  checkLyzrHealth,
  executeLyzrWorkflow,
  executeLyzrAgentChat,
  executeAiMentorWorkflow,
  checkOmiHealth,
  getOmiConversations,
  createOmiConversation,
  getAiMentorHealth,
  processOmiConversationWebhook,
  processOmiRealtimeWebhook,
  deleteMemoryPoint,
  deleteMemoriesByFilter,
  getUserIdFromOmiUid,
  linkOmiUidToUser,
  unlinkOmiUid,
  indexCourseCatalog,
  executeStudentAskWorkflow,
} from '../services/aiMentorService.js';

const router = Router();

// ============================================================================
// HEALTH CHECK (Public, no secrets exposed)
// ============================================================================

/**
 * GET /api/ai-mentor/health
 * Check connectivity and configuration status for all AI Mentor services
 * Does not expose any API keys or secrets
 */
router.get('/health', async (_req, res, next) => {
  try {
    const health = await getAiMentorHealth();
    res.json(health);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// QDRANT COLLECTION MANAGEMENT (Admin-only)
// ============================================================================

/**
 * POST /api/ai-mentor/collection
 * Create the Qdrant collection for learning memory
 * Requires admin role
 */
router.post('/collection', requireAuth, async (_req: AuthenticatedRequest, res, next) => {
  try {
    // TODO: Add requireRole('admin') middleware when needed
    const result = await createLearningMemoryCollection();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai-mentor/collection/index
 * Ensure userId payload index exists for filtering
 * Idempotent - safe to call multiple times
 */
router.post('/collection/index', requireAuth, async (_req: AuthenticatedRequest, res, next) => {
  try {
    const result = await ensureUserIdIndex();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// LEARNING MEMORY OPERATIONS (Authenticated, user-scoped)
// ============================================================================

const indexContentSchema = z.object({
  content: z.string().min(1).max(10000),
  contentType: z.enum(['course', 'lecture', 'note', 'conversation', 'section', 'block']),
  courseId: z.string().optional(),
  lectureId: z.string().optional(),
  title: z.string().optional(),
});

/**
 * POST /api/ai-mentor/index
 * Index content into the learning memory vector database
 * Automatically scoped to the authenticated user
 */
router.post('/index', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const body = indexContentSchema.parse(req.body);

    const result = await indexContent({
      userId,
      content: body.content,
      metadata: {
        contentType: body.contentType,
        courseId: body.courseId,
        lectureId: body.lectureId,
        title: body.title,
      },
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

const searchSchema = z.object({
  query: z.string().min(1).max(500),
  limit: z.number().min(1).max(20).optional(),
  courseId: z.string().optional(),
  contentType: z.string().optional(),
});

/**
 * POST /api/ai-mentor/search
 * Search learning memory for relevant content
 * Searches student's memories and platform course content
 */
router.post('/search', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const body = searchSchema.parse(req.body);

    const result = await searchLearningMemory({
      userId,
      query: body.query,
      limit: body.limit,
      courseId: body.courseId,
      contentType: body.contentType,
    });

    if (result.error) {
      return res.status(500).json(result);
    }

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/ai-mentor/catalog/index
 * Safely indexes all course learning materials into Qdrant
 */
router.post('/catalog/index', requireAuth, async (_req: AuthenticatedRequest, res, next) => {
  try {
    const result = await indexCourseCatalog();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// LYZR AGENT EXECUTION (Authenticated)
// ============================================================================

const lyzrExecuteSchema = z.object({
  input: z.record(z.any()),
});

/**
 * POST /api/ai-mentor/lyzr/execute
 * Execute a Lyzr AI agent workflow
 * Requires LYZR_API_KEY and LYZR_WORKFLOW_ID to be configured
 */
router.post('/lyzr/execute', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = lyzrExecuteSchema.parse(req.body);

    const result = await executeLyzrWorkflow({
      input: body.input,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

const lyzrAgentChatSchema = z.object({
  sessionId: z.string(),
  message: z.string(),
});

/**
 * POST /api/ai-mentor/lyzr/chat
 * Execute a Lyzr agent chat with context from Qdrant
 * Requires LYZR_API_KEY and LYZR_AGENT_ID to be configured
 * This is the agent chat API per the hackathon PDF
 */
router.post('/lyzr/chat', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const body = lyzrAgentChatSchema.parse(req.body);

    const result = await executeLyzrAgentChat({
      userId,
      sessionId: body.sessionId,
      message: body.message,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

const askWithContextSchema = z.object({
  query: z.string().min(1).max(500),
  sessionId: z.string().optional(),
});

/**
 * POST /api/ai-mentor/ask
 * Complete question-answer loop with Qdrant retrieval, Lyzr agent response,
 * and automatic conversation memory persistence.
 */
router.post('/ask', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const body = askWithContextSchema.parse(req.body);

    const result = await executeStudentAskWorkflow({
      userId,
      query: body.query,
      sessionId: body.sessionId,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// OMI USER MAPPING (Authenticated)
// ============================================================================

const linkOmiSchema = z.object({
  omiUid: z.string().min(1),
});

/**
 * POST /api/ai-mentor/omi/link
 * Link Omi uid to the authenticated user's account
 * Enables secure webhook processing for voice memories
 */
router.post('/omi/link', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const body = linkOmiSchema.parse(req.body);

    const result = await linkOmiUidToUser({
      userId,
      omiUid: body.omiUid,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/ai-mentor/omi/link
 * Unlink Omi uid from the authenticated user's account
 * Deactivates the mapping (soft delete)
 */
router.delete('/omi/link', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const body = linkOmiSchema.parse(req.body);

    const result = await unlinkOmiUid({
      userId,
      omiUid: body.omiUid,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ai-mentor/omi/link
 * Check if the authenticated user has a linked Omi account
 */
router.get('/omi/link', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    
    const mappings = await prisma.omiUserMapping.findMany({
      where: { userId, isActive: true },
      select: { omiUid: true, linkedAt: true },
    });

    res.json({
      hasLinkedAccount: mappings.length > 0,
      mappings: mappings.map(m => ({
        omiUid: m.omiUid.substring(0, 8) + '...', // Mask for privacy
        linkedAt: m.linkedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// OMI CONVERSATION OPERATIONS (Authenticated)
// ============================================================================

const omiGetConversationsSchema = z.object({
  limit: z.number().min(1).max(100).optional(),
  includeTranscript: z.boolean().optional(),
});

/**
 * GET /api/ai-mentor/omi/conversations
 * Retrieve conversations from Omi
 * Requires OMI_API_KEY to be configured
 */
router.get('/omi/conversations', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const includeTranscript = req.query.includeTranscript === 'true';

    const body = omiGetConversationsSchema.parse({
      limit,
      includeTranscript,
    });

    const result = await getOmiConversations({
      limit: body.limit,
      includeTranscript: body.includeTranscript,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

const omiCreateConversationSchema = z.object({
  text: z.string().min(1).max(100000),
  textSource: z.enum(['audio_transcript', 'message', 'other_text']).optional(),
  language: z.string().optional(),
});

/**
 * POST /api/ai-mentor/omi/conversations
 * Create a conversation in Omi from transcript text
 * Requires OMI_API_KEY to be configured
 */
router.post('/omi/conversations', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const body = omiCreateConversationSchema.parse(req.body);

    const result = await createOmiConversation({
      text: body.text,
      textSource: body.textSource,
      language: body.language,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// OMI WEBHOOK ENDPOINTS (Public, called by Omi service)
// ============================================================================

/**
 * POST /omi/conversation
 * Webhook endpoint called by Omi after a conversation completes
 * Receives completed conversation payload with transcript_segments
 */
router.post('/omi/conversation', async (req, res, next) => {
  try {
    console.log('[Omi Webhook] Received completed conversation webhook');
    
    // Extract uid from query parameter (Omi's user identifier)
    const uid = req.query.uid as string;
    if (!uid) {
      console.warn('[Omi Webhook] Missing uid query parameter');
      return res.status(400).json({ error: 'Missing uid parameter' });
    }

    // Log payload structure for debugging (without sensitive content)
    console.log('[Omi Webhook] Payload keys:', Object.keys(req.body || {}));
    
    // Process asynchronously to avoid webhook timeout
    // Return 200 immediately to acknowledge receipt
    res.status(200).json({ received: true, uid });
    
    // Process in background
    processOmiConversationWebhook({ uid, payload: req.body }).catch((error) => {
      console.error('[Omi Webhook] Background processing error:', error);
    });
    
  } catch (error) {
    console.error('[Omi Webhook] Error processing conversation webhook:', error);
    // Still return 200 to avoid Omi retry storms
    res.status(200).json({ received: true, error: 'Processing error logged' });
  }
});

/**
 * POST /omi/realtime
 * Webhook endpoint called by Omi during real-time transcription
 * Receives transcript segments while listening
 */
router.post('/omi/realtime', async (req, res, next) => {
  try {
    console.log('[Omi Webhook] Received realtime transcript webhook');
    
    // Extract uid and session_id from query parameters
    const uid = req.query.uid as string;
    const sessionId = req.query.session_id as string;
    
    if (!uid) {
      console.warn('[Omi Webhook] Missing uid query parameter');
      return res.status(400).json({ error: 'Missing uid parameter' });
    }

    // Log payload structure for debugging
    console.log('[Omi Webhook] Payload keys:', Object.keys(req.body || {}));
    
    // Process asynchronously
    res.status(200).json({ received: true, uid, sessionId });
    
    // Process in background
    processOmiRealtimeWebhook({ uid, sessionId, payload: req.body }).catch((error) => {
      console.error('[Omi Webhook] Background processing error:', error);
    });
  } catch (error) {
    console.error('[Omi Webhook] Error processing realtime webhook:', error);
    res.status(200).json({ received: true, error: 'Processing error logged' });
  }
});

// ============================================================================
// MEMORY MANAGEMENT (Authenticated)
// ============================================================================

const deleteMemorySchema = z.object({
  pointId: z.number(),
});

/**
 * DELETE /api/ai-mentor/memory/:pointId
 * Delete a specific memory point
 * Verifies user ownership before deletion
 */
router.delete('/memory/:pointId', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const pointId = Number(req.params.pointId);
    
    if (isNaN(pointId)) {
      return res.status(400).json({ error: 'Invalid point ID' });
    }

    const result = await deleteMemoryPoint({ userId, pointId });
    res.json(result);
  } catch (error) {
    next(error);
  }
});

const deleteMemoriesFilterSchema = z.object({
  contentType: z.string().optional(),
  courseId: z.string().optional(),
  lectureId: z.string().optional(),
  source: z.string().optional(),
  contentContains: z.string().optional(),
});

/**
 * DELETE /api/ai-mentor/memories
 * Delete memories by content/metadata filters (user-friendly "forget this")
 * Allows users to delete memories matching specific criteria
 */
router.delete('/memories', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const body = deleteMemoriesFilterSchema.parse(req.body);

    const result = await deleteMemoriesByFilter({
      userId,
      ...body,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============================================================================
// END-TO-END WORKFLOW (Authenticated)
// ============================================================================

const workflowSchema = z.object({
  conversationText: z.string().min(1).max(10000),
  conversationId: z.string().optional(),
  courseId: z.string().optional(),
  lectureId: z.string().optional(),
  contentType: z.enum(['conversation', 'note']).optional(),
});

/**
 * POST /api/ai-mentor/workflow
 * Execute end-to-end AI Mentor workflow
 * Flow: conversation → Lyzr → Qdrant → retrieval → response
 * Gracefully degrades when services are unavailable
 */
router.post('/workflow', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const body = workflowSchema.parse(req.body);

    const result = await executeAiMentorWorkflow({
      userId,
      conversationText: body.conversationText,
      conversationId: body.conversationId,
      metadata: {
        courseId: body.courseId,
        lectureId: body.lectureId,
        contentType: body.contentType,
      },
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
});

export default router;
