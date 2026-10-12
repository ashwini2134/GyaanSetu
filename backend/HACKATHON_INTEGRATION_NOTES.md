# Hackathon Integration Notes

## Overview
This document explains the implementation details for the Lyzr × Qdrant × Omi hackathon integration in the Fraylon LMS backend.

## Architecture Alignment with Hackathon Guide

The implementation follows the recommended architecture from the hackathon guide:

1. **Omi → Webhook → Backend**: Voice transcripts are received via webhooks
2. **Backend → Qdrant**: Transcripts are embedded and stored in vector database
3. **Backend → Qdrant → Lyzr**: Questions retrieve relevant context from Qdrant, then sent to Lyzr agent
4. **Lyzr → Backend → User**: Agent returns grounded answers

## Deviations from Guide

### Embedding Model

**Guide Recommendation:**
- Model: `BAAI/bge-small-en-v1.5`
- Library: `fastembed` (Python)
- Dimensions: 384

**Current Implementation:**
- Model: `Xenova/all-MiniLM-L6-v2`
- Library: `@xenova/transformers` (TypeScript/JavaScript)
- Dimensions: 384

**Rationale:**
- The LMS backend is built with TypeScript/Node.js, not Python
- `@xenova/transformers` provides a browser-compatible and Node.js-compatible embedding pipeline
- Both models produce 384-dimensional vectors, making them compatible with the same Qdrant collection configuration
- `all-MiniLM-L6-v2` is a well-established model for semantic similarity tasks
- The model runs locally without requiring external API keys

**Impact:**
- Functionally equivalent for semantic search and retrieval
- Same vector dimensions (384) - no schema changes needed
- Slightly different embedding space, but both are trained for semantic similarity
- Performance characteristics may differ slightly but are acceptable for the hackathon use case

## Security Enhancements

### Omi uid → userId Mapping

The guide uses Omi uid directly as userId, which is not secure for production. This implementation adds:

1. **Secure Mapping Table**: `OmiUserMapping` table in Prisma schema
   - Links Omi uid to application userId
   - Supports soft delete (isActive flag)
   - One-to-many relationship (user can have multiple Omi devices)

2. **Mapping Endpoints**:
   - `POST /api/ai-mentor/omi/link` - Link Omi account
   - `DELETE /api/ai-mentor/omi/link` - Unlink Omi account
   - `GET /api/ai-mentor/omi/link` - Check linked accounts

3. **Webhook Security**: All Omi webhooks now require an active mapping before processing

### User Privacy Features

**"Forget This" Endpoint** (Privacy Track Enhancement):
- `DELETE /api/ai-mentor/memories` - Delete memories by filters
  - Filter by contentType, courseId, lectureId, source
  - Filter by contentContains (text search)
  - User-scoped (can only delete own memories)
  - Returns count of deleted memories

## Observable Logging

Each step in the AI Mentor loop is logged with clear markers:

```
[STEP 0/4 - START] ========== AI MENTOR ASK LOOP ==========
[STEP 0/4 - START] User: abc12345...
[STEP 0/4 - START] Query: "What are my action items?"
[STEP 0/4 - START] → Step 1: Searching Qdrant for context
[STEP 2/4 - SEARCH] Starting search for userId: abc12345...
[STEP 2/4 - SEARCH] Query: "What are my action items?"
[STEP 2/4 - SEARCH] ✓ Search successful, found 3 results
[STEP 0/4 - START] ✓ Retrieved 3 context snippets
[STEP 0/4 - START] → Step 2: Built message with 3 snippets
[STEP 0/4 - START] → Step 3: Calling Lyzr agent
[STEP 3/4 - LYZR] Calling agent chat API for user abc12345...
[STEP 3/4 - LYZR] ✓ Agent chat completed in 1234ms
[STEP 0/4 - START] ✓ AI Mentor loop completed in 2345ms
[STEP 0/4 - START] ========== END LOOP ==========
```

This logging helps with:
- Debugging issues in production
- Demonstrating observable workflows (hackathon scoring criteria)
- Performance monitoring
- Understanding the flow for judges

## API Endpoints

### Health Check
- `GET /api/ai-mentor/health` - Check all service statuses

### Qdrant Operations
- `POST /api/ai-mentor/collection` - Create collection
- `POST /api/ai-mentor/collection/index` - Ensure userId index
- `POST /api/ai-mentor/index` - Index content
- `POST /api/ai-mentor/search` - Search memories

### Lyzr Operations
- `POST /api/ai-mentor/lyzr/execute` - Execute workflow
- `POST /api/ai-mentor/lyzr/chat` - Agent chat
- `POST /api/ai-mentor/ask` - Complete Q&A loop

### Omi Integration
- `POST /omi/conversation` - Webhook for completed conversations
- `POST /omi/realtime` - Webhook for live transcripts
- `POST /api/ai-mentor/omi/link` - Link Omi account
- `DELETE /api/ai-mentor/omi/link` - Unlink Omi account
- `GET /api/ai-mentor/omi/link` - Check linked accounts

### Memory Management
- `DELETE /api/ai-mentor/memory/:pointId` - Delete specific memory
- `DELETE /api/ai-mentor/memories` - Delete by filters (privacy feature)

## Environment Variables Required

```env
# Qdrant
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=optional
QDRANT_COLLECTION_NAME=voice_memory

# Lyzr
LYZR_API_KEY=your_lyzr_api_key
LYZR_AGENT_ID=your_agent_id
LYZR_WORKFLOW_ID=optional

# Omi (optional, for direct API calls)
OMI_API_KEY=optional
```

## Build Track

This implementation supports multiple hackathon tracks:

1. **Meeting and Lecture Intelligence**: Voice-to-insight with semantic retrieval
2. **Privacy-First Knowledge Systems**: Secure uid mapping + "forget this" endpoint
3. **Accessibility and Adaptive Assistants**: Voice-driven Q&A over learning content

## Submission Checklist

- [x] Public, open-source repository with clean structure
- [x] All three tools integrated (Omi, Qdrant, Lyzr)
- [x] Architecture documentation
- [x] Working demo endpoints
- [x] No API keys committed (use environment variables)
- [x] Build track identified
- [x] Solo entry
- [x] Observable workflows with logging
- [x] Privacy features (secure uid mapping, forget endpoint)
