import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../auth";
import { authFetch } from "../authClient";

const PROGRESS_EVENT = "gyansetu:progress:update";
const LEGACY_PROGRESS_EVENT = "fraylon:progress:update";

export type AchievementBadgeColor = "bronze" | "silver" | "gold" | "platinum" | "purple" | "blue" | "green" | "red";

export interface ResolvedAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xpReward: number;
  badgeColor: AchievementBadgeColor;
  unlockedAt?: string;
}

/**
 * Single shared source of achievement data — the backend catalog + the
 * user's real unlocked list. Dashboard, CoursePage, and Profile should all
 * consume this (or useRecentAchievements below) instead of maintaining any
 * local achievement logic.
 */
export function useAchievements() {
  const { user } = useAuth();
  const [unlocked, setUnlocked] = useState<ResolvedAchievement[]>([]);
  const [catalog, setCatalog] = useState<ResolvedAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setUnlocked([]);
      setCatalog([]);
      setLoading(false);
      return;
    }
    try {
      const [u, c] = await Promise.all([
        authFetch<{ achievements: ResolvedAchievement[] }>("/achievements"),
        authFetch<{ achievements: ResolvedAchievement[] }>("/achievements/catalog"),
      ]);
      setUnlocked(u.achievements || []);
      setCatalog(c.achievements || []);
    } catch (err) {
      console.error("Failed to load achievements", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
    window.addEventListener(PROGRESS_EVENT, refresh);
    window.addEventListener(LEGACY_PROGRESS_EVENT, refresh);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, refresh);
      window.removeEventListener(LEGACY_PROGRESS_EVENT, refresh);
    };
  }, [refresh]);

  return { unlocked, catalog, loading, refresh };
}

/** Latest N unlocked achievements — for the CoursePage "Recent Achievements" sidebar. */
export function useRecentAchievements(limit = 5) {
  const { user } = useAuth();
  const [recent, setRecent] = useState<ResolvedAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setRecent([]);
      setLoading(false);
      return;
    }
    try {
      const res = await authFetch<{ achievements: ResolvedAchievement[] }>(`/achievements/recent?limit=${limit}`);
      setRecent(res.achievements || []);
    } catch (err) {
      console.error("Failed to load recent achievements", err);
    } finally {
      setLoading(false);
    }
  }, [user, limit]);

  useEffect(() => {
    refresh();
    window.addEventListener(PROGRESS_EVENT, refresh);
    window.addEventListener(LEGACY_PROGRESS_EVENT, refresh);
    return () => {
      window.removeEventListener(PROGRESS_EVENT, refresh);
      window.removeEventListener(LEGACY_PROGRESS_EVENT, refresh);
    };
  }, [refresh]);

  return { recent, loading, refresh };
}
