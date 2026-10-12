# Lyzr Studio Workflow Design for GyaanSetu LMS AI Mentor

## Overview
This document describes the required Lyzr Studio workflow architecture for the AI Mentor feature in GyaanSetu LMS.

## Workflow Purpose
The AI Mentor workflow processes learner questions and provides personalized, context-aware responses using the learner's own learning memories stored in Qdrant.

## Workflow Architecture

### Input Parameters
The workflow should accept these input parameters via the `input_data` object:

```json
{
  "query": "What are Python functions?",
  "context": "Python functions are reusable blocks of code that perform specific tasks.\n\nVariables store data values..."
}
```

- **query** (string): The learner's question
- **context** (string): Relevant learning content retrieved from Qdrant (user-scoped)

### Workflow Steps

#### Step 1: Intent Identification Agent
- **Purpose**: Analyze the learner's question to understand the learning intent
- **Input**: `query` from input_data
- **Output**: Structured intent object with topic, difficulty level, and learning goal
- **Agent Type**: Text analysis/classification agent

#### Step 2: Context Processing Agent
- **Purpose**: Process and summarize the retrieved Qdrant context
- **Input**: `context` from input_data
- **Output**: Key concepts, examples, and explanations from the learning material
- **Agent Type**: Text summarization agent

#### Step 3: Response Generation Agent
- **Purpose**: Generate a clear, helpful explanation based on intent and context
- **Input**: Output from Steps 1 and 2
- **Output**: Final response with explanation and example
- **Agent Type**: Text generation agent with specific instructions:
  - Explain the topic clearly and concisely
  - Include a practical example
  - Avoid unsupported claims or hallucinations
  - Reference the provided context when available
  - If context is insufficient, indicate what additional information would help

#### Step 4: Response Formatting Agent
- **Purpose**: Format the final response in a structured, readable format
- **Input**: Output from Step 3
- **Output**: Structured response object

### Output Format
The workflow should return a structured response:

```json
{
  "status": "success",
  "output": {
    "explanation": "Python functions are reusable blocks of code that perform specific tasks...",
    "example": "def greet(name):\n    return f'Hello, {name}!'",
    "key_concepts": ["functions", "parameters", "return values"],
    "confidence_score": 0.95,
    "context_used": true
  }
}
```

## Manual Configuration Steps in Lyzr Studio

### Prerequisites
1. Sign up for a Lyzr Studio account at https://studio.lyzr.ai
2. Obtain your API key from the Lyzr Studio dashboard

### Step-by-Step Setup

1. **Create a New Workflow**
   - Navigate to Lyzr Studio
   - Click "Create New Workflow"
   - Name it: "GyaanSetu AI Mentor"

2. **Add Input Node**
   - Add an input node with two fields:
     - `query` (text)
     - `context` (text)

3. **Configure Intent Identification Agent**
   - Add an agent node connected to the input
   - Configure as a text analysis agent
   - System prompt: "Analyze the learner's question to identify the topic, difficulty level, and learning goal. Return a JSON object with these fields."

4. **Configure Context Processing Agent**
   - Add an agent node connected to the input
   - Configure as a summarization agent
   - System prompt: "Summarize the provided learning context, extracting key concepts, examples, and explanations. Return a structured summary."

5. **Configure Response Generation Agent**
   - Add an agent node connected to outputs from Steps 3 and 4
   - Configure as a text generation agent
   - System prompt: "You are an AI Mentor for a learning management system. Generate a clear, helpful explanation based on the learner's question and the provided context. Include a practical example. Avoid unsupported claims. If the context is insufficient, indicate what additional information would help."

6. **Configure Response Formatting Agent**
   - Add an agent node connected to the response generation output
   - Configure to format the response as JSON with the structure shown above

7. **Connect Nodes**
   - Connect the nodes in sequence: Input → Intent Agent → Context Agent → Response Agent → Format Agent
   - Ensure data flows correctly between nodes

8. **Test the Workflow**
   - Use the Lyzr Studio test interface with sample input
   - Verify the output matches the expected format

9. **Publish and Get Workflow ID**
   - Publish the workflow
   - Copy the workflow ID from the URL or dashboard
   - Format: UUID (e.g., `e0ab5411-8620-41c0-acdd-bac4c35fc7c0`)

10. **Configure Environment Variables**
    - Add to your backend `.env` file:
      ```
      LYZR_API_KEY=your_actual_api_key_here
      LYZR_WORKFLOW_ID=your_workflow_id_here
      ```

## Integration Notes

### Backend Integration
The backend calls the workflow via:
- **Endpoint**: `POST https://agent-prod.studio.lyzr.ai/v3/workflows/{workflow_id}/execute`
- **Headers**: `Content-Type: application/json`, `x-api-key: {LYZR_API_KEY}`
- **Body**: `{ "input_data": { "query": "...", "context": "..." } }`

### User-Scoped Context
The `context` parameter is always user-scoped:
- Qdrant search filters by `userId` to ensure privacy
- Each learner only retrieves their own learning memories
- The workflow never has access to other learners' data

### Error Handling
The backend handles these error scenarios:
- Missing API key or workflow ID
- Authentication failures (401)
- Workflow not found (404)
- Invalid input (400)
- Rate limiting (429)
- Server errors (500+)
- Timeouts (30 seconds)

## Testing

### Manual Test
```bash
# Set environment variables
export LYZR_API_KEY="your_key"
export LYZR_WORKFLOW_ID="your_workflow_id"

# Test via backend API
curl -X POST http://localhost:3001/api/ai-mentor/lyzr/execute \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "input": {
      "query": "What are Python functions?",
      "context": "Python functions are reusable blocks of code."
    }
  }'
```

### Frontend Test
1. Login to the LMS
2. Navigate to AI Mentor page
3. Search for content to populate context
4. Click "Ask Lyzr AI" button
5. Verify the response displays correctly

## Security Considerations

1. **API Key Security**: Never commit LYZR_API_KEY to version control
2. **User Privacy**: Context is always filtered by userId
3. **Input Validation**: Backend validates input before sending to Lyzr
4. **Error Messages**: Backend returns safe error messages without exposing API keys

## Troubleshooting

### Workflow Not Found (404)
- Verify LYZR_WORKFLOW_ID is correct
- Ensure the workflow is published in Lyzr Studio
- Check that the workflow ID is a valid UUID

### Authentication Failed (401)
- Verify LYZR_API_KEY is correct
- Check that the API key is active and not expired
- Ensure the API key has workflow execution permissions

### Invalid Input (400)
- Check that input_data contains required fields
- Verify the workflow input node matches the expected structure
- Review workflow node configurations

### Timeout
- The workflow may be taking too long to execute
- Consider optimizing the workflow or increasing the backend timeout
- Check Lyzr Studio for workflow performance metrics

## References
- Lyzr API Documentation: https://docs.lyzr.ai/agent-apis/orchestration/execute-workflow-endpoint
- Lyzr Studio: https://studio.lyzr.ai
