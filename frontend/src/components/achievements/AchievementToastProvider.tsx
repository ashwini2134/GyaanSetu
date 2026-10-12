import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import AchievementToast from "./AchievementToast";
import type { ResolvedAchievement } from "../../hooks/useAchievements";

interface QueuedToast extends ResolvedAchievement {
  toastKey: string;
}

const DISPLAY_MS = 5000;

/**
 * Mounted once (in Shell.tsx). Listens for the global
 * 'fraylon:achievement:unlocked' event — dispatched by progress.ts's
 * completeAction() and useLectureProgress.ts's local completeAction —
 * and shows an immediate, in-the-moment toast per newly-unlocked
 * achievement, stacked bottom-right. This is deliberately separate from
 * the persistent bell/InAppNotification record; both exist because the
 * bell can lag up to a minute behind, and this arrives with the data
 * already in hand from the same response.
 */
export default function AchievementToastProvider() {
  const [toasts, setToasts] = useState<QueuedToast[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ResolvedAchievement[]>).detail;
      if (!detail || detail.length === 0) return;
      setToasts((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const newOnes = detail
          .filter((a) => !existingIds.has(a.id))
          .map((a, i) => ({ ...a, toastKey: `${a.id}-${Date.now()}-${i}` }));
        return [...prev, ...newOnes];
      });
    };
    window.addEventListener("gyansetu:achievement:unlocked", handler);
    window.addEventListener("fraylon:achievement:unlocked", handler);
    return () => {
      window.removeEventListener("gyansetu:achievement:unlocked", handler);
      window.removeEventListener("fraylon:achievement:unlocked", handler);
    };
  }, []);

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, DISPLAY_MS);
    return () => clearTimeout(timer);
  }, [toasts]);

  const dismiss = (toastKey: string) => {
    setToasts((prev) => prev.filter((t) => t.toastKey !== toastKey));
  };

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col-reverse gap-2 items-end" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <AchievementToast key={t.toastKey} achievement={t} onClose={() => dismiss(t.toastKey)} />
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
}
