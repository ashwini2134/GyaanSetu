import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || "");
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `You are an expert code reviewer for an online learning platform.
Review this student project submission against the rubric.

Project: Image Classification
Requirements: Build an image classifier exactly as specified.

Student Submission: https://github.com/yuvaraj-dudukuru/LMS

Evaluate fairly for a beginner/intermediate student.
Respond ONLY with valid JSON matching exactly this structure:
{
  "overallScore": 85,
  "maxScore": 100,
  "passed": true,
  "overallFeedback": "2-3 sentences of feedback",
  "strengths": ["point1", "point2"],
  "improvements": ["point1", "point2"],
  "criteriaScores": [
    { "criteria": "Functionality", "score": 85, "maxScore": 100, "comment": "Good job" }
  ]
}`;

  const result = await model.generateContent(prompt);
  console.log("RAW RESPONSE:");
  console.log(result.response.text());
}

test();
