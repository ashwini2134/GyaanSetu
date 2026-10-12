import { Router } from "express";
import { prisma } from "../../prisma.js";

const router = Router();

// Delay utility for mock mode
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// GET /api/admin/ai-config
router.get("/", async (req, res, next) => {
  try {
    let config = await prisma.aIConfiguration.findFirst();
    if (!config) {
      config = await prisma.aIConfiguration.create({
        data: {}
      });
    }
    // Don't send the full API key to the frontend for security
    const safeConfig = {
      ...config,
      apiKey: config.apiKey ? `••••••••••••${config.apiKey.slice(-4)}` : null,
      hasApiKey: !!config.apiKey
    };
    res.json(safeConfig);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/ai-config
router.post("/", async (req, res, next) => {
  try {
    const { 
      provider, 
      apiKey, 
      model, 
      strictnessLevel, 
      passScoreRegular, 
      passScoreCapstone, 
      maxAttemptsRegular, 
      maxAttemptsCapstone, 
      securityCheckEnabled, 
      validationEnabled, 
      aiReviewEnabled 
    } = req.body;

    let config = await prisma.aIConfiguration.findFirst();
    
    // Prepare update data
    const updateData: any = {
      provider,
      model,
      strictnessLevel,
      passScoreRegular: Number(passScoreRegular),
      passScoreCapstone: Number(passScoreCapstone),
      maxAttemptsRegular: Number(maxAttemptsRegular),
      maxAttemptsCapstone: Number(maxAttemptsCapstone),
      securityCheckEnabled: Boolean(securityCheckEnabled),
      validationEnabled: Boolean(validationEnabled),
      aiReviewEnabled: Boolean(aiReviewEnabled)
    };

    // Only update apiKey if a real new key is provided (not the masked one or empty)
    let actualApiKey = config?.apiKey;
    if (apiKey && !apiKey.startsWith('••••')) {
      updateData.apiKey = apiKey;
      actualApiKey = apiKey;
    }

    if (config) {
      config = await prisma.aIConfiguration.update({
        where: { id: config.id },
        data: updateData
      });
    } else {
      config = await prisma.aIConfiguration.create({
        data: updateData
      });
    }

    // Update in-memory environment variable if provider is google
    if (provider === 'google' && actualApiKey) {
      process.env.GOOGLE_AI_API_KEY = actualApiKey;
    }

    const safeConfig = {
      ...config,
      apiKey: config.apiKey ? `••••••••••••${config.apiKey.slice(-4)}` : null,
      hasApiKey: !!config.apiKey
    };

    res.json(safeConfig);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/ai-config/test-key
router.post("/test-key", async (req, res, next) => {
  try {
    const { provider, apiKey } = req.body;
    
    if (provider === 'mock') {
      await delay(2000); // 2-second delay for mock mode
      return res.json({ success: true, message: "Connection successful! AI reviews are active." });
    }

    if (!apiKey) {
      return res.status(400).json({ success: false, message: "API key is required for testing." });
    }

    let testApiKey = apiKey;
    
    // If the frontend sends the masked key, we look it up from the database
    if (apiKey.startsWith('••••')) {
      const config = await prisma.aIConfiguration.findFirst();
      if (!config || !config.apiKey) {
        return res.status(400).json({ success: false, message: "Saved API key not found in database." });
      }
      testApiKey = config.apiKey;
    }

    if (provider === 'google') {
      // Test Gemini API
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${testApiKey}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: "Reply with only the word 'connected'" }] }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API Test Error:", errorData);
        return res.status(400).json({ success: false, message: "Connection failed. Please check your API key." });
      }

      const data = await response.json();
      if (data && data.candidates && data.candidates.length > 0) {
        return res.json({ success: true, message: "Connection successful! AI reviews are active." });
      } else {
         return res.status(400).json({ success: false, message: "Unexpected API response." });
      }
    } else if (provider === 'anthropic') {
      // Test Anthropic API
      const url = `https://api.anthropic.com/v1/messages`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-api-key': testApiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: "claude-3-haiku-20240307",
          max_tokens: 10,
          messages: [{ role: "user", content: "Reply with only the word 'connected'" }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Anthropic API Test Error:", errorData);
        return res.status(400).json({ success: false, message: "Connection failed. Please check your API key." });
      }

      return res.json({ success: true, message: "Connection successful! AI reviews are active." });
    }

    return res.status(400).json({ success: false, message: "Unsupported provider." });
  } catch (err) {
    console.error("API Test Error:", err);
    res.status(500).json({ success: false, message: "Connection failed due to server error." });
  }
});

export default router;
