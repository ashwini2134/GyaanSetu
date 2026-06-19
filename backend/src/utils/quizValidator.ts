export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface ValidationResult {
  isSuspicious: boolean;
  reason?: string;
  optionAPercentage: number;
  maxConsecutiveOptionA: number;
}

/**
 * Validates the correct answer distribution of a quiz to ensure it is not biased or predictable.
 * Suspicious conditions:
 * - More than 50% of questions have Option A (index 0) as the correct answer (minimum 4 questions).
 * - Or 3 or more consecutive questions have Option A as the correct answer.
 */
export function validateAnswerDistribution(questions: QuizQuestion[]): ValidationResult {
  if (!questions || questions.length === 0) {
    return { isSuspicious: false, optionAPercentage: 0, maxConsecutiveOptionA: 0 };
  }

  let optionACount = 0;
  let consecutiveOptionA = 0;
  let maxConsecutiveOptionA = 0;

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const correctIdx = q.options.indexOf(q.answer);
    if (correctIdx === 0) {
      optionACount++;
      consecutiveOptionA++;
      if (consecutiveOptionA > maxConsecutiveOptionA) {
        maxConsecutiveOptionA = consecutiveOptionA;
      }
    } else {
      consecutiveOptionA = 0;
    }
  }

  const optionAPercentage = (optionACount / questions.length) * 100;
  
  const highPercentage = questions.length >= 4 && optionAPercentage > 50;
  const tooManyConsecutive = maxConsecutiveOptionA >= 3;
  const isSuspicious = highPercentage || tooManyConsecutive;

  let reason: string | undefined;
  if (isSuspicious) {
    const details: string[] = [];
    if (tooManyConsecutive) {
      details.push(`${maxConsecutiveOptionA} consecutive Option A answers`);
    }
    if (highPercentage) {
      details.push(`Option A accounts for ${optionAPercentage.toFixed(1)}% of answers`);
    }
    reason = `Suspicious answer distribution: ${details.join(" and ")}.`;
  }

  return {
    isSuspicious,
    reason,
    optionAPercentage,
    maxConsecutiveOptionA,
  };
}
