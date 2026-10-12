# Fraylon AI Mentor — Setup Guide

## Overview

The Fraylon AI Mentor is a voice-first, memory-powered learning assistant integrated into the LMS. It uses three services:

1. **Qdrant** — Vector database for semantic retrieval and persistent learning memory
2. **Lyzr** — AI agent orchestration for intelligent responses
3. **Omi** — Voice/conversation capture and retrieval (Developer API)

## Prerequisites

- Node.js ≥ 20.11 and npm ≥ 10
- PostgreSQL database (already configured for LMS)
- Qdrant instance (local or cloud)
- OpenAI API key (for embeddings)
- Lyzr API key and workflow ID (for agent execution)
- Omi API key (for conversation retrieval)

## Environment Configuration

### 1. Copy Environment Example

```bash
cd backend
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `backend/.env` and add the following:

```bash
# Qdrant Vector Database
QDRANT_URL=http://localhost:6333  # or your Qdrant Cloud URL
QDRANT_API_KEY=                    # Required for Qdrant Cloud

# OpenAI Embeddings
OPENAI_API_KEY=sk-...             # Required for semantic search

# Lyzr AI Agent Orchestration
LYZR_API_KEY=sk-...               # Required for agent execution
LYZR_WORKFLOW_ID=...              # Your workflow ID from Lyzr Studio (see below)

# Omi Voice/Conversation Capture
OMI_API_KEY=...                   # Required for conversation retrieval

# Qdrant Collection Configuration
QDRANT_COLLECTION_NAME=lms_learning_memory
```

## Lyzr Studio Workflow Setup (Manual)

The AI Mentor requires a Lyzr workflow with the following agents:

### Step 1: Create Lyzr Account
1. Go to https://studio.lyzr.ai
2. Sign up for an account
3. Navigate to API Settings to get your `LYZR_API_KEY`

### Step 2: Create Workflow in Lyzr Studio
1. Go to Lyzr Studio and create a new workflow
2. Add the following agents:

**Orchestrator Agent:**
- Role: Coordinate the workflow and route inputs
- Input: User conversation, context metadata
- Output: Routed task for other agents

**Memory Extraction Agent:**
- Role: Extract key learning concepts from conversation
- Input: Conversation text
- Output: Structured learning concepts (JSON)

**Recall Agent:**
- Role: Retrieve relevant past learning context
- Input: Query, user ID
- Output: Relevant memories from context

**Task Identification Agent:**
- Role: Identify actionable learning tasks
- Input: Conversation, extracted concepts
- Output: Recommended tasks or next steps

### Step 3: Configure Workflow Inputs
Set the workflow to accept:
- `conversation` (string): User's conversation text
- `userId` (string): User identifier for scoping
- `context` (object): Course/lecture metadata

### Step 4: Configure Workflow Output
Ensure the workflow returns:
- `response` (string): Final AI mentor response
- `extractedConcepts` (array, optional): Key learning concepts
- `tasks` (array, optional): Recommended tasks

### Step 5: Deploy and Get Workflow ID
1. Deploy the workflow in Lyzr Studio
2. Copy the workflow ID from the URL or workflow settings
3. Add it to `backend/.env` as `LYZR_WORKFLOW_ID`

**Example Workflow ID Format:** `wf_abc123xyz456`

### 3. Get API Keys

#### Qdrant
- **Local**: Run `docker run -d -p 6333:6333 qdrant/qdrant`
- **Cloud**: Sign up at https://cloud.qdrant.io/ and get your API key

#### OpenAI
- Get API key from https://platform.openai.com/api-keys
- Model used: `text-embedding-3-small` (1536 dimensions)
- **Important**: Ensure your account has credits for embeddings

#### Lyzr
- Sign up at https://studio.lyzr.ai/
- Create a workflow in the visual builder (see above)
- Copy the workflow ID from the "Workflow API" section
- Get your API key from account settings

#### Omi
- Sign up at https://omi.me/developer
- Get your Developer API key
- Note: Live transcription requires Firebase auth setup (not covered here)

## Installation

### Backend Dependencies

The Qdrant client is already installed:

```bash
cd backend
npm install @qdrant/js-client-rest
```

## Setup Steps

### 1. Start Qdrant

**Local Docker:**
```bash
docker run -d -p 6333:6333 qdrant/qdrant
```

**Or use Qdrant Cloud** (recommended for production)

### 2. Create Qdrant Collection

Start the backend server and call the collection creation endpoint:

```bash
curl -X POST http://localhost:3001/api/ai-mentor/collection \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Or use the health check to verify connectivity:

