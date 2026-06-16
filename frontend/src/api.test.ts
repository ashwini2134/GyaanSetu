import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getToken,
  setToken,
  clearToken,
  getCompletedProjects,
  saveCompletedProject,
  getCompletedQuizzes,
  saveCompletedQuiz,
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
    it("saves and retrieves completed projects correctly", () => {
      saveCompletedProject("cs50p", "indoor", true);
      const completed = getCompletedProjects();
      expect(completed["cs50p/indoor"]).toBe(true);
    });

    it("saves and retrieves completed quizzes correctly", () => {
      saveCompletedQuiz("cs50p", 1, 90);
      const quizzes = getCompletedQuizzes();
      expect(quizzes["cs50p_1"]).toBe(90);
    });

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
