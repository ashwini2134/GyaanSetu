import { useState, useEffect, useCallback } from 'react';
import { authFetch } from '../authClient';

export interface ProjectStatusData {
  status: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  description?: string;
}

export function useProjectStatus() {
  const [statuses, setStatuses] = useState<Record<string, ProjectStatusData>>({});
  const [loading, setLoading] = useState(true);

  const fetchStatuses = useCallback(async () => {
    try {
      const data = await authFetch<Record<string, ProjectStatusData>>('/projects/status');
      setStatuses(data || {});
    } catch (e) {
      console.error("Failed to fetch project statuses", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  const startProject = useCallback(async (projectId: string) => {
    try {
      setStatuses(prev => ({ ...prev, [projectId]: { status: "IN_PROGRESS" } }));
      await authFetch(`/projects/${projectId}/start`, { method: 'PATCH' });
    } catch (e) {
      console.error("Failed to start project", e);
      fetchStatuses();
    }
  }, [fetchStatuses]);

  const completeProject = useCallback(async (projectId: string, submission?: { githubUrl: string; liveDemoUrl?: string; description: string }) => {
    try {
      setStatuses(prev => ({ ...prev, [projectId]: { status: "COMPLETED", ...submission } }));
      await authFetch(`/projects/${projectId}/complete`, { 
        method: 'PATCH',
        body: JSON.stringify(submission || {})
      });
    } catch (e) {
      console.error("Failed to complete project", e);
      fetchStatuses();
    }
  }, [fetchStatuses]);

  return {
    statuses,
    loading,
    startProject,
    completeProject,
    refreshStatuses: fetchStatuses
  };
}