```bash
curl http://localhost:3001/api/ai-mentor/health
```

### 3. Index Course Content

Index all course JSON files into Qdrant for semantic search:

```bash
cd backend
npm run seed:ai-mentor <userId>
```

Replace `<userId>` with a valid user ID from your database.

This script:
- Extracts text from `frontend/public/data/` JSON files
- Creates embeddings using OpenAI
- Stores vectors in Qdrant with user-scoped payloads

### 4. Verify Service Health

```bash
curl http://localhost:3001/api/ai-mentor/health
```

Expected response:
```json
{
  "qdrant": {
    "connected": true,
    "collectionExists": true
  },
  "lyzr": {
    "configured": true,
    "workflowConfigured": true
  },
  "omi": {
    "configured": true
  },
  "openaiConfigured": true
}
```

## API Endpoints

### Health Check (Public)
```
GET /api/ai-mentor/health
```
Returns service connectivity status without exposing secrets.

### Collection Management (Admin)
```
POST /api/ai-mentor/collection
```
Creates the Qdrant collection for learning memory.

### Index Content (Authenticated)
```
POST /api/ai-mentor/index
```
Index content into the learning memory vector database.
Automatically scoped to the authenticated user.

**Request Body:**
```json
{
  "content": "Text to index",
  "contentType": "course|lecture|note|conversation|section|block",
  "courseId": "python20",
  "lectureId": "python20-lecture-0",
  "title": "Variables & Data Types"
}
```

### Search Learning Memory (Authenticated)
```
POST /api/ai-mentor/search
```
Search learning memory for relevant content.
Returns only content scoped to the authenticated user.

**Request Body:**
```json
{
  "query": "What are variables in Python?",
  "limit": 5
}
```

### Lyzr Workflow Execution (Authenticated)
```
POST /api/ai-mentor/lyzr/execute
```
Execute a Lyzr AI agent workflow directly.

**Request Body:**
```json
{
  "input": {
    "conversation": "I'm learning about Python variables",
    "userId": "user123",
    "context": {
      "courseId": "python20"
    }
  }
}
```

### Omi Conversations (Authenticated)
```
GET /api/ai-mentor/omi/conversations?limit=10&includeTranscript=true
```
Retrieve conversations from Omi.

```
POST /api/ai-mentor/omi/conversations
```
Create a conversation in Omi from transcript text.

**Request Body:**
```json
{
  "text": "I learned about variables today",
  "textSource": "message",
  "language": "en"
}
```

### End-to-End Workflow (Authenticated)
```
POST /api/ai-mentor/workflow
```
Execute the complete AI Mentor workflow:
1. Store conversation in Omi (if configured)
2. Process with Lyzr agents (if configured)
3. Index in Qdrant for semantic memory (if OpenAI configured)
4. Retrieve relevant memories from Qdrant
5. Generate response

**Gracefully degrades** when services are unavailable - returns warnings for missing configurations.

**Request Body:**
```json
{
  "conversationText": "I'm struggling with Python variables",
  "conversationId": "conv-123",
  "courseId": "python20",
  "lectureId": "python20-lecture-0",
  "contentType": "conversation"
}
```

**Response:**
```json
{
  "success": true,
  "response": "Based on your learning history, I found 3 relevant memories...",
  "memories": [
    {
      "content": "Variables store data values...",
      "metadata": {
        "contentType": "lecture",
        "courseId": "python20",
        "title": "Variables & Data Types"
      },
      "score": 0.95
    }
  ],
  "warnings": [
    "Omi not configured - conversation not stored in Omi",
    "Lyzr not configured - skipping AI agent processing"
  ],
  "stepsCompleted": [
    "qdrant_indexing",
    "qdrant_retrieval"
  ]
}
```

## Testing

### Omi Conversations (Authenticated)
```
GET /api/ai-mentor/omi/conversations?limit=10&includeTranscript=true
```
Retrieve conversations from Omi.

```
POST /api/ai-mentor/omi/conversations
```
Create a conversation in Omi from transcript text.

**Request Body:**
```json
{
  "text": "Conversation transcript...",
  "textSource": "audio_transcript|message|other_text",
  "language": "en"
}
```

## Frontend Usage

### Access AI Mentor

Navigate to: `http://localhost:5175/ai-mentor`

### Features

1. **Service Health Check** - Verify all services are configured
2. **Question Input** - Ask questions about course content
3. **Semantic Search** - Retrieve relevant learning context from Qdrant
4. **AI Mentor Response** - Get answers from Lyzr agents with context

### Voice Input (Omi)

