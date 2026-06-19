import { useState, useEffect, useCallback } from 'react';
import { authFetch } from '../authClient';

export interface TaskStatusData {
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  completedAt?: string;
}

export function useProjectTasks(projectId: string, totalTaskCount: number) {
  const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskStatusData>>({});
  const [loading, setLoading] = useState(true);

  const fetchTaskStatuses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authFetch<Record<string, TaskStatusData>>(`/projects/tasks/${projectId}`);
      setTaskStatuses(data || {});
    } catch (e) {
      console.warn("Task backend not available, using local state only", e);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTaskStatuses();
  }, [fetchTaskStatuses]);

  const startTask = useCallback(async (taskId: string) => {
    setTaskStatuses(prev => ({ ...prev, [taskId]: { status: "IN_PROGRESS" } }));
    try {
      await authFetch(`/projects/tasks/${projectId}/${taskId}/start`, { method: 'PATCH' });
    } catch (e) {
      console.warn("Failed to sync task start with backend, keeping local state", e);
    }
  }, [projectId]);

  const completeTask = useCallback(async (taskId: string) => {
    const now = new Date().toISOString();
    setTaskStatuses(prev => ({ ...prev, [taskId]: { status: "COMPLETED", completedAt: now } }));
    try {
      await authFetch(`/projects/tasks/${projectId}/${taskId}/complete`, { method: 'PATCH' });
    } catch (e) {
      console.warn("Failed to sync task completion with backend, keeping local state", e);
    }
  }, [projectId]);

  const allTasks = [...Array(totalTaskCount).keys()].map(i => Object.keys(taskStatuses)[i] || `task-${i}`);
  const statusValues = Object.values(taskStatuses);
  const completedCount = statusValues.filter(s => s.status === "COMPLETED").length;
  const inProgressCount = statusValues.filter(s => s.status === "IN_PROGRESS").length;
  const totalCount = totalTaskCount;

  return {
    taskStatuses,
    loading,
    startTask,
    completeTask,
    completedCount,
    inProgressCount,
    totalCount,
    refreshTaskStatuses: fetchTaskStatuses
  };
}
