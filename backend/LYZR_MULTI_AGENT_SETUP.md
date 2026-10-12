# Lyzr Multi-Agent Orchestration Setup Guide

This document provides step-by-step instructions for setting up the multi-agent orchestration required by the hackathon submission guide.

## Required Agents

According to the hackathon PDF, the following specialized agents coordinated by a Manager Agent are required:

1. **Manager Agent** - Receives the task, delegates work, and combines results
2. **Memory Q&A Agent** - Answers questions using retrieved context only
3. **Action-item Agent** - Extracts tasks, owners, and spoken deadlines
4. **Summarizer Agent** - Produces concise summaries of memories
5. **Planner Agent** - Organizes extracted tasks into a plan

## Setup Instructions

### Step 1: Create Individual Agents in Lyzr Studio

1. Open [Lyzr Agent Studio](https://studio.lyzr.ai)
2. Sign in and verify your email if required
3. For each agent below, create a new agent with the specified configuration

#### Agent 1: Memory Q&A Agent

**Name:** `GyaanSetu Memory Q&A`

**Description:** Answers questions using only the provided context from voice memories

**System Prompt:**
```
You are a memory question-answering assistant.

Each message contains CONTEXT (snippets retrieved from the user's own voice memories) and a QUESTION.

- Answer ONLY from the CONTEXT. If the answer is not in the context, say "I don't have information about that in your memories."
- Keep answers short and concise.
- Cite which snippet you used in your answer (e.g., "According to snippet 1...").
- Do not use outside knowledge or make assumptions.
```

**Default LLM:** Choose a capable model (e.g., GPT-4 or Claude)

**Copy the Agent ID** after creation - you will need it for the Manager Agent.

---

#### Agent 2: Action-item Agent

**Name:** `GyaanSetu Action Item Extractor`

**Description:** Extracts tasks, owners, and deadlines from voice transcripts

**System Prompt:**
```
You are an action item extraction assistant.

Each message contains a transcript from a voice conversation.

- Extract all action items mentioned in the transcript.
- For each action item, identify:
  - The task description
  - The owner (who needs to do it)
  - The deadline (when it needs to be done, if mentioned)
- Format the output as a bulleted list.
- If no action items are found, say "No action items found in this transcript."
```

**Copy the Agent ID** after creation.

---

#### Agent 3: Summarizer Agent

**Name:** `GyaanSetu Memory Summarizer`

**Description:** Produces concise summaries of voice memories

**System Prompt:**
```
You are a memory summarization assistant.

Each message contains one or more transcript segments from voice conversations.

- Produce a concise summary (2-3 sentences maximum) of the key points.
- Focus on the main topics discussed, decisions made, and important information.
- Do not include unnecessary details or filler words.
- If the transcript is empty or very short, summarize it as-is.
```

**Copy the Agent ID** after creation.

---

#### Agent 4: Planner Agent

**Name:** `GyaanSetu Task Planner`

**Description:** Organizes extracted tasks into a structured plan

**System Prompt:**
```
You are a task planning assistant.

Each message contains a list of action items with owners and deadlines.

- Organize the action items into a logical sequence or priority order.
- Group related tasks together.
- Identify any dependencies between tasks.
- Present the plan as a structured list with sections if needed.
- If no action items are provided, say "No tasks to plan."
```

**Copy the Agent ID** after creation.

---

### Step 2: Create the Manager Agent

**Name:** `GyaanSetu Manager Agent`

**Description:** Coordinates specialized agents to process voice memories and answer questions

**System Prompt:**
```
You are a manager agent that coordinates specialized agents for voice memory processing.

You have access to these specialized agents:
- Memory Q&A Agent: Answers questions using retrieved context
- Action-item Agent: Extracts tasks, owners, and deadlines
- Summarizer Agent: Produces concise summaries
- Planner Agent: Organizes tasks into a plan

When you receive a request:
1. Determine which specialized agent(s) are needed based on the request type:
   - If the user asks a question → delegate to Memory Q&A Agent
   - If the user wants action items → delegate to Action-item Agent, then Planner Agent
   - If the user wants a summary → delegate to Summarizer Agent
   - If the user wants a comprehensive overview → delegate to multiple agents and combine results

2. Delegate the task to the appropriate agent(s).

3. Combine the results from the specialized agents into a clear, helpful response.

4. Always cite which agent provided which information.

IMPORTANT: You must actually delegate to the specialized agents using the available tools. Do not simulate delegation by changing your own prompt.
```

**Default LLM:** Choose a capable model (e.g., GPT-4 or Claude)

**Configure Agent Tools:**
- Add each of the specialized agents as tools in the Manager Agent configuration
- Use the Agent IDs you copied from Step 1
- Configure the Manager Agent to call these agents when appropriate

**Copy the Manager Agent ID** - this is the `LYZR_AGENT_ID` you will use in your backend `.env` file.

---

### Step 3: Configure Environment Variables

Add the Manager Agent ID to your backend `.env` file:

```env
LYZR_AGENT_ID=<your-manager-agent-id>
LYZR_API_KEY=<your-lyzr-api-key>
```

**Important:** The `LYZR_AGENT_ID` should be the Manager Agent ID, not the individual specialized agent IDs. The Manager Agent will handle delegation internally.

---

### Step 4: Test the Multi-Agent Orchestration

1. Start your backend server
2. Use the `/api/ai-mentor/ask` endpoint with a test query
3. Check the backend logs to see:
   - Which agent was called
   - Delegation events
   - Results from specialized agents
   - Final combined response

**Example test request:**
```bash
curl -X POST http://localhost:3001/api/ai-mentor/ask \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What are my action items?",
    "sessionId": "test-session-1"
  }'
```

**Expected behavior:**
- The Manager Agent receives the request
- It delegates to the Action-item Agent to extract tasks
- It may delegate to the Planner Agent to organize the tasks
- It returns a combined response with action items and their organization

---

### Step 5: Verify Observable Workflow

The hackathon requires observable workflow steps. Your backend logs should show:

```
[AI Mentor Lyzr Agent] Calling agent chat API for user <user-id>
[AI Mentor Lyzr Agent] Response structure: {"hasResponse":true,"keys":["response","agent_calls"]}
```

If your Lyzr Studio configuration includes agent call tracking, the response should include information about which agents were called and their individual results.

---

## Alternative: Lyzr ADK

The hackathon PDF mentions the Lyzr ADK (Agent Development Kit) as an alternative way to drive agents from code. If you prefer programmatic control over agent orchestration:

1. Install the Lyzr ADK SDK
2. Use it to call individual agents directly from your backend
3. Implement the delegation logic in TypeScript code instead of relying on the Manager Agent

This approach gives you more control but requires more code. The Manager Agent approach is simpler and aligns with the PDF's recommendation.

---

## Troubleshooting

**Issue:** Manager Agent doesn't delegate to specialized agents
- **Solution:** Ensure you've added the specialized agents as tools in the Manager Agent configuration in Lyzr Studio

**Issue:** Agent returns empty response
- **Solution:** Check the agent's system prompt and ensure it has clear instructions for the expected input format

**Issue:** Backend logs show "agent_not_found" error
- **Solution:** Verify the `LYZR_AGENT_ID` in your `.env` file matches the Manager Agent ID from Lyzr Studio

---

## Next Steps

After setting up the multi-agent orchestration:

1. Test each specialized agent individually in Lyzr Studio
2. Test the Manager Agent with delegation
3. Test the full end-to-end flow via your backend API
4. Verify the logs show agent delegation events
5. Document the specific agent IDs used for your submission
