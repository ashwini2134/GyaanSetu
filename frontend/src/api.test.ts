import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getToken,
  setToken,
  clearToken,
<<<<<<< HEAD
=======
  getCompletedQuizzes,
  saveCompletedQuiz,
  getStreak,
>>>>>>> 8245f18 (Initial commit)
  getBadges,
} from "./api";

describe("API Utils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe("Token management", () => {
    it("sets and gets the token correctly", () => {
      setToken("test-token");
      expect(getToken()).toBe("test-token");
    });

    it("clears the token correctly", () => {
      setToken("test-token");
      clearToken();
      expect(getToken()).toBeNull();
    });
  });

  describe("Progress, Streak and Badges functionality", () => {
<<<<<<< HEAD
=======
    it("saves and retrieves completed quizzes correctly", () => {
      saveCompletedQuiz("cs50p", 1, 90);
      const quizzes = getCompletedQuizzes();
      expect(quizzes["cs50p_1"]).toBe(90);
    });

    it("calculates streaks correctly", () => {
      const todayStr = new Date().toISOString().split("T")[0];
      localStorage.setItem("fa_last_submission_date", todayStr);
      localStorage.setItem("fa_streak_count", "3");

      const streak = getStreak();
      expect(streak.count).toBe(3);
      expect(streak.lastDate).toBe(todayStr);
    });

>>>>>>> 8245f18 (Initial commit)
    it("unlocks badges correctly based on progress", () => {
      const badgesLevel0 = getBadges(0, 0);
      expect(badgesLevel0.find((b) => b.id === "first_step")?.unlocked).toBe(false);

      const badgesLevel1 = getBadges(1, 1);
      expect(badgesLevel1.find((b) => b.id === "first_step")?.unlocked).toBe(true);
      expect(badgesLevel1.find((b) => b.id === "streak_star")?.unlocked).toBe(false);

      const badgesLevel3 = getBadges(5, 3);
      expect(badgesLevel3.find((b) => b.id === "pythonista")?.unlocked).toBe(true);
      expect(badgesLevel3.find((b) => b.id === "streak_star")?.unlocked).toBe(true);
    });
  });
});