Voice input requires the Omi app/device setup:

1. Install Omi app on your device
2. Configure Firebase authentication (requires Firebase project setup)
3. Set up webhook in Omi Developer Mode for real-time transcript processing
4. Use the Omi Developer API endpoints to retrieve conversations

**Note:** Live microphone capture is beyond the scope of this integration. The current implementation uses the Omi Developer API for conversation retrieval only.

## Privacy and Security

### User-Scoped Memory

All indexed content is scoped to the user who indexed it:
- Qdrant queries filter by `userId` in the payload
- Users cannot retrieve content indexed by other users
- Each user has their own learning memory space

### API Key Security

- All API keys are stored in `backend/.env` (gitignored)
- Health check endpoint never exposes secrets
- API keys are never logged or returned in responses

### Data Handling

- No raw voice recordings are stored by default
- Only transcript text is indexed
- User consent is required for conversation processing

## Troubleshooting

### Qdrant Connection Failed

**Error:** `QDRANT_URL not configured` or connection refused

**Solution:**
- Verify `QDRANT_URL` in `.env`
- Ensure Qdrant is running: `docker ps | grep qdrant`
- Check firewall settings for port 6333

### OpenAI Embeddings Failed

**Error:** `OPENAI_API_KEY not configured`

**Solution:**
- Add `OPENAI_API_KEY` to `.env`
- Verify the key is valid at https://platform.openai.com/api-keys

### Lyzr Workflow Failed

**Error:** `LYZR_WORKFLOW_ID not configured`

**Solution:**
- Create a workflow in Lyzr Studio
- Copy the workflow ID from the "Workflow API" section
- Add `LYZR_WORKFLOW_ID` to `.env]

### Omi API Failed

**Error:** `OMI_API_KEY not configured` or authentication failed

**Solution:**
- Get API key from https://omi.me/developer
- Add `OMI_API_KEY` to `.env`
- Verify the key is valid

### Collection Already Exists

**Error:** Collection creation fails with "already exists"

**Solution:**
- This is expected and handled gracefully
- The collection will be reused

## Manual Configuration Required

### Lyzr Workflow Setup

1. Go to https://studio.lyzr.ai/
2. Create a new workflow using the visual builder
3. Configure the workflow to accept:
   - `query` (string) - The user's question
   - `context` (string) - Retrieved learning context
4. Click "Workflow API" or "Export JSON"
5. Copy the workflow ID
6. Add `LYZR_WORKFLOW_ID` to `.env`

### Omi Firebase Setup (Optional)

For live transcription and real-time audio:

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable Firebase Authentication
3. Configure Omi app with your Firebase project
4. Set up webhooks for real-time transcript processing

**Note:** This is optional. The Developer API works without Firebase for conversation retrieval.

## Testing

### Test Health Endpoint

```bash
curl http://localhost:3001/api/ai-mentor/health
```

### Test Search

```bash
curl -X POST http://localhost:3001/api/ai-mentor/search \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"query": "What is Python?", "limit": 5}'
```

### Test Lyzr Execution

```bash
curl -X POST http://localhost:3001/api/ai-mentor/lyzr/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"input": {"query": "Test query", "context": "Test context"}}'
```

## Files Created/Modified

### Backend
- `backend/.env.example` - Added AI Mentor environment variables
- `backend/src/config.ts` - Added `aiMentor` configuration object
- `backend/src/services/aiMentorService.ts` - Service layer for Qdrant, Lyzr, Omi
- `backend/src/routes/aiMentor.ts` - API routes
- `backend/src/app.ts` - Mounted AI Mentor routes
- `backend/src/lib/courseContentExtractor.ts` - Course content extraction utility
- `backend/src/seeds/indexCourseContent.ts` - Indexing script
- `backend/package.json` - Added `seed:ai-mentor` script

### Frontend
- `frontend/src/pages/AiMentorPage.tsx` - AI Mentor UI component
- `frontend/src/App.tsx` - Added `/ai-mentor` route

## Next Steps

1. Configure all required API keys in `backend/.env`
2. Start Qdrant (local or cloud)
3. Create the Qdrant collection via API
4. Index course content: `npm run seed:ai-mentor <userId>`
5. Verify service health
6. Access AI Mentor at `/ai-mentor`
7. Test search and Lyzr execution
8. Configure Omi for voice input (optional)

## Support

For issues with:
- **Qdrant**: https://qdrant.tech/documentation/
- **Lyzr**: https://docs.lyzr.ai/
- **Omi**: https://docs.omi.me/
- **OpenAI**: https://platform.openai.com/docs
