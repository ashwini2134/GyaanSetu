import { useState, useEffect, useCallback } from 'react';
import { authFetch } from '../authClient';

export interface ProjectStatusData {
  status: string;
  githubUrl?: string;
  liveDemoUrl?: string;
  description?: string;
}

export function useAllProjectStatuses() {
  const [statuses, setStatuses] = useState<Record<string, ProjectStatusData>>({});
  const [loading, setLoading] = useState(true);

  const fetchStatuses = useCallback(async () => {
    try {
      // Temporarily use the old endpoint for list-view statuses
      const data = await authFetch<Record<string, ProjectStatusData>>('/projects/status');
      setStatuses(data || {});
    } catch (e) {
      console.error("Failed to fetch all project statuses", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatuses();
  }, [fetchStatuses]);

  return { statuses, loading, refetch: fetchStatuses };
}
