import { describe, expect, it } from "vitest";
import { validateAnswerDistribution } from "../src/utils/quizValidator.js";
import { seedData } from "../src/seeds/assessmentQuestions.js";
import fs from "fs";
import path from "path";

describe("Quiz Answer Distribution Validation", () => {
  it("detects suspicious distribution (high percentage of Option A)", () => {
    const questions = [
      { question: "Q1", options: ["A", "B", "C", "D"], answer: "A" },
      { question: "Q2", options: ["A", "B", "C", "D"], answer: "A" },
      { question: "Q3", options: ["A", "B", "C", "D"], answer: "A" },
      { question: "Q4", options: ["A", "B", "C", "D"], answer: "B" },
    ];
    const result = validateAnswerDistribution(questions);
    expect(result.isSuspicious).toBe(true);
    expect(result.reason).toContain("Option A accounts for 75.0%");
  });

  it("detects suspicious distribution (consecutive Option A)", () => {
    const questions = [
      { question: "Q1", options: ["A", "B", "C", "D"], answer: "A" },
      { question: "Q2", options: ["A", "B", "C", "D"], answer: "A" },
      { question: "Q3", options: ["A", "B", "C", "D"], answer: "A" },
      { question: "Q4", options: ["A", "B", "C", "D"], answer: "C" },
      { question: "Q5", options: ["A", "B", "C", "D"], answer: "D" },
      { question: "Q6", options: ["A", "B", "C", "D"], answer: "B" },
    ];
    const result = validateAnswerDistribution(questions);
    expect(result.isSuspicious).toBe(true);
    expect(result.reason).toContain("3 consecutive Option A answers");
  });

  it("passes healthy distribution", () => {
    const questions = [
      { question: "Q1", options: ["A", "B", "C", "D"], answer: "B" },
      { question: "Q2", options: ["A", "B", "C", "D"], answer: "A" },
      { question: "Q3", options: ["A", "B", "C", "D"], answer: "C" },
      { question: "Q4", options: ["A", "B", "C", "D"], answer: "D" },
    ];
    const result = validateAnswerDistribution(questions);
    expect(result.isSuspicious).toBe(false);
  });

  it("verifies all public data quizzes are healthy", () => {
    const getJsonFiles = (dir: string, files: string[] = []): string[] => {
      const list = fs.readdirSync(dir);
      for (const file of list) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
          getJsonFiles(fullPath, files);
        } else if (file === "quiz.json") {
          files.push(fullPath);
        }
      }
      return files;
    };

    const dataDir = path.resolve("../frontend/public/data");
    const quizFiles = getJsonFiles(dataDir);

    for (const file of quizFiles) {
      const content = JSON.parse(fs.readFileSync(file, "utf8"));
      // Map lesson.json structure to validator questions if needed, 
      // but quiz.json has question, options, answer directly
      const result = validateAnswerDistribution(content);
      expect(result.isSuspicious, `Quiz file ${path.relative(dataDir, file)} is suspicious: ${result.reason}`).toBe(false);
    }
  });

  it("verifies backend assessment seed MCQ questions are healthy", () => {
    const mcqQuestions = seedData
      .filter((q) => q.type === "mcq")
      .map((q) => ({
        question: q.question,
        options: q.options,
        answer: q.correctAnswer,
      }));

    // Split questions by category/subsection to check each subset independently
    const categories = Array.from(new Set(seedData.map((q) => `${q.category} - ${q.subsection}`)));

    for (const category of categories) {
      const subset = seedData
        .filter((q) => q.type === "mcq" && `${q.category} - ${q.subsection}` === category)
        .map((q) => ({
          question: q.question,
          options: q.options,
          answer: q.correctAnswer,
        }));

      if (subset.length === 0) continue;
      const result = validateAnswerDistribution(subset);
      expect(result.isSuspicious, `Assessment subset [${category}] is suspicious: ${result.reason}`).toBe(false);
    }
  });
});
